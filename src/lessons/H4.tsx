import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, o3, tex, texTuple } from "../math/format";
import { Slider } from "../ui/controls";
import { Arrow, ParamCurve, Plane2D, RightAngle, Segment, type P2 } from "../viz2d";

const dot = (u: P2, v: P2) => u[0] * v[0] + u[1] * v[1];
const sc = (k: number, v: P2): P2 => [k * v[0], k * v[1]];
const minus = (u: P2, v: P2): P2 => [u[0] - v[0], u[1] - v[1]];

/* v₁ = (3, 1), v₂ = (2, 2): proj = 0,8·v₁ = (2,4; 0,8), u₂ = (−0,4; 1,2). */
const SV1: P2 = [3, 1], SV2: P2 = [2, 2];
const SPROJ = sc(dot(SV2, SV1) / dot(SV1, SV1), SV1);
const SU2 = minus(SV2, SPROJ);

function ShadowFigure() {
  return (
    <Plane2D x={[-1, 3.8]} y={[-0.8, 2.6]} label="v₂ menos a sombra dele sobre v₁ dá um vetor perpendicular a v₁">
      <Segment a={SPROJ} b={SV2} color="var(--obj3)" dashed weight={2} />
      <RightAngle at={SPROJ} u={minus(SV2, SPROJ)} v={sc(-1, SV1)} s={0.2} />
      <Arrow tip={SPROJ} color="var(--obj4)" label="proj" weight={4} dir="se" />
      <Arrow tip={SV1} color="var(--obj1)" label="v₁ = u₁" dir="e" />
      <Arrow tip={SV2} color="var(--obj2)" label="v₂" />
      <Arrow tip={SU2} color="var(--obj3)" label="u₂" dir="nw" />
    </Plane2D>
  );
}

/* Tarefa: v₁ = (2, 1), v₂ = (1, 3); u₂ = v₂ − k·v₁ é perpendicular a v₁ quando k = 1. */
const V1: P2 = [2, 1], V2: P2 = [1, 3];

function StraightenTask({ s, done }: { s: { k: number }; done: boolean }) {
  const kv = sc(s.k, V1), u2 = minus(V2, kv);
  return (
    <Plane2D x={[-2.5, 4]} y={[-1.5, 3.5]} label="u₂ = v₂ − k·v₁ e o vetor v₁">
      <Segment a={kv} b={V2} color="var(--obj-muted)" dashed weight={2} />
      <Arrow tip={kv} color="var(--obj4)" label="k·v₁" weight={4} dir="se" />
      <Arrow tip={V1} color="var(--obj1)" label="v₁" dir="se" />
      <Arrow tip={V2} color="var(--obj2)" label="v₂" />
      <Arrow tip={u2} color={done ? "var(--obj3)" : "var(--obj5)"} label="u₂" weight={4} />
      {done && <RightAngle at={[0, 0]} u={V1} v={u2} s={0.25} />}
    </Plane2D>
  );
}

function StraightenControls({ s, set }: { s: { k: number }; set: (p: { k: number }) => void }) {
  return <Slider tex={o1("k")} value={s.k} onChange={(k) => set({ k })} min={-1} max={2} step={0.25} />;
}

/* v₂ paralelo a v₁: a sobra some. */
const PV1: P2 = [2, 1], PV2: P2 = [3, 1.5];

function ParallelPredict({ revealed, t }: { revealed: boolean; t: number }) {
  const rest = sc(revealed ? 1 - t : 1, PV2);
  return (
    <Plane2D x={[-0.8, 3.6]} y={[-0.8, 2.2]} label="E se v₂ for paralelo a v₁?">
      <Arrow tip={PV2} color="var(--obj2)" label="v₂" weight={5} opacity={0.5} />
      <Arrow tip={PV1} color="var(--obj1)" label="v₁" dir="se" />
      {revealed && <Arrow tip={rest} color="var(--obj3)" label={t > 0.9 ? "u₂ = 0" : "v₂ − proj"} weight={3} />}
    </Plane2D>
  );
}

function UnitFigure() {
  const r5 = Math.sqrt(5);
  return (
    <Plane2D x={[-2, 2.6]} y={[-1.3, 2.4]} label="Dividindo pela norma, os vetores ortogonais caem no círculo unitário">
      <ParamCurve xy={(t) => [Math.cos(t), Math.sin(t)]} domain={[0, 2 * Math.PI]} color="var(--obj-muted)" weight={2} dashed />
      <Arrow tip={V1} color="var(--obj1)" weight={2} opacity={0.45} />
      <Arrow tip={[-1, 2]} color="var(--obj3)" weight={2} opacity={0.45} />
      <Arrow tip={[2 / r5, 1 / r5]} color="var(--obj1)" label="e₁" dir="se" />
      <Arrow tip={[-1 / r5, 2 / r5]} color="var(--obj3)" label="e₂" dir="w" />
      <RightAngle at={[0, 0]} u={V1} v={[-1, 2]} s={0.2} />
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Tirar a sombra",
      body: (
        <p>
          Dois vetores tortos, <b className="obj1">v₁</b> e <b className="obj2">v₂</b>, geram o plano mas não são perpendiculares. Gram–Schmidt endireita: fica com
          u₁ = v₁ e tira de v₂ a <b className="obj4">sombra</b> dele sobre u₁ (a projeção). O que sobra, <b className="obj3">u₂</b>, é perpendicular a u₁.
        </p>
      ),
      tex: `${o3("\\vec u_2")} = ${o2("\\vec v_2")} - \\underbrace{\\frac{${o2("\\vec v_2")}\\cdot ${o1("\\vec u_1")}}{${o1("\\vec u_1")}\\cdot ${o1("\\vec u_1")}}\\,${o1("\\vec u_1")}}_{\\operatorname{proj}}`,
      Figure: ShadowFigure,
    }),
    tarefa({
      title: "Endireite v₂",
      body: (
        <p>
          Com <b className="obj1">v₁ = (2, 1)</b> e <b className="obj2">v₂ = (1, 3)</b>, ajuste <b className="obj1">k</b> até u₂ = v₂ − k·v₁ ficar perpendicular a v₁.
        </p>
      ),
      init: { k: 0 },
      solve: { k: 1 },
      goal: (s) => Math.abs(dot(minus(V2, sc(s.k, V1)), V1)) < 1e-9,
      readout: (s) => `\\vec u_2 = ${texTuple(minus(V2, sc(s.k, V1)))},\\qquad \\vec u_2\\cdot ${o1("\\vec v_1")} = ${tex(dot(minus(V2, sc(s.k, V1)), V1))}`,
      Scene: StraightenTask,
      Controls: StraightenControls,
      success: (
        <p>
          k = (v₂·v₁)/(v₁·v₁) = 5/5 = 1, e u₂ = (−1, 2). Esse k é exatamente o coeficiente da projeção: Gram–Schmidt escolhe o k que zera o produto escalar.
        </p>
      ),
    }),
    prever({
      title: "E se forem paralelos?",
      question: (
        <p>
          Agora <b className="obj2">v₂ = (3; 1,5)</b> é paralelo a <b className="obj1">v₁ = (2, 1)</b>. O que sobra de v₂ depois de tirar a projeção sobre v₁?
        </p>
      ),
      options: ["O vetor nulo", "Um vetor perpendicular a v₁", "O próprio v₂", "Um vetor unitário"],
      correct: 0,
      Figure: ParallelPredict,
      why: (
        <p>
          v₂ é todo “sombra”: a projeção é ele mesmo, e sobra <b>u₂ = 0</b>. Quando Gram–Schmidt dá o vetor nulo, é sinal de que os vetores eram linearmente
          dependentes.
        </p>
      ),
    }),
    ideia({
      title: "Normalizar e continuar",
      body: (
        <p>
          Para uma base <b>ortonormal</b>, divida cada uᵢ pela norma. Com três vetores, o terceiro perde a sombra sobre u₁ e também sobre u₂. Aqui, (2, 1) e (−1, 2)
          têm norma √5 e viram e₁ = (2, 1)/√5 e e₂ = (−1, 2)/√5.
        </p>
      ),
      tex: `\\vec e_i = \\frac{\\vec u_i}{\\|\\vec u_i\\|},\\qquad \\vec u_3 = \\vec v_3 - \\operatorname{proj}_{\\vec u_1}\\vec v_3 - \\operatorname{proj}_{\\vec u_2}\\vec v_3`,
      Figure: UnitFigure,
    }),
    pergunta({
      title: "Projeção",
      prompt: "Calcule a projeção de $(1, 3)$ sobre $(1, 1)$.",
      answer: { kind: "vector", value: [2, 2] },
      hint: "$\\dfrac{(1, 3)\\cdot(1, 1)}{(1, 1)\\cdot(1, 1)}\\,(1, 1)$.",
      explain: "$\\dfrac{4}{2}(1, 1) = (2, 2)$.",
    }),
    pergunta({
      title: "Um passo em 3D",
      prompt: "Gram–Schmidt com $\\vec v_1 = (1, 0, 1)$ e $\\vec v_2 = (1, 1, 0)$: calcule $\\vec u_2$ (com $\\vec u_1 = \\vec v_1$).",
      answer: { kind: "vector", value: [0.5, 1, -0.5] },
      hint: "$\\vec v_2\\cdot\\vec u_1 = 1$ e $\\vec u_1\\cdot\\vec u_1 = 2$.",
      explain: "$\\vec u_2 = (1, 1, 0) - \\tfrac12(1, 0, 1) = \\left(\\tfrac12, 1, -\\tfrac12\\right)$. Confira: $\\vec u_2\\cdot\\vec u_1 = \\tfrac12 - \\tfrac12 = 0$.",
    }),
    pergunta({
      title: "Unitário",
      prompt: "Qual é o vetor unitário na direção de $(3, -4)$?",
      answer: { kind: "vector", value: [0.6, -0.8] },
      hint: "A norma é $\\sqrt{9 + 16}$.",
      explain: "$\\|(3, -4)\\| = 5$, então o unitário é $\\left(\\tfrac35, -\\tfrac45\\right)$.",
    }),
  ],
};

export default lesson;
