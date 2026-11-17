import { useEffect, useSyncExternalStore } from "react";
import { isCoarse } from "./media";

/**
 * Altura visível da tela em --vvh (encolhe quando o teclado do celular abre) e
 * distância do fim da área visível até o fim da janela em --kb-offset (onde fica a barra de teclas).
 * No Android o meta viewport "interactive-widget=resizes-content" já encolhe a página;
 * no iPhone é este cálculo que resolve.
 */
export function useViewportVars() {
  useEffect(() => {
    const root = document.documentElement;
    const vv = window.visualViewport;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // Com zoom de pinça, vv.height diminui mas o layout não deve mudar: multiplica pela escala.
        const h = vv ? vv.height * (vv.scale || 1) : window.innerHeight;
        const bottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
        root.style.setProperty("--vvh", `${Math.round(h)}px`);
        root.style.setProperty("--kb-offset", `${Math.max(0, Math.round(root.clientHeight - bottom))}px`);
      });
    };
    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
}

/* ---------- Campo de texto em foco num aparelho de toque (= teclado virtual aberto) ---------- */

export type Field = HTMLInputElement | HTMLTextAreaElement;
const NOT_TEXT = new Set(["range", "checkbox", "radio", "button", "submit", "reset", "color", "file", "image", "hidden"]);

function asField(el: Element | null): Field | null {
  if (el instanceof HTMLTextAreaElement) return el;
  if (el instanceof HTMLInputElement && !NOT_TEXT.has(el.type)) return el;
  return null;
}

let current: Field | null = null;
let started = false;
let pending = 0;
const listeners = new Set<() => void>();

function set(next: Field | null) {
  if (next === current) return;
  current = next;
  // Classe no <html> para o CSS: teclado do celular aberto (esconde as abas, sobe a barra de ação).
  document.documentElement.classList.toggle("kb-open", next !== null);
  listeners.forEach((l) => l());
}

function start() {
  if (started || typeof document === "undefined") return;
  started = true;
  document.addEventListener("focusin", (e) => {
    window.clearTimeout(pending);
    const f = isCoarse() ? asField(e.target as Element) : null;
    set(f);
    // Rola o campo para o meio da área visível quando ele está dentro de um painel com rolagem própria.
    if (f && f.closest(".stage")) {
      window.setTimeout(() => {
        if (document.activeElement === f) f.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 320);
    }
  });
  // Espera um pouco: ao pular de um campo para outro, o foco sai e volta, e o gráfico não deve piscar.
  document.addEventListener("focusout", () => {
    window.clearTimeout(pending);
    pending = window.setTimeout(() => set(isCoarse() ? asField(document.activeElement) : null), 120);
  });
}

function subscribe(cb: () => void) {
  start();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Campo de texto em foco quando o aparelho é de toque (o teclado virtual está aberto); senão null. */
export function useFocusedField(): Field | null {
  return useSyncExternalStore(subscribe, () => current, () => null);
}

export const useKeyboardOpen = () => useFocusedField() !== null;
