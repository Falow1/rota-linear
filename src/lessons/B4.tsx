import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, o3, texEquation } from "../math/format";
import { Slider } from "../ui/controls";
import { Arrow3D, PlaneMesh, Point3D, Poly3D, Scene3D, type V3 } from "../viz3d";

const XYZ = ["x", "y", "z"];
const plus = (a: V3, b: V3, k = 1): V3 => [a[0] + k * b[0], a[1] + k * b[1], a[2] + k * b[2]];

function PointNormalFigure() {
  const P: V3 = [0, 0, 1], N: V3 = [1, 1, 2], W: V3 = [2, 0, -1];
  return (
    <Scene3D R={4} label="Plano x + y + 2z = 2 com a normal e um vetor do plano">
      <PlaneMesh plane={{ n: N, d: 2 }} color="obj1" opacity={0.28} />
      <Arrow3D from={P} to={plus(P, W)} color="obj2" label="X − P" width={3} />
      <Arrow3D from={P} to={plus(P, N, 0.9)} color="obj3" label="n" width={4} />
      <Point3D at={P} color="obj1" label="P" />
    </Scene3D>
  );
}

const TP: V3 = [0, 1, 0];

function NormalTask({ s }: { s: { n: number[] } }) {
  const n = s.n as V3;
  const len = Math.hypot(...n);
  return (
    <Scene3D R={4} label="Ajuste a normal até o plano ficar de frente">
      {len > 1e-9 && <PlaneMesh plane={{ n, d: n[1] }} color="obj1" opacity={0.3} />}
      {len > 1e-9 && <Arrow3D from={TP} to={plus(TP, n, 1.6 / len)} color="obj3" label="n" width={4} />}
      <Point3D at={TP} color="obj1" label="P (0, 1, 0)" />
    </Scene3D>
  );
}

function NormalControls({ s, set }: { s: { n: number[] }; set: (p: { n: number[] }) => void }) {
  const put = (i: number, x: number) => set({ n: s.n.map((y, j) => (j === i ? x : y)) });
  return (
    <>
      <Slider tex={o3("a")} value={s.n[0]} onChange={(x) => put(0, x)} min={-3} max={3} step={0.5} />
      <Slider tex={o3("b")} value={s.n[1]} onChange={(x) => put(1, x)} min={-3} max={3} step={0.5} />
      <Slider tex={o3("c")} value={s.n[2]} onChange={(x) => put(2, x)} min={-3} max={3} step={0.5} />
    </>
  );
}

function UpPredict({ revealed, t }: { revealed: boolean; t: number }) {
  const P: V3 = [0, 0, 2];
  return (
    <Scene3D R={4} label="Plano com normal (0, 0, 1) passando por (0, 0, 2)">
      {revealed && <PlaneMesh plane={{ n: [0, 0, 1], d: 2 }} color="obj1" opacity={0.3 * t} />}
      <Arrow3D from={P} to={[0, 0, 3.3]} color="obj3" label="n = (0, 0, 1)" width={4} />
      <Point3D at={P} color="obj1" label="(0, 0, 2)" />
    </Scene3D>
  );
}

function ThreePointsFigure() {
  const A: V3 = [2, 0, 0], B: V3 = [0, 2, 0], C: V3 = [0, 0, 2];
  const G: V3 = [2 / 3, 2 / 3, 2 / 3];
  return (
    <Scene3D R={3} label="Plano pelos pontos A, B e C">
      <Poly3D points={[A, B, C]} color="obj1" opacity={0.3} />
      <Arrow3D from={A} to={B} color="obj2" label="AB" width={3} />
      <Arrow3D from={A} to={C} color="obj4" label="AC" width={3} />
      <Arrow3D from={G} to={plus(G, [1, 1, 1], 0.9)} color="obj3" label="AB × AC" width={4} />
      <Point3D at={A} color="text" label="A" />
      <Point3D at={B} color="text" label="B" />
      <Point3D at={C} color="text" label="C" />
    </Scene3D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Um ponto e uma normal",
      body: (
        <p>
          Um plano fica definido por <b className="obj1">um ponto P</b> e um vetor <b className="obj3">normal n</b>, perpendicular a ele. Um ponto X está no
          plano quando a seta <b className="obj2">X − P</b> é perpendicular a n, ou seja, quando o produto escalar dá zero. Abrindo a conta, aparece a equação
          ax + by + cz = d, com (a, b, c) = n.
        </p>
      ),
      tex: `${o3("\\vec n")}\\cdot(${o2("X - P")}) = 0 \\iff ax + by + cz = d`,
      Figure: PointNormalFigure,
    }),
    tarefa({
      title: "Deixe o plano de frente",
      body: (
        <p>
          O plano passa por <b className="obj1">P = (0, 1, 0)</b>. Ajuste a normal <b className="obj3">n = (a, b, c)</b> até o plano ficar paralelo ao plano xz,
          “de frente” para quem olha pelo eixo y. Use a vista “De frente” para conferir.
        </p>
      ),
      init: { n: [1, 1, 2] },
      solve: { n: [0, 2, 0] },
      goal: (s) => Math.abs(s.n[0]) < 1e-9 && Math.abs(s.n[2]) < 1e-9 && Math.abs(s.n[1]) > 0.1,
      readout: (s) => (Math.hypot(...s.n) < 1e-9 ? "\\vec n = \\vec 0" : texEquation(s.n, XYZ, s.n[1])),
      Scene: NormalTask,
      Controls: NormalControls,
      success: (
        <p>
          Com a normal só na direção y, a equação vira by = b, isto é, <b>y = 1</b>: x e z ficam livres. O plano é paralelo ao plano xz.
        </p>
      ),
    }),
    prever({
      title: "Normal para cima",
      question: (
        <p>
          Um plano tem normal <b className="obj3">(0, 0, 1)</b> e passa por <b className="obj1">(0, 0, 2)</b>. Como ele é?
        </p>
      ),
      options: ["Horizontal, na altura z = 2", "Vertical, contendo o eixo z", "Inclinado, passando pela origem", "Paralelo ao plano yz"],
      correct: 0,
      Figure: UpPredict,
      why: (
        <p>
          A equação é 0x + 0y + 1z = 2, ou seja, <b>z = 2</b>. Uma normal vertical deixa o plano deitado: é o “chão” levantado até a altura 2.
        </p>
      ),
    }),
    ideia({
      title: "Três pontos bastam",
      body: (
        <p>
          Com três pontos que não estão alinhados, as setas <b className="obj2">AB</b> e <b className="obj4">AC</b> ficam dentro do plano. O produto vetorial das
          duas é perpendicular a ambas: é uma <b className="obj3">normal</b>. Para A = (2, 0, 0), B = (0, 2, 0) e C = (0, 0, 2), dá (4, 4, 4), e o plano é x + y +
          z = 2.
        </p>
      ),
      tex: `${o3("\\vec n")} = ${o2("\\overrightarrow{AB}")}\\times\\htmlClass{obj4}{\\overrightarrow{AC}},\\qquad d = ${o3("\\vec n")}\\cdot ${o1("A")}`,
      Figure: ThreePointsFigure,
    }),
    pergunta({
      title: "Ponto e normal",
      prompt: "Escreva a equação do plano que passa por $(1, 0, 2)$ e tem normal $(2, -1, 3)$, na forma $ax + by + cz = d$.",
      answer: { kind: "linear", value: [2, -1, 3, -8], vars: ["x", "y", "z"], rhsForm: true },
      hint: "$a$, $b$, $c$ vêm da normal. Para o $d$, substitua o ponto: $2\\cdot1 - 0 + 3\\cdot2$.",
      explain: "$d = 2 - 0 + 6 = 8$, então o plano é $2x - y + 3z = 8$.",
    }),
    pergunta({
      title: "Está no plano?",
      prompt: "O ponto $(1, 1, 1)$ está no plano $x + 2y - z = 2$?",
      answer: { kind: "choice", options: ["Sim", "Não"], correct: 0 },
      hint: "Substitua: $1 + 2\\cdot1 - 1$. Dá 2?",
      explain: "$1 + 2 - 1 = 2$: a equação é satisfeita, então o ponto está no plano.",
    }),
    pergunta({
      title: "Normal pelo produto vetorial",
      prompt: "Um plano contém as direções $\\vec u = (1, 0, 1)$ e $\\vec v = (0, 1, 2)$. Dê um vetor normal a ele.",
      answer: { kind: "direction", value: [-1, -2, 1] },
      hint: "Calcule $\\vec u\\times\\vec v$: primeira coordenada $0\\cdot2 - 1\\cdot1$.",
      explain: "$\\vec u\\times\\vec v = (0\\cdot2 - 1\\cdot1,\\; 1\\cdot0 - 1\\cdot2,\\; 1\\cdot1 - 0\\cdot0) = (-1, -2, 1)$, ou qualquer múltiplo.",
    }),
  ],
};

export default lesson;
