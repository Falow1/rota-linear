import { choices, int, ivec, nz, pick, until } from "../learn/rng";
import type { Answer, Generator } from "../learn/types";
import { texAffine, texEquation, texLinear, texSqrt } from "../math/format";
import { gcd } from "../math/fraction";
import { lineFromPoints, tidyLine, type Line2 } from "../math/lines";
import { relLineLine } from "../math/space";
import { cross, dot, sub, type Vec2, type Vec3 } from "../math/vec";
import type { TrackGens } from "./index";
import { ROUND2, isSquare, n, p, tp } from "./kit";

/* ---------- Utilidades da rota ---------- */

const XY = ["x", "y"];
const XYZ = ["x", "y", "z"];
const nonzero = (v: number[]) => v.some((x) => x !== 0);
/** ax + by + c = 0 */
const eq2 = (l: Line2) => `${texLinear([l.a, l.b], XY, l.c)} = 0`;
/** ax + by + cz = d */
const eq3 = (nv: number[], d: number) => texEquation(nv, XYZ, d);
/** X = A + t·v */
const vecLine = (name: string, A: number[], v: number[], par = "t") => `${name}: X = ${tp(A)} + ${par}\\,${tp(v)}`;

/** Divide pelo mdc e deixa a primeira coordenada não nula positiva. */
function tidyVec(v: number[]): number[] {
  const g = v.reduce((a, x) => (x === 0 ? a : a === 0 ? Math.abs(x) : gcd(a, x)), 0) || 1;
  const lead = v.find((x) => x !== 0) ?? 1;
  const s = lead < 0 ? -1 : 1;
  return v.map((x) => (s * x) / g || 0);
}

const DIST_NOTE = " Pode responder com duas casas decimais ou na forma exata (como 3/√5).";

/** |num| / √den2, exato quando der. */
function distAnswer(num: number, den2: number, label = "distância"): { answer: Answer; texv: string; irr: boolean } {
  const a = Math.abs(num);
  const value = a / Math.sqrt(den2);
  if (isSquare(den2)) return { answer: { kind: "number", value, label }, texv: n(value), irr: false };
  const texv = `\\dfrac{${n(a)}}{${texSqrt(den2)}}`;
  return { answer: { kind: "number", value, tol: ROUND2, label, exact: texv }, texv, irr: true };
}

/** Normais com norma inteira (e algumas sem), para distâncias no espaço. */
const NORMALS3: Vec3[] = [
  [1, 2, 2], [2, 1, 2], [2, 2, 1], [0, 3, 4], [3, 0, 4], [4, 3, 0], [2, 3, 6], [6, 2, 3], [1, 0, 0], [0, 0, 1],
  [1, 1, 1], [1, 2, 1], [1, 1, 0],
];
const signs3 = (r: () => number, v: Vec3): Vec3 => v.map((x) => (r() < 0.5 ? -x : x)) as Vec3;

const casesSys = (rows: string[]) => `\\begin{cases} ${rows.join(" \\\\ ")} \\end{cases}`;

/* ---------- B1 · Jeitos de escrever a reta ---------- */

const B1: Generator[] = [
  {
    id: "B1.geral",
    title: "Equação geral por dois pontos",
    level: 1,
    make: (r) => {
      const [P, Q] = until(
        () => [ivec(r, 2, -5, 5), ivec(r, 2, -5, 5)],
        ([a, b]) => a[0] !== b[0] || a[1] !== b[1],
      );
      const l = lineFromPoints(P as Vec2, Q as Vec2)!;
      const v = [Q[0] - P[0], Q[1] - P[1]];
      const a = v[1], b = -v[0];
      return {
        prompt: `Escreva a equação geral $ax + by + c = 0$ da reta que passa por $P = ${tp(P)}$ e $Q = ${tp(Q)}$.`,
        answer: { kind: "linear", value: [l.a, l.b, l.c], vars: XY },
        hint: "Um vetor diretor é $\\overrightarrow{PQ} = (d_1, d_2)$. Uma normal é $(d_2, -d_1)$: esses são $a$ e $b$. Depois ache $c$ substituindo $P$.",
        solution: [
          `$\\overrightarrow{PQ} = ${tp(v)}$, então uma normal é $(a, b) = ${tp([a, b])}$.`,
          `Substituindo $P$: $${p(a)}\\cdot${p(P[0])} + ${p(b)}\\cdot${p(P[1])} + c = 0 \\Rightarrow c = ${n(-(a * P[0] + b * P[1]))}$.`,
          `Simplificando: $${eq2(l)}$.`,
        ],
      };
    },
  },
  {
    id: "B1.incl",
    title: "Coeficiente angular",
    level: 1,
    make: (r) => {
      const [P, Q] = until(
        () => [ivec(r, 2, -5, 5), ivec(r, 2, -5, 5)],
        ([a, b]) => a[0] !== b[0],
      );
      const dx = Q[0] - P[0], dy = Q[1] - P[1];
      const m = dy / dx;
      return {
        prompt: `Qual é o coeficiente angular $m$ da reta que passa por $P = ${tp(P)}$ e $Q = ${tp(Q)}$? (Frações como 2/3 valem.)`,
        answer: { kind: "number", value: m, label: "$m$" },
        hint: "$m = \\dfrac{\\Delta y}{\\Delta x}$: quanto a reta sobe para cada passo à direita.",
        solution: [
          `$m = \\dfrac{y_Q - y_P}{x_Q - x_P} = \\dfrac{${n(Q[1])} - ${p(P[1])}}{${n(Q[0])} - ${p(P[0])}} = \\dfrac{${n(dy)}}{${n(dx)}} = ${n(m)}$`,
          m === 0 ? "A reta é horizontal." : m > 0 ? "Positivo: a reta sobe da esquerda para a direita." : "Negativo: a reta desce da esquerda para a direita.",
        ],
      };
    },
  },
  {
    id: "B1.eixos",
    title: "Onde a reta corta os eixos",
    level: 2,
    make: (r) => {
      const pp = nz(r, -6, 6), q = nz(r, -6, 6);
      // x/p + y/q = 1  ⇔  qx + py − pq = 0
      const l = tidyLine({ a: q, b: pp, c: -pp * q });
      return {
        prompt: `A reta $${eq2(l)}$ corta o eixo $x$ no ponto $(p, 0)$ e o eixo $y$ no ponto $(0, q)$. Quanto valem $p$ e $q$?`,
        answer: { kind: "vector", value: [pp, q], names: ["p", "q"] },
        hint: "No eixo x, y = 0: substitua e resolva para x. No eixo y, faça x = 0.",
        solution: [
          `$y = 0$: $${texLinear([l.a], ["x"], l.c)} = 0 \\Rightarrow x = ${n(pp)}$`,
          `$x = 0$: $${texLinear([l.b], ["y"], l.c)} = 0 \\Rightarrow y = ${n(q)}$`,
          `Forma segmentária: $\\dfrac{x}{${n(pp)}} + \\dfrac{y}{${n(q)}} = 1$`,
        ],
      };
    },
  },
  {
    id: "B1.param",
    title: "Ponto da reta paramétrica",
    level: 2,
    make: (r) => {
      const o = until(
        () => ({ x0: int(r, -3, 3), y0: int(r, -3, 3), a: nz(r, -2, 2), b: int(r, -2, 2), k: pick(r, [-2, -1, 1, 2]) }),
        (o) => Math.abs(o.x0 + o.a * o.k) <= 5 && Math.abs(o.y0 + o.b * o.k) <= 5,
      );
      const res: [number, number] = [o.x0 + o.a * o.k, o.y0 + o.b * o.k];
      return {
        prompt: `A reta $r$ tem equações $x = ${texAffine(o.x0, o.a)}$ e $y = ${texAffine(o.y0, o.b)}$. Arraste o ponto até a posição de $r$ quando $t = ${n(o.k)}$.`,
        figure: {
          view: [-6, 6, -6, 6],
          items: [
            { t: "line", a: o.b, b: -o.a, c: -(o.b * o.x0 - o.a * o.y0), color: 1 },
            { t: "pt", at: [o.x0, o.y0], color: 2, label: "t = 0" },
          ],
        },
        answer: { kind: "point", value: res },
        hint: "Troque t pelo número nas duas equações.",
        solution: [
          `$x = ${n(o.x0)} + ${p(o.a)}\\cdot${p(o.k)} = ${n(res[0])}$`,
          `$y = ${n(o.y0)} + ${p(o.b)}\\cdot${p(o.k)} = ${n(res[1])}$`,
          `O ponto é $${tp(res)}$.`,
        ],
      };
    },
  },
];

/* ---------- B2 · Cruzamentos, ângulos e distâncias ---------- */

/** Pares de normais com ângulo agradável entre as retas. */
const LINE_ANGLE_PAIRS: [Vec2, Vec2][] = [
  [[1, 0], [1, 1]],
  [[1, 1], [1, -1]],
  [[2, 1], [1, 3]],
  [[3, 1], [1, 2]],
  [[1, 2], [-2, 1]],
  [[1, 0], [3, 4]],
  [[1, 0], [4, 3]],
  [[1, 2], [2, 1]],
  [[1, 3], [3, 1]],
];
const rot90 = (v: Vec2, k: number): Vec2 => {
  let w = v;
  for (let i = 0; i < k; i++) w = [-w[1], w[0]];
  return w;
};
const degTex = (d: number) => (Math.abs(d - Math.round(d)) < 1e-9 ? n(Math.round(d)) : d.toFixed(1).replace(".", "{,}"));

const B2: Generator[] = [
  {
    id: "B2.inter",
    title: "Onde duas retas se cruzam",
    level: 1,
    make: (r) => {
      const X = ivec(r, 2, -4, 4);
      const [n1, n2] = until(
        () => [ivec(r, 2, -3, 3), ivec(r, 2, -3, 3)],
        ([a, b]) => nonzero(a) && nonzero(b) && a[0] * b[1] - a[1] * b[0] !== 0,
      );
      const l1 = tidyLine({ a: n1[0], b: n1[1], c: -dot(n1, X) });
      const l2 = tidyLine({ a: n2[0], b: n2[1], c: -dot(n2, X) });
      const D = l1.a * l2.b - l1.b * l2.a;
      return {
        prompt: `Em que ponto as retas $r: ${eq2(l1)}$ e $s: ${eq2(l2)}$ se cruzam?`,
        answer: { kind: "vector", value: X },
        hint: "O ponto de cruzamento satisfaz as duas equações: resolva o sistema (por substituição ou somando múltiplos das equações).",
        solution: [
          `$${casesSys([texEquation([l1.a, l1.b], XY, -l1.c), texEquation([l2.a, l2.b], XY, -l2.c)])}$`,
          `Determinante: $${p(l1.a)}\\cdot${p(l2.b)} - ${p(l1.b)}\\cdot${p(l2.a)} = ${n(D)} \\ne 0$: há um único ponto.`,
          `Resolvendo: $(x, y) = ${tp(X)}$.`,
        ],
      };
    },
  },
  {
    id: "B2.angulo",
    title: "Ângulo entre retas",
    level: 2,
    make: (r) => {
      const pair = pick(r, LINE_ANGLE_PAIRS);
      const k = int(r, 0, 3);
      const swap = r() < 0.5;
      let n1 = rot90(pair[swap ? 1 : 0], k), n2 = rot90(pair[swap ? 0 : 1], k);
      if (r() < 0.5) n2 = [-n2[0], -n2[1]];
      n1 = n1.map((x) => x * int(r, 1, 2)) as Vec2;
      const l1 = tidyLine({ a: n1[0], b: n1[1], c: int(r, -5, 5) });
      const l2 = tidyLine({ a: n2[0], b: n2[1], c: int(r, -5, 5) });
      const m1: Vec2 = [l1.a, l1.b], m2: Vec2 = [l2.a, l2.b];
      const d = dot(m1, m2), a2 = dot(m1, m1), b2 = dot(m2, m2);
      const deg = (Math.acos(Math.min(1, Math.abs(d) / Math.sqrt(a2 * b2))) * 180) / Math.PI;
      return {
        prompt: `Qual é o ângulo entre as retas $r: ${eq2(l1)}$ e $s: ${eq2(l2)}$? Responda em graus.`,
        answer: { kind: "number", value: deg, tol: 0.5, unit: "°", label: "$\\theta$" },
        hint: "Use as normais $(a, b)$ das duas retas: $\\cos\\theta = \\dfrac{|\\vec n_1\\cdot\\vec n_2|}{\\|\\vec n_1\\|\\,\\|\\vec n_2\\|}$. O módulo garante um ângulo entre 0° e 90°.",
        solution: [
          `$\\vec n_1 = ${tp(m1)}$, $\\vec n_2 = ${tp(m2)}$, $\\vec n_1\\cdot\\vec n_2 = ${n(d)}$`,
          `$\\cos\\theta = \\dfrac{${n(Math.abs(d))}}{\\sqrt{${a2}}\\,\\sqrt{${b2}}} \\approx ${(Math.abs(d) / Math.sqrt(a2 * b2)).toFixed(3).replace(".", "{,}")}$`,
          `$\\theta \\approx ${degTex(deg)}^\\circ$`,
        ],
      };
    },
  },
  {
    id: "B2.dist",
    title: "Distância de ponto a reta",
    level: 2,
    make: (r) => {
      const { l, P, num } = until(
        () => {
          const base = pick(r, [[3, 4], [4, 3], [1, 0], [0, 1], [5, 12], [12, 5], [1, 1], [1, 2], [2, 1], [1, 3]] as Vec2[]);
          const l = tidyLine({ a: r() < 0.5 ? -base[0] : base[0], b: r() < 0.5 ? -base[1] : base[1], c: int(r, -8, 8) });
          const P = ivec(r, 2, -4, 4);
          return { l, P, num: l.a * P[0] + l.b * P[1] + l.c };
        },
        (o) => o.num !== 0,
      );
      const den2 = l.a * l.a + l.b * l.b;
      const { answer, texv, irr } = distAnswer(num, den2);
      return {
        prompt: `Qual é a distância do ponto $P = ${tp(P)}$ à reta $${eq2(l)}$?${irr ? DIST_NOTE : ""}`,
        answer,
        hint: "$d = \\dfrac{|a x_0 + b y_0 + c|}{\\sqrt{a^2 + b^2}}$: substitua P na equação, tire o módulo e divida pelo tamanho da normal.",
        solution: [
          `Numerador: $|${p(l.a)}\\cdot${p(P[0])} + ${p(l.b)}\\cdot${p(P[1])} ${l.c < 0 ? "-" : "+"} ${n(Math.abs(l.c))}| = ${n(Math.abs(num))}$`,
          `Denominador: $\\sqrt{${p(l.a)}^2 + ${p(l.b)}^2} = ${texSqrt(den2)}$`,
          `$d = ${texv}${irr ? ` \\approx ${(Math.abs(num) / Math.sqrt(den2)).toFixed(2).replace(".", "{,}")}` : ""}$`,
        ],
      };
    },
  },
  {
    id: "B2.pos",
    title: "Posição relativa pelas equações",
    level: 1,
    make: (r) => {
      const kind = int(r, 0, 2); // 0 concorrentes, 1 paralelas, 2 coincidentes
      const l1 = tidyLine({ a: nz(r, -3, 3), b: nz(r, -3, 3), c: int(r, -5, 5) });
      const k = pick(r, [2, 3, -1, -2]);
      const l2: Line2 =
        kind === 2
          ? { a: k * l1.a, b: k * l1.b, c: k * l1.c }
          : kind === 1
            ? { a: k * l1.a, b: k * l1.b, c: k * l1.c + nz(r, -4, 4) }
            : until(
                () => ({ a: int(r, -4, 4), b: int(r, -4, 4), c: int(r, -5, 5) }),
                (m) => nonzero([m.a, m.b]) && m.a * l1.b - m.b * l1.a !== 0,
              );
      const names = ["Concorrentes (um ponto em comum)", "Paralelas distintas", "Coincidentes (a mesma reta)"];
      const { options, correct } = choices(r, names[kind], names.filter((_, i) => i !== kind));
      const D = l1.a * l2.b - l1.b * l2.a;
      return {
        prompt: `As retas $r: ${eq2(l1)}$ e $s: ${texLinear([l2.a, l2.b], XY, l2.c)} = 0$ são…`,
        answer: { kind: "choice", options, correct },
        hint: "Compare as normais $(a, b)$: se não forem múltiplas, as retas se cruzam. Se forem, veja se o $c$ segue a mesma proporção.",
        solution:
          kind === 0
            ? [`$a_1b_2 - a_2b_1 = ${n(D)} \\ne 0$: as normais não são múltiplas, então as retas se cruzam em um ponto.`]
            : [
                `A segunda equação tem $a$ e $b$ iguais a $${n(k)}$ vezes os da primeira: as retas são paralelas.`,
                kind === 2
                  ? `O $c$ também é $${n(k)}$ vezes o da primeira: é a mesma reta.`
                  : `Mas o $c$ não segue a proporção ($${n(k)}\\cdot${p(l1.c)} = ${n(k * l1.c)} \\ne ${n(l2.c)}$): paralelas distintas.`,
              ],
      };
    },
  },
];

/* ---------- B3 · Retas no espaço ---------- */

const B3: Generator[] = [
  {
    id: "B3.diretor",
    title: "Vetor diretor",
    level: 1,
    make: (r) => {
      const sym = r() < 0.5;
      const A = ivec(r, 3, -3, 3);
      const v = until(() => ivec(r, 3, -3, 3), (w) => w.every((x) => x !== 0));
      if (sym) {
        const frac = (c: string, a0: number, d: number) => `\\dfrac{${a0 === 0 ? c : `${c} ${a0 < 0 ? "+" : "-"} ${n(Math.abs(a0))}`}}{${n(d)}}`;
        return {
          prompt: `Dê um vetor diretor da reta $${frac("x", A[0], v[0])} = ${frac("y", A[1], v[1])} = ${frac("z", A[2], v[2])}$.`,
          answer: { kind: "direction", value: v },
          hint: "Na forma simétrica, os denominadores são as coordenadas do vetor diretor.",
          solution: [`Cada fração vale $t$; os denominadores dão $\\vec v = ${tp(v)}$ (ou qualquer múltiplo).`, `A reta passa por $${tp(A)}$.`],
        };
      }
      const B = A.map((x, i) => x + v[i]);
      return {
        prompt: `Dê um vetor diretor da reta que passa por $A = ${tp(A)}$ e $B = ${tp(B)}$.`,
        answer: { kind: "direction", value: v },
        hint: "Uma direção da reta é a seta de A até B: $\\overrightarrow{AB} = B - A$.",
        solution: [`$\\overrightarrow{AB} = ${tp(B)} - ${tp(A)} = ${tp(v)}$`, "Qualquer múltiplo não nulo também serve."],
      };
    },
  },
  {
    id: "B3.ponto",
    title: "Ponto para um valor de t",
    level: 1,
    make: (r) => {
      const A = ivec(r, 3, -3, 3), v = until(() => ivec(r, 3, -3, 3), nonzero);
      const k = nz(r, -3, 3);
      const X = A.map((x, i) => x + k * v[i]);
      return {
        prompt: `Na reta $${vecLine("r", A, v)}$, qual é o ponto para $t = ${n(k)}$?`,
        answer: { kind: "vector", value: X },
        hint: "Multiplique o vetor diretor por t e some ao ponto inicial.",
        solution: [`$${n(k)}\\,${tp(v)} = ${tp(v.map((x) => k * x))}$`, `$${tp(A)} + ${tp(v.map((x) => k * x))} = ${tp(X)}$`],
      };
    },
  },
  {
    id: "B3.pertence",
    title: "O ponto está na reta?",
    level: 2,
    make: (r) => {
      const yes = r() < 0.5;
      const A = ivec(r, 3, -3, 3), v = until(() => ivec(r, 3, -2, 2), (w) => w.filter((x) => x !== 0).length >= 2);
      const k = nz(r, -2, 3);
      const P = until(
        () => {
          const P = A.map((x, i) => x + k * v[i]);
          if (!yes) P[int(r, 0, 2)] += nz(r, -2, 2);
          return P;
        },
        (P) => yes || nonzero(cross(sub(P as Vec3, A as Vec3), v as Vec3)),
      );
      const ts = P.map((x, i) => (v[i] === 0 ? null : (x - A[i]) / v[i]));
      const { options, correct } = choices(r, "Sim", ["Não"]);
      const right = yes ? correct : 1 - correct;
      return {
        prompt: `O ponto $P = ${tp(P)}$ está na reta $${vecLine("r", A, v)}$?`,
        answer: { kind: "choice", options, correct: right },
        hint: "Iguale P a A + t·v coordenada por coordenada. P está na reta só se o mesmo t servir para as três.",
        solution: [
          ...P.map((x, i) =>
            v[i] === 0
              ? `Coordenada ${i + 1}: $${n(A[i])} = ${n(x)}$? ${A[i] === x ? "Sim (vale para qualquer t)." : "Não."}`
              : `Coordenada ${i + 1}: $${n(A[i])} + ${p(v[i])}t = ${n(x)} \\Rightarrow t = ${n(ts[i]!)}$`,
          ),
          yes ? `O mesmo $t = ${n(k)}$ serve em todas: P está na reta.` : "Os valores não batem: P não está na reta.",
        ],
      };
    },
  },
  {
    id: "B3.t",
    title: "Qual é o t?",
    level: 1,
    make: (r) => {
      const A = ivec(r, 3, -3, 3), v = until(() => ivec(r, 3, -3, 3), nonzero);
      const k = nz(r, -3, 3);
      const P = A.map((x, i) => x + k * v[i]);
      const i = v.findIndex((x) => x !== 0);
      return {
        prompt: `O ponto $P = ${tp(P)}$ está na reta $${vecLine("r", A, v)}$. Para qual valor de $t$?`,
        answer: { kind: "number", value: k, label: "$t$" },
        hint: "Use uma coordenada em que o vetor diretor não é zero e resolva para t.",
        solution: [`Coordenada ${i + 1}: $${n(A[i])} + ${p(v[i])}t = ${n(P[i])} \\Rightarrow t = ${n(k)}$`, "As outras coordenadas confirmam o mesmo valor."],
      };
    },
  },
];

/* ---------- B4 · Plano e normal ---------- */

const B4: Generator[] = [
  {
    id: "B4.tres",
    title: "Plano por três pontos",
    level: 2,
    make: (r) => {
      const [A, B, C] = until(
        () => [ivec(r, 3, -3, 3), ivec(r, 3, -3, 3), ivec(r, 3, -3, 3)] as Vec3[],
        ([a, b, c]) => {
          const nn = cross(sub(b, a), sub(c, a));
          return nonzero(nn) && nn.every((x) => Math.abs(x) <= 12);
        },
      );
      const AB = sub(B, A), AC = sub(C, A);
      const raw = cross(AB, AC);
      const nv = tidyVec(raw);
      const d = dot(nv, A);
      return {
        prompt: `Escreva a equação do plano que passa por $A = ${tp(A)}$, $B = ${tp(B)}$ e $C = ${tp(C)}$, na forma $ax + by + cz = d$.`,
        answer: { kind: "linear", value: [...nv, -d], vars: XYZ, rhsForm: true },
        hint: "A normal é $\\overrightarrow{AB}\\times\\overrightarrow{AC}$. Depois, $d = \\vec n\\cdot A$.",
        solution: [
          `$\\overrightarrow{AB} = ${tp(AB)}$, $\\overrightarrow{AC} = ${tp(AC)}$`,
          `$\\overrightarrow{AB}\\times\\overrightarrow{AC} = ${tp(raw)}$${raw.some((x, i) => x !== nv[i]) ? `, ou simplificando, $\\vec n = ${tp(nv)}$` : ""}`,
          `$d = \\vec n\\cdot A = ${n(d)}$, então o plano é $${eq3(nv, d)}$.`,
        ],
      };
    },
  },
  {
    id: "B4.ptnormal",
    title: "Plano por ponto e normal",
    level: 1,
    make: (r) => {
      const P = ivec(r, 3, -3, 3);
      const nv = until(() => ivec(r, 3, -3, 3), (w) => w.filter((x) => x !== 0).length >= 2);
      const d = dot(nv, P);
      return {
        prompt: `Escreva a equação do plano que passa por $P = ${tp(P)}$ e tem vetor normal $\\vec n = ${tp(nv)}$, na forma $ax + by + cz = d$.`,
        answer: { kind: "linear", value: [...nv, -d], vars: XYZ, rhsForm: true },
        hint: "$a$, $b$ e $c$ são as coordenadas da normal. Para achar $d$, substitua P: $d = \\vec n\\cdot P$.",
        solution: [`$d = ${p(nv[0])}\\cdot${p(P[0])} + ${p(nv[1])}\\cdot${p(P[1])} + ${p(nv[2])}\\cdot${p(P[2])} = ${n(d)}$`, `Plano: $${eq3(nv, d)}$`],
      };
    },
  },
  {
    id: "B4.pertence",
    title: "O ponto está no plano?",
    level: 1,
    make: (r) => {
      const nv = until(() => ivec(r, 3, -3, 3), (w) => w.filter((x) => x !== 0).length >= 2);
      const yes = r() < 0.5;
      const P = ivec(r, 3, -3, 3);
      const val = dot(nv, P);
      const d = yes ? val : val + nz(r, -3, 3);
      const { options, correct } = choices(r, "Sim", ["Não"]);
      return {
        prompt: `O ponto $P = ${tp(P)}$ está no plano $${eq3(nv, d)}$?`,
        answer: { kind: "choice", options, correct: yes ? correct : 1 - correct },
        hint: "Substitua as coordenadas de P no lado esquerdo e compare com o lado direito.",
        solution: [`$${p(nv[0])}\\cdot${p(P[0])} + ${p(nv[1])}\\cdot${p(P[1])} + ${p(nv[2])}\\cdot${p(P[2])} = ${n(val)}$`, yes ? `Dá $${n(d)}$: o ponto está no plano.` : `Dá $${n(val)} \\ne ${n(d)}$: o ponto não está no plano.`],
      };
    },
  },
  {
    id: "B4.normal",
    title: "Normal a partir de duas direções",
    level: 2,
    make: (r) => {
      const [u, v] = until(
        () => [ivec(r, 3, -3, 3), ivec(r, 3, -3, 3)] as Vec3[],
        ([a, b]) => nonzero(cross(a, b)),
      );
      const P = ivec(r, 3, -3, 3);
      const w = cross(u, v);
      return {
        prompt: `Um plano passa por $P = ${tp(P)}$ e contém as direções $\\vec u = ${tp(u)}$ e $\\vec v = ${tp(v)}$. Dê um vetor normal a ele.`,
        answer: { kind: "direction", value: w },
        hint: "A normal é perpendicular às duas direções ao mesmo tempo: use o produto vetorial $\\vec u\\times\\vec v$.",
        solution: [
          `$x$: $${p(u[1])}\\cdot${p(v[2])} - ${p(u[2])}\\cdot${p(v[1])} = ${n(w[0])}$`,
          `$y$: $${p(u[2])}\\cdot${p(v[0])} - ${p(u[0])}\\cdot${p(v[2])} = ${n(w[1])}$`,
          `$z$: $${p(u[0])}\\cdot${p(v[1])} - ${p(u[1])}\\cdot${p(v[0])} = ${n(w[2])}$`,
          `$\\vec n = ${tp(w)}$ (ou qualquer múltiplo não nulo). O ponto $P$ não muda a normal, só o $d$.`,
        ],
      };
    },
  },
];

/* ---------- B5 · Posições e distâncias ---------- */

const B5: Generator[] = [
  {
    id: "B5.dist",
    title: "Distância de ponto a plano",
    level: 2,
    make: (r) => {
      const { nv, d, P, num } = until(
        () => {
          const nv = signs3(r, pick(r, NORMALS3));
          const d = int(r, -6, 6), P = ivec(r, 3, -3, 3);
          return { nv, d, P, num: dot(nv, P) - d };
        },
        (o) => o.num !== 0,
      );
      const den2 = dot(nv, nv);
      const { answer, texv, irr } = distAnswer(num, den2);
      return {
        prompt: `Qual é a distância do ponto $P = ${tp(P)}$ ao plano $${eq3(nv, d)}$?${irr ? DIST_NOTE : ""}`,
        answer,
        hint: "$d(P, \\pi) = \\dfrac{|a x_0 + b y_0 + c z_0 - d|}{\\|\\vec n\\|}$.",
        solution: [
          `Numerador: $|${n(dot(nv, P))} - ${p(d)}| = ${n(Math.abs(num))}$`,
          `$\\|\\vec n\\| = \\sqrt{${den2}} = ${texSqrt(den2)}$`,
          `Distância: $${texv}${irr ? ` \\approx ${(Math.abs(num) / Math.sqrt(den2)).toFixed(2).replace(".", "{,}")}` : ""}$`,
        ],
      };
    },
  },
  {
    id: "B5.paralelos",
    title: "Distância entre planos paralelos",
    level: 3,
    make: (r) => {
      const nv = signs3(r, pick(r, NORMALS3.slice(0, 10)));
      const k = pick(r, [1, 2, -1]);
      const [d1, d2] = until(() => [int(r, -8, 8), int(r, -8, 8)], ([a, b]) => a !== b);
      const n2 = nv.map((x) => k * x);
      const den = Math.sqrt(dot(nv, nv));
      const dist = Math.abs(d1 - d2) / den;
      return {
        prompt: `Qual é a distância entre os planos paralelos $${eq3(nv, d1)}$ e $${eq3(n2, k * d2)}$?`,
        answer: { kind: "number", value: dist, label: "distância" },
        hint: k === 1 ? "Com a mesma normal, a distância é $\\dfrac{|d_1 - d_2|}{\\|\\vec n\\|}$." : "Primeiro divida a segunda equação para ela ter a mesma normal que a primeira. Depois use $\\dfrac{|d_1 - d_2|}{\\|\\vec n\\|}$.",
        solution: [
          ...(k === 1 ? [] : [`Dividindo a segunda por $${n(k)}$: $${eq3(nv, d2)}$`]),
          `$\\|\\vec n\\| = ${n(den)}$`,
          `Distância: $\\dfrac{|${n(d1)} - ${p(d2)}|}{${n(den)}} = ${n(dist)}$`,
        ],
      };
    },
  },
  {
    id: "B5.inter",
    title: "Onde a reta fura o plano",
    level: 2,
    make: (r) => {
      const { A, v, nv, t0 } = until(
        () => ({ A: ivec(r, 3, -3, 3), v: ivec(r, 3, -2, 2), nv: ivec(r, 3, -2, 2), t0: nz(r, -2, 2) }),
        (o) => nonzero(o.v) && nonzero(o.nv) && dot(o.nv, o.v) !== 0,
      );
      const X = A.map((x, i) => x + t0 * v[i]);
      const d = dot(nv, X);
      const nA = dot(nv, A), nV = dot(nv, v);
      return {
        prompt: `Em que ponto a reta $${vecLine("r", A, v)}$ fura o plano $${eq3(nv, d)}$?`,
        answer: { kind: "vector", value: X },
        hint: "Escreva x, y e z da reta em função de t, substitua na equação do plano e resolva para t.",
        solution: [
          `Substituindo $X = A + t\\vec v$: $${n(nA)} ${nV < 0 ? "-" : "+"} ${n(Math.abs(nV))}t = ${n(d)}$`,
          `$t = ${n(t0)}$`,
          `Ponto: $${tp(A)} + ${p(t0)}\\,${tp(v)} = ${tp(X)}$`,
        ],
      };
    },
  },
  {
    id: "B5.posicao",
    title: "Paralelas, concorrentes ou reversas",
    level: 3,
    make: (r) => {
      const kind = int(r, 0, 2); // 0 paralelas, 1 concorrentes, 2 reversas
      const { A, u, B, v } = until(
        () => {
          const A = ivec(r, 3, -2, 2), u = ivec(r, 3, -2, 2);
          let B: number[], v: number[];
          if (kind === 0) {
            v = u.map((x) => x * pick(r, [-2, -1, 2]));
            B = A.map((x) => x + int(r, -2, 2));
          } else if (kind === 1) {
            v = ivec(r, 3, -2, 2);
            const X = A.map((x, i) => x + nz(r, -2, 2) * u[i]);
            B = X.map((x, i) => x - nz(r, -1, 1) * v[i]);
          } else {
            v = ivec(r, 3, -2, 2);
            B = ivec(r, 3, -2, 2);
          }
          return { A, u, B, v };
        },
        (o) => {
          if (!nonzero(o.u) || !nonzero(o.v)) return false;
          const k = relLineLine({ p: o.A as Vec3, v: o.u as Vec3 }, { p: o.B as Vec3, v: o.v as Vec3 }).kind;
          return k === ["paralelas", "concorrentes", "reversas"][kind];
        },
        4000,
      );
      const names = ["Paralelas distintas", "Concorrentes (se cruzam)", "Reversas"];
      const { options, correct } = choices(r, names[kind], names.filter((_, i) => i !== kind));
      const uv = cross(u as Vec3, v as Vec3);
      const AB = sub(B, A);
      const mixed = dot(AB, uv);
      return {
        prompt: `As retas $${vecLine("r", A, u)}$ e $${vecLine("s", B, v, "s")}$ são…`,
        answer: { kind: "choice", options, correct },
        hint: "Primeiro: as direções são múltiplas? Se não forem, calcule o produto misto $[\\overrightarrow{AB}, \\vec u, \\vec v]$: zero quer dizer que as retas estão num mesmo plano e se cruzam.",
        solution:
          kind === 0
            ? [`$\\vec v$ é múltiplo de $\\vec u$: mesma direção.`, `$B$ não está em $r$, então são paralelas distintas.`]
            : [
                `$\\vec u\\times\\vec v = ${tp(uv)} \\ne \\vec 0$: direções diferentes.`,
                `$\\overrightarrow{AB} = ${tp(AB)}$ e $[\\overrightarrow{AB}, \\vec u, \\vec v] = ${n(mixed)}$`,
                kind === 1 ? "Zero: as retas são coplanares e se cruzam (concorrentes)." : "Diferente de zero: não há plano que contenha as duas, então são reversas.",
              ],
      };
    },
  },
];

const gens: TrackGens = { B1, B2, B3, B4, B5 };
export default gens;
