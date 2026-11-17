import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { fmt, o2, o3, o4, texDec } from "../math/format";
import { useLoop } from "../player/anim";
import { Dot, DraggablePoint, GeneralLine, Label, ParamCurve, Plane2D, RightAngle, Segment, type P2 } from "../viz2d";

/** x² = 4p·y, parametrizada por x. */
const up = (p: number) => (x: number): P2 => [x, (x * x) / (4 * p)];
const F: P2 = [0, 1];
const dist = (a: P2, b: P2) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function EqualFigure() {
  const k = useLoop(5000, 300);
  const x = -3.5 + 7 * k;
  const P = up(1)(x);
  const foot: P2 = [x, -1];
  return (
    <Plane2D x={[-5, 5]} y={[-2, 5]} label="Parábola x² = 4y com foco (0, 1) e diretriz y = −1">
      <GeneralLine a={0} b={1} c={1} color="var(--obj4)" weight={2.5} />
      <ParamCurve xy={up(1)} domain={[-5, 5]} color="var(--obj1)" />
      <Segment a={P} b={F} color="var(--obj2)" weight={3} />
      <Segment a={P} b={foot} color="var(--obj4)" weight={3} />
      <RightAngle at={foot} u={[0, 1]} v={[1, 0]} s={0.25} color="var(--obj4)" />
      <Dot at={F} color="var(--obj2)" label="foco" dir="se" />
      <Label at={[3.5, -1]} text="diretriz" color="var(--obj4)" dir="s" />
      <Dot at={P} color="var(--obj3)" r={6} label="P" dir="nw" />
    </Plane2D>
  );
}

const dDir = (P: P2) => Math.abs(P[1] + 1);

function EquiTask({ s, set, done }: { s: { p: number[] }; set: (p: { p: number[] }) => void; done: boolean }) {
  const P = s.p as P2;
  return (
    <Plane2D x={[-5, 5]} y={[-2, 5]} label="Arraste P até ficar à mesma distância do foco e da diretriz">
      <GeneralLine a={0} b={1} c={1} color="var(--obj4)" weight={2.5} />
      <ParamCurve xy={up(1)} domain={[-5, 5]} color="var(--obj1)" dashed={!done} opacity={done ? 1 : 0.4} />
      <Segment a={P} b={F} color="var(--obj2)" weight={3} />
      <Segment a={P} b={[P[0], -1]} color="var(--obj4)" weight={3} />
      <Dot at={F} color="var(--obj2)" label="foco" dir="se" />
      <DraggablePoint point={P} onMove={(p) => set({ p })} color="var(--obj3)" label="P" />
    </Plane2D>
  );
}

function WidthPredict({ revealed, t }: { revealed: boolean; t: number }) {
  const p = 0.5 + (revealed ? 1.5 * t : 0);
  return (
    <Plane2D x={[-5, 5]} y={[-1.5, 5]} label="Parábola x² = 4py com p crescendo">
      <ParamCurve xy={up(p)} domain={[-5, 5]} color="var(--obj1)" />
      <Dot at={[0, p]} color="var(--obj2)" label={`foco, p = ${fmt(Math.round(p * 10) / 10)}`} dir="e" />
    </Plane2D>
  );
}

/** (y − 1)² = 4(x + 2): vértice (−2, 1), p = 1, abre para a direita. */
function SideFigure() {
  return (
    <Plane2D x={[-5, 4]} y={[-3.5, 5]} label="Parábola (y − 1)² = 4(x + 2)">
      <GeneralLine a={1} b={0} c={3} color="var(--obj4)" weight={2.5} />
      <ParamCurve xy={(y) => [-2 + ((y - 1) * (y - 1)) / 4, y]} domain={[-4, 6]} color="var(--obj1)" />
      <Dot at={[-2, 1]} color="var(--obj3)" label="vértice (−2, 1)" dir="nw" />
      <Dot at={[-1, 1]} color="var(--obj2)" label="foco (−1, 1)" dir="se" />
      <Label at={[-3, -2.5]} text="x = −3" color="var(--obj4)" dir="w" />
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Um foco e uma reta",
      body: (
        <p>
          A <b className="obj1">parábola</b> é feita dos pontos que ficam à <b>mesma distância</b> de um ponto, o <b className="obj2">foco</b>, e de uma reta, a{" "}
          <b className="obj4">diretriz</b>. A distância até a reta é medida na perpendicular. O ponto mais baixo, o <b className="obj3">vértice</b>, fica bem no meio
          dos dois.
        </p>
      ),
      tex: `${o2("d(P, F)")} = ${o4("d(P, r)")}`,
      Figure: EqualFigure,
    }),
    tarefa({
      title: "Equidistante",
      body: (
        <p>
          O foco é (0, 1) e a diretriz é y = −1. Arraste <b className="obj3">P</b> até ele ficar à mesma distância dos dois, mas <b>fora do vértice</b>.
        </p>
      ),
      init: { p: [2, 3] },
      solve: { p: [2, 1] },
      goal: (s) => Math.abs(s.p[0]) > 0.1 && Math.abs(dist(s.p as P2, F) - dDir(s.p as P2)) < 1e-9,
      readout: (s) => `${o2("d(P, F)")} = ${texDec(dist(s.p as P2, F), 2)},\\quad ${o4("d(P, r)")} = ${texDec(dDir(s.p as P2), 2)}`,
      Scene: EquiTask,
      success: (
        <p>
          Pontos como (2, 1), (−2, 1) e (4, 4) servem: todos satisfazem x² = 4y. Na altura do foco, a parábola tem largura 4p = 4.
        </p>
      ),
    }),
    prever({
      title: "Afastando o foco",
      question: (
        <p>
          Em x² = 4py, p é a distância do vértice ao foco. Se p aumenta, a parábola…
        </p>
      ),
      options: ["Abre mais, fica mais larga", "Fecha, fica mais estreita", "Não muda", "Vira para baixo"],
      correct: 0,
      Figure: WidthPredict,
      why: (
        <p>
          y = x²/(4p): com p maior, o y cresce mais devagar, e a curva <b>abre</b>. Se p fosse negativo, o foco ficaria embaixo e a parábola abriria para baixo.
        </p>
      ),
    }),
    ideia({
      title: "Em pé ou deitada",
      body: (
        <p>
          A variável ao quadrado diz para onde a parábola abre. Com x² = 4py, ela abre para cima (p &gt; 0) ou para baixo. Com y² = 4px, ela fica deitada e abre para
          a direita ou para a esquerda. Com o vértice em (h, k), basta trocar x por x − h e y por y − k.
        </p>
      ),
      tex: `(y - k)^2 = 4p\\,(x - h):\\quad ${o3("V = (h, k)")},\\;\\; ${o2("F = (h + p,\\, k)")},\\;\\; ${o4("x = h - p")}`,
      Figure: SideFigure,
    }),
    pergunta({
      title: "O foco",
      prompt: "Qual é o foco da parábola $x^2 = 8y$?",
      answer: { kind: "vector", value: [0, 2] },
      hint: "Compare com $x^2 = 4py$: $4p = 8$.",
      explain: "$4p = 8$, então $p = 2$ e o foco é $(0, 2)$. A diretriz é $y = -2$.",
    }),
    pergunta({
      title: "A diretriz",
      prompt: "A diretriz da parábola $y^2 = -12x$ é a reta $x = d$. Quanto vale $d$?",
      answer: { kind: "number", value: 3, label: "$d$" },
      hint: "$4p = -12$. A diretriz fica do lado oposto ao foco: $x = -p$.",
      explain: "$p = -3$: o foco é $(-3, 0)$, a parábola abre para a esquerda e a diretriz é $x = 3$.",
    }),
  ],
};

export default lesson;
