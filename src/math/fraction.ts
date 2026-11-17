export interface Frac {
  n: number;
  d: number;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/**
 * Aproxima x por uma fração n/d com d <= maxDen, se o erro for desprezível.
 * Usa frações contínuas. Retorna null quando x não é "racional simples".
 */
export function toFraction(x: number, maxDen = 64, tol = 1e-9): Frac | null {
  if (!Number.isFinite(x)) return null;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  if (Math.abs(ax - Math.round(ax)) < tol * Math.max(1, ax)) return { n: sign * Math.round(ax), d: 1 };
  let h0 = 0, h1 = 1, k0 = 1, k1 = 0;
  let b = ax;
  for (let i = 0; i < 20; i++) {
    const a = Math.floor(b);
    const h2 = a * h1 + h0;
    const k2 = a * k1 + k0;
    if (k2 > maxDen) break;
    h0 = h1; h1 = h2; k0 = k1; k1 = k2;
    if (Math.abs(ax - h1 / k1) < tol * Math.max(1, ax)) return { n: sign * h1, d: k1 };
    const frac = b - a;
    if (frac < 1e-15) break;
    b = 1 / frac;
  }
  return null;
}
