import { choices, int, ivec, nz, pick, until } from "../learn/rng";
import type { Generator } from "../learn/types";
import { texEquation, texMatrix } from "../math/format";
import { det, inverse, mul, rank, transpose, type Mat } from "../math/mat";
import { eliminationSteps } from "../math/rref";
import type { TrackGens } from "./index";
import { n, p, tp } from "./kit";

/* ---------- Utilidades da rota ---------- */

const XY = ["x", "y"], XYZ = ["x", "y", "z"];
const casesSys = (rows: string[]) => `\\begin{cases} ${rows.join(" \\\\ ")} \\end{cases}`;
const sys = (A: Mat, b: number[], vars: string[]) => casesSys(A.map((row, i) => texEquation(row, vars, b[i])));
const M = (A: Mat, bar?: number) => texMatrix(A, { maxDen: 60, bar });
const imat = (r: () => number, rows: number, cols: number, lo: number, hi: number): Mat => Array.from({ length: rows }, () => ivec(r, cols, lo, hi));
const mulV = (A: Mat, x: number[]) => A.map((row) => row.reduce((s, a, k) => s + a * x[k], 0));

/* ---------- E1 · Sistemas 2×2 ---------- */

const KIND_NAMES = ["Possível e determinado (uma solução)", "Possível e indeterminado (infinitas soluções)", "Impossível (nenhuma solução)"];

const E1: Generator[] = [
  {
    id: "E1.resolver",
    title: "Resolver o sistema",
    level: 1,
    make: (r) => {
      const A = until(() => imat(r, 2, 2, -4, 4), (A) => det(A) !== 0 && A.flat().every((x) => x !== 0));
      const X = ivec(r, 2, -5, 5);
      const b = mulV(A, X);
      const D = det(A);
      return {
        prompt: `Resolva o sistema $${sys(A, b, XY)}$.`,
        answer: { kind: "vector", value: X },
        hint: "Multiplique as equações por números que deixem os coeficientes de uma variável opostos e some. Depois volte para achar a outra.",
        solution: [
          `Multiplicando a 1ª por $${n(A[1][0])}$ e a 2ª por $${n(-A[0][0])}$ e somando, o $x$ some: $${n(A[1][0] * A[0][1] - A[0][0] * A[1][1])}y = ${n(A[1][0] * b[0] - A[0][0] * b[1])}$.`,
          `Então $y = ${n(X[1])}$ (o determinante $${n(D)}$ não é zero, então a solução é única).`,
          `Voltando à 1ª equação: $x = ${n(X[0])}$. Solução: $${tp(X)}$.`,
        ],
      };
    },
  },
  {
    id: "E1.grafico",
    title: "A solução no gráfico",
    level: 1,
    make: (r) => {
      const X = ivec(r, 2, -4, 4) as [number, number];
      const A = until(() => imat(r, 2, 2, -3, 3), (A) => det(A) !== 0 && A.every((row) => row.some((x) => x !== 0)));
      const b = mulV(A, X);
      return {
        prompt: `As retas do gráfico são as equações do sistema $${sys(A, b, XY)}$. Arraste o ponto até a solução.`,
        figure: {
          view: [-6, 6, -6, 6],
          items: [
            { t: "line", a: A[0][0], b: A[0][1], c: -b[0], color: 1 },
            { t: "line", a: A[1][0], b: A[1][1], c: -b[1], color: 2 },
          ],
        },
        answer: { kind: "point", value: X },
        hint: "A solução satisfaz as duas equações ao mesmo tempo: é o ponto onde as retas se cruzam.",
        solution: [`As retas se cruzam em $${tp(X)}$.`, `Conferindo: $${n(A[0][0])}\\cdot${p(X[0])} + ${n(A[0][1])}\\cdot${p(X[1])} = ${n(b[0])}$ e $${n(A[1][0])}\\cdot${p(X[0])} + ${n(A[1][1])}\\cdot${p(X[1])} = ${n(b[1])}$.`],
      };
    },
  },
  {
    id: "E1.classif",
    title: "Quantas soluções?",
    level: 2,
    make: (r) => {
      const kind = int(r, 0, 2);
      const row1 = until(() => ivec(r, 2, -4, 4), (v) => v.every((x) => x !== 0));
      const b1 = int(r, -6, 6);
      const m = pick(r, [2, 3, -1, -2]);
      let A: Mat, b: number[];
      if (kind === 0) {
        A = [row1, until(() => ivec(r, 2, -4, 4), (v) => v.some((x) => x !== 0) && row1[0] * v[1] - row1[1] * v[0] !== 0)];
        b = [b1, int(r, -6, 6)];
      } else {
        A = [row1, row1.map((x) => m * x)];
        b = [b1, kind === 1 ? m * b1 : m * b1 + nz(r, -3, 3)];
      }
      const { options, correct } = choices(r, KIND_NAMES[kind], KIND_NAMES.filter((_, i) => i !== kind));
      return {
        prompt: `O sistema $${sys(A, b, XY)}$ é…`,
        answer: { kind: "choice", options, correct },
        hint: "Compare as duas equações: os coeficientes de uma são múltiplos dos da outra? Se forem, o lado direito segue a mesma proporção?",
        solution:
          kind === 0
            ? [`Determinante $${n(det(A))} \\ne 0$: as retas se cruzam num ponto só.`]
            : [
                `A 2ª equação tem coeficientes $${n(m)}$ vezes os da 1ª: as retas são paralelas ou iguais.`,
                kind === 1 ? `O lado direito também: $${n(m)}\\cdot${p(b1)} = ${n(b[1])}$. É a mesma reta, infinitas soluções.` : `Mas $${n(m)}\\cdot${p(b1)} = ${n(m * b1)} \\ne ${n(b[1])}$: retas paralelas distintas, nenhuma solução.`,
              ],
      };
    },
  },
  {
    id: "E1.k",
    title: "O parâmetro k",
    level: 3,
    make: (r) => {
      const spi = r() < 0.5;
      const [a, bb] = until(() => ivec(r, 2, 1, 4), (v) => v[0] !== v[1] || r() < 0.3);
      const c = int(r, -5, 5);
      const m = pick(r, [2, 3, -2]);
      const k = m * bb;
      const d = spi ? m * c : m * c + nz(r, -3, 3);
      const eq2 = `${n(m * a)}x + ky = ${n(d)}`;
      return {
        prompt: `Para que valor de $k$ o sistema $\\begin{cases} ${texEquation([a, bb], XY, c)} \\\\ ${eq2} \\end{cases}$ ${spi ? "tem infinitas soluções" : "não tem solução"}?`,
        answer: { kind: "number", value: k, label: "$k$" },
        hint: "Para não ter uma única solução, o determinante precisa ser zero: os coeficientes de uma equação são múltiplos dos da outra.",
        solution: [
          `$\\det = ${n(a)}k - ${p(bb)}\\cdot${p(m * a)} = 0 \\Rightarrow k = ${n(k)}$`,
          `Com $k = ${n(k)}$, a 2ª equação tem coeficientes $${n(m)}$ vezes os da 1ª. O lado direito: $${n(m)}\\cdot${p(c)} = ${n(m * c)}$ ${spi ? `$= ${n(d)}$, a mesma reta` : `$\\ne ${n(d)}$, retas paralelas`}.`,
        ],
      };
    },
  },
];

/* ---------- E2 · Escalonamento ---------- */

const E2: Generator[] = [
  {
    id: "E2.resolver",
    title: "Sistema 3×3 por escalonamento",
    level: 2,
    make: (r) => {
      const A = until(() => imat(r, 3, 3, -2, 3), (A) => {
        const d = det(A);
        return d !== 0 && Math.abs(d) <= 8 && A[0][0] !== 0;
      });
      const X = ivec(r, 3, -3, 3);
      const b = mulV(A, X);
      const aug = A.map((row, i) => [...row, b[i]]);
      const steps = eliminationSteps(aug, "gauss", 3).filter((s) => s.kind !== "start");
      const last = steps.length ? steps[steps.length - 1].matrix : aug;
      return {
        prompt: `Resolva por escalonamento: $${sys(A, b, XYZ)}$`,
        answer: { kind: "vector", value: X },
        hint: "Use a 1ª linha para zerar x nas outras duas; depois use a 2ª para zerar y na 3ª. Resolva de baixo para cima.",
        solution: [
          `Matriz aumentada: $${M(aug, 3)}$`,
          ...steps.map((s) => `$${s.tex}$`),
          `Escalonada: $${M(last, 3)}$`,
          `De baixo para cima: $(x, y, z) = ${tp(X)}$.`,
        ],
      };
    },
  },
  {
    id: "E2.posto",
    title: "O posto",
    level: 2,
    make: (r) => {
      const want = int(r, 1, 3);
      const A = until(
        () => {
          const base = imat(r, want, 4, -3, 3);
          const rows = [...base];
          while (rows.length < 3) {
            const c = ivec(r, want, -2, 2);
            rows.push(base[0].map((_, j) => base.reduce((s, row, i) => s + c[i] * row[j], 0)));
          }
          return rows.sort(() => r() - 0.5);
        },
        (A) => rank(A) === want && A.every((row) => row.some((x) => x !== 0)),
      );
      const steps = eliminationSteps(A, "gauss").filter((s) => s.kind !== "start");
      const last = steps.length ? steps[steps.length - 1].matrix : A;
      return {
        prompt: `Qual é o posto da matriz $${M(A)}$?`,
        answer: { kind: "number", value: want, label: "posto" },
        hint: "Escalone e conte as linhas que não zeraram (as que têm pivô).",
        solution: [...steps.map((s) => `$${s.tex}$`), `Escalonada: $${M(last)}$`, `Linhas não nulas: $${want}$, então o posto é $${want}$.`],
      };
    },
  },
  {
    id: "E2.op",
    title: "A próxima operação",
    level: 1,
    make: (r) => {
      const row1 = [1, ...ivec(r, 2, -3, 3)];
      const m = nz(r, -4, 4);
      const row2 = [m, ...ivec(r, 2, -4, 4)];
      const A = [row1, row2];
      const op = (s: string, k: number, t: string) => `$L_${s} \\leftarrow L_${s} ${k < 0 ? "+" : "-"} ${Math.abs(k) === 1 ? "" : Math.abs(k)}L_${t}$`;
      const right = op("2", m, "1");
      const { options, correct } = choices(r, right, [op("2", -m, "1"), op("1", m, "2"), `$L_2 \\leftarrow ${m === 1 ? "" : m === -1 ? "-" : m}L_2$`]);
      return {
        prompt: `Na matriz $${M(A)}$, qual operação zera a entrada da linha 2, coluna 1?`,
        answer: { kind: "choice", options, correct },
        hint: `O pivô da linha 1 é 1. Para zerar o $${n(m)}$ embaixo dele, subtraia da linha 2 esse número vezes a linha 1.`,
        solution: [`${right}: $${n(m)} - ${p(m)}\\cdot1 = 0$.`, `A linha 2 vira $${tp(row2.map((x, j) => x - m * row1[j]))}$.`],
      };
    },
  },
];

/* ---------- E3 · Determinante ---------- */

const E3: Generator[] = [
  {
    id: "E3.det2",
    title: "Determinante 2×2",
    level: 1,
    make: (r) => {
      const A = imat(r, 2, 2, -6, 6);
      const d = det(A);
      return {
        prompt: `Calcule $\\det ${M(A)}$.`,
        answer: { kind: "number", value: d, label: "$\\det$" },
        hint: "Diagonal principal menos diagonal secundária: $ad - bc$.",
        solution: [`$${p(A[0][0])}\\cdot${p(A[1][1])} - ${p(A[0][1])}\\cdot${p(A[1][0])} = ${n(A[0][0] * A[1][1])} - ${p(A[0][1] * A[1][0])} = ${n(d)}$`],
      };
    },
  },
  {
    id: "E3.det3",
    title: "Determinante 3×3",
    level: 2,
    make: (r) => {
      const A = imat(r, 3, 3, -3, 3);
      const d = det(A);
      const [[a, b, c], [dd, e, f], [g, h, i]] = A;
      const m1 = e * i - f * h, m2 = dd * i - f * g, m3 = dd * h - e * g;
      return {
        prompt: `Calcule $\\det ${M(A)}$.`,
        answer: { kind: "number", value: d, label: "$\\det$" },
        hint: "Pela 1ª linha: $a\\,(ei - fh) - b\\,(di - fg) + c\\,(dh - eg)$. Ou use a regra de Sarrus.",
        solution: [
          `$${p(a)}\\cdot(${n(m1)}) - ${p(b)}\\cdot(${n(m2)}) + ${p(c)}\\cdot(${n(m3)})$`,
          `$= ${n(a * m1)} ${b * m2 > 0 ? "-" : "+"} ${n(Math.abs(b * m2))} ${c * m3 < 0 ? "-" : "+"} ${n(Math.abs(c * m3))} = ${n(d)}$`,
        ],
      };
    },
  },
  {
    id: "E3.area",
    title: "Área pelo determinante",
    level: 2,
    make: (r) => {
      const tri = r() < 0.5;
      const [P, Q, R] = until(() => [ivec(r, 2, -4, 4), ivec(r, 2, -4, 4), ivec(r, 2, -4, 4)], ([a, b, c]) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) !== 0);
      const u = [Q[0] - P[0], Q[1] - P[1]], v = [R[0] - P[0], R[1] - P[1]];
      const d = u[0] * v[1] - u[1] * v[0];
      const area = tri ? Math.abs(d) / 2 : Math.abs(d);
      return {
        prompt: tri
          ? `Qual é a área do triângulo de vértices $A = ${tp(P)}$, $B = ${tp(Q)}$ e $C = ${tp(R)}$?`
          : `Qual é a área do paralelogramo gerado por $\\vec u = ${tp(u)}$ e $\\vec v = ${tp(v)}$?`,
        answer: { kind: "number", value: area, label: "área" },
        hint: tri ? "Monte $\\overrightarrow{AB}$ e $\\overrightarrow{AC}$; a área do triângulo é metade do módulo do determinante deles." : "A área é o módulo do determinante com $\\vec u$ e $\\vec v$ nas colunas.",
        solution: [
          ...(tri ? [`$\\overrightarrow{AB} = ${tp(u)}$, $\\overrightarrow{AC} = ${tp(v)}$`] : []),
          `$\\det = ${p(u[0])}\\cdot${p(v[1])} - ${p(v[0])}\\cdot${p(u[1])} = ${n(d)}$`,
          tri ? `Área $= \\dfrac{|${n(d)}|}{2} = ${n(area)}$` : `Área $= |${n(d)}| = ${n(area)}$`,
        ],
      };
    },
  },
  {
    id: "E3.k",
    title: "Quando o determinante zera",
    level: 2,
    make: (r) => {
      const { a, b, c, k } = until(
        () => ({ a: nz(r, -5, 5), b: nz(r, -5, 5), c: nz(r, -4, 4), k: 0 }),
        (o) => {
          o.k = (o.a * o.b) / o.c;
          return Number.isInteger(o.k) && Math.abs(o.k) <= 15;
        },
      );
      return {
        prompt: `Para que valor de $k$ a matriz $\\left[\\begin{array}{cc} k & ${n(a)} \\\\ ${n(b)} & ${n(c)} \\end{array}\\right]$ tem determinante zero?`,
        answer: { kind: "number", value: k, label: "$k$" },
        hint: "Escreva $\\det = k\\cdot c - a\\cdot b$ e iguale a zero.",
        solution: [`$\\det = ${n(c)}k - ${p(a)}\\cdot${p(b)} = ${n(c)}k - ${p(a * b)}$`, `$${n(c)}k = ${n(a * b)} \\Rightarrow k = ${n(k)}$`, "Com esse k, as colunas ficam paralelas e a área some."],
      };
    },
  },
];

/* ---------- E4 · Contas com matrizes ---------- */

const E4: Generator[] = [
  {
    id: "E4.produto",
    title: "Produto de matrizes",
    level: 1,
    make: (r) => {
      const wide = r() < 0.4;
      const A = wide ? imat(r, 2, 3, -3, 3) : imat(r, 2, 2, -3, 3);
      const B = wide ? imat(r, 3, 2, -3, 3) : imat(r, 2, 2, -3, 3);
      const C = mul(A, B);
      const k = A[0].length;
      const term = (i: number, j: number) => A[i].map((a, t) => `${p(a)}\\cdot${p(B[t][j])}`).join(" + ");
      return {
        prompt: `Calcule $AB$ para $A = ${M(A)}$ e $B = ${M(B)}$.`,
        answer: { kind: "matrix", value: C },
        hint: `A entrada $(i, j)$ de $AB$ é a linha $i$ de $A$ “vezes” a coluna $j$ de $B$: multiplique termo a termo e some (${k} produtos).`,
        solution: [`$(AB)_{11} = ${term(0, 0)} = ${n(C[0][0])}$`, `$(AB)_{12} = ${term(0, 1)} = ${n(C[0][1])}$`, `Do mesmo jeito para a 2ª linha: $AB = ${M(C)}$`],
      };
    },
  },
  {
    id: "E4.entrada",
    title: "Uma entrada do produto",
    level: 1,
    make: (r) => {
      const A = imat(r, 3, 3, -3, 3), B = imat(r, 3, 3, -3, 3);
      const i = int(r, 0, 2), j = int(r, 0, 2);
      const v = A[i].reduce((s, a, t) => s + a * B[t][j], 0);
      return {
        prompt: `Com $A = ${M(A)}$ e $B = ${M(B)}$, quanto vale a entrada da linha ${i + 1}, coluna ${j + 1} de $AB$?`,
        answer: { kind: "number", value: v, label: `$(AB)_{${i + 1}${j + 1}}$` },
        hint: `Não precisa do produto inteiro: use só a linha ${i + 1} de A e a coluna ${j + 1} de B.`,
        solution: [`Linha ${i + 1} de $A$: $${tp(A[i])}$; coluna ${j + 1} de $B$: $${tp(B.map((row) => row[j]))}$`, `$${A[i].map((a, t) => `${p(a)}\\cdot${p(B[t][j])}`).join(" + ")} = ${n(v)}$`],
      };
    },
  },
  {
    id: "E4.inversa",
    title: "Inversa 2×2",
    level: 2,
    make: (r) => {
      const A = until(() => imat(r, 2, 2, -4, 4), (A) => [1, 2, -1, -2, 4, -4].includes(det(A)));
      const d = det(A);
      const inv = inverse(A)!;
      const adj = [[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]];
      return {
        prompt: `Calcule a inversa de $A = ${M(A)}$. (Frações valem.)`,
        answer: { kind: "matrix", value: inv },
        hint: "Para $\\left[\\begin{array}{cc} a & b \\\\ c & d \\end{array}\\right]$: troque $a$ com $d$, troque o sinal de $b$ e $c$, e divida tudo pelo determinante.",
        solution: [`$\\det A = ${n(d)}$`, `Trocando e mudando sinais: $${M(adj)}$`, `Dividindo por $${n(d)}$: $A^{-1} = ${M(inv)}$`],
      };
    },
  },
  {
    id: "E4.transposta",
    title: "Produto com a transposta",
    level: 2,
    make: (r) => {
      const A = imat(r, 2, 3, -3, 3);
      const At = transpose(A);
      const C = mul(A, At);
      return {
        prompt: `Com $A = ${M(A)}$, calcule $AA^T$.`,
        answer: { kind: "matrix", value: C },
        hint: "$A^T$ tem as linhas de $A$ como colunas. A entrada $(i, j)$ de $AA^T$ é o produto escalar da linha $i$ com a linha $j$ de $A$.",
        solution: [`$A^T = ${M(At)}$`, `$AA^T = ${M(C)}$`, "Repare que o resultado é simétrico: a entrada (1, 2) é igual à (2, 1)."],
      };
    },
  },
];

const gens: TrackGens = { E1, E2, E3, E4 };
export default gens;
