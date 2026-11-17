import { useCallback, useSyncExternalStore } from "react";

/** Mesmos limites do comentário no topo de styles/tokens.css. */
export const COARSE = "(pointer: coarse)";
export const MOBILE = "(max-width: 999px)";
export const LANDSCAPE = "(max-width: 999px) and (max-height: 499px)";

const mq = (q: string) => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(q) : null);

/** true enquanto a media query casar; atualiza quando muda (girar o celular, redimensionar a janela). */
export function useMedia(query: string): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      const m = mq(query);
      m?.addEventListener("change", cb);
      return () => m?.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => mq(query)?.matches ?? false,
    () => false,
  );
}

export const isCoarse = () => mq(COARSE)?.matches ?? false;
