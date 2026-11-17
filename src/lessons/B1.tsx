import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { fmt, o1, o2, o3, o4, texLinear } from "../math/format";
import { useLoop } from "../player/anim";
import { Slider } from "../ui/controls";
import { Arrow, Dot, GeneralLine, InfLine, Label, Plane2D, RightAngle, type P2 } from "../viz2d";

/** X = P + t·v andando sobre a reta. */
function ParamWalk() {
  const k = useLoop(4200, 500);
  const t = -1.5 + 4 * k;
  const P: P2 = [-2, -1], v: P2 = [2, 1];
  const X: P2 = [P[0] + t * v[0], P[1] + t * v[1]];
  return (
    <Plane2D x={[-5, 6]} y={[-3.5, 3.5]} label="Ponto X = P + t·v andando sobre a reta">
      <InfLine p={P} v={v} color="var(--obj1)" weight={2.5} />
      <Arrow tail={P} tip={[P[0] + v[0], P[1] + v[1]]} color="var(--obj2)" label="v" weight={4} dir="nw" />
      <Dot at={P} color="var(--obj1)" label="P" dir="se" />
      <Dot at={X} color="var(--obj3)" r={6} label={`t = ${fmt(Math.round(t * 10) / 10)}`} dir="se" />
    </Plane2D>
  );
}

/** Reta x + 2y − 4 = 0: a normal (1, 2) é perpendicular à direção (2, −1). */
function NormalFigure() {
  const P: P2 = [2, 1];
  return (
    <Plane2D x={[-1, 5.5]} y={[-1.5, 4]} label="Reta x + 2y − 4 = 0 com o vetor normal">
      <GeneralLine a={1} b={2} c={-4} color="var(--obj1)" />
      <RightAngle at={P} u={[1, 2]} v={[2, -1]} s={0.35} />
      <Arrow tail={P} tip={[4, 0]} color="var(--obj2)" label="direção (2, −1)" dir="ne" />
      <Arrow tail={P} tip={[3, 3]} color="var(--obj3)" label="normal (1, 2)" weight={4} />
    </Plane2D>
  );
}

const TP: P2 = [-1, 3], TQ: P2 = [2, -3];
type MN = { m: number; n: number };
const passes = (s: MN, P: P2) => Math.abs(s.m * P[0] + s.n - P[1]) < 1e-9;

function SlopeTask({ s, done }: { s: MN; done: boolean }) {
  return (
    <Plane2D x={[-4, 4]} y={[-5, 5]} label="Reta y = mx + n e os pontos P e Q">
      <GeneralLine a={s.m} b={-1} c={s.n} color={done ? "var(--obj3)" : "var(--obj1)"} weight={3} />
      <Dot at={[0, s.n]} color="var(--obj4)" label="n" dir="w" />
      <Dot at={TP} color={passes(s, TP) ? "var(--obj3)" : "var(--text)"} label="P (−1, 3)" dir="ne" />
      <Dot at={TQ} color={passes(s, TQ) ? "var(--obj3)" : "var(--text)"} label="Q (2, −3)" dir="ne" />
    </Plane2D>
  );
}

function SlopeControls({ s, set }: { s: MN; set: (p: Partial<MN>) => void }) {
  return (
    <>
      <Slider tex={o1("m")} label="inclinação m" value={s.m} onChange={(m) => set({ m })} min={-4} max={4} step={0.5} />
      <Slider tex={o4("n")} value={s.n} onChange={(n) => set({ n })} min={-5} max={5} step={0.5} />
    </>
  );
}

function ShiftFigure({ revealed, t }: { revealed: boolean; t: number }) {
  const c = revealed ? 4 * t : 0;
  return (
    <Plane2D x={[-4, 3]} y={[-5, 3]} label="Reta 2x + y + c = 0 quando c muda">
      {revealed && <GeneralLine a={2} b={1} c={0} color="var(--obj-muted)" dashed weight={2} />}
      <GeneralLine a={2} b={1} c={c} color="var(--obj1)" weight={3} />
      {revealed && t > 0.95 && <Label at={[-2, 0]} text="c = 4" color="var(--obj1)" dir="nw" />}
      <Arrow tail={[0, -c]} tip={[2, 1 - c]} color="var(--obj3)" label="normal (2, 1)" dir="e" />
    </Plane2D>
  );
}

function InterceptFigure() {
  return (
    <Plane2D x={[-1.5, 4.5]} y={[-1.5, 3.5]} label="Reta que corta os eixos em 3 e 2">
      <GeneralLine a={2} b={3} c={-6} color="var(--obj1)" weight={3} />
      <Dot at={[3, 0]} color="var(--obj2)" label="p = 3" dir="se" />
      <Dot at={[0, 2]} color="var(--obj4)" label="q = 2" dir="nw" />
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Um ponto e uma direção",
      body: (
        <p>
          Uma reta fica definida por <b className="obj1">um ponto P</b> e <b className="obj2">uma direção v</b>. Cada valor do parâmetro <b className="obj3">t</b>{" "}
          dá um ponto: t = 0 é o próprio P, t = 1 é um passo de v, t negativo anda para trás. Essa é a forma <b>paramétrica</b>.
        </p>
      ),
      tex: `X = ${o1("P")} + ${o3("t")}\\,${o2("\\vec v")}`,
      Figure: ParamWalk,
    }),
    ideia({
      title: "A equação geral olha para a normal",
      body: (
        <p>
          Em <b>ax + by + c = 0</b>, os coeficientes (a, b) formam um vetor <b className="obj3">normal</b>: perpendicular à reta. Por isso a{" "}
          <b className="obj2">direção</b> é (−b, a) ou (b, −a). Para achar c, basta exigir que um ponto conhecido satisfaça a equação.
        </p>
      ),
      tex: `ax + by + c = 0 \\quad\\Longrightarrow\\quad ${o3("\\vec n = (a, b)")},\\;\\; ${o2("\\vec v = (-b, a)")}`,
      Figure: NormalFigure,
    }),
    tarefa({
      title: "Passe pelos dois pontos",
      body: (
        <p>
          Na forma <b>reduzida</b> y = <b className="obj1">m</b>x + <b className="obj4">n</b>, m é a inclinação e n é onde a reta corta o eixo y. Ajuste m e n
          até a reta passar por <b>P = (−1, 3)</b> e <b>Q = (2, −3)</b>.
        </p>
      ),
      init: { m: 1, n: 0 },
      solve: { m: -2, n: 1 },
      goal: (s) => passes(s, TP) && passes(s, TQ),
      readout: (s) => `y = ${texLinear([s.m], [o1("x")], s.n)}`,
      Scene: SlopeTask,
      Controls: SlopeControls,
      success: (
        <p>
          m = −2 e n = 1. De P para Q, x anda 3 e y cai 6: m = −6/3 = −2. Depois, y = −2x + n em P dá 3 = 2 + n, ou seja, n = 1.
        </p>
      ),
    }),
    prever({
      title: "Mexendo só no c",
      question: (
        <p>
          Na reta <b>2x + y + c = 0</b>, o que acontece quando o número <b>c</b> aumenta e a e b ficam iguais?
        </p>
      ),
      options: ["A reta gira em volta da origem", "A reta se desloca, sempre paralela a si mesma", "A reta fica mais inclinada", "Nada muda"],
      correct: 1,
      Figure: ShiftFigure,
      why: (
        <p>
          A normal (2, 1) não depende de c, então a direção da reta também não. Mudar c só empurra a reta ao longo da normal: todas as retas 2x + y + c = 0
          são <b>paralelas</b>.
        </p>
      ),
    }),
    ideia({
      title: "Lendo os cortes nos eixos",
      body: (
        <p>
          Se a reta corta o eixo x em <b className="obj2">p</b> e o eixo y em <b className="obj4">q</b> (os dois diferentes de zero), dá para escrevê-la na
          forma <b>segmentária</b>. A reta da figura, 2x + 3y − 6 = 0, vira x/3 + y/2 = 1.
        </p>
      ),
      tex: `\\frac{x}{${o2("p")}} + \\frac{y}{${o4("q")}} = 1`,
      Figure: InterceptFigure,
    }),
    pergunta({
      title: "Inclinação",
      prompt: "A reta passa por $(1, 2)$ e $(3, 6)$. Qual é o coeficiente angular $m$?",
      answer: { kind: "number", value: 2, label: "$m$" },
      hint: "$m = \\dfrac{\\Delta y}{\\Delta x} = \\dfrac{6 - 2}{3 - 1}$.",
      explain: "$m = \\dfrac{4}{2} = 2$: para cada passo à direita, a reta sobe 2.",
    }),
    pergunta({
      title: "Equação geral",
      prompt: "Escreva a equação geral $ax + by + c = 0$ da reta que passa por $(0, 1)$ e $(2, 5)$.",
      answer: { kind: "linear", value: [2, -1, 1], vars: ["x", "y"] },
      hint: "A direção é $(2, 4)$, então uma normal é $(4, -2)$ ou, simplificando, $(2, -1)$. Ache $c$ com o ponto $(0, 1)$.",
      explain: "Com normal $(2, -1)$: $2x - y + c = 0$. O ponto $(0, 1)$ dá $-1 + c = 0$, então $c = 1$: $2x - y + 1 = 0$.",
    }),
  ],
};

export default lesson;
