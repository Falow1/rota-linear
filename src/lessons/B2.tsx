import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, texTuple } from "../math/format";
import { relLines } from "../math/lines";
import { AngleArc, Dot, DraggablePoint, GeneralLine, InfLine, Label, Plane2D, RightAngle, Segment, bisector, type P2 } from "../viz2d";

function CrossFigure() {
  return (
    <Plane2D x={[-1, 6]} y={[-1.5, 5.5]} label="Retas x + y = 5 e x − y = 1 se cruzando em (3, 2)">
      <GeneralLine a={1} b={1} c={-5} color="var(--obj1)" />
      <GeneralLine a={1} b={-1} c={-1} color="var(--obj2)" />
      <Label at={[0.5, 4.5]} text="x + y = 5" color="var(--obj1)" dir="ne" />
      <Label at={[4.5, 3.5]} text="x − y = 1" color="var(--obj2)" dir="e" />
      <Dot at={[3, 2]} color="var(--obj3)" r={6} label="(3, 2)" dir="e" />
    </Plane2D>
  );
}

const VR: P2 = [2, 1];
const S0: P2 = [1, -2];
const sub2 = (a: P2, b: P2): P2 => [a[0] - b[0], a[1] - b[1]];
const par = (d: P2) => Math.hypot(d[0], d[1]) > 1e-9 && Math.abs(d[0] * VR[1] - d[1] * VR[0]) < 1e-9;

function ParallelTask({ s, set, done }: { s: { d: number[] }; set: (p: { d: number[] }) => void; done: boolean }) {
  const D = s.d as P2;
  const vs = sub2(D, S0);
  const rel = Math.hypot(vs[0], vs[1]) > 1e-9 ? relLines({ a: 1, b: -2, c: 2 }, { a: vs[1], b: -vs[0], c: -(vs[1] * S0[0] - vs[0] * S0[1]) }) : null;
  return (
    <Plane2D x={[-4, 6]} y={[-4, 4]} label="Arraste o ponto D até s ficar paralela a r">
      <GeneralLine a={1} b={-2} c={2} color="var(--obj1)" weight={3} />
      <Label at={[-3, -0.5]} text="r" color="var(--obj1)" dir="nw" />
      <InfLine p={S0} v={vs} color={done ? "var(--obj3)" : "var(--obj2)"} weight={3} />
      {rel?.kind === "concorrentes" && Math.abs(rel.point[0]) < 8 && Math.abs(rel.point[1]) < 8 && <Dot at={rel.point as P2} color="var(--text-3)" label="cruzam aqui" dir="se" />}
      <Dot at={S0} color="var(--obj2)" label="S" dir="sw" />
      <DraggablePoint point={D} onMove={(p) => set({ d: p })} color="var(--obj2)" label="D" />
    </Plane2D>
  );
}

function ParallelPredict({ revealed, t }: { revealed: boolean; t: number }) {
  return (
    <Plane2D x={[-4, 4]} y={[-3, 3]} label="As retas 2x + 4y − 6 = 0 e x + 2y + 1 = 0">
      {revealed && (
        <>
          <g style={{ opacity: t }}>
            <GeneralLine a={2} b={4} c={-6} color="var(--obj1)" weight={3} />
            <GeneralLine a={1} b={2} c={1} color="var(--obj2)" weight={3} />
          </g>
          {t > 0.95 && <Label at={[3, 0]} text="r" color="var(--obj1)" dir="ne" />}
          {t > 0.95 && <Label at={[-3, 1]} text="s" color="var(--obj2)" dir="sw" />}
        </>
      )}
    </Plane2D>
  );
}

function AngleFigure() {
  return (
    <Plane2D x={[-3, 4]} y={[-2.5, 3.5]} label="Retas y = x e y = 0 formando 45°">
      <GeneralLine a={1} b={-1} c={0} color="var(--obj1)" weight={3} />
      <GeneralLine a={0} b={1} c={0} color="var(--obj2)" weight={3} />
      <AngleArc from={[1, 0]} to={[1, 1]} r={1.2} color="var(--obj5)" />
      <Label at={bisector([1, 0], [1, 1], 1.6)} text="45°" color="var(--obj5)" dir="e" dist={0} />
    </Plane2D>
  );
}

function DistFigure() {
  const P: P2 = [4, 3], F: P2 = [1.6, -0.2];
  return (
    <Plane2D x={[-2, 6]} y={[-2.5, 4.5]} label="Distância do ponto P à reta 3x + 4y − 4 = 0">
      <GeneralLine a={3} b={4} c={-4} color="var(--obj1)" weight={3} />
      <Segment a={P} b={F} color="var(--obj3)" weight={3} dashed />
      <RightAngle at={F} u={[P[0] - F[0], P[1] - F[1]]} v={[4, -3]} s={0.3} />
      <Dot at={F} color="var(--obj3)" />
      <Dot at={P} color="var(--obj2)" r={6} label="P (4, 3)" dir="ne" />
      <Label at={[2.8, 1.4]} text="d = 4" color="var(--obj3)" dir="w" />
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Cruzar é resolver um sistema",
      body: (
        <p>
          O ponto onde duas retas se cruzam satisfaz as <b>duas</b> equações ao mesmo tempo. Somando <b className="obj1">x + y = 5</b> com{" "}
          <b className="obj2">x − y = 1</b>, o y some: 2x = 6, então x = 3 e y = 2.
        </p>
      ),
      tex: `\\begin{cases} ${o1("x + y = 5")} \\\\ ${o2("x - y = 1")} \\end{cases} \\;\\Rightarrow\\; (x, y) = (3, 2)`,
      Figure: CrossFigure,
    }),
    tarefa({
      title: "Deixe as retas paralelas",
      body: (
        <p>
          A reta <b className="obj1">r: x − 2y + 2 = 0</b> tem direção (2, 1). A reta <b className="obj2">s</b> passa por S = (1, −2) e pelo ponto D. Arraste D
          até s ficar <b>paralela</b> a r, sem nenhum ponto de cruzamento.
        </p>
      ),
      init: { d: [3, 0] },
      solve: { d: [3, -1] },
      goal: (s) => par(sub2(s.d as P2, S0)),
      readout: (s) => `${o1("\\vec v_r = (2, 1)")},\\quad ${o2(`\\vec v_s = ${texTuple(sub2(s.d as P2, S0))}`)}`,
      Scene: ParallelTask,
      success: (
        <p>
          A direção de s virou um múltiplo de (2, 1). Retas paralelas têm direções (e normais) múltiplas uma da outra; aí o sistema não tem solução.
        </p>
      ),
    }),
    prever({
      title: "Só pelas equações",
      question: (
        <p>
          Sem desenhar: as retas <b className="obj1">r: 2x + 4y − 6 = 0</b> e <b className="obj2">s: x + 2y + 1 = 0</b> são…
        </p>
      ),
      options: ["Concorrentes (se cruzam em um ponto)", "Paralelas distintas", "Coincidentes (a mesma reta)"],
      correct: 1,
      Figure: ParallelPredict,
      why: (
        <p>
          Os coeficientes de x e y de r são o dobro dos de s (2 = 2·1 e 4 = 2·2), então as normais são paralelas. Mas o termo independente não segue a
          proporção (−6 ≠ 2·1): as retas são paralelas e <b>distintas</b>.
        </p>
      ),
    }),
    ideia({
      title: "O ângulo vem das normais",
      body: (
        <p>
          O ângulo entre duas retas é o mesmo que entre as suas normais (ou as direções). Como reta não tem sentido, usamos o <b>módulo</b> do produto
          escalar, e o ângulo fica entre 0° e 90°. Para y = x e y = 0: normais (1, −1) e (0, 1), cos θ = 1/√2, θ = 45°.
        </p>
      ),
      tex: `\\cos\\theta = \\frac{|\\vec n_1\\cdot\\vec n_2|}{\\|\\vec n_1\\|\\,\\|\\vec n_2\\|}`,
      Figure: AngleFigure,
    }),
    ideia({
      title: "Distância até a reta",
      body: (
        <p>
          A distância de um ponto a uma reta é medida na <b>perpendicular</b>, que é a direção da normal. Substituir o ponto na equação e dividir pelo tamanho da
          normal dá essa medida direto: para P = (4, 3) e 3x + 4y − 4 = 0, |12 + 12 − 4| / 5 = <b>4</b>.
        </p>
      ),
      tex: `d(P, r) = \\frac{|a x_0 + b y_0 + c|}{\\sqrt{a^2 + b^2}}`,
      Figure: DistFigure,
    }),
    pergunta({
      title: "Cruzamento",
      prompt: "Em que ponto as retas $2x + y = 7$ e $x - y = -1$ se cruzam?",
      answer: { kind: "vector", value: [2, 3] },
      hint: "Some as duas equações: o $y$ some e sobra $3x = 6$.",
      explain: "Somando: $3x = 6$, então $x = 2$. Na segunda equação, $2 - y = -1$, logo $y = 3$. O ponto é $(2, 3)$.",
    }),
    pergunta({
      title: "Distância",
      prompt: "Qual é a distância do ponto $(1, 2)$ à reta $3x + 4y - 1 = 0$?",
      answer: { kind: "number", value: 2, label: "distância" },
      hint: "Substitua o ponto: $3\\cdot1 + 4\\cdot2 - 1$. Depois divida por $\\sqrt{3^2 + 4^2}$.",
      explain: "$\\dfrac{|3 + 8 - 1|}{5} = \\dfrac{10}{5} = 2$.",
    }),
  ],
};

export default lesson;
