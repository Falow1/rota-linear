import { charPoly3, realCubicRoots } from "./eigen";
import { toFraction } from "./fraction";
import { addM, identity, inverse, mul, rrefPlain, scaleM, type Mat } from "./mat";
import { clean } from "./tolerance";

/** Base do núcleo com tolerância ajustável (autovalores numéricos não são exatos). */
export function nullspaceTol(A: Mat, eps = 1e-6): number[][] {
  const n = A[0].length;
  const { R, pivots } = rrefPlain(A, eps);
  const free = Array.from({ length: n }, (_, i) => i).filter((i) => !pivots.includes(i));
  return free.map((f) => {
    const v = Array(n).fill(0);
    v[f] = 1;
    pivots.forEach((c, row) => (v[c] = clean(-R[row][f], 1e-7)));
    return niceDirection(v);
  });
}

/** Reescala uma direção para ter coordenadas inteiras pequenas e a primeira não nula positiva. */
export function niceDirection(v: number[]): number[] {
  const nz = v.filter((x) => Math.abs(x) > 1e-9);
  if (nz.length === 0) return v;
  if (nz[0] < 0) v = v.map((x) => -x);
  for (let k = 1; k <= 12; k++) {
    const w = v.map((x) => x * k);
    if (w.every((x) => Math.abs(x - Math.round(x)) < 1e-7)) {
      const ints = w.map((x) => Math.round(x));
      let g = 0;
      const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
      for (const x of ints) g = gcd(g, x);
      return ints.map((x) => (g ? x / g : x) || 0);
    }
  }
  return v;
}

const snap = (x: number) => {
  const f = toFraction(x, 64, 1e-6);
  return f ? f.n / f.d : clean(x, 1e-9);
};

export interface EigenGroup {
  value: number;
  /** Multiplicidade algébrica (vezes que é raiz de p). */
  alg: number;
  /** Multiplicidade geométrica (dimensão do autoespaço). */
  geo: number;
  basis: number[][];
}

export type Eig3 =
  | { kind: "real"; groups: EigenGroup[]; diagonalizable: boolean; P: Mat | null; D: Mat | null }
  | { kind: "complex"; real: EigenGroup; re: number; im: number };

/** Autovalores (com multiplicidades) e autoespaços de uma matriz 3×3 qualquer. */
export function eig3(A: Mat): Eig3 {
  const [, a, b, c] = charPoly3(A);
  const roots = realCubicRoots(a, b, c).map(snap);
  const groupOf = (l: number, alg: number): EigenGroup => {
    const basis = nullspaceTol(addM(A, scaleM(identity(3), -l)));
    return { value: l, alg, geo: basis.length, basis };
  };
  if (roots.length === 1) {
    const r = roots[0];
    const p1 = a + r, q1 = b + r * (a + r); // x² + p1 x + q1
    const disc = p1 * p1 - 4 * q1;
    if (disc < -1e-9) return { kind: "complex", real: groupOf(r, 1), re: clean(-p1 / 2), im: Math.sqrt(-disc) / 2 };
    // raízes reais que a fórmula perdeu por arredondamento
    const s = Math.sqrt(Math.max(0, disc));
    roots.push(snap((-p1 + s) / 2), snap((-p1 - s) / 2));
  }
  const values: { v: number; m: number }[] = [];
  for (const r of roots) {
    const g = values.find((x) => Math.abs(x.v - r) < 1e-5);
    if (g) g.m++;
    else values.push({ v: r, m: 1 });
  }
  values.sort((x, y) => y.v - x.v);
  const groups = values.map(({ v, m }) => groupOf(v, m));
  const diagonalizable = groups.every((g) => g.geo === g.alg);
  let P: Mat | null = null, D: Mat | null = null;
  if (diagonalizable) {
    const cols = groups.flatMap((g) => g.basis);
    const vals = groups.flatMap((g) => g.basis.map(() => g.value));
    P = [0, 1, 2].map((i) => cols.map((c) => c[i]));
    D = [0, 1, 2].map((i) => [0, 1, 2].map((j) => (i === j ? vals[i] : 0)));
  }
  return { kind: "real", groups, diagonalizable, P, D };
}

const isZeroMat = (M: Mat, eps = 1e-6) => M.every((r) => r.every((x) => Math.abs(x) < eps));

/** Polinômio (coeficientes do maior grau para o menor) a partir de fatores (x − λ)^k. */
export function expandFactors(factors: { value: number; k: number }[]): number[] {
  let p = [1];
  for (const { value, k } of factors)
    for (let i = 0; i < k; i++) {
      const q = Array(p.length + 1).fill(0);
      p.forEach((c, j) => {
        q[j] += c;
        q[j + 1] -= c * value;
      });
      p = q;
    }
  return p.map((x) => clean(x));
}

export interface MinimalPoly {
  /** Fatores (x − λ)^k; vazio no caso complexo, em que m = p. */
  factors: { value: number; k: number }[];
  coeffs: number[];
  /** Candidatos testados (do menor grau ao maior) e se anularam A. */
  tried: { factors: { value: number; k: number }[]; zero: boolean }[];
  equalsChar: boolean;
}

/** Polinômio minimal: o polinômio mônico de menor grau com m(A) = 0. */
export function minimalPoly3(A: Mat, e: Eig3): MinimalPoly {
  const [, a, b, c] = charPoly3(A);
  if (e.kind === "complex") return { factors: [], coeffs: [1, a, b, c], tried: [], equalsChar: true };
  const g = e.groups;
  const combos: number[][] = [];
  const rec = (i: number, cur: number[]) => {
    if (i === g.length) return void combos.push(cur);
    for (let k = 1; k <= g[i].alg; k++) rec(i + 1, [...cur, k]);
  };
  rec(0, []);
  combos.sort((x, y) => x.reduce((s, t) => s + t, 0) - y.reduce((s, t) => s + t, 0));
  const I = identity(3);
  const tried: MinimalPoly["tried"] = [];
  for (const ks of combos) {
    let M = I;
    ks.forEach((k, i) => {
      const B = addM(A, scaleM(I, -g[i].value));
      for (let t = 0; t < k; t++) M = mul(M, B);
    });
    const factors = ks.map((k, i) => ({ value: g[i].value, k }));
    const zero = isZeroMat(M);
    tried.push({ factors, zero });
    if (zero) {
      const deg = ks.reduce((s, t) => s + t, 0);
      return { factors, coeffs: expandFactors(factors), tried, equalsChar: deg === 3 };
    }
  }
  const factors = g.map((x) => ({ value: x.value, k: x.alg }));
  return { factors, coeffs: expandFactors(factors), tried, equalsChar: true };
}

/** Hamilton–Cayley: p(A) = A³ + aA² + bA + cI (deve dar a matriz nula). */
export function hamiltonCayley(A: Mat) {
  const [, a, b, c] = charPoly3(A);
  const I = identity(3);
  const A2 = mul(A, A);
  const A3 = mul(A2, A);
  const pA = addM(addM(A3, scaleM(A2, a)), addM(scaleM(A, b), scaleM(I, c))).map((r) => r.map((x) => clean(x, 1e-7)));
  // A⁻¹ = −(A² + aA + bI)/c, quando c = −det A ≠ 0
  const inv = Math.abs(c) > 1e-12 ? scaleM(addM(addM(A2, scaleM(A, a)), scaleM(I, b)), -1 / c).map((r) => r.map((x) => clean(x))) : null;
  return { coeffs: [1, a, b, c] as [number, number, number, number], A2, A3, pA, inv, invCheck: inverse(A) };
}
