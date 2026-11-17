import { choices, int, ivec, nz, pick, until } from "../learn/rng";
import type { Generator } from "../learn/types";
import { cross, dot, norm, triple, type Vec3 } from "../math/vec";
import type { TrackGens } from "./index";
import { ROUND2, SQRT_NOTE, n, p, sqrtAnswer, tp } from "./kit";

/* ---------- A1 · Vetores no plano ---------- */

const A1: Generator[] = [
  {
    id: "A1.comb",
    title: "Combinação de vetores",
    level: 1,
    make: (r) => {
      const a = nz(r, -3, 3), b = nz(r, -3, 3);
      const u = ivec(r, 2, -4, 4), v = ivec(r, 2, -4, 4);
      const au = u.map((x) => a * x), bv = v.map((x) => b * x);
      const w = au.map((x, i) => x + bv[i]);
      const lhs = `${a === 1 ? "" : a === -1 ? "-" : n(a)}\\vec u ${b < 0 ? "-" : "+"} ${Math.abs(b) === 1 ? "" : n(Math.abs(b))}\\vec v`;
      return {
        prompt: `Com $\\vec u = ${tp(u)}$ e $\\vec v = ${tp(v)}$, calcule $${lhs}$.`,
        answer: { kind: "vector", value: w },
        hint: `Multiplique cada vetor pelo seu número e some coordenada a coordenada: $${n(a)}\\vec u = ${tp(au)}$.`,
        solution: [`$${n(a)}\\vec u = ${tp(au)}$`, `$${n(b)}\\vec v = ${tp(bv)}$`, `Somando: $${tp(au)} + ${tp(bv)} = ${tp(w)}$`],
      };
    },
  },
  {
    id: "A1.norma",
    title: "Tamanho de um vetor",
    level: 1,
    make: (r) => {
      const u = until(
        () => ivec(r, 2, -6, 6),
        (v) => v[0] !== 0 && v[1] !== 0,
      );
      const k = u[0] ** 2 + u[1] ** 2;
      const { answer, texv } = sqrtAnswer(k, "$\\|\\vec u\\|$");
      return {
        prompt: `Qual é o tamanho (norma) de $\\vec u = ${tp(u)}$?${Number.isInteger(Math.sqrt(k)) ? "" : SQRT_NOTE}`,
        answer,
        hint: "Pitágoras: $\\|\\vec u\\| = \\sqrt{u_1^2 + u_2^2}$. Cuidado: o quadrado de um negativo é positivo.",
        solution: [`$\\|\\vec u\\| = \\sqrt{${p(u[0])}^2 + ${p(u[1])}^2} = \\sqrt{${u[0] ** 2} + ${u[1] ** 2}} = \\sqrt{${k}}$`, `$\\sqrt{${k}} = ${texv}${Number.isInteger(Math.sqrt(k)) ? "" : ` \\approx ${Math.sqrt(k).toFixed(2).replace(".", "{,}")}`}$`],
      };
    },
  },
  {
    id: "A1.ponto",
    title: "Marque no plano",
    level: 1,
    make: (r) => {
      const u = until(() => ivec(r, 2, -3, 3), (v) => Math.abs(v[0]) + Math.abs(v[1]) >= 2) as [number, number];
      const v = until(() => ivec(r, 2, -3, 3), (w) => Math.abs(w[0]) + Math.abs(w[1]) >= 2 && w[0] * u[1] - w[1] * u[0] !== 0) as [number, number];
      const op = pick(r, ["+", "-"] as const);
      const res: [number, number] = op === "+" ? [u[0] + v[0], u[1] + v[1]] : [u[0] - v[0], u[1] - v[1]];
      return {
        prompt: `Arraste o ponto até a ponta de $\\vec u ${op} \\vec v$ (com o vetor saindo da origem).`,
        figure: {
          view: [-6, 6, -6, 6],
          items: [
            { t: "vec", to: u, color: 1, label: "u" },
            { t: "vec", to: v, color: 2, label: "v" },
          ],
        },
        answer: { kind: "point", value: res },
        hint: op === "+" ? "Emende v na ponta de u: ande u e depois ande v." : "u − v = u + (−v): emende v ao contrário na ponta de u.",
        solution: [`Pelo gráfico, $\\vec u = ${tp(u)}$ e $\\vec v = ${tp(v)}$.`, `$\\vec u ${op} \\vec v = ${tp(res)}$`],
      };
    },
  },
  {
    id: "A1.coef",
    title: "Achar a combinação",
    level: 2,
    make: (r) => {
      const [u, v] = until(
        () => [ivec(r, 2, -3, 3), ivec(r, 2, -3, 3)],
        ([a, b]) => a[0] * b[1] - a[1] * b[0] !== 0,
      );
      const al = nz(r, -3, 3), be = nz(r, -3, 3);
      const w = [al * u[0] + be * v[0], al * u[1] + be * v[1]];
      const D = u[0] * v[1] - u[1] * v[0];
      return {
        prompt: `Encontre $\\alpha$ e $\\beta$ tais que $\\alpha\\,${tp(u)} + \\beta\\,${tp(v)} = ${tp(w)}$.`,
        answer: { kind: "vector", value: [al, be], names: ["α", "β"] },
        hint: "Cada coordenada dá uma equação. Monte o sistema em α e β e resolva.",
        solution: [
          `$\\begin{cases} ${n(u[0])}\\alpha ${v[0] < 0 ? "-" : "+"} ${n(Math.abs(v[0]))}\\beta = ${n(w[0])} \\\\ ${n(u[1])}\\alpha ${v[1] < 0 ? "-" : "+"} ${n(Math.abs(v[1]))}\\beta = ${n(w[1])} \\end{cases}$`,
          `Determinante do sistema: $${p(u[0])}\\cdot${p(v[1])} - ${p(v[0])}\\cdot${p(u[1])} = ${n(D)} \\ne 0$, então há uma única solução.`,
          `Resolvendo: $\\alpha = ${n(al)}$ e $\\beta = ${n(be)}$.`,
        ],
      };
    },
  },
];

/* ---------- A2 · Produto escalar ---------- */

/** Pares com ângulo "de tabela" (antes de girar e escalar). */
const ANGLE_PAIRS: { u: number[]; v: number[]; deg: number }[] = [
  { u: [1, 0], v: [1, 1], deg: 45 },
  { u: [1, 0], v: [0, 1], deg: 90 },
  { u: [1, 0], v: [-1, 1], deg: 135 },
  { u: [1, 0], v: [-1, 0], deg: 180 },
  { u: [1, 1], v: [1, -1], deg: 90 },
  { u: [1, 1], v: [0, 1], deg: 45 },
  { u: [1, 1], v: [-1, 0], deg: 135 },
  { u: [2, 1], v: [-1, 2], deg: 90 },
  { u: [3, 1], v: [1, 2], deg: 45 },
  { u: [1, 2], v: [-3, 1], deg: 90 },
  { u: [2, 1], v: [1, 3], deg: 45 },
  { u: [1, 3], v: [-2, -1], deg: 135 },
];
const rot90 = (v: number[], k: number) => {
  let w = v;
  for (let i = 0; i < k; i++) w = [-w[1], w[0]];
  return w;
};

const A2: Generator[] = [
  {
    id: "A2.dot",
    title: "Produto escalar",
    level: 1,
    make: (r) => {
      const u = ivec(r, 2, -5, 5), v = ivec(r, 2, -5, 5);
      const d = dot(u, v);
      return {
        prompt: `Calcule $\\vec u\\cdot\\vec v$ para $\\vec u = ${tp(u)}$ e $\\vec v = ${tp(v)}$.`,
        answer: { kind: "number", value: d, label: "$\\vec u\\cdot\\vec v$" },
        hint: "Multiplique as primeiras coordenadas, multiplique as segundas e some os dois resultados.",
        solution: [`$\\vec u\\cdot\\vec v = ${p(u[0])}\\cdot${p(v[0])} + ${p(u[1])}\\cdot${p(v[1])} = ${n(u[0] * v[0])} + ${p(u[1] * v[1])} = ${n(d)}$`],
      };
    },
  },
  {
    id: "A2.sinal",
    title: "Agudo, reto ou obtuso?",
    level: 1,
    make: (r) => {
      const [u, v] = until(
        () => [ivec(r, 2, -4, 4), ivec(r, 2, -4, 4)],
        ([a, b]) => norm(a) > 0 && norm(b) > 0 && (dot(a, b) === 0 || r() < 0.75),
      );
      const d = dot(u, v);
      const k = d > 0 ? 0 : d === 0 ? 1 : 2;
      const opts = ["Agudo (menor que 90°)", "Reto (90°)", "Obtuso (maior que 90°)"];
      return {
        prompt: `Sem medir: o ângulo entre $\\vec u = ${tp(u)}$ e $\\vec v = ${tp(v)}$ é…`,
        answer: { kind: "choice", options: opts, correct: k },
        hint: "Calcule $\\vec u\\cdot\\vec v$ e olhe só o sinal.",
        solution: [`$\\vec u\\cdot\\vec v = ${p(u[0])}\\cdot${p(v[0])} + ${p(u[1])}\\cdot${p(v[1])} = ${n(d)}$`, `${d > 0 ? "Positivo: ângulo agudo." : d === 0 ? "Zero: ângulo reto." : "Negativo: ângulo obtuso."}`],
      };
    },
  },
  {
    id: "A2.angulo",
    title: "Ângulo entre vetores",
    level: 2,
    make: (r) => {
      const base = pick(r, ANGLE_PAIRS);
      const k = int(r, 0, 3), su = int(r, 1, 2), sv = int(r, 1, 2);
      const u = rot90(base.u, k).map((x) => x * su), v = rot90(base.v, k).map((x) => x * sv);
      const d = dot(u, v), nu2 = dot(u, u), nv2 = dot(v, v);
      return {
        prompt: `Qual é o ângulo entre $\\vec u = ${tp(u)}$ e $\\vec v = ${tp(v)}$? Responda em graus.`,
        answer: { kind: "number", value: base.deg, tol: 0.5, unit: "°", label: "$\\theta$" },
        hint: "$\\cos\\theta = \\dfrac{\\vec u\\cdot\\vec v}{\\|\\vec u\\|\\,\\|\\vec v\\|}$. Depois, qual ângulo tem esse cosseno?",
        solution: [
          `$\\vec u\\cdot\\vec v = ${n(d)}$, $\\|\\vec u\\| = \\sqrt{${nu2}}$, $\\|\\vec v\\| = \\sqrt{${nv2}}$`,
          `$\\cos\\theta = \\dfrac{${n(d)}}{\\sqrt{${nu2}}\\sqrt{${nv2}}} = \\dfrac{${n(d)}}{\\sqrt{${nu2 * nv2}}} \\approx ${(d / Math.sqrt(nu2 * nv2)).toFixed(3).replace(".", "{,}")}$`,
          `$\\theta = ${base.deg}^\\circ$`,
        ],
      };
    },
  },
  {
    id: "A2.proj",
    title: "Projeção",
    level: 2,
    make: (r) => {
      const [u, v] = until(
        () => [ivec(r, 2, -4, 4), ivec(r, 2, -3, 3)],
        ([a, b]) => norm(b) > 0 && dot(a, b) !== 0 && Number.isInteger((dot(a, b) * 12) / dot(b, b)),
      );
      const d = dot(u, v), vv = dot(v, v), k = d / vv;
      const pr = v.map((x) => x * k);
      return {
        prompt: `Calcule $\\operatorname{proj}_{\\vec v}\\vec u$ para $\\vec u = ${tp(u)}$ e $\\vec v = ${tp(v)}$. (Frações como 3/5 valem.)`,
        answer: { kind: "vector", value: pr },
        hint: "$\\operatorname{proj}_{\\vec v}\\vec u = \\dfrac{\\vec u\\cdot\\vec v}{\\vec v\\cdot\\vec v}\\,\\vec v$: primeiro ache esse número, depois multiplique v por ele.",
        solution: [`$\\vec u\\cdot\\vec v = ${n(d)}$ e $\\vec v\\cdot\\vec v = ${n(vv)}$`, `Fator: $\\dfrac{${n(d)}}{${n(vv)}} = ${n(k)}$`, `$${n(k)}\\cdot${tp(v)} = ${tp(pr)}$`],
      };
    },
  },
  {
    id: "A2.ortok",
    title: "Valor de k para ortogonalidade",
    level: 2,
    make: (r) => {
      const { a, b, c, k } = until(
        () => ({ a: nz(r, -4, 4), b: nz(r, -4, 4), c: nz(r, -4, 4), k: 0 }),
        (o) => {
          // a·b + k·c = 0  →  k = −ab/c inteiro
          o.k = (-o.a * o.b) / o.c;
          return Number.isInteger(o.k) && Math.abs(o.k) <= 12;
        },
      );
      return {
        prompt: `Para que valor de $k$ os vetores $\\vec u = (${n(a)};\\ k)$ e $\\vec v = (${n(b)};\\ ${n(c)})$ são ortogonais?`,
        answer: { kind: "number", value: k, label: "$k$" },
        hint: "Ortogonais quer dizer $\\vec u\\cdot\\vec v = 0$. Escreva o produto escalar com k e resolva.",
        solution: [`$\\vec u\\cdot\\vec v = ${p(a)}\\cdot${p(b)} + k\\cdot${p(c)} = ${n(a * b)} ${c < 0 ? "-" : "+"} ${n(Math.abs(c))}k$`, `$${n(a * b)} ${c < 0 ? "-" : "+"} ${n(Math.abs(c))}k = 0 \\Rightarrow k = ${n(k)}$`],
      };
    },
  },
];

/* ---------- A3 · Produto vetorial e misto ---------- */

const crossSteps = (u: Vec3, v: Vec3, w: Vec3) => [
  `$x$: $${p(u[1])}\\cdot${p(v[2])} - ${p(u[2])}\\cdot${p(v[1])} = ${n(w[0])}$`,
  `$y$: $${p(u[2])}\\cdot${p(v[0])} - ${p(u[0])}\\cdot${p(v[2])} = ${n(w[1])}$`,
  `$z$: $${p(u[0])}\\cdot${p(v[1])} - ${p(u[1])}\\cdot${p(v[0])} = ${n(w[2])}$`,
];

const A3: Generator[] = [
  {
    id: "A3.cross",
    title: "Produto vetorial",
    level: 1,
    make: (r) => {
      const u = ivec(r, 3, -3, 3) as Vec3, v = ivec(r, 3, -3, 3) as Vec3;
      const w = cross(u, v);
      return {
        prompt: `Calcule $\\vec u\\times\\vec v$ para $\\vec u = ${tp(u)}$ e $\\vec v = ${tp(v)}$.`,
        answer: { kind: "vector", value: w },
        hint: "Primeira coordenada: $u_2v_3 - u_3v_2$; segunda: $u_3v_1 - u_1v_3$; terceira: $u_1v_2 - u_2v_1$.",
        solution: [...crossSteps(u, v, w), `$\\vec u\\times\\vec v = ${tp(w)}$`],
      };
    },
  },
  {
    id: "A3.area",
    title: "Área com produto vetorial",
    level: 2,
    make: (r) => {
      const tri = r() < 0.4;
      const [u, v] = until(
        () => [ivec(r, 3, -3, 3) as Vec3, ivec(r, 3, -3, 3) as Vec3],
        ([a, b]) => norm(cross(a, b)) > 0,
      );
      const w = cross(u, v);
      const k = dot(w, w);
      const { answer, texv } = sqrtAnswer(k, tri ? "área do triângulo" : "área");
      if (tri && answer.kind === "number") {
        answer.value /= 2;
        answer.tol = Number.isInteger(Math.sqrt(k) / 2) ? 1e-6 : ROUND2;
        if (answer.exact) answer.exact = `\\dfrac{${texv}}{2}`;
      }
      return {
        prompt: `Qual é a área do ${tri ? "triângulo" : "paralelogramo"} determinado por $\\vec u = ${tp(u)}$ e $\\vec v = ${tp(v)}$?${Number.isInteger(Math.sqrt(k)) && (!tri || Number.isInteger(Math.sqrt(k) / 2)) ? "" : SQRT_NOTE}`,
        answer,
        hint: `A área do paralelogramo é $\\|\\vec u\\times\\vec v\\|$.${tri ? " O triângulo é metade dele." : ""}`,
        solution: [
          `$\\vec u\\times\\vec v = ${tp(w)}$`,
          `$\\|\\vec u\\times\\vec v\\| = \\sqrt{${k}} = ${texv}$`,
          ...(tri ? [`Triângulo: metade, $\\dfrac{${texv}}{2} \\approx ${(Math.sqrt(k) / 2).toFixed(2).replace(".", "{,}")}$`] : []),
        ],
      };
    },
  },
  {
    id: "A3.volume",
    title: "Volume pelo produto misto",
    level: 2,
    make: (r) => {
      const [u, v, w] = until(
        () => [ivec(r, 3, -2, 3) as Vec3, ivec(r, 3, -2, 3) as Vec3, ivec(r, 3, -2, 3) as Vec3],
        ([a, b, c]) => triple(a, b, c) !== 0,
      );
      const t = triple(u, v, w);
      const vw = cross(v, w);
      return {
        prompt: `Qual é o volume do paralelepípedo gerado por $\\vec u = ${tp(u)}$, $\\vec v = ${tp(v)}$ e $\\vec w = ${tp(w)}$?`,
        answer: { kind: "number", value: Math.abs(t), label: "volume" },
        hint: "Volume $= |\\vec u\\cdot(\\vec v\\times\\vec w)|$: faça primeiro $\\vec v\\times\\vec w$, depois o produto escalar com u, e tire o módulo.",
        solution: [`$\\vec v\\times\\vec w = ${tp(vw)}$`, `$\\vec u\\cdot(\\vec v\\times\\vec w) = ${n(t)}$`, `Volume $= |${n(t)}| = ${n(Math.abs(t))}$`],
      };
    },
  },
  {
    id: "A3.coplanar",
    title: "Coplanares?",
    level: 3,
    make: (r) => {
      const yes = r() < 0.5;
      const [u, v] = until(
        () => [ivec(r, 3, -3, 3) as Vec3, ivec(r, 3, -3, 3) as Vec3],
        ([a, b]) => norm(cross(a, b)) > 0,
      );
      const w = yes
        ? (() => {
            const a = nz(r, -2, 2), b = nz(r, -2, 2);
            return u.map((x, i) => a * x + b * v[i]) as Vec3;
          })()
        : until(() => ivec(r, 3, -3, 3) as Vec3, (c) => triple(u, v, c) !== 0);
      const t = triple(u, v, w);
      const { options, correct } = choices(r, "Sim, o produto misto é zero", ["Não, o produto misto não é zero"]);
      const right = yes ? correct : 1 - correct;
      return {
        prompt: `Os vetores $\\vec u = ${tp(u)}$, $\\vec v = ${tp(v)}$ e $\\vec w = ${tp(w)}$ são coplanares?`,
        answer: { kind: "choice", options, correct: right },
        hint: "Calcule o produto misto $[\\vec u, \\vec v, \\vec w]$. Coplanares ⇔ volume zero.",
        solution: [`$\\vec v\\times\\vec w = ${tp(cross(v, w))}$`, `$[\\vec u, \\vec v, \\vec w] = ${n(t)}$`, t === 0 ? "Zero: os três estão num mesmo plano." : "Diferente de zero: eles geram um volume, não são coplanares."],
      };
    },
  },
];

const gens: TrackGens = { A1, A2, A3 };
export default gens;
