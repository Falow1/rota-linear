import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { fmt, o1, o2, o3, texTuple } from "../math/format";
import { useLoop } from "../player/anim";
import { Slider } from "../ui/controls";
import { Arrow3D, Line3D, Point3D, Scene3D, type V3 } from "../viz3d";

const P: V3 = [1, -1, 0], V: V3 = [1, 1, 2];
const at = (t: number): V3 => [P[0] + t * V[0], P[1] + t * V[1], P[2] + t * V[2]];
const LINE = { p: P, v: V };

function WalkFigure() {
  const k = useLoop(4200, 500);
  const t = -1.5 + 3 * k;
  return (
    <Scene3D R={4} label="Ponto X = P + t·v andando sobre a reta no espaço">
      <Line3D line={LINE} color="obj1" width={3} />
      <Arrow3D from={P} to={at(1)} color="obj2" label="v" width={4} />
      <Point3D at={P} color="obj1" label="P" />
      <Point3D at={at(t)} color="obj3" size={0.13} label={`t = ${fmt(Math.round(t * 10) / 10)}`} />
    </Scene3D>
  );
}

const Q: V3 = at(2);

function WalkTask({ s }: { s: { t: number } }) {
  return (
    <Scene3D R={4} label="Ajuste t até X chegar em Q">
      <Line3D line={LINE} color="obj1" width={3} />
      <Point3D at={P} color="obj1" label="P" />
      <Point3D at={Q} color="text" size={0.11} label="Q (3, 1, 4)" />
      <Arrow3D from={P} to={at(s.t)} color="obj3" width={3} />
      <Point3D at={at(s.t)} color="obj3" size={0.13} label="X" />
    </Scene3D>
  );
}

function WalkControls({ s, set }: { s: { t: number }; set: (p: { t: number }) => void }) {
  return <Slider tex={o3("t")} value={s.t} onChange={(t) => set({ t })} min={-3} max={3} step={0.5} />;
}

function BackPredict({ revealed, t }: { revealed: boolean; t: number }) {
  const k = revealed ? -t : 0;
  return (
    <Scene3D R={4} label="Onde fica X quando t = −1?">
      <Line3D line={LINE} color="obj1" width={3} />
      <Arrow3D from={P} to={at(1)} color="obj2" label="v" width={4} />
      <Point3D at={P} color="obj1" label="P (1, −1, 0)" />
      {revealed && <Point3D at={at(k)} color="obj3" size={0.13} label={t > 0.95 ? "t = −1" : undefined} />}
    </Scene3D>
  );
}

function SymFigure() {
  return (
    <Scene3D R={4} label="A reta (x − 1)/1 = (y + 1)/1 = z/2">
      <Line3D line={LINE} color="obj1" width={3} />
      <Arrow3D from={P} to={at(1)} color="obj2" label="v = (1, 1, 2)" width={4} />
      <Point3D at={P} color="obj1" label="P (1, −1, 0)" />
    </Scene3D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "A mesma receita, com três coordenadas",
      body: (
        <p>
          No espaço, uma reta ainda é <b className="obj1">um ponto P</b> mais <b className="obj2">uma direção v</b>. Só que agora não existe uma equação “ax + by +
          c = 0” para ela: essa equação, em 3D, descreve um plano. A forma que funciona é a <b>paramétrica</b>, uma equação para cada coordenada.
        </p>
      ),
      tex: `X = ${o1("(1, -1, 0)")} + ${o3("t")}\\,${o2("(1, 1, 2)")} \\iff \\begin{cases} x = 1 + t \\\\ y = -1 + t \\\\ z = 2t \\end{cases}`,
      Figure: WalkFigure,
    }),
    tarefa({
      title: "Chegue em Q",
      body: (
        <p>
          A reta passa por <b className="obj1">P = (1, −1, 0)</b> com direção <b className="obj2">v = (1, 1, 2)</b>. Ajuste <b className="obj3">t</b> até o ponto X
          chegar em <b>Q = (3, 1, 4)</b>. Gire a cena para conferir.
        </p>
      ),
      init: { t: 0 },
      solve: { t: 2 },
      goal: (s) => Math.abs(s.t - 2) < 1e-9,
      readout: (s) => `X(${fmt(s.t)}) = ${o3(texTuple(at(s.t)))}`,
      Scene: WalkTask,
      Controls: WalkControls,
      success: (
        <p>
          t = 2: dois passos de v a partir de P. Repare que o mesmo t vale nas três coordenadas: 1 + 2 = 3, −1 + 2 = 1 e 2·2 = 4.
        </p>
      ),
    }),
    prever({
      title: "Para trás",
      question: (
        <p>
          Na mesma reta, onde fica X quando <b className="obj3">t = −1</b>?
        </p>
      ),
      options: ["(0, −2, −2)", "(2, 0, 2)", "(−1, 1, 0)", "(0, −2, 2)"],
      correct: 0,
      Figure: BackPredict,
      why: (
        <p>
          X = P − v = (1 − 1, −1 − 1, 0 − 2) = <b>(0, −2, −2)</b>. Um t negativo anda no sentido contrário de v, para o outro lado de P.
        </p>
      ),
    }),
    ideia({
      title: "Isolando o t",
      body: (
        <p>
          Se todas as coordenadas de v são diferentes de zero, dá para isolar t em cada equação e igualar. Essa é a forma <b>simétrica</b>: os numeradores
          trazem o ponto, e os denominadores, a direção.
        </p>
      ),
      tex: `\\frac{x - ${o1("1")}}{${o2("1")}} = \\frac{y + ${o1("1")}}{${o2("1")}} = \\frac{z - ${o1("0")}}{${o2("2")}} \\;(= t)`,
      Figure: SymFigure,
    }),
    pergunta({
      title: "Está na reta?",
      prompt: "O ponto $(5, 3, 7)$ está na reta $X = (1, -1, 0) + t\\,(1, 1, 2)$?",
      answer: { kind: "choice", options: ["Sim", "Não"], correct: 1 },
      hint: "Ache o t de cada coordenada: $1 + t = 5$, $-1 + t = 3$ e $2t = 7$. Eles precisam ser iguais.",
      explain: "As duas primeiras dão $t = 4$, mas a terceira dá $t = 3{,}5$. Como não existe um único t, o ponto não está na reta.",
    }),
    pergunta({
      title: "Lendo a direção",
      prompt: "Dê um vetor diretor da reta $\\dfrac{x - 2}{3} = \\dfrac{y + 1}{-1} = \\dfrac{z}{2}$.",
      answer: { kind: "direction", value: [3, -1, 2] },
      hint: "Na forma simétrica, os denominadores são as coordenadas da direção.",
      explain: "$\\vec v = (3, -1, 2)$, ou qualquer múltiplo não nulo dele. O ponto da reta é $(2, -1, 0)$.",
    }),
    pergunta({
      title: "Um ponto da reta",
      prompt: "Na reta $X = (0, 1, -2) + t\\,(2, -1, 3)$, qual é o ponto para $t = 2$?",
      answer: { kind: "vector", value: [4, -1, 4] },
      hint: "$2\\,(2, -1, 3) = (4, -2, 6)$. Some isso ao ponto inicial.",
      explain: "$(0, 1, -2) + (4, -2, 6) = (4, -1, 4)$.",
    }),
  ],
};

export default lesson;
