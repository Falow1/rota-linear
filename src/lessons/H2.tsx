import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, texMatrix } from "../math/format";
import { lerpM } from "../math/mat";
import { useLoop } from "../player/anim";
import { Slider } from "../ui/controls";
import { Arrow, BasisGrid, Dot, Fill, ImplicitCurve, InfLine, Label, Plane2D, applyM, type P2 } from "../viz2d";

/* A = [2 1; 1 2] = PDP⁻¹, P = [1 −1; 1 1], D = diag(3, 1). */
const A = [[2, 1], [1, 2]];
const I2 = [[1, 0], [0, 1]];
const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const r2 = (x: number) => Math.round(x * 100) / 100 || 0;

function EigenGridFigure() {
  const t = useLoop(3200, 900);
  const M = lerpM(I2, A, t);
  const b1 = applyM(M, [1, 1]), b2 = applyM(M, [-1, 1]);
  return (
    <Plane2D x={[-3.5, 4]} y={[-1.5, 4.5]} label="Na grade dos autovetores, A só estica cada direção">
      <BasisGrid b1={[1, 1]} b2={[-1, 1]} n={4} color="var(--obj-muted)" opacity={0.25} />
      <Fill points={[[0, 0], b1, add(b1, b2), b2]} color="var(--obj4)" opacity={0.25} stroke />
      <Arrow tip={b1} color="var(--obj1)" label="3·(1, 1)" />
      <Arrow tip={b2} color="var(--obj2)" label="1·(−1, 1)" dir="nw" />
    </Plane2D>
  );
}

/* Base ortonormal girada de φ: b₁ = (cos φ, sen φ), b₂ = (−sen φ, cos φ). Em coordenadas dela, A vira PᵀAP. */
const basis = (deg: number): [P2, P2] => {
  const f = (deg * Math.PI) / 180;
  return [
    [Math.cos(f), Math.sin(f)],
    [-Math.sin(f), Math.cos(f)],
  ];
};
function inBasis(deg: number) {
  const [b1, b2] = basis(deg);
  const Ab1 = applyM(A, b1), Ab2 = applyM(A, b2);
  const d = (u: P2, v: P2) => u[0] * v[0] + u[1] * v[1];
  return [
    [r2(d(b1, Ab1)), r2(d(b1, Ab2))],
    [r2(d(b2, Ab1)), r2(d(b2, Ab2))],
  ];
}

function AlignTask({ s, done }: { s: { phi: number }; done: boolean }) {
  const [b1, b2] = basis(s.phi);
  const k = 1.4;
  const u: P2 = [k * b1[0], k * b1[1]], v: P2 = [k * b2[0], k * b2[1]];
  const Au = applyM(A, u), Av = applyM(A, v);
  return (
    <Plane2D x={[-4, 4.5]} y={[-1.5, 5]} label="Um quadrado na base girada e a imagem dele por A">
      <Fill points={[[0, 0], u, add(u, v), v]} color="var(--obj-muted)" opacity={0.2} stroke />
      <Fill points={[[0, 0], Au, add(Au, Av), Av]} color={done ? "var(--obj3)" : "var(--obj4)"} opacity={0.25} stroke />
      <Arrow tip={Au} color="var(--obj1)" weight={2} opacity={0.6} />
      <Arrow tip={Av} color="var(--obj2)" weight={2} opacity={0.6} />
      <Arrow tip={u} color="var(--obj1)" label="b₁" />
      <Arrow tip={v} color="var(--obj2)" label="b₂" />
    </Plane2D>
  );
}

function AlignControls({ s, set }: { s: { phi: number }; set: (p: { phi: number }) => void }) {
  return <Slider label="giro da base φ (graus)" value={s.phi} onChange={(phi) => set({ phi })} min={0} max={90} step={15} color="obj1" />;
}

const HYP = (x: number, y: number) => x * x + 4 * x * y + y * y - 1;

function ConicPredict({ revealed, t }: { revealed: boolean; t: number }) {
  return (
    <Plane2D x={[-3, 3]} y={[-3, 3]} label="Os eixos dos autovetores de [1 2; 2 1]">
      <InfLine p={[0, 0]} v={[1, 1]} color="var(--obj1)" dashed weight={1.5} />
      <InfLine p={[0, 0]} v={[1, -1]} color="var(--obj2)" dashed weight={1.5} />
      <Label at={[2, 2]} text="λ = 3" color="var(--obj1)" dir="se" />
      <Label at={[2, -2]} text="λ = −1" color="var(--obj2)" dir="ne" />
      {revealed && t > 0.3 && <ImplicitCurve F={HYP} color="var(--obj3)" weight={3} />}
    </Plane2D>
  );
}

/* B = [1 0,5; 0,5 1]: λ = 1,5 em (1, 1) e λ = 0,5 em (1, −1). Bᵏ(3, −1) = 1,5ᵏ(1, 1) + 2·0,5ᵏ(1, −1). */
const POW: P2[] = [0, 1, 2, 3, 4].map((k) => [1.5 ** k + 2 * 0.5 ** k, 1.5 ** k - 2 * 0.5 ** k]);

function PowerFigure() {
  return (
    <Plane2D x={[-1, 6]} y={[-2, 5.5]} label="Bᵏv para k = 0, 1, 2, 3, 4: a direção do maior autovalor domina">
      <InfLine p={[0, 0]} v={[1, 1]} color="var(--obj1)" dashed weight={1.5} />
      {POW.map((q, k) => (
        <Dot key={k} at={q} color={k === 0 ? "var(--obj2)" : "var(--obj4)"} r={5} label={k === 0 ? "v" : `B${"¹²³⁴"[k - 1]}v`} dir="se" />
      ))}
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Na régua dos autovetores",
      body: (
        <p>
          Se você medir tudo na base dos autovetores, a matriz A = [2 1; 1 2] só estica: 3 vezes ao longo de <b className="obj1">(1, 1)</b> e 1 vez ao longo de{" "}
          <b className="obj2">(−1, 1)</b>. Nessa régua, A vira a matriz diagonal D. A matriz P, com os autovetores nas colunas, faz a tradução.
        </p>
      ),
      tex: `A = PDP^{-1},\\qquad P = [${o1("\\vec v_1")}\\;${o2("\\vec v_2")}] = ${texMatrix([[1, -1], [1, 1]])},\\quad D = ${texMatrix([[3, 0], [0, 1]])}`,
      Figure: EigenGridFigure,
    }),
    tarefa({
      title: "Alinhe a régua",
      body: (
        <p>
          Gire a base <b className="obj1">b₁</b>, <b className="obj2">b₂</b> até a imagem do quadrado virar um retângulo alinhado com ela, sem entortar. A leitura
          mostra a matriz de A nessa base: o objetivo é ela ficar diagonal.
        </p>
      ),
      init: { phi: 0 },
      solve: { phi: 45 },
      goal: (s) => Math.abs(inBasis(s.phi)[0][1]) < 1e-6,
      readout: (s) => `[A]_{b} = ${texMatrix(inBasis(s.phi), { maxDen: 0 })}`,
      Scene: AlignTask,
      Controls: AlignControls,
      success: (
        <p>
          Com φ = 45°, a base é a dos autovetores e a matriz vira [3 0; 0 1]. Diagonalizar é isso: achar a régua em que a transformação só estica os eixos.
        </p>
      ),
    }),
    prever({
      title: "Elipse ou hipérbole?",
      question: (
        <p>
          A curva x² + 4xy + y² = 1 tem matriz [1 2; 2 1], com autovalores <b className="obj1">3</b> e <b className="obj2">−1</b>. Nos eixos dos autovetores, ela
          vira 3X² − Y² = 1. Que curva é?
        </p>
      ),
      options: ["Hipérbole", "Elipse", "Parábola", "Duas retas"],
      correct: 0,
      Figure: ConicPredict,
      why: (
        <p>
          Autovalores de sinais opostos dão um sinal + e um sinal −: <b>hipérbole</b>, com eixos nas direções dos autovetores. Se os dois fossem positivos, seria
          uma elipse.
        </p>
      ),
    }),
    ideia({
      title: "Potências ficam fáceis",
      body: (
        <p>
          A = PDP⁻¹ implica A² = PD²P⁻¹, A³ = PD³P⁻¹, e assim por diante: basta elevar a diagonal. Na figura, B = [1 ½; ½ 1] tem autovalores 1,5 e 0,5. Ao aplicar
          B várias vezes, a parte de autovalor 0,5 some e a de 1,5 cresce: os pontos se aproximam da reta do autovetor (1, 1).
        </p>
      ),
      tex: `A^k = PD^kP^{-1},\\qquad D^k = \\left[\\begin{array}{cc} \\lambda_1^k & 0 \\\\ 0 & \\lambda_2^k \\end{array}\\right]`,
      Figure: PowerFigure,
    }),
    pergunta({
      title: "Montando A",
      prompt: "Uma matriz $A$ tem autovetor $(1, 1)$ com $\\lambda = 3$ e autovetor $(1, -1)$ com $\\lambda = 1$. Qual é $A$?",
      answer: { kind: "matrix", value: [[2, 1], [1, 2]] },
      hint: `$A = PDP^{-1}$ com $P = ${texMatrix([[1, 1], [1, -1]])}$ e $D = ${texMatrix([[3, 0], [0, 1]])}$.`,
      explain: `$PD = ${texMatrix([[3, 1], [3, -1]])}$ e $P^{-1} = \\tfrac12 ${texMatrix([[1, 1], [1, -1]])}$, então $A = ${texMatrix([[2, 1], [1, 2]])}$.`,
    }),
    pergunta({
      title: "Determinante pela diagonal",
      prompt: "$A = PDP^{-1}$ com $D = \\left[\\begin{array}{cc} 2 & 0 \\\\ 0 & -1 \\end{array}\\right]$. Quanto vale $\\det A$?",
      answer: { kind: "number", value: -2, label: "$\\det A$" },
      hint: "$\\det A = \\det P\\,\\det D\\,\\det P^{-1}$, e $\\det P\\cdot\\det P^{-1} = 1$.",
      explain: "$\\det A = \\det D = 2\\cdot(-1) = -2$: o determinante é o produto dos autovalores.",
    }),
    pergunta({
      title: "Que curva?",
      prompt: "Que curva é $3x^2 + 2xy + 3y^2 = 1$?",
      answer: { kind: "choice", options: ["Elipse", "Hipérbole", "Parábola", "Nenhum ponto"], correct: 0 },
      hint: `A matriz é $${texMatrix([[3, 1], [1, 3]])}$. Ache o sinal dos autovalores: o produto é o determinante.`,
      explain: "Autovalores $4$ e $2$, os dois positivos: é uma elipse, com eixos nas direções $(1, 1)$ e $(1, -1)$.",
    }),
  ],
};

export default lesson;
