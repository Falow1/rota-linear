import { createContext, useContext } from "react";

/** Encaixe na grade (passo de 0,5) para pontos arrastáveis. */
export const SnapContext = createContext<{ snap: boolean; step: number }>({ snap: true, step: 0.5 });
export const useSnap = () => useContext(SnapContext);

export function snapValue(x: number, step: number): number {
  return Math.round(x / step) * step;
}
