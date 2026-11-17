import { choices, int, pick, shuffle } from "../learn/rng";
import type { Generator } from "../learn/types";
import { classifyConic, type ConicKind } from "../math/conics";
import { texLinear } from "../math/format";
import { QUADRICS, quadricTrace } from "../math/quadrics";
import type { TrackGens } from "./index";
import { n } from "./kit";

/** Nome curto do traço (cônica), agrupando os casos que a pessoa não precisa distinguir. */
function traceName(k: ConicKind): string {
  switch (k) {
    case "elipse":
    case "circunferencia":
      return "Elipse (ou circunferência)";
    case "hiperbole":
      return "Hipérbole";
    case "parabola":
      return "Parábola";
    case "ponto":
      return "Um único ponto";
    case "vazio":
      return "Nenhum ponto (vazio)";
    case "retas-concorrentes":
      return "Duas retas que se cruzam";
    case "retas-paralelas":
      return "Duas retas paralelas";
    default:
      return "Uma reta";
  }
}
const TRACE_NAMES = ["Elipse (ou circunferência)", "Hipérbole", "Parábola", "Um único ponto", "Nenhum ponto (vazio)", "Duas retas que se cruzam", "Duas retas paralelas", "Uma reta"];

const D1: Generator[] = [
  {
    id: "D1.nome",
    title: "Qual quádrica?",
    level: 1,
    make: (r) => {
      const q = pick(r, QUADRICS);
      const a = int(r, 1, 3), b = int(r, 1, 3), c = int(r, 1, 3);
      const wrong = shuffle(r, QUADRICS.filter((x) => x.id !== q.id)).slice(0, 3).map((x) => x.name);
      const { options, correct } = choices(r, q.name, wrong);
      return {
        prompt: `Que superfície é $${q.equation(a, b, c)}$?`,
        answer: { kind: "choice", options, correct },
        hint: "Conte os quadrados e os sinais. Três quadrados: elipsoide, hiperboloides ou cone. Uma variável só no 1º grau: paraboloide. Uma variável ausente: cilindro.",
        solution: [`$${q.equation(a, b, c)}$ é um ${q.name.toLowerCase()}.`, q.note],
      };
    },
  },
  {
    id: "D1.traco",
    title: "Tipo do traço",
    level: 2,
    make: (r) => {
      const q = pick(r, QUADRICS);
      const a = int(r, 1, 3), b = int(r, 1, 3), c = int(r, 1, 3);
      const axis = pick(r, ["x", "y", "z"] as const);
      const k = int(r, -3, 3);
      const coeffs = q.coeffs(a, b, c);
      const { conic, vars } = quadricTrace(coeffs, axis, k);
      const name = traceName(classifyConic(conic).kind);
      const wrong = shuffle(r, TRACE_NAMES.filter((x) => x !== name)).slice(0, 3);
      const { options, correct } = choices(r, name, wrong);
      const eq2 = `${texLinear([conic.A, conic.C, conic.D, conic.E], [`${vars[0]}^2`, `${vars[1]}^2`, vars[0], vars[1]], conic.F, { maxDen: 81 })} = 0`;
      return {
        prompt: `Qual é o traço de $${q.equation(a, b, c)}$ no plano $${axis} = ${n(k)}$?`,
        answer: { kind: "choice", options, correct },
        hint: `Troque $${axis}$ por $${n(k)}$ na equação. Sobra uma equação em $${vars[0]}$ e $${vars[1]}$: reconheça a cônica (cuidado com os casos degenerados).`,
        solution: [`Com $${axis} = ${n(k)}$: $${eq2}$`, `Isso é: ${name.toLowerCase()}.`],
      };
    },
  },
  {
    id: "D1.semieixos",
    title: "Semieixos de um corte",
    level: 3,
    make: (r) => {
      const ell = r() < 0.5;
      // Elipsoide: fator √(1 − k²/c²); hiperboloide de uma folha: √(1 + k²/c²).
      const [c, k, f] = ell ? pick(r, [[5, 3, 4 / 5], [5, 4, 3 / 5], [5, -3, 4 / 5], [5, -4, 3 / 5]] as const) : pick(r, [[4, 3, 5 / 4], [3, 4, 5 / 3], [4, -3, 5 / 4], [3, -4, 5 / 3]] as const);
      const a = int(r, 1, 4), b = int(r, 1, 4);
      const q = QUADRICS.find((x) => x.id === (ell ? "elipsoide" : "hiperboloide1"))!;
      const rhs = ell ? 1 - (k * k) / (c * c) : 1 + (k * k) / (c * c);
      return {
        prompt: `O plano $z = ${n(k)}$ corta $${q.equation(a, b, c)}$ numa elipse. Quais são os semieixos dela nas direções $x$ e $y$? (Frações valem.)`,
        answer: { kind: "vector", value: [a * f, b * f], names: ["em x", "em y"] },
        hint: "Troque z por k e passe o termo de z para a direita. Para voltar à forma “= 1”, divida pelo número do lado direito: os denominadores novos são os quadrados dos semieixos.",
        solution: [
          `Com $z = ${n(k)}$: $\\dfrac{x^2}{${a * a}} + \\dfrac{y^2}{${b * b}} = 1 ${ell ? "-" : "+"} \\dfrac{${k * k}}{${c * c}} = ${n(rhs)}$`,
          `Os semieixos ficam multiplicados por $\\sqrt{${n(rhs)}} = ${n(f)}$.`,
          `Em $x$: $${a}\\cdot${n(f)} = ${n(a * f)}$; em $y$: $${b}\\cdot${n(f)} = ${n(b * f)}$.`,
        ],
      };
    },
  },
  {
    id: "D1.altura",
    title: "Até onde o plano corta",
    level: 2,
    make: (r) => {
      const ell = r() < 0.5;
      const a = int(r, 1, 3), b = int(r, 1, 3), c = int(r, 1, 5);
      const q = QUADRICS.find((x) => x.id === (ell ? "elipsoide" : "hiperboloide2"))!;
      return {
        prompt: ell
          ? `Qual é o maior $k$ para o qual o plano $z = k$ ainda encontra $${q.equation(a, b, c)}$?`
          : `Qual é o menor $k$ positivo para o qual o plano $z = k$ encontra $${q.equation(a, b, c)}$?`,
        answer: { kind: "number", value: c, label: "$k$" },
        hint: "Troque z por k e veja quando o lado com $x^2$ e $y^2$ pode ser maior ou igual a zero.",
        solution: ell
          ? [`$\\dfrac{x^2}{${a * a}} + \\dfrac{y^2}{${b * b}} = 1 - \\dfrac{k^2}{${c * c}}$ precisa ser $\\ge 0$.`, `Isso pede $k^2 \\le ${c * c}$, ou seja, $|k| \\le ${c}$. O maior é $k = ${c}$, onde o corte é um único ponto.`]
          : [`$\\dfrac{x^2}{${a * a}} + \\dfrac{y^2}{${b * b}} = \\dfrac{k^2}{${c * c}} - 1$ precisa ser $\\ge 0$.`, `Isso pede $k^2 \\ge ${c * c}$, ou seja, $|k| \\ge ${c}$. O menor positivo é $k = ${c}$: o vértice de uma das folhas.`],
      };
    },
  },
];

const gens: TrackGens = { D1 };
export default gens;
