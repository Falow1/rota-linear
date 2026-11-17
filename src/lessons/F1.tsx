import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, o3, tex, texTuple } from "../math/format";
import { Slider } from "../ui/controls";
import { Arrow, BasisGrid, Dot, InfLine, Label, Plane2D, type P2 } from "../viz2d";

const V1: P2 = [2, 1], V2: P2 = [-1, 1];
const combo = (c1: number, c2: number): P2 => [c1 * V1[0] + c2 * V2[0], c1 * V1[1] + c2 * V2[1]];

function GridFigure() {
  const w = combo(2, 1);
  return (
    <Plane2D x={[-3, 5]} y={[-2, 5]} label="Grade de combinações de v₁ e v₂">
      <BasisGrid b1={V1} b2={V2} n={6} color="var(--obj4)" opacity={0.25} />
      <Arrow tip={combo(2, 0)} color="var(--obj1)" weight={2} opacity={0.5} />
      <Arrow tail={combo(2, 0)} tip={w} color="var(--obj2)" weight={2} opacity={0.5} />
      <Arrow tip={V1} color="var(--obj1)" label="v₁" dir="se" />
      <Arrow tip={V2} color="var(--obj2)" label="v₂" dir="nw" />
      <Dot at={w} color="var(--obj3)" r={6} label="2v₁ + v₂" dir="ne" />
    </Plane2D>
  );
}

const W: P2 = [1, 5];
type C = { c1: number; c2: number };
const plain = (x: number) => String(x).replace(".", ",").replace("-", "−");

function ReachTask({ s, done }: { s: C; done: boolean }) {
  const a = combo(s.c1, 0), b = combo(s.c1, s.c2);
  return (
    <Plane2D x={[-4, 5]} y={[-2, 6]} label="Combinação c₁v₁ + c₂v₂ e o alvo w">
      <BasisGrid b1={V1} b2={V2} n={6} color="var(--obj4)" opacity={0.2} />
      <Arrow tip={a} color="var(--obj1)" label={`${plain(s.c1)}·v₁`} dir="se" />
      <Arrow tail={a} tip={b} color="var(--obj2)" />
      <Arrow tip={b} color={done ? "var(--obj3)" : "var(--text-3)"} weight={4} />
      <Dot at={W} color="var(--obj3)" r={6} label="w = (1, 5)" dir="ne" />
    </Plane2D>
  );
}

function ReachControls({ s, set }: { s: C; set: (p: Partial<C>) => void }) {
  return (
    <>
      <Slider tex={o1("c_1")} value={s.c1} onChange={(c1) => set({ c1 })} min={-3} max={4} step={0.5} />
      <Slider tex={o2("c_2")} value={s.c2} onChange={(c2) => set({ c2 })} min={-3} max={4} step={0.5} />
    </>
  );
}

const D1: P2 = [2, 1], D2: P2 = [-4, -2];

function ParallelPredict({ revealed, t }: { revealed: boolean; t: number }) {
  const pts: [number, number][] = [[1, 1], [-1, 0.5], [0.5, 1], [2, 0.5], [-1, -1]];
  return (
    <Plane2D x={[-5, 5]} y={[-3.5, 3.5]} label="Dois vetores paralelos e as combinações deles">
      {revealed && <InfLine p={[0, 0]} v={D1} color="var(--obj3)" weight={4} opacity={0.6 * t} />}
      <Arrow tip={D2} color="var(--obj2)" label="v₂" />
      <Arrow tip={D1} color="var(--obj1)" label="v₁" />
      {revealed &&
        t > 0.5 &&
        pts.map(([a, b], i) => {
          const q: P2 = [a * D1[0] + b * D2[0], a * D1[1] + b * D2[1]];
          return <Dot key={i} at={q} color="var(--obj3)" r={4} />;
        })}
    </Plane2D>
  );
}

function BaseFigure() {
  return (
    <Plane2D x={[-4, 4]} y={[-3, 3]} label="Dois vetores independentes: a grade cobre o plano">
      <BasisGrid b1={[1, 1]} b2={[1, -1]} n={8} color="var(--obj4)" opacity={0.3} />
      <Arrow tip={[1, 1]} color="var(--obj1)" label="(1, 1)" />
      <Arrow tip={[1, -1]} color="var(--obj2)" label="(1, −1)" dir="se" />
      <Label at={[-3.5, 2.6]} text="det = −2 ≠ 0" color="var(--obj4)" dir="e" />
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Esticar e somar",
      body: (
        <p>
          Uma <b>combinação linear</b> de <b className="obj1">v₁</b> e <b className="obj2">v₂</b> é c₁v₁ + c₂v₂: estique cada um por um número e some. Cada
          escolha de c₁ e c₂ dá um ponto da grade inclinada. O conjunto de todos esses pontos é o <b>espaço gerado</b>, ou span.
        </p>
      ),
      tex: `${o3("\\vec w")} = c_1\\,${o1("\\vec v_1")} + c_2\\,${o2("\\vec v_2")}`,
      Figure: GridFigure,
    }),
    tarefa({
      title: "Alcance o alvo",
      body: (
        <p>
          Com <b className="obj1">v₁ = (2, 1)</b> e <b className="obj2">v₂ = (−1, 1)</b>, ajuste <b className="obj1">c₁</b> e <b className="obj2">c₂</b> até a
          combinação chegar em <b className="obj3">w = (1, 5)</b>.
        </p>
      ),
      init: { c1: 1, c2: 1 },
      solve: { c1: 2, c2: 3 },
      goal: (s) => Math.abs(combo(s.c1, s.c2)[0] - W[0]) < 1e-9 && Math.abs(combo(s.c1, s.c2)[1] - W[1]) < 1e-9,
      readout: (s) => `${tex(s.c1)}\\,${o1("\\vec v_1")} + ${tex(s.c2)}\\,${o2("\\vec v_2")} = ${texTuple(combo(s.c1, s.c2))}`,
      Scene: ReachTask,
      Controls: ReachControls,
      success: (
        <p>
          c₁ = 2 e c₂ = 3. Nas contas, é o sistema 2c₁ − c₂ = 1 e c₁ + c₂ = 5. Como v₁ e v₂ não são paralelos, dá para alcançar <b>qualquer</b> ponto do plano.
        </p>
      ),
    }),
    prever({
      title: "E se forem paralelos?",
      question: (
        <p>
          Agora <b className="obj1">v₁ = (2, 1)</b> e <b className="obj2">v₂ = (−4, −2)</b>. Que pontos as combinações c₁v₁ + c₂v₂ alcançam?
        </p>
      ),
      options: ["Só uma reta pela origem", "O plano inteiro", "Só a origem", "Duas retas"],
      correct: 0,
      Figure: ParallelPredict,
      why: (
        <p>
          v₂ = −2v₁, então toda combinação é um múltiplo de v₁: o span é a <b>reta</b> na direção (2, 1). Os vetores são <b>linearmente dependentes</b>: um não
          acrescenta nada ao outro.
        </p>
      ),
    }),
    ideia({
      title: "Independentes geram mais",
      body: (
        <p>
          Vetores são <b>linearmente independentes</b> (LI) quando nenhum é combinação dos outros, ou seja, quando c₁v₁ + c₂v₂ = 0 só acontece com c₁ = c₂ = 0. No
          plano, dois vetores são LI exatamente quando o determinante deles não é zero, e aí geram o plano todo.
        </p>
      ),
      tex: `\\det[\\vec v_1\\;\\vec v_2] \\ne 0 \\iff \\vec v_1, \\vec v_2 \\text{ LI} \\iff \\text{geram } \\mathbb{R}^2`,
      Figure: BaseFigure,
    }),
    pergunta({
      title: "Os coeficientes",
      prompt: "Escreva $(4, 1)$ como $c_1(1, 1) + c_2(2, -1)$.",
      answer: { kind: "vector", value: [2, 1], names: ["c₁", "c₂"] },
      hint: "Monte o sistema: $c_1 + 2c_2 = 4$ e $c_1 - c_2 = 1$.",
      explain: "Subtraindo as equações: $3c_2 = 3$, então $c_2 = 1$ e $c_1 = 2$.",
    }),
    pergunta({
      title: "Dependentes",
      prompt: "Para que valor de $k$ os vetores $(2, k)$ e $(3, 6)$ são linearmente dependentes?",
      answer: { kind: "number", value: 4, label: "$k$" },
      hint: "Determinante zero: $2\\cdot6 - 3k = 0$.",
      explain: "$12 - 3k = 0 \\Rightarrow k = 4$. Aí $(2, 4)$ e $(3, 6)$ são múltiplos de $(1, 2)$.",
    }),
  ],
};

export default lesson;
