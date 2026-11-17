import type { MouseEvent, PointerEvent } from "react";
import { useFocusedField, type Field } from "./viewport";

/** Teclas para respostas de exercício (inseridas na posição do cursor). */
const ANSWER_KEYS: { label: string; text: string; aria: string }[] = [
  { label: "−", text: "-", aria: "Sinal de menos" },
  { label: "/", text: "/", aria: "Fração" },
  { label: "√", text: "√", aria: "Raiz quadrada" },
  { label: "π", text: "π", aria: "Pi" },
  { label: "(", text: "(", aria: "Abre parêntese" },
  { label: ")", text: ")", aria: "Fecha parêntese" },
  { label: ",", text: ",", aria: "Vírgula decimal" },
];

const setNative = (el: Field, v: string) => {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, v);
};
/** Avisa o React da mudança (o onChange dos campos escuta o evento "input"). */
const notify = (el: Field) => el.dispatchEvent(new Event("input", { bubbles: true }));

function insert(el: Field, text: string) {
  const s = el.selectionStart ?? el.value.length;
  const e = el.selectionEnd ?? s;
  el.setRangeText(text, s, e, "end");
  notify(el);
}

function toggleSign(el: Field) {
  const v = el.value.trim();
  setNative(el, /^[-−]/.test(v) ? v.slice(1) : `-${v}`);
  notify(el);
  const n = el.value.length;
  el.setSelectionRange?.(n, n);
}

const arrow = (el: Field, key: "ArrowUp" | "ArrowDown") => el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));

/**
 * Barra fixa logo acima do teclado do celular, enquanto um campo numérico ou uma resposta está em foco.
 * Resolve o que o teclado numérico do iPhone não tem (sinal de menos e barra) e dá atalhos de passo.
 * Os botões não roubam o foco do campo (preventDefault no pointerdown/mousedown).
 */
export function KeyBar() {
  const field = useFocusedField();
  if (!field) return null;
  const isNum = field.classList.contains("num");
  const isExpr = field.classList.contains("ans");
  if (!isNum && !isExpr) return null;

  const keep = (e: PointerEvent | MouseEvent) => e.preventDefault();
  const act = (fn: (el: Field) => void) => () => {
    if (document.activeElement !== field) field.focus({ preventScroll: true });
    fn(field);
  };
  const Key = ({ label, aria, run, wide }: { label: string; aria?: string; run: (el: Field) => void; wide?: boolean }) => (
    <button type="button" className={`key${wide ? " wide" : ""}`} aria-label={aria} tabIndex={-1} onPointerDown={keep} onMouseDown={keep} onClick={act(run)}>
      {label}
    </button>
  );

  return (
    <div className="keybar" role="toolbar" aria-label="Teclas extras">
      <div className="keybar-keys">
        {isNum ? (
          <>
            <Key label="±" aria="Trocar o sinal" run={toggleSign} />
            <Key label="/" aria="Fração" run={(el) => insert(el, "/")} />
            <Key label="− passo" run={(el) => arrow(el, "ArrowDown")} wide />
            <Key label="+ passo" run={(el) => arrow(el, "ArrowUp")} wide />
          </>
        ) : (
          ANSWER_KEYS.map((k) => <Key key={k.label} label={k.label} aria={k.aria} run={(el) => insert(el, k.text)} />)
        )}
      </div>
      <Key label="OK" aria="Fechar o teclado" run={(el) => el.blur()} wide />
    </div>
  );
}
