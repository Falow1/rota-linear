import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { fmt, o1, o3, tex, texDec } from "../math/format";
import { useLoop } from "../player/anim";
import { Slider } from "../ui/controls";
import { ImplicitSurface, PlaneMesh, Point3D, Scene3D, Segments3D, type V3 } from "../viz3d";

/** Elipse (ou circunferência) horizontal na altura z, como pares de pontos para Segments3D. */
function ring(ax: number, by: number, z: number, n = 64): V3[] {
  const pts: V3[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = (2 * Math.PI * i) / n, t1 = (2 * Math.PI * (i + 1)) / n;
    pts.push([ax * Math.cos(t0), by * Math.sin(t0), z], [ax * Math.cos(t1), by * Math.sin(t1), z]);
  }
  return pts;
}

/* Elipsoide x²/9 + y²/4 + z²/2,56 = 1 */
const EA = 3, EB = 2, EC = 1.6;
const ELLIPSOID = (x: number, y: number, z: number) => (x * x) / (EA * EA) + (y * y) / (EB * EB) + (z * z) / (EC * EC) - 1;

function SliceFigure() {
  const s = useLoop(5200, 400);
  const k = -1.45 + 2.9 * s;
  const f = Math.sqrt(Math.max(0, 1 - (k * k) / (EC * EC)));
  return (
    <Scene3D R={3.5} label="Elipsoide cortado por um plano horizontal que sobe e desce">
      <ImplicitSurface F={ELLIPSOID} R={3.5} res={40} color="obj1" opacity={0.45} deps={[]} />
      <PlaneMesh plane={{ n: [0, 0, 1], d: k }} color="obj4" opacity={0.18} R={3.5} />
      {f > 0.02 && <Segments3D points={ring(EA * f, EB * f, k)} color="obj3" width={4} onTop />}
    </Scene3D>
  );
}

/* Hiperboloide de duas folhas −x²/1,44 − y²/1,44 + z² = 1 */
const HA = 1.2;
const TWO_SHEETS = (x: number, y: number, z: number) => -(x * x) / (HA * HA) - (y * y) / (HA * HA) + z * z - 1;

function GapTask({ s }: { s: { k: number } }) {
  const r2 = s.k * s.k - 1;
  return (
    <Scene3D R={3} label="Hiperboloide de duas folhas e o plano z = k">
      <ImplicitSurface F={TWO_SHEETS} R={3} res={42} color="obj1" opacity={0.5} deps={[]} />
      <PlaneMesh plane={{ n: [0, 0, 1], d: s.k }} color="obj4" opacity={0.2} R={3} />
      {r2 > 1e-9 && <Segments3D points={ring(HA * Math.sqrt(r2), HA * Math.sqrt(r2), s.k)} color="obj3" width={4} onTop />}
      {Math.abs(r2) < 1e-9 && <Point3D at={[0, 0, s.k]} color="obj3" size={0.14} label="um ponto" />}
    </Scene3D>
  );
}

function GapControls({ s, set }: { s: { k: number }; set: (p: { k: number }) => void }) {
  return <Slider tex="k" label="altura k" value={s.k} onChange={(k) => set({ k })} min={-2.5} max={2.5} step={0.25} color="obj4" />;
}

/* Sela z = (x² − y²)/2 */
const SADDLE = (x: number, y: number, z: number) => (x * x - y * y) / 2 - z;

function SaddlePredict({ revealed, t }: { revealed: boolean; t: number }) {
  return (
    <Scene3D R={3} label="Paraboloide hiperbólico z = (x² − y²)/2 e o plano z = 0">
      <ImplicitSurface F={SADDLE} R={3} res={40} color="obj2" opacity={0.55} deps={[]} />
      {revealed && <PlaneMesh plane={{ n: [0, 0, 1], d: 0 }} color="obj4" opacity={0.2 * t} R={3} />}
      {revealed && t > 0.6 && <Segments3D points={[[-3, -3, 0], [3, 3, 0], [-3, 3, 0], [3, -3, 0]]} color="obj3" width={4} onTop />}
    </Scene3D>
  );
}

/* Hiperboloide de uma folha x² + y² − z² = 1 */
const ONE_SHEET = (x: number, y: number, z: number) => x * x + y * y - z * z - 1;

function OneSheetFigure() {
  return (
    <Scene3D R={2.5} label="Hiperboloide de uma folha com o traço em z = 0">
      <ImplicitSurface F={ONE_SHEET} R={2.5} res={42} color="obj6" opacity={0.5} deps={[]} />
      <Segments3D points={ring(1, 1, 0)} color="obj3" width={4} onTop />
      <Segments3D points={ring(Math.SQRT2, Math.SQRT2, 1)} color="obj3" width={2.5} onTop />
    </Scene3D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Fatiar para enxergar",
      body: (
        <p>
          Uma <b className="obj1">quádrica</b> é uma superfície do 2º grau em x, y e z. Ela é difícil de imaginar de uma vez, então cortamos em fatias: cada plano
          z = k corta a superfície numa <b className="obj3">cônica</b>, o <b>traço</b>. Aqui, um elipsoide: todas as fatias são elipses, que encolhem até virar um
          ponto no topo e no fundo.
        </p>
      ),
      tex: `\\frac{x^2}{9} + \\frac{y^2}{4} + \\frac{z^2}{${tex(EC * EC, { maxDen: 0 })}} = 1`,
      Figure: SliceFigure,
    }),
    tarefa({
      title: "Encoste na folha",
      body: (
        <p>
          A superfície tem <b>duas folhas</b> separadas. Suba ou desça o plano <b className="obj4">z = k</b> até o corte ser um <b>único ponto</b>.
        </p>
      ),
      init: { k: 0 },
      solve: { k: 1 },
      goal: (s) => Math.abs(s.k * s.k - 1) < 1e-9,
      readout: (s) => `\\frac{x^2 + y^2}{${tex(HA * HA, { maxDen: 0 })}} = ${tex(s.k * s.k, { maxDen: 0 })} - 1 = ${texDec(s.k * s.k - 1, 4)}`,
      Scene: GapTask,
      Controls: GapControls,
      success: (
        <p>
          Em k = ±1 o plano só encosta no vértice. Entre −1 e 1, o lado direito fica negativo e o corte é vazio: é o “buraco” entre as folhas. Fora dele, os
          traços são circunferências.
        </p>
      ),
    }),
    prever({
      title: "A sela no nível zero",
      question: (
        <p>
          O plano z = 0 corta a sela <b className="obj2">z = (x² − y²)/2</b>. Que curva aparece?
        </p>
      ),
      options: ["Duas retas que se cruzam", "Uma hipérbole", "Uma parábola", "Um único ponto"],
      correct: 0,
      Figure: SaddlePredict,
      why: (
        <p>
          Com z = 0 sobra x² − y² = 0, ou seja, (x − y)(x + y) = 0: as retas <b>y = x</b> e <b>y = −x</b>. Nos outros níveis (z = k ≠ 0) os traços são hipérboles;
          em z = 0 a hipérbole degenera nas suas assíntotas.
        </p>
      ),
    }),
    ideia({
      title: "Reconhecendo pela equação",
      body: (
        <>
          <p>Olhe quantas variáveis aparecem ao quadrado e com que sinais:</p>
          <ul>
            <li>Três quadrados, todos +, igual a 1: <b>elipsoide</b>.</li>
            <li>Um sinal −: hiperboloide de <b className="obj6">uma folha</b> (o da figura). Dois sinais −: de <b>duas folhas</b>.</li>
            <li>Igual a 0 com um sinal −: <b>cone</b>.</li>
            <li>Uma variável só no 1º grau: <b>paraboloide</b> (elíptico com sinais iguais, sela com sinais opostos).</li>
            <li>Uma variável ausente: <b>cilindro</b>, a cônica repetida ao longo desse eixo.</li>
          </ul>
        </>
      ),
      tex: `x^2 + y^2 - z^2 = 1:\\quad ${o3("z = k")} \\;\\Rightarrow\\; ${o1("x^2 + y^2 = 1 + k^2")}`,
      Figure: OneSheetFigure,
    }),
    pergunta({
      title: "Qual superfície?",
      prompt: "Que superfície é $x^2 + y^2 - z^2 = 0$?",
      answer: { kind: "choice", options: ["Cone", "Hiperboloide de uma folha", "Hiperboloide de duas folhas", "Paraboloide elíptico"], correct: 0 },
      hint: "Três quadrados, um sinal negativo, e o lado direito é zero.",
      explain: "Igual a zero com um sinal negativo: é um cone. Os traços $z = k$ são circunferências de raio $|k|$, e em $z = 0$ sobra só a origem.",
    }),
    pergunta({
      title: "Um traço vertical",
      prompt: "Qual é o traço do elipsoide $\\dfrac{x^2}{4} + \\dfrac{y^2}{9} + \\dfrac{z^2}{4} = 1$ no plano $y = 0$?",
      answer: { kind: "choice", options: ["Uma circunferência de raio 2", "Uma elipse de semieixos 2 e 3", "Uma hipérbole", "Duas retas"], correct: 0 },
      hint: "Com $y = 0$, sobra uma equação em x e z. Compare os denominadores.",
      explain: "$\\dfrac{x^2}{4} + \\dfrac{z^2}{4} = 1$, ou $x^2 + z^2 = 4$: circunferência de raio $2$ no plano xz.",
    }),
    pergunta({
      title: "O buraco entre as folhas",
      prompt: `Qual é o menor $k$ positivo para o qual o plano $z = k$ encontra $-x^2 - y^2 + \\dfrac{z^2}{9} = 1$?`,
      answer: { kind: "number", value: 3, label: "$k$" },
      hint: "Com $z = k$: $x^2 + y^2 = \\dfrac{k^2}{9} - 1$. Quando isso pode ser $\\ge 0$?",
      explain: `É preciso $\\dfrac{k^2}{9} \\ge 1$, ou seja, $|k| \\ge 3$. O menor positivo é $k = 3$ (em $z = ${fmt(3)}$ o corte é um ponto).`,
    }),
  ],
};

export default lesson;
