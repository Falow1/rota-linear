import { choices, int, ivec, nz, pick, until } from "../learn/rng";
import type { Generator } from "../learn/types";
import { texEquation, texLinear, texMatrix } from "../math/format";
import { gcd } from "../math/fraction";
import { det, inverse, rank, type Mat } from "../math/mat";
import { cross, type Vec3 } from "../math/vec";
import type { TrackGens } from "./index";
import { n, p, tp } from "./kit";

const M = (A: Mat) => texMatrix(A, { maxDen: 60 });
const cols = (...vs: number[][]): Mat => vs[0].map((_, i) => vs.map((v) => v[i]));
const nonzero = (v: number[]) => v.some((x) => x !== 0);
const comb = (c: number[], vs: number[][]) => vs[0].map((_, i) => vs.reduce((s, v, k) => s + c[k] * v[i], 0));
function tidyVec(v: number[]): number[] {
  const g = v.reduce((a, x) => (x === 0 ? a : a === 0 ? Math.abs(x) : gcd(a, x)), 0) || 1;
  const lead = v.find((x) => x !== 0) ?? 1;
  return v.map((x) => ((lead < 0 ? -1 : 1) * x) / g || 0);
}

/* ---------- F1 · Combinação linear e espaço gerado ---------- */

const F1: Generator[] = [
  {
    id: "F1.coef",
    title: "Os coeficientes da combinação",
    level: 2,
    make: (r) => {
      const [v1, v2] = until(() => [ivec(r, 3, -2, 3), ivec(r, 3, -2, 3)], ([a, b]) => nonzero(cross(a as Vec3, b as Vec3)));
      const c = [nz(r, -3, 3), nz(r, -3, 3)];
      const w = comb(c, [v1, v2]);
      return {
        prompt: `Escreva $\\vec w = ${tp(w)}$ como $c_1\\vec v_1 + c_2\\vec v_2$, com $\\vec v_1 = ${tp(v1)}$ e $\\vec v_2 = ${tp(v2)}$.`,
        answer: { kind: "vector", value: c, names: ["c₁", "c₂"] },
        hint: "Cada coordenada dá uma equação em $c_1$ e $c_2$. Resolva duas delas e confira na terceira.",
        solution: [
          `$\\begin{cases} ${v1.map((_, i) => `${texLinear([v1[i], v2[i]], ["c_1", "c_2"])} = ${n(w[i])}`).join(" \\\\ ")} \\end{cases}$`,
          `Resolvendo: $c_1 = ${n(c[0])}$ e $c_2 = ${n(c[1])}$ (as três equações batem).`,
        ],
      };
    },
  },
  {
    id: "F1.span",
    title: "Está no espaço gerado?",
    level: 2,
    make: (r) => {
      const yes = r() < 0.5;
      const [v1, v2] = until(() => [ivec(r, 3, -2, 2), ivec(r, 3, -2, 2)], ([a, b]) => nonzero(cross(a as Vec3, b as Vec3)));
      const w = yes ? comb([nz(r, -2, 2), nz(r, -2, 2)], [v1, v2]) : until(() => ivec(r, 3, -3, 3), (x) => det(cols(v1, v2, x)) !== 0);
      const D = det(cols(v1, v2, w));
      const { options, correct } = choices(r, "Sim", ["Não"]);
      return {
        prompt: `$\\vec w = ${tp(w)}$ pertence ao espaço gerado por $\\vec v_1 = ${tp(v1)}$ e $\\vec v_2 = ${tp(v2)}$?`,
        answer: { kind: "choice", options, correct: yes ? correct : 1 - correct },
        hint: "Dois vetores independentes geram um plano pela origem. $\\vec w$ está nele exatamente quando os três vetores são coplanares: determinante zero.",
        solution: [`$\\det[\\vec v_1\\; \\vec v_2\\; \\vec w] = ${n(D)}$`, D === 0 ? "Zero: w é combinação de v₁ e v₂, então está no espaço gerado." : "Diferente de zero: w sai do plano gerado por v₁ e v₂."],
      };
    },
  },
  {
    id: "F1.dep",
    title: "Quando ficam dependentes",
    level: 2,
    make: (r) => {
      const { a, b, c, k } = until(
        () => ({ a: nz(r, -5, 5), b: nz(r, -4, 4), c: nz(r, -6, 6), k: 0 }),
        (o) => {
          o.k = (o.a * o.c) / o.b;
          return Number.isInteger(o.k) && Math.abs(o.k) <= 15;
        },
      );
      return {
        prompt: `Para que valor de $k$ os vetores $\\vec v_1 = (${n(a)},\\ k)$ e $\\vec v_2 = (${n(b)},\\ ${n(c)})$ são linearmente dependentes?`,
        answer: { kind: "number", value: k, label: "$k$" },
        hint: "Dois vetores do plano são dependentes quando são paralelos: o determinante com eles nas colunas é zero.",
        solution: [`$\\det = ${n(a)}\\cdot${p(c)} - ${p(b)}\\cdot k = 0$`, `$k = \\dfrac{${n(a * c)}}{${n(b)}} = ${n(k)}$`, "Com esse k, um vetor é múltiplo do outro e os dois geram só uma reta."],
      };
    },
  },
  {
    id: "F1.gera",
    title: "Geram o plano?",
    level: 1,
    make: (r) => {
      const yes = r() < 0.5;
      const v1 = until(() => ivec(r, 2, -4, 4), nonzero);
      const v2 = yes ? until(() => ivec(r, 2, -4, 4), (v) => v1[0] * v[1] - v1[1] * v[0] !== 0) : v1.map((x) => x * pick(r, [-2, -1, 2, 3]));
      const D = v1[0] * v2[1] - v1[1] * v2[0];
      const { options, correct } = choices(r, "Sim, geram todo o plano", ["Não, geram só uma reta"]);
      return {
        prompt: `Os vetores $${tp(v1)}$ e $${tp(v2)}$ geram todo o $\\mathbb{R}^2$?`,
        answer: { kind: "choice", options, correct: yes ? correct : 1 - correct },
        hint: "Eles geram o plano quando não são paralelos.",
        solution: [`$\\det = ${p(v1[0])}\\cdot${p(v2[1])} - ${p(v2[0])}\\cdot${p(v1[1])} = ${n(D)}$`, D !== 0 ? "Diferente de zero: não são paralelos, geram o plano." : "Zero: são paralelos, geram só uma reta."],
      };
    },
  },
];

/* ---------- F2 · Subespaços, base e dimensão ---------- */

const F2: Generator[] = [
  {
    id: "F2.sub",
    title: "É subespaço?",
    level: 1,
    make: (r) => {
      const a = nz(r, -3, 3), b = nz(r, -3, 3), c = nz(r, -3, 3), d = nz(r, -4, 4);
      const cases: [string, boolean, string][] = [
        [`\\{(x, y, z) : ${texEquation([a, b, c], ["x", "y", "z"], 0)}\\}`, true, "É um plano pela origem: contém o zero e é fechado para soma e para multiplicação por número."],
        [`\\{(x, y, z) : ${texEquation([a, b, c], ["x", "y", "z"], d)}\\}`, false, `Não contém o vetor nulo: $(0, 0, 0)$ dá $0 \\ne ${n(d)}$.`],
        [`\\{(${texLinear([a], ["t"])},\\ ${texLinear([b], ["t"])},\\ ${texLinear([c], ["t"])}) : t \\in \\mathbb{R}\\}`, true, "É uma reta pela origem (os múltiplos de um vetor): é subespaço."],
        [`\\{(x, y, z) : x \\ge 0\\}`, false, "Multiplicar por −1 tira o vetor do conjunto: não é fechado para multiplicação por número."],
        [`\\{(x, y, z) : xy = 0\\}`, false, "(1, 0, 0) e (0, 1, 0) estão no conjunto, mas a soma (1, 1, 0) não: não é fechado para soma."],
        [`\\{(x, y, z) : z = ${texLinear([a], ["x"])}\\ \\text{e}\\ y = 0\\}`, true, "Duas equações homogêneas: é uma reta pela origem, um subespaço."],
        [`\\{(x, y, z) : z = x^2\\}`, false, "(1, 0, 1) está no conjunto, mas 2·(1, 0, 1) = (2, 0, 2) não, pois 2 ≠ 2²."],
        [`\\{(${texLinear([1], ["t"])},\\ ${texLinear([b], ["t"], d)},\\ 0) : t \\in \\mathbb{R}\\}`, false, "É uma reta que não passa pela origem: o vetor nulo não está nela."],
      ];
      const [set, yes, why] = pick(r, cases);
      const { options, correct } = choices(r, "Sim", ["Não"]);
      return {
        prompt: `O conjunto $${set}$ é um subespaço de $\\mathbb{R}^3$?`,
        answer: { kind: "choice", options, correct: yes ? correct : 1 - correct },
        hint: "Teste três coisas: o vetor nulo está no conjunto? A soma de dois elementos continua nele? E um múltiplo de um elemento?",
        solution: [why],
      };
    },
  },
  {
    id: "F2.dim",
    title: "Dimensão do espaço gerado",
    level: 2,
    make: (r) => {
      const want = int(r, 1, 3);
      const vs = until(
        () => {
          const base = Array.from({ length: want }, () => ivec(r, 3, -3, 3));
          const out = [...base];
          while (out.length < 3) out.push(comb(ivec(r, want, -2, 2), base));
          return out.sort(() => r() - 0.5);
        },
        (vs) => rank(vs) === want && vs.every(nonzero),
      );
      return {
        prompt: `Qual é a dimensão do espaço gerado por $${tp(vs[0])}$, $${tp(vs[1])}$ e $${tp(vs[2])}$?`,
        answer: { kind: "number", value: want, label: "dimensão" },
        hint: "Monte uma matriz com os vetores nas linhas e escalone: a dimensão é o número de linhas não nulas (o posto).",
        solution: [`O posto da matriz $${M(vs)}$ é $${want}$.`, want === 3 ? "Os três são independentes: geram o espaço todo." : want === 2 ? "Só dois são independentes: geram um plano." : "Todos são múltiplos de um só: geram uma reta."],
      };
    },
  },
  {
    id: "F2.solucoes",
    title: "Dimensão das soluções",
    level: 2,
    make: (r) => {
      const rk = int(r, 1, 2);
      const rows = until(
        () => {
          const base = Array.from({ length: rk }, () => ivec(r, 3, -3, 3));
          const out = [...base];
          if (r() < 0.5 && rk === 1) out.push(base[0].map((x) => x * pick(r, [2, -1, 3])));
          return out;
        },
        (A) => rank(A) === rk && A.every(nonzero),
      );
      const dim = 3 - rk;
      return {
        prompt: `Qual é a dimensão do subespaço de $\\mathbb{R}^3$ formado pelas soluções de $\\begin{cases} ${rows.map((row) => texEquation(row, ["x", "y", "z"], 0)).join(" \\\\ ")} \\end{cases}$?`,
        answer: { kind: "number", value: dim, label: "dimensão" },
        hint: "Cada equação independente “gasta” uma dimensão das três. Conte quantas equações são de fato independentes (o posto).",
        solution: [`O posto do sistema é $${rk}$.`, `Dimensão $= 3 - ${rk} = ${dim}$: ${dim === 2 ? "um plano pela origem" : "uma reta pela origem"}.`],
      };
    },
  },
  {
    id: "F2.li",
    title: "LI ou LD?",
    level: 2,
    make: (r) => {
      const li = r() < 0.5;
      const [v1, v2] = until(() => [ivec(r, 3, -2, 2), ivec(r, 3, -2, 2)], ([a, b]) => nonzero(cross(a as Vec3, b as Vec3)));
      const v3 = li ? until(() => ivec(r, 3, -2, 2), (x) => det(cols(v1, v2, x)) !== 0) : comb([nz(r, -2, 2), nz(r, -2, 2)], [v1, v2]);
      const D = det(cols(v1, v2, v3));
      const { options, correct } = choices(r, "Linearmente independentes", ["Linearmente dependentes"]);
      return {
        prompt: `Os vetores $${tp(v1)}$, $${tp(v2)}$ e $${tp(v3)}$ são…`,
        answer: { kind: "choice", options, correct: li ? correct : 1 - correct },
        hint: "Três vetores do espaço são independentes exatamente quando o determinante com eles nas colunas não é zero.",
        solution: [`$\\det = ${n(D)}$`, D !== 0 ? "Diferente de zero: independentes, formam uma base do espaço." : "Zero: um deles é combinação dos outros, são dependentes."],
      };
    },
  },
];

/* ---------- F3 · Mudança de base ---------- */

const basis = (r: () => number) => until(() => [ivec(r, 2, -2, 3), ivec(r, 2, -2, 3)], ([a, b]) => [1, -1, 2, -2].includes(a[0] * b[1] - a[1] * b[0]));

const F3: Generator[] = [
  {
    id: "F3.coord",
    title: "Coordenadas numa base",
    level: 2,
    make: (r) => {
      const [b1, b2] = basis(r);
      const c = [nz(r, -3, 3), int(r, -3, 3)];
      const v = comb(c, [b1, b2]);
      return {
        prompt: `Quais são as coordenadas de $\\vec v = ${tp(v)}$ na base $B = \\{${tp(b1)},\\ ${tp(b2)}\\}$?`,
        answer: { kind: "vector", value: c, names: ["c₁", "c₂"] },
        hint: "Procure $c_1$ e $c_2$ com $c_1\\vec b_1 + c_2\\vec b_2 = \\vec v$: é um sistema 2×2.",
        solution: [
          `$\\begin{cases} ${texLinear([b1[0], b2[0]], ["c_1", "c_2"])} = ${n(v[0])} \\\\ ${texLinear([b1[1], b2[1]], ["c_1", "c_2"])} = ${n(v[1])} \\end{cases}$`,
          `$[\\vec v]_B = ${tp(c)}$`,
        ],
      };
    },
  },
  {
    id: "F3.volta",
    title: "Da base B para a canônica",
    level: 1,
    make: (r) => {
      const [b1, b2] = basis(r);
      const c = [nz(r, -3, 3), nz(r, -3, 3)];
      const v = comb(c, [b1, b2]);
      return {
        prompt: `Na base $B = \\{\\vec b_1, \\vec b_2\\}$ com $\\vec b_1 = ${tp(b1)}$ e $\\vec b_2 = ${tp(b2)}$, um vetor tem coordenadas $[\\vec v]_B = ${tp(c)}$. Quem é $\\vec v$?`,
        answer: { kind: "vector", value: v },
        hint: "$[\\vec v]_B = (c_1, c_2)$ quer dizer $\\vec v = c_1\\vec b_1 + c_2\\vec b_2$.",
        solution: [`$\\vec v = ${n(c[0])}\\,${tp(b1)} + ${p(c[1])}\\,${tp(b2)} = ${tp(v)}$`],
      };
    },
  },
  {
    id: "F3.matriz",
    title: "Matriz de mudança de base",
    level: 3,
    make: (r) => {
      const [b1, b2] = basis(r);
      const P = cols(b1, b2);
      const toB = r() < 0.5;
      const ans = toB ? inverse(P)! : P;
      return {
        prompt: toB
          ? `Com $B = \\{${tp(b1)},\\ ${tp(b2)}\\}$, qual matriz transforma as coordenadas canônicas de um vetor nas coordenadas na base $B$? (Frações valem.)`
          : `Com $B = \\{${tp(b1)},\\ ${tp(b2)}\\}$, qual matriz transforma $[\\vec v]_B$ nas coordenadas canônicas de $\\vec v$?`,
        answer: { kind: "matrix", value: ans },
        hint: toB ? "Primeiro monte $P$ com os vetores de B nas colunas (ela vai de B para a canônica). O caminho de volta é $P^{-1}$." : "$\\vec v = c_1\\vec b_1 + c_2\\vec b_2$: em forma de matriz, os vetores da base ficam nas colunas.",
        solution: toB ? [`$P = ${M(P)}$ leva de B para a canônica.`, `$P^{-1} = ${M(ans)}$ faz o caminho contrário.`] : [`Os vetores de B nas colunas: $P = ${M(P)}$.`, "Assim $\\vec v = P\\,[\\vec v]_B$."],
      };
    },
  },
  {
    id: "F3.ponto",
    title: "Marque pelas coordenadas",
    level: 2,
    make: (r) => {
      const { b1, b2, c, v } = until(
        () => {
          const [b1, b2] = basis(r);
          const c = [int(r, -2, 2), int(r, -2, 2)];
          return { b1, b2, c, v: comb(c, [b1, b2]) };
        },
        (o) => Math.abs(o.v[0]) <= 5 && Math.abs(o.v[1]) <= 5 && nonzero(o.c) && Math.abs(o.b1[0]) + Math.abs(o.b1[1]) > 0,
      );
      return {
        prompt: `Arraste o ponto até o vetor que, na base $B = \\{\\vec b_1, \\vec b_2\\}$ do gráfico, tem coordenadas $[\\vec v]_B = ${tp(c)}$.`,
        figure: {
          view: [-6, 6, -6, 6],
          items: [
            { t: "vec", to: b1 as [number, number], color: 1, label: "b₁" },
            { t: "vec", to: b2 as [number, number], color: 2, label: "b₂" },
          ],
        },
        answer: { kind: "point", value: v as [number, number] },
        hint: `Ande ${n(c[0])} vezes $\\vec b_1$ e depois ${n(c[1])} vezes $\\vec b_2$.`,
        solution: [`Pelo gráfico, $\\vec b_1 = ${tp(b1)}$ e $\\vec b_2 = ${tp(b2)}$.`, `$${n(c[0])}\\vec b_1 + ${p(c[1])}\\vec b_2 = ${tp(v)}$`],
      };
    },
  },
];

/* ---------- F4 · Núcleo e imagem ---------- */

const rank2 = (r: () => number) =>
  until(
    () => {
      const r1 = ivec(r, 3, -2, 2), r2 = ivec(r, 3, -2, 2);
      const r3 = comb([nz(r, -2, 2), int(r, -2, 2)], [r1, r2]);
      return [r1, r2, r3].sort(() => r() - 0.5);
    },
    (A) => rank(A) === 2 && A.every(nonzero),
  );

const F4: Generator[] = [
  {
    id: "F4.nulidade",
    title: "Posto + nulidade",
    level: 1,
    make: (r) => {
      const m = int(r, 2, 5), nn = int(r, 2, 6);
      const rk = int(r, 1, Math.min(m, nn));
      return {
        prompt: `Uma matriz $A$ tem ${m} linhas, ${nn} colunas e posto ${rk}. Qual é a dimensão do núcleo de $A$?`,
        answer: { kind: "number", value: nn - rk, label: "$\\dim N(A)$" },
        hint: "Teorema do posto: posto + dimensão do núcleo = número de colunas (o número de incógnitas de $A\\vec x = \\vec 0$).",
        solution: [`$\\dim N(A) = ${nn} - ${rk} = ${nn - rk}$`, "As linhas não entram na conta: o núcleo mora no espaço das colunas, de dimensão igual ao número de incógnitas."],
      };
    },
  },
  {
    id: "F4.nucleo",
    title: "Um vetor do núcleo",
    level: 2,
    make: (r) => {
      const A = rank2(r);
      const [a, b] = A.filter((row, i) => rank([A[0], row]) === 2 || i === 0).slice(0, 2);
      const k = tidyVec(cross(a as Vec3, b as Vec3));
      return {
        prompt: `Dê um vetor não nulo do núcleo de $A = ${M(A)}$.`,
        answer: { kind: "direction", value: k },
        hint: "Resolva $A\\vec x = \\vec 0$ escalonando. Como o posto é 2, sobra uma variável livre: escolha 1 para ela.",
        solution: [`O posto é 2, então o núcleo é uma reta pela origem.`, `Resolvendo $A\\vec x = \\vec 0$: $\\vec x = t\\,${tp(k)}$.`, `Conferindo: $A\\,${tp(k)} = (0, 0, 0)$.`],
      };
    },
  },
  {
    id: "F4.imagem",
    title: "Está na imagem?",
    level: 3,
    make: (r) => {
      const A = rank2(r);
      const yes = r() < 0.5;
      const colsA = A[0].map((_, j) => A.map((row) => row[j]));
      const b = yes ? comb(ivec(r, 3, -2, 2), colsA) : until(() => ivec(r, 3, -3, 3), (x) => rank(A.map((row, i) => [...row, x[i]])) === 3);
      const rAug = rank(A.map((row, i) => [...row, b[i]]));
      const { options, correct } = choices(r, "Sim", ["Não"]);
      return {
        prompt: `O vetor $\\vec b = ${tp(b)}$ está na imagem de $A = ${M(A)}$?`,
        answer: { kind: "choice", options, correct: yes ? correct : 1 - correct },
        hint: "$\\vec b$ está na imagem quando $A\\vec x = \\vec b$ tem solução: compare o posto de A com o posto da matriz aumentada $[A \\mid \\vec b]$.",
        solution: [`Posto de $A$: $2$. Posto de $[A \\mid \\vec b]$: $${rAug}$.`, rAug === 2 ? "Iguais: o sistema tem solução, b está na imagem (é combinação das colunas)." : "O posto aumentou: o sistema é impossível, b não está na imagem."],
      };
    },
  },
];

const gens: TrackGens = { F1, F2, F3, F4 };
export default gens;
