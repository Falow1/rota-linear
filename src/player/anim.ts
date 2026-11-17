import { useEffect, useRef, useState } from "react";
import type { TaskState } from "../learn/types";

export const reducedMotion = () => typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

/** Sem animação: "reduzir movimento" ligado ou aba em segundo plano. */
const skip = () => reducedMotion() || (typeof document !== "undefined" && document.hidden);

/** Suavização (começa e termina devagar). */
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Próximo quadro: requestAnimationFrame, com um setTimeout de reserva para quando o navegador
 * pausa os quadros (janela minimizada, alguns webviews). Assim a animação sempre termina.
 */
function frame(cb: (now: number) => void): () => void {
  let done = false;
  const fire = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(a);
    clearTimeout(b);
    cb(performance.now());
  };
  const a = requestAnimationFrame(fire);
  const b = setTimeout(fire, 80);
  return () => {
    done = true;
    cancelAnimationFrame(a);
    clearTimeout(b);
  };
}

/**
 * Anima de 0 a 1 quando `run` vira true (e volta a 0 quando vira false).
 * Com "reduzir movimento" ligado, pula direto para o fim.
 */
export function useTween(run: boolean, ms = 1100): number {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!run) {
      setT(0);
      return;
    }
    if (skip()) {
      setT(1);
      return;
    }
    let cancel = () => {};
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      setT(ease(k));
      if (k < 1) cancel = frame(tick);
    };
    cancel = frame(tick);
    return () => cancel();
  }, [run, ms]);
  return t;
}

/** Repete 0→1 em loop enquanto montado (para figuras que se mexem sozinhas). */
export function useLoop(ms = 3000, pauseMs = 900): number {
  const [t, setT] = useState(reducedMotion() ? 1 : 0);
  useEffect(() => {
    if (reducedMotion()) return;
    let cancel = () => {};
    const t0 = performance.now();
    const tick = (now: number) => {
      const cycle = ms + pauseMs;
      const k = ((now - t0) % cycle) / ms;
      setT(k >= 1 ? 1 : ease(k));
      cancel = frame(tick);
    };
    cancel = frame(tick);
    return () => cancel();
  }, [ms, pauseMs]);
  return t;
}

type Val = number | number[] | number[][];

function lerpVal(a: Val, b: Val, t: number): Val {
  if (typeof a === "number" && typeof b === "number") return a + (b - a) * t;
  if (Array.isArray(a) && Array.isArray(b)) return a.map((x, i) => lerpVal(x as Val, b[i] as Val, t)) as Val;
  return t < 1 ? a : b;
}

/** Interpola dois estados de tarefa (números, vetores e matrizes). */
export function lerpState<S extends TaskState>(a: S, b: S, t: number): S {
  const out = { ...a };
  for (const k of Object.keys(b) as (keyof S)[]) out[k] = lerpVal(a[k] as Val, b[k] as Val, t) as S[keyof S];
  return out;
}

/** Anima um estado até um alvo; devolve a função que dispara a animação. */
export function useAnimateTo<S extends TaskState>(get: () => S, set: (s: S) => void, ms = 900) {
  const cancel = useRef<() => void>(() => {});
  useEffect(() => () => cancel.current(), []);
  return (target: S, onEnd?: () => void) => {
    cancel.current();
    const from = get();
    if (skip()) {
      set(target);
      onEnd?.();
      return;
    }
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      set(k >= 1 ? target : lerpState(from, target, ease(k)));
      if (k < 1) cancel.current = frame(tick);
      else onEnd?.();
    };
    cancel.current = frame(tick);
  };
}
