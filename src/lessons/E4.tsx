import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { texMatrix } from "../math/format";
import { mul } from "../math/mat";
import { MatrixInput } from "../ui/controls";
import { F_SHAPE, Fill, Label, Plane2D, Segment, applyM, type P2 } from "../viz2d";

const A = [[1, 2], [3, 4]], B = [[5, 6], [7, 8]];
const ROWCOL = `${texMatrix(A, { cellClass: (i) => (i === 0 ? "obj1" : null) })}${texMatrix(B, { cellClass: (_i, j) => (j === 1 ? "obj2" : null) })} = ${texMatrix(mul(A, B), { cellClass: (i, j) => (i === 0 && j === 1 ? "obj3" : null) })}`;

/* A: cisalhamento, B: giro de 90°. */
const SH = [[1, 1], [0, 1]], ROT = [[0, -1], [1, 0]];
const AB = mul(SH, ROT), BA = mul(ROT, SH);
const shape = (M: number[][]) => F_SHAPE.map((p) => applyM(M, p));

function Outline({ pts, color }: { pts: P2[]; color: string }) {
  return (
    <>
      {pts.map((p, i) => (
        <Segment key={i} a={p} b={pts[(i + 1) % pts.length]} color={color} dashed weight={2.5} />
      ))}
    </>
  );
}

function BuildTask({ s }: { s: { M: number[][] } }) {
  return (
    <Plane2D x={[-3.5, 3]} y={[-2, 3]} label="A figura transformada pela sua matriz e o alvo AB">
      <Fill points={F_SHAPE} color="var(--obj-muted)" opacity={0.15} />
      <Outline pts={shape(AB)} color="var(--text-3)" />
      <Fill points={shape(s.M)} color="var(--obj3)" opacity={0.35} stroke />
      <Label at={applyM(AB, [0, 2.1])} text="alvo AB" color="var(--text-3)" dir="w" />
    </Plane2D>
  );
}

function BuildControls({ s, set }: { s: { M: number[][] }; set: (p: { M: number[][] }) => void }) {
  return <MatrixInput value={s.M} onChange={(M) => set({ M })} label="AB =" />;
}

function OrderPredict({ revealed, t }: { revealed: boolean; t: number }) {
  return (
    <Plane2D x={[-3.5, 3]} y={[-2, 3]} label="A figura depois de AB e depois de BA">
      <Fill points={shape(AB)} color="var(--obj1)" opacity={0.3} stroke />
      <Label at={applyM(AB, [0, 2.1])} text="AB" color="var(--obj1)" dir="w" />
      {revealed && t > 0.3 && (
        <>
          <Fill points={shape(BA)} color="var(--obj2)" opacity={0.3} stroke />
          <Label at={applyM(BA, [0, 2.1])} text="BA" color="var(--obj2)" dir="n" />
        </>
      )}
    </Plane2D>
  );
}

const same = (M: number[][], N: number[][]) => M.every((r, i) => r.every((x, j) => Math.abs(x - N[i][j]) < 1e-9));

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Linha vezes coluna",
      body: (
        <p>
          Cada entrada de AB vem de uma <b className="obj1">linha de A</b> e uma <b className="obj2">coluna de B</b>: multiplique termo a termo e some. A entrada
          da linha 1, coluna 2 é 1·6 + 2·8 = <b className="obj3">22</b>. Por isso o número de colunas de A precisa ser igual ao número de linhas de B.
        </p>
      ),
      tex: ROWCOL,
    }),
    tarefa({
      title: "Monte o produto",
      body: (
        <p>
          A = [1 1; 0 1] inclina a figura, e B = [0 −1; 1 0] gira 90°. Calcule AB entrada por entrada e digite. A figura colorida mostra o efeito da sua matriz; o
          contorno pontilhado é o alvo.
        </p>
      ),
      init: { M: [[1, 0], [0, 1]] },
      solve: { M: AB },
      goal: (s) => same(s.M, AB),
      readout: (s) => `${texMatrix(s.M, { maxDen: 0 })}`,
      Scene: BuildTask,
      Controls: BuildControls,
      success: (
        <p>
          AB = [1 −1; 1 0]. Aplicar AB num vetor é aplicar primeiro <b>B</b> (girar) e depois <b>A</b> (inclinar): a matriz da direita age primeiro.
        </p>
      ),
    }),
    prever({
      title: "E na outra ordem?",
      question: <p>Com as mesmas A (inclinar) e B (girar), BA dá o mesmo que AB?</p>,
      options: ["Sim, sempre dá o mesmo", "Não: a ordem muda o resultado", "Só dá diferente se as matrizes não forem quadradas"],
      correct: 1,
      Figure: OrderPredict,
      why: (
        <p>
          BA = [0 −1; 1 1] ≠ AB. Inclinar e depois girar não é o mesmo que girar e depois inclinar. O produto de matrizes <b>não é comutativo</b>.
        </p>
      ),
    }),
    ideia({
      title: "Transpor e inverter",
      body: (
        <p>
          A <b>transposta</b> Aᵀ troca linhas por colunas. A <b>inversa</b> A⁻¹ desfaz A: AA⁻¹ = I, e só existe quando det A ≠ 0. As duas invertem a ordem de um
          produto. Para 2×2 há uma fórmula direta.
        </p>
      ),
      tex: `(AB)^T = B^TA^T,\\qquad (AB)^{-1} = B^{-1}A^{-1},\\qquad \\left[\\begin{array}{cc} a & b \\\\ c & d \\end{array}\\right]^{-1} = \\frac{1}{ad - bc}\\left[\\begin{array}{cc} d & -b \\\\ -c & a \\end{array}\\right]`,
    }),
    pergunta({
      title: "Produto",
      prompt: "Calcule $\\left[\\begin{array}{cc} 1 & 2 \\\\ 3 & 4 \\end{array}\\right]\\left[\\begin{array}{cc} 0 & 1 \\\\ 1 & 0 \\end{array}\\right]$.",
      answer: { kind: "matrix", value: [[2, 1], [4, 3]] },
      hint: "Entrada (1, 1): linha $(1, 2)$ vezes coluna $(0, 1)$, ou seja, $1\\cdot0 + 2\\cdot1$.",
      explain: "$\\left[\\begin{array}{cc} 2 & 1 \\\\ 4 & 3 \\end{array}\\right]$: multiplicar à direita por essa matriz troca as colunas de lugar.",
    }),
    pergunta({
      title: "Inversa",
      prompt: "Calcule a inversa de $\\left[\\begin{array}{cc} 2 & 1 \\\\ 5 & 3 \\end{array}\\right]$.",
      answer: { kind: "matrix", value: [[3, -1], [-5, 2]] },
      hint: "O determinante é $2\\cdot3 - 1\\cdot5 = 1$. Troque 2 com 3 e mude o sinal de 1 e 5.",
      explain: `$\\det = 1$, então a inversa é $${texMatrix([[3, -1], [-5, 2]])}$. Confira: multiplicando pela original dá a identidade.`,
    }),
    pergunta({
      title: "Transposta",
      prompt: "Qual é a transposta de $\\left[\\begin{array}{ccc} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\end{array}\\right]$?",
      answer: { kind: "matrix", value: [[1, 4], [2, 5], [3, 6]] },
      hint: "A 1ª linha vira a 1ª coluna, a 2ª linha vira a 2ª coluna. O resultado é 3×2.",
      explain: `$${texMatrix([[1, 4], [2, 5], [3, 6]])}$`,
    }),
  ],
};

export default lesson;
