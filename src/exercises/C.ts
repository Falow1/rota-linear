import { choices, int, nz, pick, until } from "../learn/rng";
import type { FigItem, Generator } from "../learn/types";
import { classifyConic, type ConicCoeffs } from "../math/conics";
import { texLinear, texShift } from "../math/format";
import type { TrackGens } from "./index";
import { n, p, tp } from "./kit";

/* ---------- Utilidades da rota ---------- */

/** (x − h)² ou x² */
const sq = (v: string, a: number) => (a === 0 ? `${v}^2` : `(${texShift(v, a)})^2`);
/** Fração com o quadrado em cima. */
const fq = (v: string, a: number, den: number) => (den === 1 ? sq(v, a) : `\\dfrac{${sq(v, a)}}{${den}}`);
/** Ax·(x − h)² + Cy·(y − k)² = rhs  →  coeficientes da equação geral. */
const conicFrom = (Ax: number, Cy: number, h: number, k: number, rhs: number): ConicCoeffs => ({
  A: Ax,
  B: 0,
  C: Cy,
  D: -2 * h * Ax,
  E: -2 * k * Cy,
  F: Ax * h * h + Cy * k * k - rhs,
});
const conicItem = (k: ConicCoeffs, color = 1): FigItem => ({ t: "conic", k, color });
const view = (h: number, k: number, R = 6): [number, number, number, number] => [h - R, h + R, k - R, k + R];
const generalTex = (k: ConicCoeffs) => `${texLinear([k.A, k.B, k.C, k.D, k.E], ["x^2", "xy", "y^2", "x", "y"], k.F)} = 0`;

/** Elipses com a² − b² = c² e c inteiro: [a², b², c]. */
const ELLIPSES: [number, number, number][] = [
  [25, 16, 3], [25, 9, 4], [10, 6, 2], [5, 1, 2], [8, 4, 2], [13, 4, 3], [9, 5, 2], [6, 2, 2], [17, 8, 3], [20, 4, 4], [7, 3, 2], [12, 3, 3],
];
/** Elipses com a inteiro (para excentricidade): [a, b², c]. */
const ELLIPSES_A: [number, number, number][] = [
  [5, 16, 3], [5, 9, 4], [3, 5, 2], [2, 3, 1], [4, 12, 2], [4, 7, 3], [3, 8, 1], [5, 21, 2], [6, 20, 4], [7, 40, 3],
];
/** Hipérboles com a² + b² = c² e c inteiro: [a², b², c]. */
const HYPERBOLAS: [number, number, number][] = [
  [9, 16, 5], [16, 9, 5], [1, 3, 2], [3, 1, 2], [4, 5, 3], [5, 4, 3], [2, 2, 2], [1, 8, 3], [8, 1, 3], [7, 9, 4], [12, 4, 4], [6, 10, 4],
];

/* ---------- C1 · Elipse ---------- */

const C1: Generator[] = [
  {
    id: "C1.foco",
    title: "Marque o foco",
    level: 2,
    make: (r) => {
      const [a2, b2, c] = pick(r, ELLIPSES);
      const vert = r() < 0.4;
      const h = int(r, -2, 2), k = int(r, -2, 2);
      const [dx, dy] = vert ? [b2, a2] : [a2, b2];
      const F: [number, number] = vert ? [h, k + c] : [h + c, k];
      return {
        prompt: `Arraste o ponto até o foco ${vert ? "de cima" : "da direita"} da elipse $${fq("x", h, dx)} + ${fq("y", k, dy)} = 1$.`,
        figure: { view: view(h, k), items: [conicItem(conicFrom(dy, dx, h, k, dx * dy)), { t: "pt", at: [h, k], color: 0, label: "centro" }] },
        answer: { kind: "point", value: F },
        hint: "O maior denominador é $a^2$ e diz em que eixo estão os focos. Depois, $c^2 = a^2 - b^2$, e os focos ficam a uma distância $c$ do centro.",
        solution: [
          `Centro $${tp([h, k])}$; o maior denominador está embaixo de $${vert ? "y" : "x"}$, então os focos estão na direção ${vert ? "vertical" : "horizontal"}.`,
          `$c^2 = ${a2} - ${b2} = ${c * c}$, então $c = ${c}$.`,
          `Foco ${vert ? "de cima" : "da direita"}: $${tp(F)}$.`,
        ],
      };
    },
  },
  {
    id: "C1.exc",
    title: "Excentricidade",
    level: 2,
    make: (r) => {
      const [a, b2, c] = pick(r, ELLIPSES_A);
      const vert = r() < 0.4;
      const eq = vert ? `\\dfrac{x^2}{${b2}} + \\dfrac{y^2}{${a * a}} = 1` : `\\dfrac{x^2}{${a * a}} + \\dfrac{y^2}{${b2}} = 1`;
      return {
        prompt: `Qual é a excentricidade da elipse $${eq}$? (Frações valem.)`,
        answer: { kind: "number", value: c / a, label: "$e$" },
        hint: "$e = \\dfrac{c}{a}$, com $a^2$ o maior denominador e $c^2 = a^2 - b^2$.",
        solution: [`$a^2 = ${a * a}$, $b^2 = ${b2}$, então $a = ${a}$ e $c = \\sqrt{${a * a} - ${b2}} = ${c}$.`, `$e = \\dfrac{${c}}{${a}} = ${n(c / a)}$`, "Quanto mais perto de 0, mais redonda; perto de 1, mais achatada."],
      };
    },
  },
  {
    id: "C1.eixos",
    title: "Semieixos pela equação",
    level: 2,
    make: (r) => {
      const [pp, q] = until(() => [int(r, 2, 6), int(r, 2, 6)], ([x, y]) => x !== y);
      // Semieixo pp em x e q em y:  q²x² + p²y² = p²q²
      const eq = `${texLinear([q * q, pp * pp], ["x^2", "y^2"])} = ${pp * pp * q * q}`;
      const a = Math.max(pp, q), b = Math.min(pp, q);
      return {
        prompt: `A elipse $${eq}$ tem semieixo maior $a$ e semieixo menor $b$. Quanto valem?`,
        answer: { kind: "vector", value: [a, b], names: ["a", "b"] },
        hint: "Divida tudo pelo lado direito para chegar em $\\dfrac{x^2}{\\square} + \\dfrac{y^2}{\\square} = 1$. Os semieixos são as raízes dos denominadores.",
        solution: [
          `Dividindo por $${pp * pp * q * q}$: $\\dfrac{x^2}{${pp * pp}} + \\dfrac{y^2}{${q * q}} = 1$`,
          `Raízes dos denominadores: $${pp}$ e $${q}$. O maior é $a = ${a}$ e o menor é $b = ${b}$.`,
        ],
      };
    },
  },
  {
    id: "C1.soma",
    title: "A soma das distâncias",
    level: 1,
    make: (r) => {
      const [a, b2] = pick(r, ELLIPSES_A);
      const vert = r() < 0.4;
      const eq = vert ? `\\dfrac{x^2}{${b2}} + \\dfrac{y^2}{${a * a}} = 1` : `\\dfrac{x^2}{${a * a}} + \\dfrac{y^2}{${b2}} = 1`;
      return {
        prompt: `$P$ é um ponto qualquer da elipse $${eq}$, e $F_1$, $F_2$ são os focos. Quanto vale $d(P, F_1) + d(P, F_2)$?`,
        answer: { kind: "number", value: 2 * a, label: "soma" },
        hint: "Essa soma é a mesma para todos os pontos da elipse: é o comprimento do eixo maior, $2a$.",
        solution: [`O maior denominador é $a^2 = ${a * a}$, então $a = ${a}$.`, `A soma é sempre $2a = ${2 * a}$.`],
      };
    },
  },
];

/* ---------- C2 · Hipérbole ---------- */

const C2: Generator[] = [
  {
    id: "C2.assint",
    title: "Inclinação das assíntotas",
    level: 2,
    make: (r) => {
      const a = int(r, 1, 5), b = int(r, 1, 5);
      const vert = r() < 0.4;
      const eq = vert ? `\\dfrac{y^2}{${a * a}} - \\dfrac{x^2}{${b * b}} = 1` : `\\dfrac{x^2}{${a * a}} - \\dfrac{y^2}{${b * b}} = 1`;
      const m = vert ? a / b : b / a;
      return {
        prompt: `As assíntotas da hipérbole $${eq}$ são as retas $y = \\pm m\\,x$. Quanto vale $m$ (positivo)? (Frações valem.)`,
        answer: { kind: "number", value: m, label: "$m$" },
        hint: "Troque o 1 por 0: $\\dfrac{x^2}{a^2} - \\dfrac{y^2}{b^2} = 0$ vira duas retas. Isole o $y$.",
        solution: [
          `Com o lado direito zero: $${vert ? `\\dfrac{y^2}{${a * a}} = \\dfrac{x^2}{${b * b}}` : `\\dfrac{y^2}{${b * b}} = \\dfrac{x^2}{${a * a}}`}$`,
          `$y = \\pm ${n(m)}\\,x$, então $m = ${n(m)}$.`,
        ],
      };
    },
  },
  {
    id: "C2.foco",
    title: "Marque o foco",
    level: 2,
    make: (r) => {
      const [a2, b2, c] = pick(r, HYPERBOLAS);
      const vert = r() < 0.4;
      const h = int(r, -2, 2), k = int(r, -2, 2);
      const F: [number, number] = vert ? [h, k + c] : [h + c, k];
      const eq = vert ? `${fq("y", k, a2)} - ${fq("x", h, b2)} = 1` : `${fq("x", h, a2)} - ${fq("y", k, b2)} = 1`;
      // horizontal: b²(x−h)² − a²(y−k)² = a²b²;  vertical: −a²(x−h)² + b²(y−k)² = a²b²
      const K = vert ? conicFrom(-a2, b2, h, k, a2 * b2) : conicFrom(b2, -a2, h, k, a2 * b2);
      return {
        prompt: `Arraste o ponto até o foco ${vert ? "de cima" : "da direita"} da hipérbole $${eq}$.`,
        figure: { view: view(h, k), items: [conicItem(K, 2), { t: "pt", at: [h, k], color: 0, label: "centro" }] },
        answer: { kind: "point", value: F },
        hint: "Na hipérbole, $c^2 = a^2 + b^2$ (soma, não diferença). O termo positivo diz em que eixo estão os focos.",
        solution: [
          `Centro $${tp([h, k])}$; o termo positivo é o de $${vert ? "y" : "x"}$, então os focos estão na direção ${vert ? "vertical" : "horizontal"}.`,
          `$c^2 = ${a2} + ${b2} = ${c * c}$, então $c = ${c}$.`,
          `Foco ${vert ? "de cima" : "da direita"}: $${tp(F)}$.`,
        ],
      };
    },
  },
  {
    id: "C2.vertices",
    title: "Distância entre os vértices",
    level: 2,
    make: (r) => {
      const a = int(r, 1, 6), b = int(r, 1, 6);
      const vert = r() < 0.4;
      // horizontal: b²x² − a²y² = a²b²
      const eq = vert ? `${texLinear([-a * a, b * b], ["x^2", "y^2"])} = ${a * a * b * b}` : `${texLinear([b * b, -a * a], ["x^2", "y^2"])} = ${a * a * b * b}`;
      return {
        prompt: `Qual é a distância entre os dois vértices da hipérbole $${eq}$?`,
        answer: { kind: "number", value: 2 * a, label: "distância" },
        hint: "Divida pelo lado direito. O denominador do termo positivo é $a^2$, e os vértices ficam a $a$ do centro, um de cada lado.",
        solution: [
          `Dividindo por $${a * a * b * b}$: $${vert ? `\\dfrac{y^2}{${a * a}} - \\dfrac{x^2}{${b * b}}` : `\\dfrac{x^2}{${a * a}} - \\dfrac{y^2}{${b * b}}`} = 1$`,
          `$a = ${a}$, então os vértices distam $2a = ${2 * a}$.`,
        ],
      };
    },
  },
  {
    id: "C2.eixo",
    title: "Em que eixo estão os focos?",
    level: 1,
    make: (r) => {
      const a2 = int(r, 1, 9), b2 = int(r, 1, 9);
      const vert = r() < 0.5;
      const flip = r() < 0.5; // escreve o termo negativo primeiro
      const pos = vert ? `\\dfrac{y^2}{${a2}}` : `\\dfrac{x^2}{${a2}}`;
      const neg = vert ? `\\dfrac{x^2}{${b2}}` : `\\dfrac{y^2}{${b2}}`;
      const eq = flip ? `-${neg} + ${pos} = 1` : `${pos} - ${neg} = 1`;
      const { options, correct } = choices(r, vert ? "No eixo y" : "No eixo x", [vert ? "No eixo x" : "No eixo y"]);
      return {
        prompt: `Na hipérbole $${eq}$, os focos estão…`,
        answer: { kind: "choice", options, correct },
        hint: "Não olhe o tamanho dos denominadores: olhe qual termo é positivo.",
        solution: [`O termo positivo é o de $${vert ? "y" : "x"}$: a hipérbole abre na direção desse eixo, e os focos ficam nele.`],
      };
    },
  },
];

/* ---------- C3 · Parábola ---------- */

const PS = [-2, -1, -0.5, 0.5, 1, 2];

/** (x − h)² = 4p(y − k)  (vertical) ou (y − k)² = 4p(x − h)  (horizontal). */
function parabola(vert: boolean, h: number, k: number, pp: number) {
  const q = 4 * pp;
  const eq = vert ? `${sq("x", h)} = ${n(q)}${k === 0 ? "y" : `(${texShift("y", k)})`}` : `${sq("y", k)} = ${n(q)}${h === 0 ? "x" : `(${texShift("x", h)})`}`;
  const K: ConicCoeffs = vert ? { A: 1, B: 0, C: 0, D: -2 * h, E: -q, F: h * h + q * k } : { A: 0, B: 0, C: 1, D: -q, E: -2 * k, F: k * k + q * h };
  return { eq, K, F: (vert ? [h, k + pp] : [h + pp, k]) as [number, number] };
}

const C3: Generator[] = [
  {
    id: "C3.foco",
    title: "Marque o foco",
    level: 2,
    make: (r) => {
      const vert = r() < 0.5, h = int(r, -2, 2), k = int(r, -2, 2), pp = pick(r, PS);
      const { eq, K, F } = parabola(vert, h, k, pp);
      return {
        prompt: `Arraste o ponto até o foco da parábola $${eq}$.`,
        figure: { view: view(h, k), items: [conicItem(K, 3), { t: "pt", at: [h, k], color: 0, label: "vértice" }] },
        answer: { kind: "point", value: F },
        hint: "Compare com $(x - h)^2 = 4p(y - k)$: o número na frente é $4p$. O foco fica a uma distância $p$ do vértice, para o lado em que a parábola abre.",
        solution: [`Vértice $${tp([h, k])}$ e $4p = ${n(4 * pp)}$, então $p = ${n(pp)}$.`, `Foco: $${tp(F)}$.`],
      };
    },
  },
  {
    id: "C3.diretriz",
    title: "A diretriz",
    level: 2,
    make: (r) => {
      const vert = r() < 0.5, h = int(r, -3, 3), k = int(r, -3, 3), pp = pick(r, PS);
      const { eq } = parabola(vert, h, k, pp);
      const d = vert ? k - pp : h - pp;
      const v = vert ? "y" : "x";
      return {
        prompt: `A diretriz da parábola $${eq}$ é a reta $${v} = d$. Quanto vale $d$?`,
        answer: { kind: "number", value: d, label: `$d$` },
        hint: "A diretriz fica do lado oposto ao foco, à mesma distância $p$ do vértice.",
        solution: [`Vértice $${tp([h, k])}$ e $p = ${n(pp)}$.`, `Diretriz: $${v} = ${n(vert ? k : h)} - ${p(pp)} = ${n(d)}$.`],
      };
    },
  },
  {
    id: "C3.vertice",
    title: "Completando o quadrado",
    level: 3,
    make: (r) => {
      const vert = r() < 0.5, h = nz(r, -3, 3), k = int(r, -3, 3), pp = pick(r, [-2, -1, 1, 2]);
      const { K, eq } = parabola(vert, h, k, pp);
      return {
        prompt: `Qual é o vértice da parábola $${generalTex(K)}$?`,
        answer: { kind: "vector", value: [h, k] },
        hint: `Junte os termos em ${vert ? "x" : "y"} e complete o quadrado; o resto vira um múltiplo de ${vert ? "(y − k)" : "(x − h)"}.`,
        solution: [`Completando o quadrado: $${eq}$`, `Vértice: $${tp([h, k])}$.`],
      };
    },
  },
  {
    id: "C3.abre",
    title: "Para onde abre?",
    level: 1,
    make: (r) => {
      const vert = r() < 0.5, h = int(r, -3, 3), k = int(r, -3, 3), pp = pick(r, PS);
      const { eq } = parabola(vert, h, k, pp);
      const names = ["Para cima", "Para baixo", "Para a direita", "Para a esquerda"];
      const idx = vert ? (pp > 0 ? 0 : 1) : pp > 0 ? 2 : 3;
      const { options, correct } = choices(r, names[idx], names.filter((_, i) => i !== idx));
      return {
        prompt: `A parábola $${eq}$ abre…`,
        answer: { kind: "choice", options, correct },
        hint: "Quem está ao quadrado diz o eixo de simetria; o sinal de $4p$ diz o sentido.",
        solution: [
          `O quadrado é em $${vert ? "x" : "y"}$, então ela abre na direção ${vert ? "vertical" : "horizontal"}.`,
          `$4p = ${n(4 * pp)}$ é ${pp > 0 ? "positivo" : "negativo"}: ${names[idx].toLowerCase()}.`,
        ],
      };
    },
  },
];

/* ---------- C4 · Equação geral ---------- */

const C4: Generator[] = [
  {
    id: "C4.discr",
    title: "O discriminante",
    level: 1,
    make: (r) => {
      const A = int(r, -4, 4), B = nz(r, -5, 5), C = int(r, -4, 4);
      const K: ConicCoeffs = { A, B, C, D: int(r, -4, 4), E: int(r, -4, 4), F: int(r, -6, 6) };
      const d = B * B - 4 * A * C;
      return {
        prompt: `Calcule $B^2 - 4AC$ para a equação $${generalTex(K)}$.`,
        answer: { kind: "number", value: d, label: "$B^2 - 4AC$" },
        hint: "$A$ acompanha $x^2$, $B$ acompanha $xy$ e $C$ acompanha $y^2$. Os outros termos não entram.",
        solution: [`$A = ${n(A)}$, $B = ${n(B)}$, $C = ${n(C)}$`, `$B^2 - 4AC = ${p(B)}^2 - 4\\cdot${p(A)}\\cdot${p(C)} = ${n(d)}$`],
      };
    },
  },
  {
    id: "C4.classif",
    title: "Qual cônica?",
    level: 2,
    make: (r) => {
      const genus = int(r, 0, 2); // 0 elipse, 1 hipérbole, 2 parábola
      const K = until(
        () => {
          let A: number, B: number, C: number;
          if (genus === 2) {
            const s = int(r, -2, 2), t = int(r, -2, 2), sg = r() < 0.5 ? -1 : 1;
            [A, B, C] = [sg * s * s, sg * 2 * s * t, sg * t * t];
          } else [A, B, C] = [int(r, -4, 4), int(r, -4, 4), int(r, -4, 4)];
          return { A, B, C, D: int(r, -5, 5), E: int(r, -5, 5), F: int(r, -6, 6) } as ConicCoeffs;
        },
        (K) => {
          const kind = classifyConic(K).kind;
          return genus === 0 ? kind === "elipse" : genus === 1 ? kind === "hiperbole" : kind === "parabola";
        },
        2000,
      );
      const d = K.B * K.B - 4 * K.A * K.C;
      const names = ["Elipse", "Hipérbole", "Parábola"];
      const { options, correct } = choices(r, names[genus], names.filter((_, i) => i !== genus));
      return {
        prompt: `A equação $${generalTex(K)}$ representa uma…`,
        answer: { kind: "choice", options, correct },
        hint: "Calcule $B^2 - 4AC$: negativo é elipse, positivo é hipérbole, zero é parábola (fora os casos degenerados).",
        solution: [`$B^2 - 4AC = ${p(K.B)}^2 - 4\\cdot${p(K.A)}\\cdot${p(K.C)} = ${n(d)}$`, `${d < 0 ? "Negativo: elipse." : d > 0 ? "Positivo: hipérbole." : "Zero: parábola."}`],
      };
    },
  },
  {
    id: "C4.centro",
    title: "O centro, completando quadrados",
    level: 3,
    make: (r) => {
      const A = int(r, 1, 4), C = pick(r, [1, 2, 3, 4, -1, -2, -3, -4]);
      const h = int(r, -3, 3), k = int(r, -3, 3);
      const R = C > 0 ? int(r, 1, 12) : nz(r, -12, 12);
      const K = conicFrom(A, C, h, k, R);
      return {
        prompt: `Qual é o centro da cônica $${generalTex(K)}$?`,
        answer: { kind: "vector", value: [h, k] },
        hint: "Agrupe os termos em x e os termos em y, ponha o coeficiente do quadrado em evidência e complete cada quadrado.",
        solution: [
          `Completando: $${texLinear([A], [sq("x", h)])} ${C < 0 ? "-" : "+"} ${texLinear([Math.abs(C)], [sq("y", k)])} = ${n(R)}$`,
          `Centro: $${tp([h, k])}$.`,
        ],
      };
    },
  },
  {
    id: "C4.angulo",
    title: "Ângulo que tira o termo xy",
    level: 3,
    make: (r) => {
      const kind = int(r, 0, 2); // 0: A = C (45°), 1: A − C = B (22,5°), 2: A − C = −B (67,5°)
      const B = nz(r, -4, 4);
      const C = int(r, -3, 3);
      const A = kind === 0 ? C : kind === 1 ? C + B : C - B;
      const deg = [45, 22.5, 67.5][kind];
      const K: ConicCoeffs = { A, B, C, D: 0, E: 0, F: -int(r, 1, 9) };
      const cot = (A - C) / B;
      return {
        prompt: `Para eliminar o termo $xy$ de $${generalTex(K)}$, giramos os eixos de um ângulo $\\theta$ entre $0^\\circ$ e $90^\\circ$ com $\\cot 2\\theta = \\dfrac{A - C}{B}$. Quanto vale $\\theta$, em graus?`,
        answer: { kind: "number", value: deg, tol: 0.5, unit: "°", label: "$\\theta$" },
        hint: "Calcule $\\dfrac{A - C}{B}$. Se der 0, $2\\theta = 90^\\circ$; se der 1, $2\\theta = 45^\\circ$; se der $-1$, $2\\theta = 135^\\circ$.",
        solution: [`$\\cot 2\\theta = \\dfrac{${n(A)} - ${p(C)}}{${n(B)}} = ${n(cot)}$`, `$2\\theta = ${n(2 * deg)}^\\circ$, então $\\theta = ${n(deg)}^\\circ$.`],
      };
    },
  },
];

const gens: TrackGens = { C1, C2, C3, C4 };
export default gens;
