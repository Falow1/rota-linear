import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, o3, texLinear } from "../math/format";
import { Slider } from "../ui/controls";
import { Dot, ImplicitCurve, InfLine, Label, ParamCurve, Plane2D, type P2 } from "../viz2d";

function FamilyFigure() {
  return (
    <Plane2D x={[-8, 8]} y={[-5.5, 5]} label="Elipse, hipérbole e parábola, cada uma com o sinal de B² − 4AC">
      <ParamCurve xy={(t) => [-4.5 + 2 * Math.cos(t), 2.2 + 1.2 * Math.sin(t)]} domain={[0, 2 * Math.PI]} color="var(--obj1)" />
      <ParamCurve xy={(u) => [4 + Math.cosh(u), 2.2 + Math.sinh(u)]} domain={[-1.5, 1.5]} color="var(--obj2)" />
      <ParamCurve xy={(u) => [4 - Math.cosh(u), 2.2 + Math.sinh(u)]} domain={[-1.5, 1.5]} color="var(--obj2)" />
      <ParamCurve xy={(x) => [x, (x * x) / 4 - 4.8]} domain={[-4.2, 4.2]} color="var(--obj3)" />
      <Label at={[-4.5, 3.4]} text="B² − 4AC < 0" color="var(--obj1)" dir="n" />
      <Label at={[4, 4.4]} text="B² − 4AC > 0" color="var(--obj2)" dir="n" />
      <Label at={[0, -4.8]} text="B² − 4AC = 0" color="var(--obj3)" dir="s" />
    </Plane2D>
  );
}

/** 5x² − 6xy + 5y² = 8: elipse girada de 45°. */
const rotated = (deg: number) => {
  const th = (deg * Math.PI) / 180, c = Math.cos(th), s = Math.sin(th);
  const A = 5, B = -6, C = 5;
  return { A: A * c * c + B * c * s + C * s * s, B: 2 * (C - A) * c * s + B * (c * c - s * s), C: A * s * s - B * c * s + C * c * c, c, s };
};
const R2 = Math.SQRT1_2;
const tilted = (t: number): P2 => [2 * Math.cos(t) * R2 - Math.sin(t) * R2, 2 * Math.cos(t) * R2 + Math.sin(t) * R2];

function RotateTask({ s, done }: { s: { th: number }; done: boolean }) {
  const { c, s: sn } = rotated(s.th);
  return (
    <Plane2D x={[-3.5, 3.5]} y={[-3, 3]} label="Elipse 5x² − 6xy + 5y² = 8 e os eixos girados x′ e y′">
      <ParamCurve xy={tilted} domain={[0, 2 * Math.PI]} color="var(--obj1)" />
      <InfLine p={[0, 0]} v={[c, sn]} color={done ? "var(--obj3)" : "var(--obj2)"} weight={2.5} />
      <InfLine p={[0, 0]} v={[-sn, c]} color={done ? "var(--obj3)" : "var(--obj2)"} weight={2.5} />
      <Label at={[2.8 * c, 2.8 * sn]} text="x′" color="var(--obj2)" dir="se" />
      <Label at={[-2.4 * sn, 2.4 * c]} text="y′" color="var(--obj2)" dir="ne" />
    </Plane2D>
  );
}

function RotateControls({ s, set }: { s: { th: number }; set: (p: { th: number }) => void }) {
  return <Slider label="ângulo θ (graus)" value={s.th} onChange={(th) => set({ th })} min={0} max={90} step={15} color="obj2" />;
}

const PARABOLA = (x: number, y: number) => x * x + 4 * x * y + 4 * y * y - 6 * x + 3;

function DiscPredict({ revealed, t }: { revealed: boolean; t: number }) {
  return (
    <Plane2D x={[-2, 8]} y={[-5, 3]} label="A cônica x² + 4xy + 4y² − 6x + 3 = 0">
      {revealed && t > 0.4 && <ImplicitCurve F={PARABOLA} color="var(--obj3)" />}
    </Plane2D>
  );
}

function CenterFigure() {
  return (
    <Plane2D x={[-2, 6]} y={[-4, 2.5]} label="Elipse 4(x − 2)² + 9(y + 1)² = 36 com centro (2, −1)">
      <ParamCurve xy={(t) => [2 + 3 * Math.cos(t), -1 + 2 * Math.sin(t)]} domain={[0, 2 * Math.PI]} color="var(--obj1)" />
      <Dot at={[2, -1]} color="var(--obj2)" r={6} label="centro (2, −1)" dir="ne" />
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Uma equação para todas",
      body: (
        <p>
          Toda cônica cabe na equação Ax² + Bxy + Cy² + Dx + Ey + F = 0. Só os termos de grau 2 decidem o tipo, e um número resume tudo: o{" "}
          <b>discriminante</b> B² − 4AC. Negativo é <b className="obj1">elipse</b>, positivo é <b className="obj2">hipérbole</b>, zero é{" "}
          <b className="obj3">parábola</b>, fora alguns casos degenerados (um ponto, retas, nada).
        </p>
      ),
      tex: `Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0,\\qquad B^2 - 4AC \\;\\begin{cases} ${o1("< 0")} \\\\ ${o2("> 0")} \\\\ ${o3("= 0")} \\end{cases}`,
      Figure: FamilyFigure,
    }),
    tarefa({
      title: "Gire até o xy sumir",
      body: (
        <p>
          O termo <b>xy</b> aparece quando a cônica está torta em relação aos eixos. Gire os eixos <b className="obj2">x′ e y′</b> até a equação de 5x² − 6xy +
          5y² = 8 ficar sem o termo x′y′.
        </p>
      ),
      init: { th: 0 },
      solve: { th: 45 },
      goal: (s) => Math.abs(rotated(s.th).B) < 1e-9,
      readout: (s) => {
        const r = rotated(s.th);
        return `${texLinear([r.A, r.B, r.C], ["x'^2", "x'y'", "y'^2"], 0, { maxDen: 0, digits: 2 })} = 8`;
      },
      Scene: RotateTask,
      Controls: RotateControls,
      success: (
        <p>
          Com θ = 45°, a equação vira 2x′² + 8y′² = 8, ou x′²/4 + y′² = 1: uma elipse com a = 2 e b = 1. Em geral, o ângulo certo sai de cot 2θ = (A − C)/B; aqui A
          = C, então 2θ = 90°.
        </p>
      ),
    }),
    prever({
      title: "Só pelo discriminante",
      question: (
        <p>
          Sem desenhar: a equação <b>x² + 4xy + 4y² − 6x + 3 = 0</b> é de qual cônica?
        </p>
      ),
      options: ["Elipse", "Hipérbole", "Parábola"],
      correct: 2,
      Figure: DiscPredict,
      why: (
        <p>
          A = 1, B = 4, C = 4: B² − 4AC = 16 − 16 = <b>0</b>, então é uma parábola. A parte de grau 2 é um quadrado perfeito, (x + 2y)², o sinal típico da
          parábola.
        </p>
      ),
    }),
    ideia({
      title: "Completar quadrados acha o centro",
      body: (
        <p>
          Sem o termo xy, o centro aparece completando quadrados. Em 4x² + 9y² − 16x + 18y − 11 = 0, junte x com x e y com y: 4(x² − 4x) + 9(y² + 2y) = 11. Somando
          4·4 e 9·1 dos dois lados, fica 4(x − 2)² + 9(y + 1)² = 36: uma elipse de <b className="obj2">centro (2, −1)</b>.
        </p>
      ),
      tex: `4(x - 2)^2 + 9(y + 1)^2 = 36 \\iff \\frac{(x - 2)^2}{9} + \\frac{(y + 1)^2}{4} = 1`,
      Figure: CenterFigure,
    }),
    pergunta({
      title: "Classifique",
      prompt: "A equação $2x^2 + 3xy - 2y^2 + x - 1 = 0$ representa uma…",
      answer: { kind: "choice", options: ["Elipse", "Hipérbole", "Parábola"], correct: 1 },
      hint: "Calcule $B^2 - 4AC$ com $A = 2$, $B = 3$ e $C = -2$.",
      explain: "$B^2 - 4AC = 9 - 4\\cdot2\\cdot(-2) = 9 + 16 = 25 > 0$: hipérbole.",
    }),
    pergunta({
      title: "O centro",
      prompt: "Qual é o centro da circunferência $x^2 + y^2 - 4x + 6y - 3 = 0$?",
      answer: { kind: "vector", value: [2, -3] },
      hint: "Complete os quadrados: $x^2 - 4x = (x - 2)^2 - 4$ e $y^2 + 6y = (y + 3)^2 - 9$.",
      explain: "$(x - 2)^2 + (y + 3)^2 = 3 + 4 + 9 = 16$: centro $(2, -3)$ e raio $4$.",
    }),
  ],
};

export default lesson;
