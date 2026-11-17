import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { fmtDeg, o1, o2, tex, texTuple } from "../math/format";
import { angle, dot, proj } from "../math/vec";
import { useLoop } from "../player/anim";
import { AngleArc, Arrow, DraggablePoint, InfLine, Label, Plane2D, RightAngle, Segment, bisector, type P2 } from "../viz2d";

function TwoVectors() {
  const u: P2 = [3, 1], v: P2 = [1, 2];
  return (
    <Plane2D x={[-1, 4.5]} y={[-1, 3]} label="Vetores u = (3, 1) e v = (1, 2)">
      <AngleArc from={u} to={v} r={0.7} />
      <Label at={bisector(u, v, 0.95)} text="θ" color="var(--obj5)" dir="e" dist={0} />
      <Arrow tip={u} color="var(--obj1)" label="u = (3, 1)" />
      <Arrow tip={v} color="var(--obj2)" label="v = (1, 2)" />
    </Plane2D>
  );
}

/** v gira em volta de u; a legenda mostra o sinal de u·v. */
function SignLoop() {
  const t = useLoop(5200, 700);
  const a = t * Math.PI;
  const u: P2 = [2.5, 0];
  const v: P2 = [2 * Math.cos(a), 2 * Math.sin(a)];
  const d = dot(u, v);
  const s = Math.abs(d) < 0.15 ? "= 0: ângulo reto" : d > 0 ? "> 0: ângulo agudo" : "< 0: ângulo obtuso";
  const color = Math.abs(d) < 0.15 ? "var(--obj5)" : d > 0 ? "var(--obj3)" : "var(--obj2)";
  return (
    <Plane2D
      x={[-3, 3]}
      y={[-1, 3]}
      label="v girando em volta de u"
      overlay={
        <div className="graph-overlay bl">
          <span className="graph-legend" style={{ color }}>
            u · v {s}
          </span>
        </div>
      }
    >
      <AngleArc from={u} to={v} r={0.6} color={color} />
      <Arrow tip={u} color="var(--obj1)" label="u" />
      <Arrow tip={v} color="var(--obj2)" label="v" />
    </Plane2D>
  );
}

const PU: P2 = [2, 1], PV: P2 = [-1, 3];

function SignPredict({ revealed, t }: { revealed: boolean; t: number }) {
  const th = angle(PU, PV)!;
  return (
    <Plane2D x={[-2.5, 3]} y={[-1, 3.5]} label="u = (2, 1) e v = (−1, 3)">
      {revealed && <AngleArc from={PU} to={PV} r={0.7 * t + 0.01} />}
      {revealed && t > 0.95 && <Label at={bisector(PU, PV, 1.15)} text={fmtDeg(th)} color="var(--obj5)" dir="ne" dist={0} />}
      <Arrow tip={PU} color="var(--obj1)" label="u" />
      <Arrow tip={PV} color="var(--obj2)" label="v" />
    </Plane2D>
  );
}

const OU: P2 = [3, 1];

function OrthoTask({ s, set, done }: { s: { v: number[] }; set: (p: { v: number[] }) => void; done: boolean }) {
  const v = s.v as P2;
  return (
    <Plane2D x={[-4, 4]} y={[-3, 4]} label="Arraste v até ficar perpendicular a u">
      <InfLine p={[0, 0]} v={[-OU[1], OU[0]]} color="var(--obj-muted)" dashed weight={1} opacity={0.35} />
      {done && <RightAngle at={[0, 0]} u={OU} v={v} s={0.4} color="var(--obj3)" />}
      <AngleArc from={OU} to={v} r={0.6} />
      <Arrow tip={OU} color="var(--obj1)" label="u" />
      <Arrow tip={v} color="var(--obj2)" label="v" />
      <DraggablePoint point={v} onMove={(p) => set({ v: p })} color="var(--obj2)" />
    </Plane2D>
  );
}

function Shadow() {
  const u: P2 = [2, 3], v: P2 = [4, 1];
  const p = proj(u, v) as P2;
  return (
    <Plane2D x={[-1, 5]} y={[-1, 4]} label="Projeção de u sobre v">
      <InfLine p={[0, 0]} v={v} color="var(--obj-muted)" dashed weight={1} opacity={0.5} />
      <Segment a={u} b={p} color="var(--obj4)" dashed weight={2} />
      <RightAngle at={p} u={[u[0] - p[0], u[1] - p[1]]} v={[-v[0], -v[1]]} />
      <Arrow tip={v} color="var(--obj2)" label="v" />
      <Arrow tip={p} color="var(--obj3)" label="proj" weight={5} dir="s" />
      <Arrow tip={u} color="var(--obj1)" label="u" />
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Um número que compara direções",
      body: (
        <p>
          O <b>produto escalar</b> de dois vetores é um número: multiplique as coordenadas correspondentes e some. Para{" "}
          <b className="obj1">u = (3, 1)</b> e <b className="obj2">v = (1, 2)</b>: 3·1 + 1·2 = 5.
        </p>
      ),
      tex: `${o1("\\vec u")}\\cdot${o2("\\vec v")} = u_1v_1 + u_2v_2`,
      Figure: TwoVectors,
    }),
    ideia({
      title: "O sinal conta o ângulo",
      body: (
        <p>
          O mesmo número também vale ‖u‖‖v‖cos θ. Como os tamanhos são positivos, quem decide o sinal é o cosseno: <b className="obj3">positivo</b> se o
          ângulo é agudo, <b className="obj5">zero</b> se é reto e <b className="obj2">negativo</b> se é obtuso. Veja v girar.
        </p>
      ),
      tex: `${o1("\\vec u")}\\cdot${o2("\\vec v")} = \\|${o1("\\vec u")}\\|\\,\\|${o2("\\vec v")}\\|\\cos\\theta`,
      Figure: SignLoop,
    }),
    prever({
      title: "Quase reto…",
      question: (
        <p>
          Para <b className="obj1">u = (2, 1)</b> e <b className="obj2">v = (−1, 3)</b>, o ângulo parece bem perto de 90°. Qual é o sinal de u · v?
        </p>
      ),
      options: ["Positivo: o ângulo é agudo", "Zero: o ângulo é reto", "Negativo: o ângulo é obtuso"],
      correct: 0,
      Figure: SignPredict,
      why: (
        <p>
          u · v = 2·(−1) + 1·3 = <b>1 &gt; 0</b>. O ângulo é agudo, mas por pouco: cerca de {fmtDeg(angle(PU, PV)!)}. A conta enxerga o que o olho não
          garante.
        </p>
      ),
    }),
    tarefa({
      title: "Deixe os vetores perpendiculares",
      body: (
        <p>
          Arraste a ponta de <b className="obj2">v</b> até que u · v seja <b>zero</b>. Esse é o teste de perpendicularidade.
        </p>
      ),
      init: { v: [1, 3] },
      solve: { v: [-1, 3] },
      goal: (s) => Math.abs(dot(OU, s.v as P2)) < 1e-9 && Math.hypot(...(s.v as P2)) > 0.1,
      readout: (s) => `${o1("\\vec u")}\\cdot${o2(texTuple(s.v as number[]))} = ${tex(dot(OU, s.v as P2))}`,
      Scene: OrthoTask,
      success: (
        <p>
          u · v = 0 ⇔ u e v são perpendiculares. Qualquer múltiplo de (−1, 3) também serve: (1, −3), (−2, 6)… todos estão na mesma reta tracejada.
        </p>
      ),
    }),
    ideia({
      title: "Projeção: a sombra de u",
      body: (
        <p>
          A <b className="obj3">projeção</b> de u sobre v é a “sombra” de u na reta de v, com a luz caindo perpendicular. O que sobra,{" "}
          <span className="obj4">u − proj</span>, é perpendicular a v. A fórmula usa o próprio produto escalar.
        </p>
      ),
      tex: `\\operatorname{proj}_{${o2("\\vec v")}}${o1("\\vec u")} = \\dfrac{${o1("\\vec u")}\\cdot${o2("\\vec v")}}{${o2("\\vec v")}\\cdot${o2("\\vec v")}}\\,${o2("\\vec v")}`,
      Figure: Shadow,
    }),
    pergunta({
      title: "Na conta",
      prompt: "Calcule $\\vec u\\cdot\\vec v$ para $\\vec u = (4, 2)$ e $\\vec v = (1, 3)$.",
      answer: { kind: "number", value: 10, label: "$\\vec u\\cdot\\vec v$" },
      hint: "Multiplique 4 por 1, multiplique 2 por 3 e some.",
      explain: "$4\\cdot1 + 2\\cdot3 = 4 + 6 = 10$.",
    }),
    pergunta({
      title: "Ângulo",
      prompt: "Qual é o ângulo entre $\\vec u = (2, 0)$ e $\\vec v = (1, \\sqrt3)$? Responda em graus.",
      answer: { kind: "number", value: 60, tol: 0.5, unit: "°", label: "$\\theta$" },
      hint: "$\\cos\\theta = \\dfrac{\\vec u\\cdot\\vec v}{\\|\\vec u\\|\\,\\|\\vec v\\|}$. Aqui $\\vec u\\cdot\\vec v = 2$ e os dois vetores têm tamanho 2.",
      explain: "$\\cos\\theta = \\dfrac{2}{2\\cdot2} = \\dfrac12$, então $\\theta = 60^\\circ$.",
    }),
  ],
};

export default lesson;

