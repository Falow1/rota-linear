import { choices, int, ivec, nz, pick, shuffle, until } from "../learn/rng";
import type { Generator } from "../learn/types";
import { texMatrix } from "../math/format";
import { det, inverse, mul, type Mat } from "../math/mat";
import type { TrackGens } from "./index";
import { n, p, tp } from "./kit";

/* ---------- Utilidades da rota ---------- */

const M = (A: Mat) => texMatrix(A, { maxDen: 60 });
const imat = (r: () => number, rows: number, cols: number, lo: number, hi: number): Mat => Array.from({ length: rows }, () => ivec(r, cols, lo, hi));
const mulV = (A: Mat, x: number[]) => A.map((row) => row.reduce((s, a, k) => s + a * x[k], 0));
const fromCols = (u: number[], v: number[]): Mat => [
  [u[0], v[0]],
  [u[1], v[1]],
];
/** Linha i de A·x escrita por extenso. */
const rowTex = (A: Mat, x: number[], i: number) => A[i].map((a, k) => `${p(a)}\\cdot${p(x[k])}`).join(" + ");

/** Transformações 2D com nome, para reconhecer pela matriz. */
const KINDS2: { name: string; make: (r: () => number) => Mat; why: string }[] = [
  { name: "Rotação de 90° no sentido anti-horário", make: () => [[0, -1], [1, 0]], why: "e₁ vai para e₂ e e₂ vai para −e₁: tudo gira um quarto de volta." },
  { name: "Rotação de 180°", make: () => [[-1, 0], [0, -1]], why: "Todo vetor vira o oposto: v ↦ −v." },
  { name: "Reflexão no eixo x", make: () => [[1, 0], [0, -1]], why: "x fica, y troca de sinal: espelho no eixo x." },
  { name: "Reflexão no eixo y", make: () => [[-1, 0], [0, 1]], why: "x troca de sinal, y fica: espelho no eixo y." },
  { name: "Reflexão na reta y = x", make: () => [[0, 1], [1, 0]], why: "As coordenadas trocam de lugar: (x, y) ↦ (y, x)." },
  { name: "Projeção no eixo x", make: () => [[1, 0], [0, 0]], why: "y vira 0: tudo cai no eixo x (det = 0)." },
  { name: "Cisalhamento horizontal", make: (r) => [[1, pick(r, [-2, -1, 1, 2])], [0, 1]], why: "e₁ fica parado e e₂ tomba para o lado: a figura inclina sem mudar de área." },
  { name: "Ampliação uniforme", make: (r) => { const k = pick(r, [2, 3]); return [[k, 0], [0, k]]; }, why: "Os dois eixos esticam pelo mesmo fator." },
];

/** Movimentos de um ponto no plano, para arrastar a resposta. */
const MOVES2: { name: string; f: (x: number, y: number) => [number, number]; rule: string }[] = [
  { name: "a rotação de 90° no sentido anti-horário", f: (x, y) => [-y, x], rule: "(x, y) \\mapsto (-y,\\; x)" },
  { name: "a rotação de 90° no sentido horário", f: (x, y) => [y, -x], rule: "(x, y) \\mapsto (y,\\; -x)" },
  { name: "a reflexão na reta y = x", f: (x, y) => [y, x], rule: "(x, y) \\mapsto (y,\\; x)" },
  { name: "a reflexão no eixo y", f: (x, y) => [-x, y], rule: "(x, y) \\mapsto (-x,\\; y)" },
  { name: "a rotação de 180°", f: (x, y) => [-x, -y], rule: "(x, y) \\mapsto (-x,\\; -y)" },
];

/* ---------- G1 · Matriz como transformação ---------- */

const G1: Generator[] = [
  {
    id: "G1.imagem",
    title: "Aplicar a matriz",
    level: 1,
    make: (r) => {
      const A = imat(r, 2, 2, -3, 3);
      const v = ivec(r, 2, -4, 4);
      const w = mulV(A, v);
      return {
        prompt: `A transformação $T$ tem matriz $A = ${M(A)}$. Calcule $T${tp(v)}$.`,
        answer: { kind: "vector", value: w },
        hint: "Multiplique cada linha de $A$ pelo vetor: linha vezes coluna.",
        solution: [`$1^a$ coordenada: $${rowTex(A, v, 0)} = ${n(w[0])}$`, `$2^a$ coordenada: $${rowTex(A, v, 1)} = ${n(w[1])}$`, `$T${tp(v)} = ${tp(w)}$`],
      };
    },
  },
  {
    id: "G1.matriz",
    title: "Montar a matriz pelas imagens",
    level: 2,
    make: (r) => {
      const u = until(() => ivec(r, 2, -3, 3), (x) => x.some((y) => y !== 0));
      const e2 = until(() => ivec(r, 2, -3, 3), (x) => x.some((y) => y !== 0));
      const viaSum = r() < 0.5;
      const w = viaSum ? [u[0] + e2[0], u[1] + e2[1]] : e2;
      const A = fromCols(u, e2);
      return {
        prompt: viaSum
          ? `Uma transformação linear $T$ do plano satisfaz $T(1, 0) = ${tp(u)}$ e $T(1, 1) = ${tp(w)}$. Qual é a matriz de $T$?`
          : `Uma transformação linear $T$ do plano leva $\\vec e_1$ em $${tp(u)}$ e $\\vec e_2$ em $${tp(e2)}$. Qual é a matriz de $T$?`,
        answer: { kind: "matrix", value: A },
        hint: viaSum
          ? "As colunas da matriz são $T(\\vec e_1)$ e $T(\\vec e_2)$. Como $(0, 1) = (1, 1) - (1, 0)$, a linearidade dá $T(\\vec e_2)$."
          : "As colunas da matriz são as imagens de $\\vec e_1$ e $\\vec e_2$, nessa ordem.",
        solution: [
          ...(viaSum ? [`$T(\\vec e_2) = T(1, 1) - T(1, 0) = ${tp(w)} - ${tp(u)} = ${tp(e2)}$`] : []),
          `$A = \\big[\\,T(\\vec e_1)\\;\\; T(\\vec e_2)\\,\\big] = ${M(A)}$`,
        ],
      };
    },
  },
  {
    id: "G1.tipo",
    title: "Que transformação é essa?",
    level: 1,
    make: (r) => {
      const k = pick(r, KINDS2);
      const A = k.make(r);
      const wrong = shuffle(
        r,
        KINDS2.filter((x) => x !== k).map((x) => x.name),
      ).slice(0, 3);
      const { options, correct } = choices(r, k.name, wrong);
      return {
        prompt: `Que transformação do plano tem matriz $${M(A)}$?`,
        answer: { kind: "choice", options, correct },
        hint: "Olhe as colunas: a 1ª é para onde vai $\\vec e_1 = (1, 0)$, a 2ª é para onde vai $\\vec e_2 = (0, 1)$.",
        solution: [`$\\vec e_1 \\mapsto ${tp([A[0][0], A[1][0]])}$ e $\\vec e_2 \\mapsto ${tp([A[0][1], A[1][1]])}$.`, `${k.why} É: ${k.name.toLowerCase()}.`],
      };
    },
  },
  {
    id: "G1.ponto",
    title: "Para onde vai o ponto",
    level: 1,
    make: (r) => {
      const m = pick(r, MOVES2);
      const P = until(
        () => [nz(r, -4, 4), nz(r, -4, 4)],
        ([x, y]) => x !== y && x !== -y,
      );
      const Q = m.f(P[0], P[1]).map((x) => x || 0) as [number, number];
      return {
        prompt: `Arraste o ponto até a imagem de $P = ${tp(P)}$ por ${m.name}.`,
        figure: {
          view: [-5, 5, -5, 5],
          items: [
            { t: "pt", at: P as [number, number], color: 1, label: "P" },
            { t: "seg", a: [0, 0], b: P as [number, number], color: 1, dashed: true },
          ],
        },
        answer: { kind: "point", value: Q },
        hint: `Use a regra $${m.rule}$.`,
        solution: [`$${m.rule}$`, `$P = ${tp(P)} \\mapsto ${tp(Q)}$`],
      };
    },
  },
];

/* ---------- G2 · Composição e inversa ---------- */

const G2: Generator[] = [
  {
    id: "G2.composta",
    title: "Matriz da composição",
    level: 2,
    make: (r) => {
      const A = until(() => imat(r, 2, 2, -2, 2), (X) => det(X) !== 0);
      const B = until(() => imat(r, 2, 2, -2, 2), (X) => det(X) !== 0);
      const BA = mul(B, A);
      return {
        prompt: `Primeiro aplicamos $A = ${M(A)}$ e depois $B = ${M(B)}$. Qual é a matriz da transformação composta?`,
        answer: { kind: "matrix", value: BA },
        hint: "Quem age primeiro fica à direita: a composta é $BA$, não $AB$.",
        solution: ["A composta é $BA$: aplicar em $\\vec v$ dá $B(A\\vec v)$.", `$BA = ${M(B)}${M(A)} = ${M(BA)}$`],
      };
    },
  },
  {
    id: "G2.desfazer",
    title: "Desfazer a transformação",
    level: 2,
    make: (r) => {
      const A = until(() => imat(r, 2, 2, -3, 3), (X) => Math.abs(det(X)) === 1);
      const v = until(() => ivec(r, 2, -3, 3), (x) => x.some((y) => y !== 0));
      const w = mulV(A, v);
      const inv = inverse(A)!.map((row) => row.map((x) => Math.round(x) || 0));
      return {
        prompt: `A matriz $A = ${M(A)}$ levou um vetor $\\vec v$ em $${tp(w)}$. Qual era $\\vec v$?`,
        answer: { kind: "vector", value: v },
        hint: "Aplique a inversa: $\\vec v = A^{-1}\\,(A\\vec v)$. Aqui $\\det A = \\pm1$, então a inversa tem entradas inteiras.",
        solution: [`$\\det A = ${n(det(A))}$`, `$A^{-1} = ${M(inv)}$`, `$\\vec v = A^{-1}${tp(w)} = ${tp(v)}$`],
      };
    },
  },
  {
    id: "G2.det",
    title: "Determinantes que se combinam",
    level: 2,
    make: (r) => {
      const a = nz(r, -4, 4), b = nz(r, -3, 3);
      const kind = int(r, 0, 3);
      const k = pick(r, [2, 3, -2]);
      const forms = [
        { q: "\\det(AB)", v: a * b, why: `\\det(AB) = \\det A\\cdot\\det B = ${p(a)}\\cdot${p(b)}` },
        { q: "\\det(A^2)", v: a * a, why: `\\det(A^2) = (\\det A)^2 = ${p(a)}^2` },
        { q: "\\det(A^{-1})", v: 1 / a, why: `\\det(A^{-1}) = \\dfrac{1}{\\det A} = \\dfrac{1}{${n(a)}}` },
        { q: `\\det(${n(k)}A)`, v: k * k * a, why: `\\det(${n(k)}A) = ${p(k)}^2\\cdot\\det A = ${n(k * k)}\\cdot${p(a)}` },
      ];
      const f = forms[kind];
      return {
        prompt: `$A$ e $B$ são matrizes $2\\times2$ com $\\det A = ${n(a)}$ e $\\det B = ${n(b)}$. Quanto vale $${f.q}$?`,
        answer: { kind: "number", value: f.v, label: `$${f.q}$` },
        hint:
          kind === 3
            ? "Multiplicar a matriz $2\\times2$ por $k$ multiplica as duas colunas por $k$: o determinante ganha $k^2$."
            : "O determinante de um produto é o produto dos determinantes.",
        solution: [`$${f.why} = ${n(f.v)}$`],
      };
    },
  },
  {
    id: "G2.area",
    title: "A área depois da transformação",
    level: 1,
    make: (r) => {
      const A = until(() => imat(r, 2, 2, -3, 3), (X) => det(X) !== 0);
      const S = pick(r, [2, 3, 4, 5, 6]);
      const d = det(A);
      return {
        prompt: `Uma figura de área $${n(S)}$ é transformada pela matriz $${M(A)}$. Qual é a área da figura transformada?`,
        answer: { kind: "number", value: Math.abs(d) * S, label: "área" },
        hint: "Toda área é multiplicada por $|\\det A|$.",
        solution: [`$\\det A = ${n(d)}$`, `Nova área $= |${n(d)}|\\cdot${n(S)} = ${n(Math.abs(d) * S)}$`],
      };
    },
  },
];

/* ---------- G3 · Transformações no espaço ---------- */

const AXES = ["x", "y", "z"];
/** Rotação de 90° (anti-horária vista da ponta do eixo) ou 180° em torno de um eixo coordenado. */
function rot3(axis: number, quarter: 1 | 2): Mat {
  const R: Mat = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  const [i, j] = [(axis + 1) % 3, (axis + 2) % 3];
  if (quarter === 2) {
    R[i][i] = -1;
    R[j][j] = -1;
  } else {
    R[i][i] = 0;
    R[j][j] = 0;
    R[i][j] = -1;
    R[j][i] = 1;
  }
  return R;
}

const SIMPLE3: { name: string; A: Mat; why: string }[] = [
  { name: "a reflexão no plano xy", A: [[1, 0, 0], [0, 1, 0], [0, 0, -1]], why: "z troca de sinal; x e y ficam." },
  { name: "a reflexão no plano xz", A: [[1, 0, 0], [0, -1, 0], [0, 0, 1]], why: "y troca de sinal; x e z ficam." },
  { name: "a reflexão no plano yz", A: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]], why: "x troca de sinal; y e z ficam." },
  { name: "a projeção no plano xy", A: [[1, 0, 0], [0, 1, 0], [0, 0, 0]], why: "z vira 0; x e y ficam." },
  { name: "a projeção no plano xz", A: [[1, 0, 0], [0, 0, 0], [0, 0, 1]], why: "y vira 0; x e z ficam." },
  { name: "a projeção no eixo z", A: [[0, 0, 0], [0, 0, 0], [0, 0, 1]], why: "Só z sobrevive." },
];

const G3: Generator[] = [
  {
    id: "G3.rot",
    title: "Girar em torno de um eixo",
    level: 2,
    make: (r) => {
      const axis = int(r, 0, 2);
      const quarter = pick(r, [1, 2] as const);
      const R = rot3(axis, quarter);
      const v = until(() => ivec(r, 3, -3, 3), (x) => x.filter((y) => y !== 0).length >= 2);
      const w = mulV(R, v).map((x) => x || 0);
      return {
        prompt: `Gire $\\vec v = ${tp(v)}$ de ${quarter === 1 ? "$90°$ (no sentido anti-horário, olhando da ponta do eixo)" : "$180°$"} em torno do eixo $${AXES[axis]}$. Qual é o vetor obtido?`,
        answer: { kind: "vector", value: w },
        hint: `A coordenada $${AXES[axis]}$ não muda. ${quarter === 1 ? "As outras duas giram como no plano: $(a, b) \\mapsto (-b, a)$, na ordem cíclica x → y → z → x." : "As outras duas trocam de sinal."}`,
        solution: [`$R = ${M(R)}$`, `$R\\,${tp(v)} = ${tp(w)}$`],
      };
    },
  },
  {
    id: "G3.matriz",
    title: "Matriz de uma transformação 3D",
    level: 1,
    make: (r) => {
      const s = pick(r, SIMPLE3);
      return {
        prompt: `Qual é a matriz $3\\times3$ de ${s.name}?`,
        answer: { kind: "matrix", value: s.A },
        hint: "As colunas são as imagens de $\\vec e_1$, $\\vec e_2$ e $\\vec e_3$.",
        solution: [s.why, `$${M(s.A)}$`],
      };
    },
  },
  {
    id: "G3.volume",
    title: "O volume depois da transformação",
    level: 2,
    make: (r) => {
      const A = until(
        () => [
          [nz(r, -3, 3), int(r, -2, 2), int(r, -2, 2)],
          [0, nz(r, -2, 2), int(r, -2, 2)],
          [int(r, -2, 2), 0, nz(r, -2, 2)],
        ],
        (X) => det(X) !== 0 && Math.abs(det(X)) <= 30,
      );
      const V = pick(r, [1, 2, 3]);
      const d = det(A);
      return {
        prompt: `Um sólido de volume $${n(V)}$ é transformado pela matriz $A = ${M(A)}$. Qual é o volume do sólido transformado?`,
        answer: { kind: "number", value: Math.abs(d) * V, label: "volume" },
        hint: "Todo volume é multiplicado por $|\\det A|$. Calcule o determinante pela 1ª coluna, que tem um zero.",
        solution: [`$\\det A = ${n(d)}$`, `Novo volume $= |${n(d)}|\\cdot${n(V)} = ${n(Math.abs(d) * V)}$`],
      };
    },
  },
  {
    id: "G3.imagem",
    title: "Aplicar uma matriz 3×3",
    level: 1,
    make: (r) => {
      const A = imat(r, 3, 3, -2, 2);
      const v = ivec(r, 3, -3, 3);
      const w = mulV(A, v);
      return {
        prompt: `Calcule $A\\vec v$ para $A = ${M(A)}$ e $\\vec v = ${tp(v)}$.`,
        answer: { kind: "vector", value: w },
        hint: "Cada coordenada é uma linha de $A$ vezes o vetor.",
        solution: [0, 1, 2].map((i) => `Linha ${i + 1}: $${rowTex(A, v, i)} = ${n(w[i])}$`).concat(`$A\\vec v = ${tp(w)}$`),
      };
    },
  },
];

const gens: TrackGens = { G1, G2, G3 };
export default gens;
