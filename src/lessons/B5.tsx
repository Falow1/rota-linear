import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, tex } from "../math/format";
import { Slider } from "../ui/controls";
import { Label3D, Line3D, PlaneMesh, Point3D, Scene3D, Seg3D, type V3 } from "../viz3d";

function SkewFigure() {
  return (
    <Scene3D R={3.5} label="Duas retas reversas e o segmento que mede a distância entre elas">
      <Line3D line={{ p: [0, 0, 0], v: [1, 0, 0] }} color="obj1" width={3} R={3.5} />
      <Line3D line={{ p: [0, 0, 2], v: [0, 1, 0] }} color="obj2" width={3} R={3.5} />
      <Seg3D a={[0, 0, 0]} b={[0, 0, 2]} color="obj3" width={3} dashed />
      <Label3D at={[0, 0, 1]} text="distância 2" color="obj3" offset={[12, 0]} />
      <Label3D at={[3, 0, 0]} text="r" color="obj1" />
      <Label3D at={[0, 3, 2]} text="s" color="obj2" />
    </Scene3D>
  );
}

type HM = { h: number; m: number };
const kindOf = ({ h, m }: HM) => (m === 0 ? (h === 0 ? "coincidentes" : "paralelas") : h === 0 ? "concorrentes" : "reversas");

function SkewTask({ s }: { s: HM }) {
  const k = kindOf(s);
  return (
    <Scene3D R={3.5} label="Retas r e s: ajuste a altura e a direção de s">
      <Line3D line={{ p: [0, 0, 0], v: [1, 0, 0] }} color="obj1" width={3} R={3.5} />
      <Line3D line={{ p: [0, 0, s.h], v: [1, s.m, 0] }} color={k === "reversas" ? "obj3" : "obj2"} width={3} R={3.5} />
      <Point3D at={[0, 0, s.h]} color="obj2" label="B" />
      {k === "concorrentes" && <Point3D at={[0, 0, 0]} color="text" size={0.12} label="cruzam aqui" />}
      {k === "reversas" && <Seg3D a={[0, 0, 0]} b={[0, 0, s.h]} color="obj3" width={2} dashed />}
    </Scene3D>
  );
}

function SkewControls({ s, set }: { s: HM; set: (p: Partial<HM>) => void }) {
  return (
    <>
      <Slider label="altura h de s" value={s.h} onChange={(h) => set({ h })} min={-3} max={3} step={0.5} color="obj2" />
      <Slider tex={o2("m")} value={s.m} onChange={(m) => set({ m })} min={-2} max={2} step={0.5} />
    </>
  );
}

function ParallelPredict({ revealed, t }: { revealed: boolean; t: number }) {
  return (
    <Scene3D R={4} label="As retas r e s da pergunta">
      <Point3D at={[1, 0, 0]} color="obj1" label="A" />
      <Point3D at={[0, 1, 3]} color="obj2" label="B" />
      {revealed && t > 0.3 && <Line3D line={{ p: [1, 0, 0], v: [1, 2, -1] }} color="obj1" width={3} />}
      {revealed && t > 0.6 && <Line3D line={{ p: [0, 1, 3], v: [-2, -4, 2] }} color="obj2" width={3} />}
    </Scene3D>
  );
}

function PlaneDistFigure() {
  const P: V3 = [1, 2, 3], F: V3 = [-1, 1, 1];
  return (
    <Scene3D R={4} label="Distância do ponto P ao plano 2x + y + 2z = 1">
      <PlaneMesh plane={{ n: [2, 1, 2], d: 1 }} color="obj1" opacity={0.28} />
      <Seg3D a={P} b={F} color="obj3" width={3} dashed />
      <Point3D at={F} color="obj3" label="pé da perpendicular" />
      <Point3D at={P} color="obj2" size={0.12} label="P (1, 2, 3)" />
      <Label3D at={[0, 1.5, 2]} text="d = 3" color="obj3" offset={[-14, 0]} />
    </Scene3D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "No espaço, nem toda reta se cruza",
      body: (
        <>
          <p>
            No plano, duas retas ou se cruzam ou são paralelas. No espaço aparece um terceiro caso: retas <b>reversas</b>, que não se cruzam e também não são
            paralelas. Elas passam uma “por cima” da outra, como <b className="obj1">r</b> e <b className="obj2">s</b> na figura.
          </p>
          <p>Gire a cena: de nenhum ângulo elas se encostam.</p>
        </>
      ),
      Figure: SkewFigure,
    }),
    tarefa({
      title: "Separe as retas",
      body: (
        <p>
          <b className="obj1">r</b> é o eixo x. A reta <b className="obj2">s</b> passa por B = (0, 0, h) com direção (1, m, 0). Agora elas se cruzam na origem.
          Ajuste h e m até elas ficarem <b>reversas</b>. A leitura mostra o produto misto, que decide o caso.
        </p>
      ),
      init: { h: 0, m: 1 },
      solve: { h: 2, m: 1 },
      goal: (s) => kindOf(s) === "reversas",
      readout: (s) => `[\\overrightarrow{AB}, ${o1("\\vec u")}, ${o2("\\vec v")}] = ${tex(s.h * s.m)} \\;\\Rightarrow\\; \\text{${kindOf(s)}}`,
      Scene: SkewTask,
      Controls: SkewControls,
      success: (
        <p>
          Com direções diferentes (m ≠ 0) e o produto misto diferente de zero (h ≠ 0), não há plano que contenha as duas retas: elas são reversas. A distância
          entre elas é |h|.
        </p>
      ),
    }),
    prever({
      title: "Classifique o par",
      question: (
        <p>
          <b className="obj1">r: X = (1, 0, 0) + t(1, 2, −1)</b> e <b className="obj2">s: X = (0, 1, 3) + t(−2, −4, 2)</b>. Essas retas são…
        </p>
      ),
      options: ["Paralelas distintas", "Concorrentes", "Reversas", "Coincidentes"],
      correct: 0,
      Figure: ParallelPredict,
      why: (
        <p>
          (−2, −4, 2) = −2·(1, 2, −1): as direções são paralelas. E B não está em r (de x = 0 sai t = −1, mas aí y = −2, não 1). Então são{" "}
          <b>paralelas distintas</b>.
        </p>
      ),
    }),
    ideia({
      title: "Distância de ponto a plano",
      body: (
        <p>
          A conta é a mesma da distância de ponto a reta no plano, com uma coordenada a mais: substitua o ponto na equação, tire o módulo e divida pelo tamanho
          da normal. Para <b className="obj2">P = (1, 2, 3)</b> e <b className="obj1">2x + y + 2z = 1</b>: |2 + 2 + 6 − 1| / 3 = <b className="obj3">3</b>.
        </p>
      ),
      tex: `d(P, \\pi) = \\frac{|a x_0 + b y_0 + c z_0 - d|}{\\sqrt{a^2 + b^2 + c^2}}`,
      Figure: PlaneDistFigure,
    }),
    pergunta({
      title: "Ponto e plano",
      prompt: "Qual é a distância do ponto $(2, -1, 1)$ ao plano $x + 2y + 2z = 6$? (Frações valem.)",
      answer: { kind: "number", value: 4 / 3, label: "distância" },
      hint: "Substitua o ponto: $2 + 2\\cdot(-1) + 2\\cdot1 - 6$. Tire o módulo e divida por $\\sqrt{1 + 4 + 4}$.",
      explain: "$\\dfrac{|2 - 2 + 2 - 6|}{3} = \\dfrac{4}{3}$.",
    }),
    pergunta({
      title: "Planos paralelos",
      prompt: "Qual é a distância entre os planos $x + 2y + 2z = 1$ e $x + 2y + 2z = 7$?",
      answer: { kind: "number", value: 2, label: "distância" },
      hint: "Com a mesma normal, a distância é $\\dfrac{|d_1 - d_2|}{\\|\\vec n\\|}$.",
      explain: "$\\dfrac{|1 - 7|}{\\sqrt{1 + 4 + 4}} = \\dfrac{6}{3} = 2$.",
    }),
    pergunta({
      title: "Reta furando o plano",
      prompt: "Em que ponto a reta $X = (1, 0, 2) + t\\,(1, 1, -1)$ fura o plano $x + y + z = 6$?",
      answer: { kind: "vector", value: [4, 3, -1] },
      hint: "Na reta, $x = 1 + t$, $y = t$ e $z = 2 - t$. Substitua no plano e ache t.",
      explain: `$(1 + t) + t + (2 - t) = 6 \\Rightarrow 3 + t = 6 \\Rightarrow t = 3$. O ponto é $(4, 3, -1)$.`,
    }),
  ],
};

export default lesson;
