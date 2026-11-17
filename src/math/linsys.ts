import { col, rrefPlain, type Mat } from "./mat";
import { clean } from "./tolerance";

export type SysType = "SPD" | "SPI" | "SI";

export interface SysResult {
  type: SysType;
  rankA: number;
  rankAug: number;
  /** Número de incógnitas. */
  n: number;
  /** Solução particular (variáveis livres = 0). */
  particular: number[] | null;
  /** Vetores diretores da solução geral (um por variável livre). */
  directions: number[][];
  free: number[];
  pivots: number[];
  rref: Mat;
}

export const SYS_NAMES: Record<SysType, string> = {
  SPD: "Sistema possível e determinado (SPD)",
  SPI: "Sistema possível e indeterminado (SPI)",
  SI: "Sistema impossível (SI)",
};

/** Resolve o sistema dado pela matriz aumentada [A | b]. */
export function solveSystem(aug: Mat): SysResult {
  const n = aug[0].length - 1;
  const { R, pivots: allPivots } = rrefPlain(aug);
  const pivots = allPivots.filter((c) => c < n);
  const rankA = pivots.length;
  const rankAug = allPivots.length;
  const free = Array.from({ length: n }, (_, i) => i).filter((i) => !pivots.includes(i));
  if (rankAug > rankA) {
    return { type: "SI", rankA, rankAug, n, particular: null, directions: [], free, pivots, rref: R };
  }
  const particular = Array(n).fill(0);
  pivots.forEach((c, row) => (particular[c] = clean(R[row][n])));
  const directions = free.map((f) => {
    const v = Array(n).fill(0);
    v[f] = 1;
    pivots.forEach((c, row) => (v[c] = clean(-R[row][f])));
    return v;
  });
  return { type: free.length === 0 ? "SPD" : "SPI", rankA, rankAug, n, particular, directions, free, pivots, rref: R };
}

/** Base do núcleo de A (soluções de Ax = 0). */
export function nullspace(A: Mat): number[][] {
  return solveSystem(A.map((r) => [...r, 0])).directions;
}

/** Base da imagem (espaço coluna): colunas de A nas posições dos pivôs. */
export function columnSpace(A: Mat): number[][] {
  const { pivots } = rrefPlain(A);
  return pivots.map((j) => col(A, j));
}

/** Regra de Cramer para sistemas quadrados; null se det = 0. */
export function cramer(A: Mat, b: number[], detFn: (M: Mat) => number): { D: number; Di: number[]; x: number[] } | null {
  const D = detFn(A);
  if (Math.abs(D) < 1e-12) return null;
  const Di = A[0].map((_, j) => detFn(A.map((r, i) => r.map((x, k) => (k === j ? b[i] : x)))));
  return { D, Di, x: Di.map((d) => clean(d / D)) };
}
