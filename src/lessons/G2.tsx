import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, o3, texMatrix } from "../math/format";
import { lerpM, mul } from "../math/mat";
import { useLoop } from "../player/anim";
import { MatrixInput } from "../ui/controls";
import { F_SHAPE, Fill, Label, Plane2D, Segment, applyM, type P2 } from "../viz2d";

const shape = (M: number[][]) => F_SHAPE.map((p) => applyM(M, p));
const I2 = [[1, 0], [0, 1]];

function Outline({ pts, color }: { pts: P2[]; color: string }) {
  return (
    <>
      {pts.map((p, i) => (
        <Segment key={i} a={p} b={pts[(i + 1) % pts.length]} color={color} dashed weight={2.5} />
      ))}
    </>
  );
}

/* A: giro de 90°; B: reflexão no eixo x. */
const ROT = [[0, -1], [1, 0]], REF = [[1, 0], [0, -1]];
const BA = mul(REF, ROT);

function ChainFigure() {
  const t = useLoop(4200, 900);
  const M = t < 0.5 ? lerpM(I2, ROT, t * 2) : lerpM(ROT, BA, t * 2 - 1);
  return (
    <Plane2D x={[-2.5, 2.5]} y={[-2.5, 2.5]} label="Primeiro gira (A), depois espelha no eixo x (B)">
      <Fill points={F_SHAPE} color="var(--obj-muted)" opacity={0.12} />
      <Outline pts={shape(ROT)} color="var(--obj1)" />
      <Fill points={shape(M)} color="var(--obj3)" opacity={0.3} stroke />
      <Label at={[-2.3, 2.2]} text={t < 0.5 ? "aplicando A" : "aplicando B"} color={t < 0.5 ? "var(--obj1)" : "var(--obj2)"} dir="e" />
    </Plane2D>
  );
}

/* A = [2 1; 1 1], det 1. A⁻¹ = [1 −1; −1 2]. */
const A = [[2, 1], [1, 1]];
const INV = [[1, -1], [-1, 2]];
const same = (M: number[][], N: number[][]) => M.every((r, i) => r.every((x, j) => Math.abs(x - N[i][j]) < 1e-9));

function UndoTask({ s, done }: { s: { M: number[][] }; done: boolean }) {
  return (
    <Plane2D x={[-1.5, 4.5]} y={[-1, 4]} label="A figura depois de A e da sua matriz; o contorno é a figura original">
      <Fill points={shape(A)} color="var(--obj1)" opacity={0.12} />
      <Outline pts={F_SHAPE} color="var(--text-3)" />
      <Fill points={shape(mul(s.M, A))} color={done ? "var(--obj3)" : "var(--obj4)"} opacity={0.35} stroke />
      <Label at={applyM(A, [0, 2.1])} text="depois de A" color="var(--obj1)" dir="e" />
    </Plane2D>
  );
}

function UndoControls({ s, set }: { s: { M: number[][] }; set: (p: { M: number[][] }) => void }) {
  return <MatrixInput value={s.M} onChange={(M) => set({ M })} label="M =" />;
}

const SHEAR = [[1, 1.5], [0, 1]];
const SQUARE: P2[] = [[0, 0], [1, 0], [1, 1], [0, 1]];

function ShearPredict({ revealed, t }: { revealed: boolean; t: number }) {
  const loop = useLoop(3000, 800);
  const k = revealed ? 1 : loop;
  const M = lerpM(I2, SHEAR, k);
  const pts = SQUARE.map((p) => applyM(M, p));
  return (
    <Plane2D x={[-0.8, 3.2]} y={[-0.8, 1.9]} label="O quadrado unitário inclinado pelo cisalhamento">
      <Fill points={SQUARE} color="var(--obj-muted)" opacity={0.15} stroke />
      <Fill points={pts} color="var(--obj4)" opacity={0.3} stroke />
      {revealed && t > 0.4 && (
        <>
          <Segment a={[1.5, 0]} b={[1.5, 1]} color="var(--obj3)" dashed weight={2.5} />
          <Label at={[0.5, 0]} text="base 1" color="var(--obj1)" dir="s" />
          <Label at={[1.5, 0.5]} text="altura 1" color="var(--obj3)" dir="e" />
        </>
      )}
      {revealed && t > 0.9 && <Label at={[1.6, 1.55]} text="área 1 · det = 1" color="var(--obj3)" dir="e" />}
    </Plane2D>
  );
}

function SquashFigure() {
  const t = useLoop(3000, 900);
  const P = lerpM(I2, [[1, 0.5], [0, 0]], t);
  const pts = SQUARE.map((p) => applyM(P, p));
  return (
    <Plane2D x={[-0.8, 2.5]} y={[-0.8, 1.6]} label="Uma projeção achata o quadrado num segmento: não dá para desfazer">
      <Fill points={SQUARE} color="var(--obj-muted)" opacity={0.15} stroke />
      <Fill points={pts} color="var(--obj5)" opacity={0.3} stroke />
      {t > 0.95 && <Label at={[0.75, 0]} text="det = 0" color="var(--obj5)" dir="n" />}
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Uma depois da outra",
      body: (
        <p>
          Aplicar <b className="obj1">A</b> e depois <b className="obj2">B</b> é aplicar a matriz <b className="obj3">BA</b>. A ordem de escrita é ao contrário
          da ordem em que as coisas acontecem: quem está mais perto do vetor age primeiro. Na figura, A gira 90° e B espelha no eixo x.
        </p>
      ),
      tex: `${o2("B")}\\big(${o1("A")}\\vec v\\big) = (${o3("BA")})\\,\\vec v,\\qquad ${o3("BA")} = ${texMatrix(REF)}${texMatrix(ROT)} = ${texMatrix(BA)}`,
      Figure: ChainFigure,
    }),
    tarefa({
      title: "Desfaça a transformação",
      body: (
        <p>
          A matriz <b className="obj1">A = [2 1; 1 1]</b> deformou a figura. Digite uma matriz M que, aplicada depois de A, devolva a figura ao contorno original.
          Dica: det A = 1.
        </p>
      ),
      init: { M: [[1, 0], [0, 1]] },
      solve: { M: INV },
      goal: (s) => same(mul(s.M, A), I2),
      readout: (s) => `MA = ${texMatrix(mul(s.M, A), { maxDen: 0 })}`,
      Scene: UndoTask,
      Controls: UndoControls,
      success: (
        <p>
          M = A⁻¹ = [1 −1; −1 2]. MA = I: a inversa desfaz exatamente o que A fez. Com det A = 1, basta trocar a diagonal e mudar o sinal das outras entradas.
        </p>
      ),
    }),
    prever({
      title: "Inclinar muda a área?",
      question: (
        <p>
          O <b>cisalhamento</b> [1 1,5; 0 1] inclina o quadrado unitário, que vira um paralelogramo. O que acontece com a área?
        </p>
      ),
      options: ["Continua 1", "Aumenta, porque a figura ficou mais comprida", "Diminui, porque a figura ficou mais fina", "Depende de quanto inclinou"],
      correct: 0,
      Figure: ShearPredict,
      why: (
        <p>
          A base continua 1 e a altura continua 1: a área é <b>1</b>. O cisalhamento inclina, mas não muda a área. O determinante confirma: 1·1 − 1,5·0 = 1.
        </p>
      ),
    }),
    ideia({
      title: "Determinantes encadeiam",
      body: (
        <p>
          Cada transformação multiplica as áreas por |det|. Em sequência, os fatores se multiplicam: det(BA) = det B · det A. E a inversa divide de volta. Quando
          det A = 0, a matriz achata o plano numa reta: pontos diferentes vão para o mesmo lugar, e não existe inversa.
        </p>
      ),
      tex: `\\det(BA) = \\det B\\,\\det A,\\qquad \\det(A^{-1}) = \\frac{1}{\\det A}`,
      Figure: SquashFigure,
    }),
    pergunta({
      title: "Composição",
      prompt: `Primeiro aplicamos $A = ${texMatrix([[0, -1], [1, 0]])}$ (giro de 90°) e depois $B = ${texMatrix([[0, 1], [1, 0]])}$ (reflexão em $y = x$). Qual é a matriz da composta?`,
      answer: { kind: "matrix", value: [[1, 0], [0, -1]] },
      hint: "A composta é $BA$: $B$ à esquerda, $A$ à direita.",
      explain: `$BA = ${texMatrix([[1, 0], [0, -1]])}$: girar 90° e depois espelhar em $y = x$ dá a reflexão no eixo $x$.`,
    }),
    pergunta({
      title: "Determinante do produto",
      prompt: "Se $\\det A = 3$ e $\\det B = -2$, quanto vale $\\det(AB)$?",
      answer: { kind: "number", value: -6, label: "$\\det(AB)$" },
      hint: "O determinante do produto é o produto dos determinantes.",
      explain: "$3\\cdot(-2) = -6$. As áreas ficam 6 vezes maiores, e o sinal negativo diz que a figura foi espelhada.",
    }),
    pergunta({
      title: "Desfazendo o cisalhamento",
      prompt: `Qual matriz desfaz o cisalhamento $${texMatrix([[1, 2], [0, 1]])}$?`,
      answer: { kind: "matrix", value: [[1, -2], [0, 1]] },
      hint: "O cisalhamento empurra $x$ por $2y$. Para desfazer, empurre de volta.",
      explain: `$${texMatrix([[1, -2], [0, 1]])}$. Confira: o produto das duas dá a identidade.`,
    }),
  ],
};

export default lesson;
