import type { Mat } from "./mat";
import { clean } from "./tolerance";
import type { Vec2 } from "./vec";

export type Eig2 =
  | { kind: "distinct"; values: [number, number]; vectors: [Vec2, Vec2] }
  | { kind: "repeated-full"; values: [number, number]; vectors: [Vec2, Vec2] }
  | { kind: "repeated-defective"; values: [number, number]; vectors: [Vec2] }
  | { kind: "complex"; re: number; im: number };

/** Coeficientes do polinômio característico p(λ) = λ² − tr·λ + det. */
export function charPoly2(A: Mat): [number, number, number] {
  const tr = A[0][0] + A[1][1];
  const d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  return [1, clean(-tr), clean(d)];
}

/** Um autovetor "bonito" de A para o autovalor λ (direção do núcleo de A − λI). */
export function eigenvector2(A: Mat, l: number): Vec2 {
  const a = A[0][0] - l, b = A[0][1], c = A[1][0], d = A[1][1] - l;
  const scaleRef = Math.max(1, Math.abs(A[0][0]), Math.abs(A[0][1]), Math.abs(A[1][0]), Math.abs(A[1][1]));
  const eps = 1e-9 * scaleRef;
  let v: Vec2;
  if (Math.abs(a) > eps || Math.abs(b) > eps) v = Math.abs(b) > eps ? [b, -a] : [0, 1];
  else if (Math.abs(c) > eps || Math.abs(d) > eps) v = Math.abs(d) > eps ? [-d, c] : [0, 1];
  else v = [1, 0];
  if (Math.abs(v[0]) < eps) v = [0, Math.sign(v[1]) || 1];
  // Normaliza para que a primeira coordenada não nula seja positiva e, se possível, inteira pequena.
  const first = Math.abs(v[0]) > eps ? v[0] : v[1];
  v = [v[0] / first, v[1] / first];
  if (Math.abs(v[0]) > eps && Math.abs(v[1]) > eps) {
    const r = Math.abs(v[1] / v[0]);
    for (let k = 1; k <= 12; k++) {
      if (Math.abs(r * k - Math.round(r * k)) < 1e-9) {
        v = [k * Math.sign(v[0]), Math.round(r * k) * Math.sign(v[1])];
        break;
      }
    }
  }
  return [clean(v[0]), clean(v[1])];
}

export function eig2(A: Mat): Eig2 {
  const [, b, c] = charPoly2(A);
  const tr = -b;
  const disc = clean(tr * tr - 4 * c, 1e-9);
  if (disc < 0) return { kind: "complex", re: clean(tr / 2), im: Math.sqrt(-disc) / 2 };
  if (disc === 0) {
    const l = clean(tr / 2);
    const isScalar = Math.abs(A[0][1]) < 1e-12 && Math.abs(A[1][0]) < 1e-12 && Math.abs(A[0][0] - A[1][1]) < 1e-12;
    if (isScalar) return { kind: "repeated-full", values: [l, l], vectors: [[1, 0], [0, 1]] };
    return { kind: "repeated-defective", values: [l, l], vectors: [eigenvector2(A, l)] };
  }
  const s = Math.sqrt(disc);
  const l1 = clean((tr + s) / 2), l2 = clean((tr - s) / 2);
  return { kind: "distinct", values: [l1, l2], vectors: [eigenvector2(A, l1), eigenvector2(A, l2)] };
}

/** Polinômio característico de 3×3: λ³ + a λ² + b λ + c (retorna [1, a, b, c]). */
export function charPoly3(A: Mat): [number, number, number, number] {
  const tr = A[0][0] + A[1][1] + A[2][2];
  const m =
    A[0][0] * A[1][1] - A[0][1] * A[1][0] +
    A[0][0] * A[2][2] - A[0][2] * A[2][0] +
    A[1][1] * A[2][2] - A[1][2] * A[2][1];
  const d =
    A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
    A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
    A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
  return [1, clean(-tr), clean(m), clean(-d)];
}

/** Raízes reais de x³ + a x² + b x + c (com repetição, em ordem decrescente). */
export function realCubicRoots(a: number, b: number, c: number): number[] {
  const p = b - (a * a) / 3;
  const q = (2 * a * a * a) / 27 - (a * b) / 3 + c;
  const shift = -a / 3;
  const D = (q * q) / 4 + (p * p * p) / 27;
  let roots: number[];
  if (Math.abs(p) < 1e-12 && Math.abs(q) < 1e-12) roots = [0, 0, 0];
  else if (D > 1e-12) {
    const u = Math.cbrt(-q / 2 + Math.sqrt(D));
    const v = Math.cbrt(-q / 2 - Math.sqrt(D));
    roots = [u + v];
  } else if (D > -1e-12) {
    const u = Math.cbrt(-q / 2);
    roots = [2 * u, -u, -u];
  } else {
    const r = Math.sqrt(-p / 3);
    const phi = Math.acos(Math.max(-1, Math.min(1, (-q / 2) / (r * r * r))));
    roots = [0, 1, 2].map((k) => 2 * r * Math.cos((phi - 2 * Math.PI * k) / 3));
  }
  return roots.map((x) => clean(x + shift, 1e-7)).sort((x, y) => y - x);
}

/** Autovalores e autovetores de matriz simétrica 3×3 (método de Jacobi). */
export function eigSym3(S: Mat): { values: number[]; vectors: number[][] } {
  const A = S.map((r) => r.slice());
  const V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 50; sweep++) {
    let off = 0;
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) off += A[i][j] ** 2;
    if (off < 1e-20) break;
    for (let p = 0; p < 3; p++)
      for (let q = p + 1; q < 3; q++) {
        if (Math.abs(A[p][q]) < 1e-15) continue;
        const theta = (A[q][q] - A[p][p]) / (2 * A[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < 3; k++) {
          const akp = A[k][p], akq = A[k][q];
          A[k][p] = c * akp - s * akq;
          A[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < 3; k++) {
          const apk = A[p][k], aqk = A[q][k];
          A[p][k] = c * apk - s * aqk;
          A[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < 3; k++) {
          const vkp = V[k][p], vkq = V[k][q];
          V[k][p] = c * vkp - s * vkq;
          V[k][q] = s * vkp + c * vkq;
        }
      }
  }
  const idx = [0, 1, 2].sort((i, j) => A[j][j] - A[i][i]);
  return { values: idx.map((i) => clean(A[i][i], 1e-9)), vectors: idx.map((i) => [V[0][i], V[1][i], V[2][i]].map((x) => clean(x, 1e-9))) };
}
