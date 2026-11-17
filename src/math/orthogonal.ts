import { inverse, mul, mulVec, transpose, type Mat } from "./mat";
import { clean } from "./tolerance";
import { dot, isZeroVec, norm, proj, scale, sub, type Vec } from "./vec";

export interface GSStep {
  /** Índice do vetor original sendo processado. */
  index: number;
  /** Vetor original vᵢ. */
  v: Vec;
  /** Projeções subtraídas (sobre cada wⱼ anterior). */
  projections: Vec[];
  /** Vetor ortogonal resultante wᵢ (pode ser nulo se dependente). */
  w: Vec;
  dependent: boolean;
}

/** Gram–Schmidt com registro dos passos. */
export function gramSchmidt(vs: Vec[]): { steps: GSStep[]; orthogonal: Vec[]; orthonormal: Vec[] } {
  const ws: Vec[] = [];
  const steps: GSStep[] = [];
  vs.forEach((v, index) => {
    const projections = ws.map((w) => proj(v, w)!);
    let w = v.slice();
    for (const p of projections) w = sub(w, p);
    w = w.map((x) => clean(x, 1e-9));
    const dependent = isZeroVec(w, 1e-9);
    steps.push({ index, v, projections, w, dependent });
    if (!dependent) ws.push(w);
  });
  return { steps, orthogonal: ws, orthonormal: ws.map((w) => scale(w, 1 / norm(w))) };
}

export interface FitResult {
  /** Coeficientes do grau 0 ao grau n. */
  coeffs: number[];
  AtA: Mat;
  Atb: number[];
  residuals: number[];
  sse: number;
}

/** Mínimos quadrados para polinômio de grau `degree` (equações normais AᵀA x = Aᵀb). */
export function leastSquares(points: [number, number][], degree: number): FitResult | null {
  if (points.length < degree + 1) return null;
  const A = points.map(([x]) => Array.from({ length: degree + 1 }, (_, k) => x ** k));
  const b = points.map(([, y]) => y);
  const At = transpose(A);
  const AtA = mul(At, A);
  const Atb = mulVec(At, b).map((x) => clean(x));
  const inv = inverse(AtA);
  if (!inv) return null;
  const coeffs = mulVec(inv, Atb).map((x) => clean(x, 1e-9));
  const residuals = points.map(([x, y]) => y - coeffs.reduce((s, c, k) => s + c * x ** k, 0));
  return { coeffs, AtA, Atb, residuals, sse: dot(residuals, residuals) };
}
