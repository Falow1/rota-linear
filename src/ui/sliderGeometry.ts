/**
 * Posições (de 0 a 1) usadas para desenhar o slider.
 * - p: onde está a bolinha.
 * - z: onde fica o zero, só quando o intervalo cruza o zero (ex.: −5 a 5); senão null.
 * - lo, hi: começo e fim do preenchimento. Cruzando o zero, o preenchimento vai do zero até a bolinha,
 *   para qualquer lado; senão vai da esquerda até a bolinha (fromEdge = true).
 */
export function sliderGeometry(value: number, min: number, max: number) {
  const span = max - min || 1;
  const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);
  const p = clamp01((value - min) / span);
  const crosses = min < 0 && max > 0;
  const z = crosses ? -min / span : null;
  return {
    p,
    z,
    lo: z === null ? 0 : Math.min(p, z),
    hi: z === null ? p : Math.max(p, z),
    fromEdge: z === null,
  };
}

/**
 * Soma um passo, prende no intervalo e limpa o erro de ponto flutuante (0,1 + 0,2).
 * Um valor digitado fora do intervalo (o campo aceita) não é puxado de volta de uma vez:
 * o passo nunca o leva mais para fora, mas anda normalmente em direção ao intervalo.
 */
export function stepValue(value: number, dir: 1 | -1, step: number, min: number, max: number): number {
  const v0 = Number.isFinite(value) ? value : 0;
  const lo = Math.min(min, v0), hi = Math.max(max, v0);
  return Math.round(Math.min(hi, Math.max(lo, v0 + dir * step)) * 1e6) / 1e6;
}
