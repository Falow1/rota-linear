import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { fmt, o2, o3, o4, texDec } from "../math/format";
import { useLoop } from "../player/anim";
import { Slider } from "../ui/controls";
import { Dot, Fill, InfLine, Label, ParamCurve, Plane2D, Segment, type P2 } from "../viz2d";

const dist = (p: P2, q: P2) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const right = (a: number, b: number) => (u: number): P2 => [a * Math.cosh(u), b * Math.sinh(u)];
const left = (a: number, b: number) => (u: number): P2 => [-a * Math.cosh(u), b * Math.sinh(u)];
const U: P2 = [-2.2, 2.2];

function Branches({ a, b, color = "var(--obj1)" }: { a: number; b: number; color?: string }) {
  return (
    <>
      <ParamCurve xy={right(a, b)} domain={U} color={color} />
      <ParamCurve xy={left(a, b)} domain={U} color={color} />
    </>
  );
}

const F1: P2 = [-5, 0], F2: P2 = [5, 0];

/** P anda no ramo direito; a diferença das distâncias fica em 6. */
function DiffFigure() {
  const k = useLoop(5000, 300);
  const P = right(3, 4)(-1.3 + 2.6 * k);
  const d = Math.abs(dist(P, F1) - dist(P, F2));
  return (
    <Plane2D
      x={[-8, 8]}
      y={[-6, 6]}
      label="Hipérbole com focos F₁ e F₂ e um ponto P andando num ramo"
      overlay={
        <div className="graph-overlay tl">
          <span className="graph-legend">|d₁ − d₂| = {fmt(Math.round(d * 100) / 100)}</span>
        </div>
      }
    >
      <Branches a={3} b={4} />
      <Segment a={F1} b={P} color="var(--obj2)" weight={3} />
      <Segment a={F2} b={P} color="var(--obj4)" weight={3} />
      <Dot at={F1} color="var(--text)" label="F₁" dir="s" />
      <Dot at={F2} color="var(--text)" label="F₂" dir="s" />
      <Dot at={P} color="var(--obj3)" r={6} label="P" />
    </Plane2D>
  );
}

const TA = 2, TB = 3;

function AsymTask({ s, done }: { s: { m: number }; done: boolean }) {
  return (
    <Plane2D x={[-6, 6]} y={[-5, 5]} label="Hipérbole x²/4 − y²/9 = 1 e as retas y = ±mx">
      {done && <Fill points={[[-TA, -TB], [TA, -TB], [TA, TB], [-TA, TB]]} color="var(--obj4)" opacity={0.12} stroke />}
      <Branches a={TA} b={TB} />
      <InfLine p={[0, 0]} v={[1, s.m]} color={done ? "var(--obj3)" : "var(--obj2)"} dashed weight={2.5} />
      <InfLine p={[0, 0]} v={[1, -s.m]} color={done ? "var(--obj3)" : "var(--obj2)"} dashed weight={2.5} />
      {done && <Dot at={[TA, TB]} color="var(--obj4)" label="(a, b)" dir="e" />}
    </Plane2D>
  );
}

function AsymControls({ s, set }: { s: { m: number }; set: (p: { m: number }) => void }) {
  return <Slider tex={o2("m")} value={s.m} onChange={(m) => set({ m })} min={0} max={3} step={0.5} />;
}

function OpenPredict({ revealed, t }: { revealed: boolean; t: number }) {
  const b = 1 + (revealed ? 3 * t : 0);
  return (
    <Plane2D x={[-7, 7]} y={[-5, 5]} label="Hipérbole com a = 2 e b crescendo">
      <Branches a={2} b={b} />
      <InfLine p={[0, 0]} v={[2, b]} color="var(--obj-muted)" dashed weight={1.5} />
      <InfLine p={[0, 0]} v={[2, -b]} color="var(--obj-muted)" dashed weight={1.5} />
      <Label at={[-6.5, 4.3]} text={`b = ${fmt(Math.round(b * 10) / 10)}`} color="var(--obj4)" dir="e" />
    </Plane2D>
  );
}

function PartsFigure() {
  return (
    <Plane2D x={[-7, 7]} y={[-6, 6]} label="Retângulo de lados 2a e 2b, assíntotas e focos">
      <Fill points={[[-3, -4], [3, -4], [3, 4], [-3, 4]]} color="var(--obj4)" opacity={0.1} stroke />
      <InfLine p={[0, 0]} v={[3, 4]} color="var(--obj3)" dashed weight={2} />
      <InfLine p={[0, 0]} v={[3, -4]} color="var(--obj3)" dashed weight={2} />
      <Branches a={3} b={4} />
      <Segment a={[0, 0]} b={[3, 0]} color="var(--obj2)" weight={3.5} />
      <Label at={[1.5, 0]} text="a = 3" color="var(--obj2)" dir="s" />
      <Label at={[3, 2]} text="b = 4" color="var(--obj4)" dir="e" />
      <Dot at={F1} color="var(--text)" label="F₁" dir="s" />
      <Dot at={F2} color="var(--text)" label="F₂ (c = 5)" dir="s" />
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Agora vale a diferença",
      body: (
        <p>
          Na <b className="obj1">hipérbole</b>, o que fica constante é a <b>diferença</b> das distâncias aos focos, em módulo: |
          <b className="obj2">d₁</b> − <b className="obj4">d₂</b>| = 2a. Por isso ela tem dois ramos: um mais perto de F₁, outro mais perto de F₂.
        </p>
      ),
      tex: `\\left|${o2("d(P, F_1)")} - ${o4("d(P, F_2)")}\\right| = 2a`,
      Figure: DiffFigure,
    }),
    tarefa({
      title: "Encontre as assíntotas",
      body: (
        <p>
          Longe do centro, os ramos de x²/4 − y²/9 = 1 quase viram retas: as <b>assíntotas</b> y = ±<b className="obj2">m</b>x. Ajuste m até as retas
          acompanharem os ramos.
        </p>
      ),
      init: { m: 0.5 },
      solve: { m: 1.5 },
      goal: (s) => Math.abs(s.m - 1.5) < 1e-9,
      readout: (s) => `y = \\pm ${texDec(s.m, 2)}\\,x`,
      Scene: AsymTask,
      Controls: AsymControls,
      success: (
        <p>
          m = b/a = 3/2. As assíntotas são as diagonais do retângulo de lados 2a e 2b. Um jeito rápido de achá-las: troque o 1 da equação por 0, e x²/4 = y²/9 dá
          y = ±(3/2)x.
        </p>
      ),
    }),
    prever({
      title: "Aumentando o b",
      question: (
        <p>
          Com a = 2 fixo, o que acontece com os ramos quando <b className="obj4">b</b> cresce?
        </p>
      ),
      options: ["Ficam mais abertos", "Ficam mais fechados, mais finos", "Não mudam", "Viram uma elipse"],
      correct: 0,
      Figure: OpenPredict,
      why: (
        <p>
          A inclinação das assíntotas é b/a, que aumenta com b. As assíntotas ficam mais íngremes, e os ramos <b>abrem</b> junto com elas. Os vértices (±2, 0) não
          saem do lugar.
        </p>
      ),
    }),
    ideia({
      title: "A equação reduzida",
      body: (
        <p>
          Com focos no eixo x, a hipérbole é x²/a² − y²/b² = 1. Diferente da elipse, aqui <b className="obj3">c² = a² + b²</b>: os focos ficam mais longe do centro
          que os vértices. Se o termo positivo for o de y, os ramos abrem para cima e para baixo.
        </p>
      ),
      tex: `\\frac{x^2}{${o2("a")}^2} - \\frac{y^2}{${o4("b")}^2} = 1,\\qquad c^2 = ${o2("a")}^2 + ${o4("b")}^2,\\qquad ${o3("y = \\pm\\frac{b}{a}\\,x")}`,
      Figure: PartsFigure,
    }),
    pergunta({
      title: "Os focos",
      prompt: "Na hipérbole $\\dfrac{x^2}{9} - \\dfrac{y^2}{16} = 1$, a que distância $c$ do centro ficam os focos?",
      answer: { kind: "number", value: 5, label: "$c$" },
      hint: "Na hipérbole, $c^2 = a^2 + b^2$.",
      explain: "$c^2 = 9 + 16 = 25$, então $c = 5$: os focos são $(\\pm 5, 0)$.",
    }),
    pergunta({
      title: "Assíntotas em pé",
      prompt: "As assíntotas de $\\dfrac{y^2}{4} - \\dfrac{x^2}{9} = 1$ são $y = \\pm m\\,x$. Quanto vale $m$? (Frações valem.)",
      answer: { kind: "number", value: 2 / 3, label: "$m$" },
      hint: "Troque o 1 por 0 e isole o y: $\\dfrac{y^2}{4} = \\dfrac{x^2}{9}$.",
      explain: "$y^2 = \\dfrac{4}{9}x^2$, então $y = \\pm\\dfrac{2}{3}x$ e $m = \\dfrac{2}{3}$.",
    }),
  ],
};

export default lesson;
