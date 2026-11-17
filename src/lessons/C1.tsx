import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o2, o3, o4, texDec } from "../math/format";
import { useLoop } from "../player/anim";
import { Dot, DraggablePoint, Label, ParamCurve, Plane2D, Segment, type P2 } from "../viz2d";

const A = 5, B = 4, C = 3;
const F1: P2 = [-C, 0], F2: P2 = [C, 0];
const dist = (p: P2, q: P2) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const ellipse = (a: number, b: number) => (t: number): P2 => [a * Math.cos(t), b * Math.sin(t)];
const FULL: P2 = [0, 2 * Math.PI];

/** P dá a volta na elipse; as duas distâncias mudam, a soma não. */
function StringFigure() {
  const k = useLoop(6000, 0);
  const P = ellipse(A, B)(2 * Math.PI * k);
  return (
    <Plane2D x={[-6, 6]} y={[-5, 5]} label="Elipse com focos F₁ e F₂ e um ponto P que dá a volta">
      <ParamCurve xy={ellipse(A, B)} domain={FULL} color="var(--obj1)" />
      <Segment a={F1} b={P} color="var(--obj2)" weight={3} />
      <Segment a={F2} b={P} color="var(--obj4)" weight={3} />
      <Dot at={F1} color="var(--text)" label="F₁" dir="s" />
      <Dot at={F2} color="var(--text)" label="F₂" dir="s" />
      <Dot at={P} color="var(--obj3)" r={6} label="P" />
    </Plane2D>
  );
}

function SumTask({ s, set, done }: { s: { p: number[] }; set: (p: { p: number[] }) => void; done: boolean }) {
  const P = s.p as P2;
  return (
    <Plane2D x={[-6, 6]} y={[-5, 5]} label="Arraste P até d₁ + d₂ = 10">
      <ParamCurve xy={ellipse(A, B)} domain={FULL} color="var(--obj1)" dashed={!done} opacity={done ? 1 : 0.45} />
      <Segment a={F1} b={P} color="var(--obj2)" weight={3} />
      <Segment a={F2} b={P} color="var(--obj4)" weight={3} />
      <Dot at={F1} color="var(--text)" label="F₁" dir="s" />
      <Dot at={F2} color="var(--text)" label="F₂" dir="s" />
      <DraggablePoint point={P} onMove={(p) => set({ p })} color="var(--obj3)" label="P" />
    </Plane2D>
  );
}

/** Os focos se juntam: c vai a 0 com a = 3 fixo. */
function MergePredict({ revealed, t }: { revealed: boolean; t: number }) {
  const c = 2.6 * (revealed ? 1 - t : 1);
  const b = Math.sqrt(9 - c * c);
  return (
    <Plane2D x={[-4.5, 4.5]} y={[-3.5, 3.5]} label="Elipse com a = 3 e os focos se aproximando">
      <ParamCurve xy={ellipse(3, b)} domain={FULL} color="var(--obj1)" />
      <Dot at={[-c, 0]} color="var(--text)" label="F₁" dir="s" />
      <Dot at={[c, 0]} color="var(--text)" label="F₂" dir="s" />
      {revealed && t > 0.97 && <Label at={[0, 3]} text="raio 3" color="var(--obj1)" dir="ne" />}
    </Plane2D>
  );
}

function PartsFigure() {
  return (
    <Plane2D x={[-6, 6]} y={[-5, 5]} label="Semieixos a e b e a distância focal c">
      <ParamCurve xy={ellipse(A, B)} domain={FULL} color="var(--obj1)" />
      <Segment a={[0, 0]} b={[A, 0]} color="var(--obj2)" weight={3.5} />
      <Segment a={[0, 0]} b={[0, B]} color="var(--obj4)" weight={3.5} />
      <Segment a={[0, B]} b={F2} color="var(--obj3)" weight={2} dashed />
      <Label at={[3.6, 0]} text="a = 5" color="var(--obj2)" dir="s" />
      <Label at={[0, 2]} text="b = 4" color="var(--obj4)" dir="w" />
      <Label at={[1.6, 2]} text="a" color="var(--obj3)" dir="ne" />
      <Dot at={F1} color="var(--text)" label="F₁" dir="s" />
      <Dot at={F2} color="var(--text)" label="F₂ (c = 3)" dir="s" />
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Um barbante preso em dois pregos",
      body: (
        <p>
          Prenda as pontas de um barbante em dois pontos, os <b>focos</b> F₁ e F₂, e estique com a ponta do lápis. O lápis desenha uma{" "}
          <b className="obj1">elipse</b>: as distâncias <b className="obj2">d₁</b> e <b className="obj4">d₂</b> mudam o tempo todo, mas a soma é sempre o comprimento do barbante, chamado de{" "}
          <b>2a</b>.
        </p>
      ),
      tex: `${o2("d(P, F_1)")} + ${o4("d(P, F_2)")} = 2a`,
      Figure: StringFigure,
    }),
    tarefa({
      title: "Caia na elipse",
      body: (
        <p>
          Aqui F₁ = (−3, 0), F₂ = (3, 0) e a soma vale 10. Arraste <b className="obj3">P</b> até um ponto do <b>eixo y</b> em que{" "}
          <b className="obj2">d₁</b> + <b className="obj4">d₂</b> = 10.
        </p>
      ),
      init: { p: [0, 1] },
      solve: { p: [0, 4] },
      goal: (s) => Math.abs(dist(s.p as P2, F1) + dist(s.p as P2, F2) - 2 * A) < 1e-9,
      readout: (s) => `${o2("d_1")} + ${o4("d_2")} = ${texDec(dist(s.p as P2, F1) + dist(s.p as P2, F2), 2)}`,
      Scene: SumTask,
      success: (
        <p>
          Em (0, 4), cada distância vale 5, a metade de 10, ou seja, <b>a</b>. O triângulo de lados 3, 4 e 5 mostra a relação da elipse: <b>a² = b² + c²</b>.
        </p>
      ),
    }),
    prever({
      title: "Juntando os focos",
      question: (
        <p>
          Mantendo a soma 2a = 6, aproxime os focos até eles coincidirem no centro (c = 0). A elipse vira…
        </p>
      ),
      options: ["Uma circunferência de raio 3", "Um segmento de reta", "Uma parábola", "Um ponto"],
      correct: 0,
      Figure: MergePredict,
      why: (
        <p>
          Com um foco só, todo ponto fica a 3 dele: é uma <b>circunferência</b>. A <b>excentricidade</b> e = c/a mede esse achatamento: e = 0 é o círculo, e
          perto de 1 é uma elipse bem achatada.
        </p>
      ),
    }),
    ideia({
      title: "A equação reduzida",
      body: (
        <p>
          Com centro na origem e focos no eixo x, a elipse é x²/a² + y²/b² = 1. O semieixo maior é <b className="obj2">a</b>, o menor é <b className="obj4">b</b>,
          e os focos ficam em (±c, 0) com c² = a² − b². Se o denominador maior estiver embaixo de y, a elipse fica em pé e os focos vão para o eixo y.
        </p>
      ),
      tex: `\\frac{x^2}{${o2("a")}^2} + \\frac{y^2}{${o4("b")}^2} = 1,\\qquad ${o3("c")}^2 = ${o2("a")}^2 - ${o4("b")}^2,\\qquad e = \\frac{${o3("c")}}{${o2("a")}}`,
      Figure: PartsFigure,
    }),
    pergunta({
      title: "Distância focal",
      prompt: "Na elipse $\\dfrac{x^2}{25} + \\dfrac{y^2}{9} = 1$, a que distância $c$ do centro ficam os focos?",
      answer: { kind: "number", value: 4, label: "$c$" },
      hint: "$c^2 = a^2 - b^2$, com $a^2$ o maior denominador.",
      explain: "$c^2 = 25 - 9 = 16$, então $c = 4$: os focos são $(\\pm 4, 0)$.",
    }),
    pergunta({
      title: "Excentricidade",
      prompt: "Qual é a excentricidade da elipse $\\dfrac{x^2}{9} + \\dfrac{y^2}{5} = 1$? (Frações valem.)",
      answer: { kind: "number", value: 2 / 3, label: "$e$" },
      hint: "Ache $a$ e $c$: $a^2 = 9$ e $c^2 = 9 - 5$.",
      explain: "$a = 3$ e $c = \\sqrt{4} = 2$, então $e = \\dfrac{2}{3}$.",
    }),
  ],
};

export default lesson;
