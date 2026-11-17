import type { ConicCoeffs } from "./conics";
import { tex } from "./format";

/** αx² + βy² + γz² + δx + εy + ζz + η = 0 (sem termos mistos). */
export interface QuadricCoeffs {
  X2: number;
  Y2: number;
  Z2: number;
  X: number;
  Y: number;
  Z: number;
  K: number;
}

export type QuadricId =
  | "elipsoide"
  | "hiperboloide1"
  | "hiperboloide2"
  | "cone"
  | "paraboloide-eliptico"
  | "paraboloide-hiperbolico"
  | "cilindro-eliptico"
  | "cilindro-hiperbolico"
  | "cilindro-parabolico";

export interface QuadricDef {
  id: QuadricId;
  name: string;
  coeffs: (a: number, b: number, c: number) => QuadricCoeffs;
  equation: (a: number, b: number, c: number) => string;
  /** Quais parâmetros são usados. */
  uses: ("a" | "b" | "c")[];
  note: string;
}

const fr = (v: string, k: number) => (Math.abs(k - 1) < 1e-12 ? `${v}^2` : `\\frac{${v}^2}{${tex(k * k)}}`);
const lin = (v: string, k: number) => (Math.abs(k - 1) < 1e-12 ? v : `\\frac{${v}}{${tex(k)}}`);

export const QUADRICS: QuadricDef[] = [
  {
    id: "elipsoide",
    name: "Elipsoide",
    uses: ["a", "b", "c"],
    coeffs: (a, b, c) => ({ X2: 1 / a ** 2, Y2: 1 / b ** 2, Z2: 1 / c ** 2, X: 0, Y: 0, Z: 0, K: -1 }),
    equation: (a, b, c) => `${fr("x", a)} + ${fr("y", b)} + ${fr("z", c)} = 1`,
    note: "Todos os traços são elipses (ou pontos, ou vazios). Com a = b = c é uma esfera.",
  },
  {
    id: "hiperboloide1",
    name: "Hiperboloide de uma folha",
    uses: ["a", "b", "c"],
    coeffs: (a, b, c) => ({ X2: 1 / a ** 2, Y2: 1 / b ** 2, Z2: -1 / c ** 2, X: 0, Y: 0, Z: 0, K: -1 }),
    equation: (a, b, c) => `${fr("x", a)} + ${fr("y", b)} - ${fr("z", c)} = 1`,
    note: "Um sinal negativo. Traços horizontais (z = k) são sempre elipses; verticais são hipérboles.",
  },
  {
    id: "hiperboloide2",
    name: "Hiperboloide de duas folhas",
    uses: ["a", "b", "c"],
    coeffs: (a, b, c) => ({ X2: -1 / a ** 2, Y2: -1 / b ** 2, Z2: 1 / c ** 2, X: 0, Y: 0, Z: 0, K: -1 }),
    equation: (a, b, c) => `-${fr("x", a)} - ${fr("y", b)} + ${fr("z", c)} = 1`,
    note: "Dois sinais negativos. Para |k| < c o plano z = k não encontra a superfície.",
  },
  {
    id: "cone",
    name: "Cone elíptico",
    uses: ["a", "b", "c"],
    coeffs: (a, b, c) => ({ X2: 1 / a ** 2, Y2: 1 / b ** 2, Z2: -1 / c ** 2, X: 0, Y: 0, Z: 0, K: 0 }),
    equation: (a, b, c) => `${fr("x", a)} + ${fr("y", b)} - ${fr("z", c)} = 0`,
    note: "Os cortes de um cone geram todas as cônicas: elipse, parábola, hipérbole e casos degenerados.",
  },
  {
    id: "paraboloide-eliptico",
    name: "Paraboloide elíptico",
    uses: ["a", "b", "c"],
    coeffs: (a, b, c) => ({ X2: 1 / a ** 2, Y2: 1 / b ** 2, Z2: 0, X: 0, Y: 0, Z: -1 / c, K: 0 }),
    equation: (a, b, c) => `${lin("z", c)} = ${fr("x", a)} + ${fr("y", b)}`,
    note: "Traços horizontais são elipses; verticais são parábolas.",
  },
  {
    id: "paraboloide-hiperbolico",
    name: "Paraboloide hiperbólico (sela)",
    uses: ["a", "b", "c"],
    coeffs: (a, b, c) => ({ X2: 1 / a ** 2, Y2: -1 / b ** 2, Z2: 0, X: 0, Y: 0, Z: -1 / c, K: 0 }),
    equation: (a, b, c) => `${lin("z", c)} = ${fr("x", a)} - ${fr("y", b)}`,
    note: "Traços horizontais são hipérboles (em z = 0, duas retas); verticais são parábolas.",
  },
  {
    id: "cilindro-eliptico",
    name: "Cilindro elíptico",
    uses: ["a", "b"],
    coeffs: (a, b) => ({ X2: 1 / a ** 2, Y2: 1 / b ** 2, Z2: 0, X: 0, Y: 0, Z: 0, K: -1 }),
    equation: (a, b) => `${fr("x", a)} + ${fr("y", b)} = 1`,
    note: "A variável z não aparece: a elipse do plano xy se repete em toda altura.",
  },
  {
    id: "cilindro-hiperbolico",
    name: "Cilindro hiperbólico",
    uses: ["a", "b"],
    coeffs: (a, b) => ({ X2: 1 / a ** 2, Y2: -1 / b ** 2, Z2: 0, X: 0, Y: 0, Z: 0, K: -1 }),
    equation: (a, b) => `${fr("x", a)} - ${fr("y", b)} = 1`,
    note: "A hipérbole do plano xy é arrastada ao longo do eixo z.",
  },
  {
    id: "cilindro-parabolico",
    name: "Cilindro parabólico",
    uses: ["a"],
    coeffs: (a) => ({ X2: 1 / a ** 2, Y2: 0, Z2: 0, X: 0, Y: -1, Z: 0, K: 0 }),
    equation: (a) => `y = ${fr("x", a)}`,
    note: "A parábola do plano xy é arrastada ao longo do eixo z.",
  },
];

export const quadricF = (q: QuadricCoeffs) => (x: number, y: number, z: number): number =>
  q.X2 * x * x + q.Y2 * y * y + q.Z2 * z * z + q.X * x + q.Y * y + q.Z * z + q.K;

/**
 * Traço da quádrica no plano (eixo) = k, como cônica nas duas variáveis restantes
 * (na ordem natural: x=k → (y, z); y=k → (x, z); z=k → (x, y)).
 */
export function quadricTrace(q: QuadricCoeffs, axis: "x" | "y" | "z", k: number): { conic: ConicCoeffs; vars: [string, string] } {
  if (axis === "x")
    return { conic: { A: q.Y2, B: 0, C: q.Z2, D: q.Y, E: q.Z, F: q.X2 * k * k + q.X * k + q.K }, vars: ["y", "z"] };
  if (axis === "y")
    return { conic: { A: q.X2, B: 0, C: q.Z2, D: q.X, E: q.Z, F: q.Y2 * k * k + q.Y * k + q.K }, vars: ["x", "z"] };
  return { conic: { A: q.X2, B: 0, C: q.Y2, D: q.X, E: q.Y, F: q.Z2 * k * k + q.Z * k + q.K }, vars: ["x", "y"] };
}
