import { choices, int, ivec, nz, pick, shuffle, until } from "../learn/rng";
import type { Generator } from "../learn/types";
import { texLinear, texMatrix } from "../math/format";
import { charPoly3 } from "../math/eigen";
import { det, mul, rank, type Mat } from "../math/mat";
import type { TrackGens } from "./index";
import { n, nice, p, tp } from "./kit";

/* ---------- Utilidades da rota ---------- */

const M = (A: Mat) => texMatrix(A, { maxDen: 60 });
const mulV = (A: Mat, x: number[]) => A.map((row) => row.reduce((s, a, k) => s + a * x[k], 0));
const dot = (u: number[], v: number[]) => u.reduce((s, x, i) => s + x * v[i], 0);
const scale = (k: number, v: number[]) => v.map((x) => k * x || 0);
const sub = (u: number[], v: number[]) => u.map((x, i) => x - v[i] || 0);
const clean = (A: Mat) => A.map((r) => r.map((x) => Math.round(x * 1e9) / 1e9 || 0));
const nonzero = (v: number[]) => v.some((x) => x !== 0);
const diag = (...d: number[]): Mat => d.map((x, i) => d.map((_, j) => (i === j ? x : 0)));

/** P 2×2 inteira com det ±1 (inversa inteira). */
function unimodular(r: () => number): { P: Mat; Pi: Mat } {
  const P = until(
    () => [ivec(r, 2, -2, 2), ivec(r, 2, -2, 2)],
    (X) => Math.abs(det(X)) === 1 && X[0][1] !== 0 && X[1][0] !== 0,
  );
  const d = det(P);
  const Pi = [
    [P[1][1] / d, -P[0][1] / d],
    [-P[1][0] / d, P[0][0] / d],
  ].map((row) => row.map((x) => x || 0));
  return { P, Pi };
}

/** A = PDP⁻¹ com autovalores inteiros distintos e entradas pequenas. */
function eigenCase(r: () => number, lo = -4, hi = 4) {
  return until(
    () => {
      const { P, Pi } = unimodular(r);
      const l1 = int(r, lo, hi);
      const l2 = until(() => int(r, lo, hi), (x) => x !== l1);
      const A = clean(mul(mul(P, diag(l1, l2)), Pi));
      return { P, Pi, l: [l1, l2], A, v: [[P[0][0], P[1][0]], [P[0][1], P[1][1]]] };
    },
    ({ A }) => A.flat().every((x) => Math.abs(x) <= 9) && (A[0][1] !== 0 || A[1][0] !== 0),
  );
}

/* ---------- H1 · Autovalores e autovetores ---------- */

const H1: Generator[] = [
  {
    id: "H1.poli",
    title: "Polinômio característico",
    level: 1,
    make: (r) => {
      const A = until(() => [ivec(r, 2, -4, 4), ivec(r, 2, -4, 4)], (X) => X[0][1] !== 0 || X[1][0] !== 0);
      const tr = A[0][0] + A[1][1], d = det(A);
      return {
        prompt: `Escreva o polinômio característico de $A = ${M(A)}$ na forma $\\lambda^2 + b\\lambda + c$. Quais são $b$ e $c$?`,
        answer: { kind: "vector", value: [-tr || 0, d], names: ["b", "c"] },
        hint: "Para 2×2: $p(\\lambda) = \\lambda^2 - (\\operatorname{tr} A)\\lambda + \\det A$.",
        solution: [`$\\operatorname{tr} A = ${n(A[0][0])} + ${p(A[1][1])} = ${n(tr)}$`, `$\\det A = ${p(A[0][0])}\\cdot${p(A[1][1])} - ${p(A[0][1])}\\cdot${p(A[1][0])} = ${n(d)}$`, `$b = ${n(-tr || 0)}$ e $c = ${n(d)}$`],
      };
    },
  },
  {
    id: "H1.valores",
    title: "Achar os autovalores",
    level: 2,
    make: (r) => {
      const { A, l } = eigenCase(r);
      const [big, small] = l[0] > l[1] ? l : [l[1], l[0]];
      const tr = big + small, d = big * small;
      return {
        prompt: `Quais são os autovalores de $A = ${M(A)}$?`,
        answer: { kind: "vector", value: [big, small], names: ["λ₁ (maior)", "λ₂ (menor)"] },
        hint: "Resolva $\\lambda^2 - (\\operatorname{tr} A)\\lambda + \\det A = 0$.",
        solution: [
          `$\\operatorname{tr} A = ${n(tr)}$ e $\\det A = ${n(d)}$`,
          `$${texLinear([1, -tr], ["\\lambda^2", "\\lambda"], d)} = 0$`,
          `Raízes: $\\lambda_1 = ${n(big)}$ e $\\lambda_2 = ${n(small)}$ (soma ${n(tr)}, produto ${n(d)}).`,
        ],
      };
    },
  },
  {
    id: "H1.vetor",
    title: "Achar um autovetor",
    level: 2,
    make: (r) => {
      const { A, l, v } = eigenCase(r);
      const k = int(r, 0, 1);
      const L = l[k], w = v[k];
      const B = [
        [A[0][0] - L, A[0][1]],
        [A[1][0], A[1][1] - L],
      ];
      return {
        prompt: `$\\lambda = ${n(L)}$ é autovalor de $A = ${M(A)}$. Dê um autovetor associado.`,
        answer: { kind: "direction", value: w },
        hint: "Resolva $(A - \\lambda I)\\vec v = \\vec 0$. As duas linhas dão a mesma equação.",
        solution: [`$A - ${p(L)}I = ${M(B)}$`, `Uma solução não nula é $${tp(w)}$ (qualquer múltiplo serve).`, `Confira: $A${tp(w)} = ${tp(mulV(A, w))} = ${n(L)}\\cdot${tp(w)}$`],
      };
    },
  },
  {
    id: "H1.eh",
    title: "É autovetor?",
    level: 1,
    make: (r) => {
      const { A, v } = eigenCase(r);
      const yes = r() < 0.5;
      const w = yes ? scale(pick(r, [1, -1, 2]), v[int(r, 0, 1)]) : until(() => ivec(r, 2, -3, 3), (x) => nonzero(x) && Math.abs(mulV(A, x)[0] * x[1] - mulV(A, x)[1] * x[0]) > 1e-9);
      const Aw = mulV(A, w);
      const { options, correct } = choices(r, "Sim", ["Não"]);
      return {
        prompt: `$\\vec v = ${tp(w)}$ é autovetor de $A = ${M(A)}$?`,
        answer: { kind: "choice", options, correct: yes ? correct : 1 - correct },
        hint: "Calcule $A\\vec v$ e veja se é um múltiplo de $\\vec v$.",
        solution: [`$A\\vec v = ${tp(Aw)}$`, yes ? `É $${n(w[0] !== 0 ? Aw[0] / w[0] : Aw[1] / w[1])}$ vezes $\\vec v$: é autovetor.` : "Não é múltiplo de $\\vec v$: a direção mudou, então não é autovetor."],
      };
    },
  },
];

/* ---------- H2 · Diagonalização ---------- */

const H2: Generator[] = [
  {
    id: "H2.D",
    title: "A matriz diagonal",
    level: 2,
    make: (r) => {
      const { A, P, l } = eigenCase(r);
      const D = diag(l[0], l[1]);
      const c1 = [P[0][0], P[1][0]], c2 = [P[0][1], P[1][1]];
      return {
        prompt: `As colunas de $P = ${M(P)}$ são autovetores de $A = ${M(A)}$. Qual é a matriz diagonal $D$ com $A = PDP^{-1}$?`,
        answer: { kind: "matrix", value: D },
        hint: "Na diagonal de $D$ vão os autovalores, na mesma ordem das colunas de $P$. Calcule $A$ vezes cada coluna.",
        solution: [`$A${tp(c1)} = ${tp(mulV(A, c1))} = ${n(l[0])}${tp(c1)}$`, `$A${tp(c2)} = ${tp(mulV(A, c2))} = ${n(l[1])}${tp(c2)}$`, `$D = ${M(D)}$`],
      };
    },
  },
  {
    id: "H2.potencia",
    title: "Potência pela diagonal",
    level: 3,
    make: (r) => {
      const { P, Pi, A, l } = eigenCase(r, -2, 2);
      const k = pick(r, [2, 3, 4]);
      const Dk = diag(l[0] ** k, l[1] ** k);
      const Ak = clean(mul(mul(P, Dk), Pi));
      return {
        prompt: `$A = ${M(A)} = PDP^{-1}$, com $P = ${M(P)}$, $D = ${M(diag(l[0], l[1]))}$ e $P^{-1} = ${M(Pi)}$. Calcule $A^{${k}}$.`,
        answer: { kind: "matrix", value: Ak },
        hint: `$A^{${k}} = PD^{${k}}P^{-1}$, e $D^{${k}}$ é só elevar a diagonal.`,
        solution: [`$D^{${k}} = ${M(Dk)}$`, `$PD^{${k}} = ${M(mul(P, Dk))}$`, `$A^{${k}} = PD^{${k}}P^{-1} = ${M(Ak)}$`],
      };
    },
  },
  {
    id: "H2.forma",
    title: "Elipse ou hipérbole?",
    level: 2,
    make: (r) => {
      const S = until(
        () => {
          const b = int(r, -2, 2);
          return [
            [nz(r, -3, 3), b],
            [b, nz(r, -3, 3)],
          ];
        },
        (X) => det(X) !== 0 && X[0][1] !== 0,
      );
      const d = det(S), tr = S[0][0] + S[1][1];
      const kind = d < 0 ? "Hipérbole" : tr > 0 ? "Elipse" : "Nenhum ponto (conjunto vazio)";
      const others = ["Elipse", "Hipérbole", "Nenhum ponto (conjunto vazio)", "Parábola"].filter((x) => x !== kind);
      const { options, correct } = choices(r, kind, shuffle(r, others));
      const quad = `${texLinear([S[0][0], 2 * S[0][1], S[1][1]], ["x^2", "xy", "y^2"])} = 1`;
      return {
        prompt: `Que curva é $${quad}$?`,
        answer: { kind: "choice", options, correct },
        hint: "Monte a matriz simétrica da forma. Os sinais dos autovalores decidem: o produto deles é o determinante e a soma é o traço.",
        solution: [
          `Matriz da forma: $${M(S)}$, com $\\det = ${n(d)}$ e traço $${n(tr)}$.`,
          d < 0
            ? "Determinante negativo: autovalores de sinais opostos, então é uma hipérbole."
            : tr > 0
              ? "Determinante positivo e traço positivo: os dois autovalores são positivos, então é uma elipse."
              : "Determinante positivo e traço negativo: os dois autovalores são negativos. O lado esquerdo nunca chega a 1: nenhum ponto.",
        ],
      };
    },
  },
];

/* ---------- H3 · 3×3 e Hamilton–Cayley ---------- */

const H3: Generator[] = [
  {
    id: "H3.tri",
    title: "Autovalores de uma triangular",
    level: 1,
    make: (r) => {
      const d = until(() => ivec(r, 3, -4, 5), (x) => new Set(x).size === 3);
      const A = [
        [d[0], int(r, -3, 3), int(r, -3, 3)],
        [0, d[1], int(r, -3, 3)],
        [0, 0, d[2]],
      ];
      const sorted = [...d].sort((a, b) => a - b);
      return {
        prompt: `Quais são os autovalores de $A = ${M(A)}$, em ordem crescente?`,
        answer: { kind: "vector", value: sorted, names: ["λ₁", "λ₂", "λ₃"] },
        hint: "Numa matriz triangular, $\\det(A - \\lambda I)$ é o produto da diagonal de $A - \\lambda I$.",
        solution: [`$p(\\lambda) = (${n(d[0])} - \\lambda)(${n(d[1])} - \\lambda)(${n(d[2])} - \\lambda)$`, `Autovalores: $${sorted.map(n).join(",\\; ")}$`],
      };
    },
  },
  {
    id: "H3.mg",
    title: "Multiplicidade geométrica",
    level: 3,
    make: (r) => {
      const a = int(r, -3, 4);
      const b = until(() => int(r, -3, 4), (x) => x !== a);
      const x = r() < 0.5 ? 0 : nz(r, -3, 3);
      const A = [
        [a, x, int(r, -2, 2)],
        [0, a, int(r, -2, 2)],
        [0, 0, b],
      ];
      const B = A.map((row, i) => row.map((y, j) => (i === j ? y - a : y)));
      const rk = rank(B);
      return {
        prompt: `$\\lambda = ${n(a)}$ é autovalor de $A = ${M(A)}$ com multiplicidade algébrica $2$. Qual é a multiplicidade geométrica dele?`,
        answer: { kind: "number", value: 3 - rk, label: "$m_g$" },
        hint: "$m_g = 3 - \\operatorname{posto}(A - \\lambda I)$: é a dimensão do autoespaço.",
        solution: [`$A - ${p(a)}I = ${M(B)}$`, `Posto $${rk}$, então $m_g = 3 - ${rk} = ${3 - rk}$.`],
      };
    },
  },
  {
    id: "H3.diag",
    title: "É diagonalizável?",
    level: 3,
    make: (r) => {
      const mode = int(r, 0, 2);
      const a = int(r, -3, 4);
      const b = until(() => int(r, -3, 4), (x) => x !== a);
      const c = until(() => int(r, -3, 4), (x) => x !== a && x !== b);
      const x = mode === 2 ? nz(r, -3, 3) : int(r, -2, 2);
      const A =
        mode === 0
          ? [
              [a, x, int(r, -2, 2)],
              [0, b, int(r, -2, 2)],
              [0, 0, c],
            ]
          : [
              [a, mode === 1 ? 0 : x, int(r, -2, 2)],
              [0, a, int(r, -2, 2)],
              [0, 0, b],
            ];
      const yes = mode !== 2;
      const { options, correct } = choices(r, "Sim", ["Não"]);
      const B = A.map((row, i) => row.map((y, j) => (i === j ? y - a : y)));
      return {
        prompt: `A matriz $A = ${M(A)}$ é diagonalizável?`,
        answer: { kind: "choice", options, correct: yes ? correct : 1 - correct },
        hint: "Autovalores distintos garantem que sim. Com um autovalor repetido, compare a multiplicidade algébrica com a geométrica.",
        solution:
          mode === 0
            ? ["A diagonal tem três valores distintos: três autovalores distintos, então é diagonalizável."]
            : [`$\\lambda = ${n(a)}$ aparece duas vezes ($m_a = 2$).`, `$A - ${p(a)}I = ${M(B)}$ tem posto ${rank(B)}, então $m_g = ${3 - rank(B)}$.`, yes ? "$m_g = m_a$: é diagonalizável." : "$m_g < m_a$: falta autovetor, não é diagonalizável."],
      };
    },
  },
  {
    id: "H3.hc",
    title: "Coeficientes de Hamilton–Cayley",
    level: 2,
    make: (r) => {
      const A = until(() => [ivec(r, 3, -2, 2), ivec(r, 3, -2, 2), ivec(r, 3, -2, 2)], (X) => det(X) !== 0);
      const [, a, , c] = charPoly3(A);
      const askC = r() < 0.5;
      const tr = A[0][0] + A[1][1] + A[2][2], d = det(A);
      return {
        prompt: `Pelo teorema de Hamilton–Cayley, $A^3 + aA^2 + bA + cI = 0$ para $A = ${M(A)}$, onde $\\lambda^3 + a\\lambda^2 + b\\lambda + c$ é o polinômio característico. Quanto vale $${askC ? "c" : "a"}$?`,
        answer: { kind: "number", value: askC ? c : a, label: `$${askC ? "c" : "a"}$` },
        hint: askC ? "Com $p(\\lambda) = \\det(\\lambda I - A)$, o termo constante é $p(0) = \\det(-A) = -\\det A$." : "O coeficiente de $\\lambda^2$ é menos o traço.",
        solution: askC ? [`$\\det A = ${n(d)}$`, `$c = -\\det A = ${n(c)}$`] : [`$\\operatorname{tr} A = ${n(tr)}$`, `$a = -\\operatorname{tr} A = ${n(a)}$`],
      };
    },
  },
];

/* ---------- H4 · Gram–Schmidt ---------- */

const PYTH: number[][] = [
  [3, 4],
  [5, 12],
  [6, 8],
  [8, 15],
  [1, 2, 2],
  [2, 3, 6],
  [2, 6, 9],
  [4, 4, 7],
];

const H4: Generator[] = [
  {
    id: "H4.proj",
    title: "Projeção",
    level: 1,
    make: (r) => {
      const dim = pick(r, [2, 3]);
      const [u, v] = until(() => [ivec(r, dim, -3, 3), ivec(r, dim, -3, 3)], ([a, b]) => nonzero(a) && dot(a, b) !== 0);
      const k = dot(u, v) / dot(u, u);
      const pr = scale(k, u);
      return {
        prompt: `Calcule a projeção de $\\vec v = ${tp(v)}$ sobre $\\vec u = ${tp(u)}$.`,
        answer: { kind: "vector", value: pr },
        hint: "$\\operatorname{proj}_{\\vec u}\\vec v = \\dfrac{\\vec v\\cdot\\vec u}{\\vec u\\cdot\\vec u}\\,\\vec u$.",
        solution: [`$\\vec v\\cdot\\vec u = ${n(dot(u, v))}$ e $\\vec u\\cdot\\vec u = ${n(dot(u, u))}$`, `$\\operatorname{proj} = ${n(k)}\\,${tp(u)} = ${tp(pr)}$`],
      };
    },
  },
  {
    id: "H4.u2",
    title: "O passo de Gram–Schmidt",
    level: 2,
    make: (r) => {
      const dim = pick(r, [2, 3]);
      const [v1, v2] = until(
        () => [ivec(r, dim, -3, 3), ivec(r, dim, -3, 3)],
        ([a, b]) => nonzero(a) && dot(a, b) !== 0 && nonzero(sub(scale(dot(a, a), b), scale(dot(a, b), a))),
      );
      const k = dot(v2, v1) / dot(v1, v1);
      const u2 = sub(v2, scale(k, v1));
      return {
        prompt: `Gram–Schmidt com $\\vec v_1 = ${tp(v1)}$ e $\\vec v_2 = ${tp(v2)}$: tomando $\\vec u_1 = \\vec v_1$, calcule $\\vec u_2$.`,
        answer: { kind: "vector", value: u2 },
        hint: "$\\vec u_2 = \\vec v_2 - \\dfrac{\\vec v_2\\cdot\\vec u_1}{\\vec u_1\\cdot\\vec u_1}\\,\\vec u_1$.",
        solution: [
          `$\\dfrac{\\vec v_2\\cdot\\vec u_1}{\\vec u_1\\cdot\\vec u_1} = \\dfrac{${n(dot(v2, v1))}}{${n(dot(v1, v1))}} = ${n(k)}$`,
          `$\\vec u_2 = ${tp(v2)} - ${p(k)}\\,${tp(v1)} = ${tp(u2)}$`,
          `Confira: $\\vec u_2\\cdot\\vec u_1 = 0$.`,
        ],
      };
    },
  },
  {
    id: "H4.unit",
    title: "Normalizar",
    level: 1,
    make: (r) => {
      const base = pick(r, PYTH);
      const v = shuffle(r, base).map((x) => x * pick(r, [1, -1]));
      const len = Math.hypot(...v);
      const e = scale(1 / len, v);
      return {
        prompt: `Qual é o vetor unitário na direção de $${tp(v)}$?`,
        answer: { kind: "vector", value: e },
        hint: "Divida o vetor pela norma dele.",
        solution: [`$\\|\\vec v\\| = \\sqrt{${v.map((x) => `${p(x)}^2`).join(" + ")}} = ${n(len)}$`, `$\\dfrac{\\vec v}{\\|\\vec v\\|} = ${tp(e)}$`],
      };
    },
  },
];

/* ---------- H5 · Mínimos quadrados ---------- */

const XSETS = [
  [0, 1, 2],
  [-1, 0, 1],
  [0, 1, 2, 3],
  [1, 2, 3, 4],
  [-2, -1, 0, 1, 2],
  [-1, 0, 1, 2],
];

function dataset(r: () => number, xs = pick(r, XSETS)) {
  const ys = xs.map(() => int(r, -2, 4));
  const k = xs.length;
  const Sx = xs.reduce((s, x) => s + x, 0), Sxx = xs.reduce((s, x) => s + x * x, 0);
  const Sy = ys.reduce((s, y) => s + y, 0), Sxy = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const D = k * Sxx - Sx * Sx;
  const b = (k * Sxy - Sx * Sy) / D;
  const a = (Sy - b * Sx) / k;
  return { xs, ys, k, Sx, Sxx, Sy, Sxy, a: Math.round(a * 1e9) / 1e9 || 0, b: Math.round(b * 1e9) / 1e9 || 0 };
}
const pts = (xs: number[], ys: number[]) => xs.map((x, i) => `(${n(x)}, ${n(ys[i])})`).join(",\\; ");

const H5: Generator[] = [
  {
    id: "H5.ata",
    title: "Montar AᵀA",
    level: 2,
    make: (r) => {
      const d = dataset(r);
      const AtA = [
        [d.k, d.Sx],
        [d.Sx, d.Sxx],
      ];
      return {
        prompt: `Para ajustar a reta $y = a + bx$ aos pontos $${pts(d.xs, d.ys)}$, calcule $A^TA$.`,
        answer: { kind: "matrix", value: AtA },
        hint: "Cada linha de $A$ é $(1,\\; x_i)$. Então $A^TA = \\left[\\begin{array}{cc} n & \\sum x_i \\\\ \\sum x_i & \\sum x_i^2 \\end{array}\\right]$.",
        solution: [`$n = ${d.k}$, $\\sum x_i = ${n(d.Sx)}$, $\\sum x_i^2 = ${n(d.Sxx)}$`, `$A^TA = ${M(AtA)}$`],
      };
    },
  },
  {
    id: "H5.atb",
    title: "Montar Aᵀy",
    level: 2,
    make: (r) => {
      const d = dataset(r);
      return {
        prompt: `Para ajustar a reta $y = a + bx$ aos pontos $${pts(d.xs, d.ys)}$, calcule $A^T\\vec y$.`,
        answer: { kind: "vector", value: [d.Sy, d.Sxy] },
        hint: "$\\vec y$ guarda os $y_i$. Então $A^T\\vec y = \\big(\\sum y_i,\\; \\sum x_iy_i\\big)$.",
        solution: [`$\\sum y_i = ${n(d.Sy)}$`, `$\\sum x_iy_i = ${d.xs.map((x, i) => `${p(x)}\\cdot${p(d.ys[i])}`).join(" + ")} = ${n(d.Sxy)}$`, `$A^T\\vec y = ${tp([d.Sy, d.Sxy])}$`],
      };
    },
  },
  {
    id: "H5.reta",
    title: "A melhor reta",
    level: 3,
    make: (r) => {
      const d = until(() => dataset(r), (x) => nice(x.a, 12) && nice(x.b, 12) && x.b !== 0);
      const AtA = [
        [d.k, d.Sx],
        [d.Sx, d.Sxx],
      ];
      return {
        prompt: `Ache a reta de mínimos quadrados $y = a + bx$ para os pontos $${pts(d.xs, d.ys)}$.`,
        answer: { kind: "vector", value: [d.a, d.b], names: ["a", "b"] },
        hint: "Resolva as equações normais $A^TA\\,(a, b) = A^T\\vec y$.",
        solution: [`$A^TA = ${M(AtA)}$ e $A^T\\vec y = ${tp([d.Sy, d.Sxy])}$`, `$\\begin{cases} ${texLinear([d.k, d.Sx], ["a", "b"])} = ${n(d.Sy)} \\\\ ${texLinear([d.Sx, d.Sxx], ["a", "b"])} = ${n(d.Sxy)} \\end{cases}$`, `$a = ${n(d.a)}$ e $b = ${n(d.b)}$`],
      };
    },
  },
  {
    id: "H5.media",
    title: "O ponto médio dos dados",
    level: 1,
    make: (r) => {
      const d = until(
        () => dataset(r, pick(r, [[0, 1, 2, 3], [-1, 0, 1, 2], [1, 2, 3, 4], [-2, -1, 1, 2]])),
        (x) => Number.isInteger((2 * x.Sy) / x.k),
      );
      const m: [number, number] = [d.Sx / d.k, d.Sy / d.k];
      return {
        prompt: "A reta de mínimos quadrados sempre passa pelo ponto $(\\bar x, \\bar y)$, a média dos dados. Arraste o ponto até ele.",
        figure: {
          view: [-4, 5, -4, 5],
          items: d.xs.map((x, i) => ({ t: "pt" as const, at: [x, d.ys[i]] as [number, number], color: 1 })),
        },
        answer: { kind: "point", value: m },
        hint: "Some os $x$ e divida pela quantidade de pontos; faça o mesmo com os $y$.",
        solution: [`$\\bar x = \\dfrac{${n(d.Sx)}}{${d.k}} = ${n(m[0])}$`, `$\\bar y = \\dfrac{${n(d.Sy)}}{${d.k}} = ${n(m[1])}$`],
      };
    },
  },
];

const gens: TrackGens = { H1, H2, H3, H4, H5 };
export default gens;
