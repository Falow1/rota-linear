export const EPS = 1e-9;

export function isZero(x: number, eps = EPS): boolean {
  return Math.abs(x) < eps;
}

/** Igualdade com tolerância relativa e absoluta. */
export function approxEq(a: number, b: number, eps = EPS): boolean {
  return Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b));
}

/** Zera valores muito pequenos (resíduos de ponto flutuante). */
export function clean(x: number, eps = 1e-10): number {
  if (Math.abs(x) < eps) return 0;
  const r = Math.round(x);
  if (Math.abs(x - r) < eps * Math.max(1, Math.abs(x))) return r;
  return x;
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}
