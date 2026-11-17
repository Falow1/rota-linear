import { gcd, toFraction } from "./fraction";
import { clean } from "./tolerance";
import type { Vec2 } from "./vec";

/** Reta na forma geral ax + by + c = 0. */
export interface Line2 {
  a: number;
  b: number;
  c: number;
}

/** Deixa os coeficientes "bonitos": inteiros primos entre si quando possível e primeiro coeficiente positivo. */
export function tidyLine(l: Line2): Line2 {
  let { a, b, c } = l;
  const coeffs = [a, b, c];
  const fr = coeffs.map((x) => toFraction(x, 64));
  if (fr.every((f) => f)) {
    const lcm = fr.reduce((m, f) => (m * f!.d) / gcd(m, f!.d), 1);
    const ints = coeffs.map((x) => Math.round(x * lcm));
    const g = ints.reduce((acc, x) => gcd(acc, x), 0) || 1;
    [a, b, c] = ints.map((x) => x / g);
  }
  const lead = Math.abs(a) > 1e-12 ? a : b;
  if (lead < 0) [a, b, c] = [-a, -b, -c];
  return { a: clean(a), b: clean(b), c: clean(c) };
}

export function lineFromPoints(P: Vec2, Q: Vec2): Line2 | null {
  const dx = Q[0] - P[0], dy = Q[1] - P[1];
  if (Math.abs(dx) < 1e-12 && Math.abs(dy) < 1e-12) return null;
  const a = dy, b = -dx;
  return tidyLine({ a, b, c: -(a * P[0] + b * P[1]) });
}

export const normalOf = (l: Line2): Vec2 => [l.a, l.b];
export const directionOf = (l: Line2): Vec2 => [-l.b, l.a];

/** Um ponto da reta. */
export function pointOn(l: Line2): Vec2 {
  const n2 = l.a * l.a + l.b * l.b;
  return [clean((-l.c * l.a) / n2), clean((-l.c * l.b) / n2)];
}

/** Forma reduzida y = mx + n (null para reta vertical). */
export function reduced(l: Line2): { m: number; n: number } | null {
  if (Math.abs(l.b) < 1e-12) return null;
  return { m: clean(-l.a / l.b), n: clean(-l.c / l.b) };
}

/** Forma segmentária x/p + y/q = 1 (null se a reta passa pela origem ou é paralela a um eixo). */
export function segmentary(l: Line2): { p: number; q: number } | null {
  if (Math.abs(l.a) < 1e-12 || Math.abs(l.b) < 1e-12 || Math.abs(l.c) < 1e-12) return null;
  return { p: clean(-l.c / l.a), q: clean(-l.c / l.b) };
}

export type LinePos =
  | { kind: "concorrentes"; point: Vec2; angle: number; perpendicular: boolean }
  | { kind: "paralelas"; distance: number }
  | { kind: "coincidentes" };

export function relLines(l1: Line2, l2: Line2): LinePos {
  const D = l1.a * l2.b - l2.a * l1.b;
  const s = Math.max(1, Math.hypot(l1.a, l1.b) * Math.hypot(l2.a, l2.b));
  if (Math.abs(D) < 1e-10 * s) {
    // paralelas: normalizar e comparar c
    const n1 = Math.hypot(l1.a, l1.b), n2 = Math.hypot(l2.a, l2.b);
    const sameDir = l1.a * l2.a + l1.b * l2.b > 0 ? 1 : -1;
    const c1 = l1.c / n1, c2 = (sameDir * l2.c) / n2;
    if (Math.abs(c1 - c2) < 1e-9) return { kind: "coincidentes" };
    return { kind: "paralelas", distance: Math.abs(c1 - c2) };
  }
  const x = (l1.b * l2.c - l2.b * l1.c) / D;
  const y = (l2.a * l1.c - l1.a * l2.c) / D;
  const cos = Math.abs(l1.a * l2.a + l1.b * l2.b) / (Math.hypot(l1.a, l1.b) * Math.hypot(l2.a, l2.b));
  const angle = Math.acos(Math.min(1, cos));
  return { kind: "concorrentes", point: [clean(x), clean(y)], angle, perpendicular: cos < 1e-10 };
}

/** Distância de P à reta e o pé da perpendicular. */
export function distPointLine(P: Vec2, l: Line2): { d: number; foot: Vec2; num: number; den: number } {
  const num = l.a * P[0] + l.b * P[1] + l.c;
  const den2 = l.a * l.a + l.b * l.b;
  const t = num / den2;
  return { d: Math.abs(num) / Math.sqrt(den2), foot: [clean(P[0] - t * l.a), clean(P[1] - t * l.b)], num: clean(num), den: den2 };
}

/** Recorta a reta numa janela retangular (para desenhar). */
export function clipLine(l: Line2, xr: [number, number], yr: [number, number]): [Vec2, Vec2] | null {
  const pts: Vec2[] = [];
  if (Math.abs(l.b) > 1e-12) {
    for (const x of xr) {
      const y = (-l.c - l.a * x) / l.b;
      if (y >= yr[0] - 1e-9 && y <= yr[1] + 1e-9) pts.push([x, y]);
    }
  }
  if (Math.abs(l.a) > 1e-12) {
    for (const y of yr) {
      const x = (-l.c - l.b * y) / l.a;
      if (x >= xr[0] - 1e-9 && x <= xr[1] + 1e-9) pts.push([x, y]);
    }
  }
  if (pts.length < 2) return null;
  let best: [Vec2, Vec2] = [pts[0], pts[1]];
  let bd = -1;
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
      if (d > bd) { bd = d; best = [pts[i], pts[j]]; }
    }
  return best;
}
