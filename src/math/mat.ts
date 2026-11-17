import { clean, isZero } from "./tolerance";
import type { Vec } from "./vec";

export type Mat = number[][];

export const identity = (n: number): Mat =>
  Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));

export const zeros = (r: number, c: number): Mat => Array.from({ length: r }, () => Array(c).fill(0));

export const clone = (A: Mat): Mat => A.map((r) => r.slice());

export function transpose(A: Mat): Mat {
  return A[0].map((_, j) => A.map((r) => r[j]));
}

export function mul(A: Mat, B: Mat): Mat {
  return A.map((row) => B[0].map((_, j) => clean(row.reduce((s, a, k) => s + a * B[k][j], 0))));
}

export function mulVec(A: Mat, v: Vec): Vec {
  return A.map((row) => row.reduce((s, a, k) => s + a * v[k], 0));
}

export function addM(A: Mat, B: Mat): Mat {
  return A.map((r, i) => r.map((x, j) => x + B[i][j]));
}

export function scaleM(A: Mat, k: number): Mat {
  return A.map((r) => r.map((x) => x * k));
}

export const trace = (A: Mat): number => A.reduce((s, r, i) => s + r[i], 0);

/** Coluna j de A. */
export const col = (A: Mat, j: number): Vec => A.map((r) => r[j]);

/** Matriz cujas colunas são os vetores dados. */
export const fromCols = (cols: Vec[]): Mat => cols[0].map((_, i) => cols.map((c) => c[i]));

export function det(A: Mat): number {
  const n = A.length;
  if (n === 1) return A[0][0];
  if (n === 2) return clean(A[0][0] * A[1][1] - A[0][1] * A[1][0]);
  if (n === 3) {
    const [[a, b, c], [d, e, f], [g, h, i]] = A;
    return clean(a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g));
  }
  const M = clone(A);
  let s = 1;
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[p][k])) p = i;
    if (isZero(M[p][k])) return 0;
    if (p !== k) {
      [M[p], M[k]] = [M[k], M[p]];
      s = -s;
    }
    for (let i = k + 1; i < n; i++) {
      const f = M[i][k] / M[k][k];
      for (let j = k; j < n; j++) M[i][j] -= f * M[k][j];
    }
  }
  return clean(M.reduce((acc, r, i) => acc * r[i], s));
}

/** Menor complementar: remove linha i e coluna j. */
export function minor(A: Mat, i: number, j: number): Mat {
  return A.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));
}

export const cofactor = (A: Mat, i: number, j: number): number => ((i + j) % 2 === 0 ? 1 : -1) * det(minor(A, i, j));

export function inverse(A: Mat): Mat | null {
  const n = A.length;
  const M = A.map((r, i) => [...r, ...identity(n)[i]]);
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[p][k])) p = i;
    if (Math.abs(M[p][k]) < 1e-10) return null;
    [M[p], M[k]] = [M[k], M[p]];
    const pv = M[k][k];
    for (let j = 0; j < 2 * n; j++) M[k][j] /= pv;
    for (let i = 0; i < n; i++) {
      if (i === k) continue;
      const f = M[i][k];
      for (let j = 0; j < 2 * n; j++) M[i][j] -= f * M[k][j];
    }
  }
  return M.map((r) => r.slice(n).map((x) => clean(x)));
}

/** Escalonamento reduzido sem registro de passos (uso interno). */
export function rrefPlain(A: Mat, eps = 1e-9): { R: Mat; pivots: number[] } {
  const M = clone(A);
  const rows = M.length;
  const cols = M[0].length;
  const pivots: number[] = [];
  let r = 0;
  for (let c = 0; c < cols && r < rows; c++) {
    let p = r;
    for (let i = r + 1; i < rows; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
    const scaleRef = Math.max(1, ...M.map((row) => Math.abs(row[c])));
    if (Math.abs(M[p][c]) < eps * scaleRef) continue;
    [M[p], M[r]] = [M[r], M[p]];
    const pv = M[r][c];
    for (let j = 0; j < cols; j++) M[r][j] /= pv;
    for (let i = 0; i < rows; i++) {
      if (i === r) continue;
      const f = M[i][c];
      if (f !== 0) for (let j = 0; j < cols; j++) M[i][j] -= f * M[r][j];
    }
    pivots.push(c);
    r++;
  }
  return { R: M.map((row) => row.map((x) => clean(x))), pivots };
}

export const rank = (A: Mat): number => rrefPlain(A).pivots.length;

/** Matriz 2x2 de rotação por ângulo (rad). */
export const rot2 = (t: number): Mat => [
  [Math.cos(t), -Math.sin(t)],
  [Math.sin(t), Math.cos(t)],
];

/** Interpolação linear entre matrizes. */
export const lerpM = (A: Mat, B: Mat, t: number): Mat => A.map((r, i) => r.map((x, j) => x + (B[i][j] - x) * t));

export const isSymmetric = (A: Mat, eps = 1e-9): boolean =>
  A.every((r, i) => r.every((x, j) => Math.abs(x - A[j][i]) < eps));
