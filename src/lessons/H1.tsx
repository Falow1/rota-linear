import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o3, tex, texMatrix, texTuple } from "../math/format";
import { useLoop } from "../player/anim";
import { Slider } from "../ui/controls";
import { Arrow, InfLine, ParamCurve, Plane2D, applyM, type P2 } from "../viz2d";

/* A = [2 1; 1 2]: λ = 3 na direção (1, 1) e λ = 1 na direção (1, −1). */
const A = [[2, 1], [1, 2]];
const parallel = (u: P2, v: P2) => Math.abs(u[0] * v[1] - u[1] * v[0]) < 1e-6;
const r2 = (x: number) => Math.round(x * 100) / 100 || 0;

function SweepFigure() {
  const t = useLoop(6000, 0);
  const th = t * Math.PI * 2;
  const v: P2 = [1.3 * Math.cos(th), 1.3 * Math.sin(th)];
  const Av = applyM(A, v);
  const hit = parallel(v, Av) || Math.abs(Math.sin(th - Math.PI / 4)) < 0.06 || Math.abs(Math.cos(th - Math.PI / 4)) < 0.06;
  return (
    <Plane2D x={[-4.5, 4.5]} y={[-4, 4]} label="Um vetor v girando e a imagem Av: só em duas direções eles ficam alinhados">
      <InfLine p={[0, 0]} v={[1, 1]} color="var(--obj3)" dashed weight={1.5} opacity={0.6} />
      <InfLine p={[0, 0]} v={[1, -1]} color="var(--obj3)" dashed weight={1.5} opacity={0.6} />
      <Arrow tip={Av} color={hit ? "var(--obj3)" : "var(--obj4)"} label="Av" weight={4} />
      <Arrow tip={v} color="var(--obj1)" label="v" />
    </Plane2D>
  );
}

const vOf = (deg: number): P2 => [2 * Math.cos((deg * Math.PI) / 180), 2 * Math.sin((deg * Math.PI) / 180)];

function AlignTask({ s, done }: { s: { th: number }; done: boolean }) {
  const v = vOf(s.th), Av = applyM(A, v);
  return (
    <Plane2D x={[-5, 6.5]} y={[-3.5, 6.5]} label="O vetor v na direção θ e a imagem Av">
      <Arrow tip={Av} color={done ? "var(--obj3)" : "var(--obj4)"} label="Av" weight={4} />
      <Arrow tip={v} color="var(--obj1)" label="v" />
    </Plane2D>
  );
}

function AlignControls({ s, set }: { s: { th: number }; set: (p: { th: number }) => void }) {
  return <Slider label="direção θ (graus)" value={s.th} onChange={(th) => set({ th })} min={0} max={90} step={15} color="obj1" />;
}

/* B = [−0,5 −1,5; −1,5 −0,5]: λ = −2 na direção (1, 1). */
function FlipPredict({ revealed, t }: { revealed: boolean; t: number }) {
  const k = revealed ? 1 - 3 * t : 1;
  return (
    <Plane2D x={[-3, 2.5]} y={[-3, 2.5]} label="Um autovetor v com autovalor −2">
      <InfLine p={[0, 0]} v={[1, 1]} color="var(--obj-muted)" dashed weight={1.5} />
      {revealed && <Arrow tip={[k, k]} color="var(--obj3)" label={t > 0.95 ? "Av = −2v" : undefined} weight={4} />}
      <Arrow tip={[1, 1]} color="var(--obj1)" label="v" dir="se" />
    </Plane2D>
  );
}

function EllipseFigure() {
  const s = Math.SQRT1_2;
  return (
    <Plane2D x={[-3.5, 3.5]} y={[-3, 3]} label="O círculo unitário vira uma elipse; os eixos dela são os autovetores">
      <ParamCurve xy={(t) => [Math.cos(t), Math.sin(t)]} domain={[0, 2 * Math.PI]} color="var(--obj-muted)" weight={2} dashed />
      <ParamCurve xy={(t) => applyM(A, [Math.cos(t), Math.sin(t)])} domain={[0, 2 * Math.PI]} color="var(--obj4)" weight={3} />
      <Arrow tip={[3 * s, 3 * s]} color="var(--obj3)" label="λ = 3" />
      <Arrow tip={[s, -s]} color="var(--obj1)" label="λ = 1" dir="se" />
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Quase todo vetor muda de direção",
      body: (
        <p>
          Aplique A = [2 1; 1 2] em vetores de todas as direções. Quase sempre <b className="obj4">Av</b> aponta para outro lado. Mas em duas direções especiais,
          Av fica na mesma reta de <b className="obj1">v</b>: a matriz só estica. Esses v são os <b className="obj3">autovetores</b>, e o fator de esticada é o{" "}
          <b>autovalor</b> λ.
        </p>
      ),
      tex: `A\\,${o1("\\vec v")} = \\lambda\\,${o1("\\vec v")},\\qquad ${o1("\\vec v")} \\ne \\vec 0`,
      Figure: SweepFigure,
    }),
    tarefa({
      title: "Ache uma direção que só estica",
      body: (
        <p>
          Gire <b className="obj1">v</b> com o controle θ até <b className="obj4">Av</b> ficar na mesma direção de v.
        </p>
      ),
      init: { th: 0 },
      solve: { th: 45 },
      goal: (s) => s.th > 0 && s.th < 90 && parallel(vOf(s.th), applyM(A, vOf(s.th))),
      readout: (s) => {
        const v = vOf(s.th), Av = applyM(A, v);
        return `A${o1("\\vec v")} = ${texTuple([r2(Av[0]), r2(Av[1])])}${parallel(v, Av) ? ` = ${o3(tex(r2(Av[0] / v[0])))}\\,${o1("\\vec v")}` : ""}`;
      },
      Scene: AlignTask,
      Controls: AlignControls,
      success: (
        <p>
          Em θ = 45°, v aponta na direção (1, 1) e A(1, 1) = (3, 3) = <b>3</b>·(1, 1). Então (1, 1) é autovetor com autovalor 3. A outra direção especial é (1, −1),
          com autovalor 1.
        </p>
      ),
    }),
    prever({
      title: "Autovalor negativo",
      question: (
        <p>
          <b className="obj1">v</b> é autovetor de uma matriz A com autovalor <b>λ = −2</b>. O que A faz com v?
        </p>
      ),
      options: ["Inverte o sentido e dobra o tamanho", "Encolhe pela metade", "Gira 90°", "Não muda nada"],
      correct: 0,
      Figure: FlipPredict,
      why: (
        <p>
          Av = −2v: a seta continua na <b>mesma reta</b>, mas aponta para o outro lado e fica duas vezes maior. Autovalor negativo vira o sentido; |λ| diz quanto
          estica.
        </p>
      ),
    }),
    ideia({
      title: "Como achar os autovalores",
      body: (
        <p>
          Av = λv quer dizer (A − λI)v = 0 com v ≠ 0. Isso só acontece quando A − λI achata o plano, ou seja, quando det(A − λI) = 0. Em 2×2, isso vira uma equação
          do 2º grau. Para A = [2 1; 1 2]: λ² − 4λ + 3 = 0, então λ = 3 e λ = 1. Na figura, o círculo unitário vira uma elipse esticada 3 vezes ao longo de (1, 1).
        </p>
      ),
      tex: `\\det(A - \\lambda I) = \\lambda^2 - (\\operatorname{tr} A)\\,\\lambda + \\det A = 0`,
      Figure: EllipseFigure,
    }),
    pergunta({
      title: "Os autovalores",
      prompt: `Quais são os autovalores de $${texMatrix([[4, 1], [2, 3]])}$?`,
      answer: { kind: "vector", value: [5, 2], names: ["λ₁ (maior)", "λ₂ (menor)"] },
      hint: "Traço $7$ e determinante $4\\cdot3 - 1\\cdot2 = 10$: resolva $\\lambda^2 - 7\\lambda + 10 = 0$.",
      explain: "$\\lambda^2 - 7\\lambda + 10 = (\\lambda - 5)(\\lambda - 2)$: os autovalores são $5$ e $2$.",
    }),
    pergunta({
      title: "Um autovetor",
      prompt: `Dê um autovetor de $${texMatrix([[4, 1], [2, 3]])}$ para $\\lambda = 2$.`,
      answer: { kind: "direction", value: [1, -2] },
      hint: "$A - 2I = \\left[\\begin{array}{cc} 2 & 1 \\\\ 2 & 1 \\end{array}\\right]$: resolva $2x + y = 0$.",
      explain: "$2x + y = 0$ dá $y = -2x$. Com $x = 1$: $(1, -2)$, ou qualquer múltiplo.",
    }),
    pergunta({
      title: "Qual é o λ?",
      prompt: `$\\vec v = (1, 1)$ é autovetor de $${texMatrix([[3, 1], [2, 2]])}$. Qual é o autovalor associado?`,
      answer: { kind: "number", value: 4, label: "$\\lambda$" },
      hint: "Calcule $A\\vec v$ e compare com $\\vec v$.",
      explain: "$A(1, 1) = (4, 4) = 4\\,(1, 1)$, então $\\lambda = 4$.",
    }),
  ],
};

export default lesson;
