import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, texMatrix } from "../math/format";
import { lerpM, rot2 } from "../math/mat";
import { useLoop } from "../player/anim";
import { Arrow, DraggablePoint, Dot, F_SHAPE, Fill, Plane2D, Segment, applyM, type P2 } from "../viz2d";

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

/** A figura vai da identidade até A = [2 1; 0 1] e volta. */
const A_DEMO = [[2, 1], [0, 1]];
function FollowFigure() {
  const t = useLoop(3200, 900);
  const M = lerpM(I2, A_DEMO, t);
  return (
    <Plane2D x={[-1.5, 4.5]} y={[-1, 3]} label="A figura acompanha as setas de e₁ e e₂">
      <Fill points={F_SHAPE} color="var(--obj-muted)" opacity={0.12} />
      <Fill points={shape(M)} color="var(--obj4)" opacity={0.3} stroke />
      <Arrow tip={[M[0][0], M[1][0]]} color="var(--obj1)" label="T(e₁)" dir="se" />
      <Arrow tip={[M[0][1], M[1][1]]} color="var(--obj2)" label="T(e₂)" dir="nw" />
    </Plane2D>
  );
}

const ROT90 = [[0, -1], [1, 0]];
type S = { a: number[]; b: number[] };
const matOf = (s: S) => [[s.a[0], s.b[0]], [s.a[1], s.b[1]]];

function BuildTask({ s, set, done }: { s: S; set: (p: Partial<S>) => void; done: boolean }) {
  const M = matOf(s);
  return (
    <Plane2D x={[-3, 3]} y={[-2, 3]} label="Arraste as imagens de e₁ e e₂; o contorno pontilhado é a figura girada">
      <Outline pts={shape(ROT90)} color="var(--text-3)" />
      <Fill points={shape(M)} color={done ? "var(--obj3)" : "var(--obj4)"} opacity={0.3} stroke />
      <Arrow tip={s.a as P2} color="var(--obj1)" label="T(e₁)" />
      <Arrow tip={s.b as P2} color="var(--obj2)" label="T(e₂)" />
      <DraggablePoint point={s.a as P2} onMove={(p) => set({ a: p })} color="var(--obj1)" />
      <DraggablePoint point={s.b as P2} onMove={(p) => set({ b: p })} color="var(--obj2)" />
    </Plane2D>
  );
}

const A_GUESS = [[2, -1], [1, 1]];
const GUESS_TRUTH: P2 = [1, 2];

function GuessFigure({ revealed, t, guess, setGuess }: { revealed: boolean; t: number; guess: P2 | null; setGuess: (p: P2) => void }) {
  const c1: P2 = [A_GUESS[0][0], A_GUESS[1][0]], c2: P2 = [A_GUESS[0][1], A_GUESS[1][1]];
  const k = Math.min(1, Math.max(0, t * 2 - 1));
  return (
    <Plane2D x={[-2, 4]} y={[-1.5, 3.5]} label="Imagens de e₁ e e₂; para onde vai (1, 1)?">
      <Arrow tip={c1} color="var(--obj1)" label="T(e₁) = (2, 1)" dir="se" />
      <Arrow tip={c2} color="var(--obj2)" label="T(e₂) = (−1, 1)" dir="nw" />
      <Dot at={[1, 1]} color="var(--obj-muted)" label="(1, 1)" dir="e" />
      {revealed && (
        <>
          <Arrow tail={c1} tip={[c1[0] + k * c2[0], c1[1] + k * c2[1]]} color="var(--obj2)" weight={2} dashed />
          {t > 0.98 && <Dot at={GUESS_TRUTH} color="var(--obj3)" r={6} label="T(1, 1) = (1, 2)" dir="ne" />}
        </>
      )}
      {guess &&
        (revealed ? (
          <Dot at={guess} color="var(--text-3)" label="seu palpite" dir="sw" />
        ) : (
          <DraggablePoint point={guess} onMove={setGuess} color="var(--text-3)" label="?" />
        ))}
    </Plane2D>
  );
}

function RotationFigure() {
  const t = useLoop(4000, 700);
  const R = rot2(t * Math.PI * 0.75);
  return (
    <Plane2D x={[-2.5, 2.5]} y={[-1.5, 2.5]} label="Rotação: e₁ e e₂ giram juntos e a figura vai junto">
      <Fill points={F_SHAPE} color="var(--obj-muted)" opacity={0.12} />
      <Fill points={shape(R)} color="var(--obj4)" opacity={0.3} stroke />
      <Arrow tip={[R[0][0], R[1][0]]} color="var(--obj1)" label="(cos θ, sen θ)" />
      <Arrow tip={[R[0][1], R[1][1]]} color="var(--obj2)" label="(−sen θ, cos θ)" />
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Siga e₁ e e₂",
      body: (
        <p>
          Uma matriz 2×2 é uma transformação do plano. Para descobrir o que ela faz, basta olhar para onde vão <b className="obj1">e₁ = (1, 0)</b> e{" "}
          <b className="obj2">e₂ = (0, 1)</b>: as imagens são as <b>colunas</b> da matriz. O resto vem junto, porque (x, y) = x·e₁ + y·e₂.
        </p>
      ),
      tex: `A = \\big[\\,${o1("T(\\vec e_1)")}\\;\\; ${o2("T(\\vec e_2)")}\\,\\big],\\qquad T(x, y) = x\\,${o1("T(\\vec e_1)")} + y\\,${o2("T(\\vec e_2)")}`,
      Figure: FollowFigure,
    }),
    tarefa({
      title: "Monte a rotação de 90°",
      body: (
        <p>
          Arraste as pontas de <b className="obj1">T(e₁)</b> e <b className="obj2">T(e₂)</b> para que a figura fique girada 90° no sentido anti-horário, em cima
          do contorno pontilhado.
        </p>
      ),
      init: { a: [1, 0], b: [0, 1] },
      solve: { a: [0, 1], b: [-1, 0] },
      goal: (s) => matOf(s).every((row, i) => row.every((x, j) => Math.abs(x - ROT90[i][j]) < 1e-9)),
      readout: (s) => `A = ${texMatrix(matOf(s), { maxDen: 0 })}`,
      Scene: BuildTask,
      success: (
        <p>
          e₁ vai para (0, 1) e e₂ vai para (−1, 0). Então a matriz da rotação de 90° é [0 −1; 1 0]: as colunas são os destinos.
        </p>
      ),
    }),
    prever({
      title: "Para onde vai (1, 1)?",
      question: (
        <p>
          A matriz leva <b className="obj1">e₁</b> em (2, 1) e <b className="obj2">e₂</b> em (−1, 1). Onde vai parar o ponto (1, 1)? Arraste até o seu palpite.
        </p>
      ),
      ghost: { start: [3, 3], truth: GUESS_TRUTH, tol: 0.6 },
      Figure: GuessFigure,
      why: (
        <p>
          (1, 1) = e₁ + e₂, então T(1, 1) = T(e₁) + T(e₂) = (2, 1) + (−1, 1) = <b>(1, 2)</b>. Emende as duas setas.
        </p>
      ),
    }),
    ideia({
      title: "Rotação de θ",
      body: (
        <p>
          Girar por θ leva e₁ ao ponto (cos θ, sen θ) do círculo, e e₂ ao ponto 90° adiante, (−sen θ, cos θ). Essas são as colunas da matriz de rotação. Com θ =
          90° sai de novo [0 −1; 1 0].
        </p>
      ),
      tex: `R_\\theta = \\left[\\begin{array}{cc} ${o1("\\cos\\theta")} & ${o2("-\\sin\\theta")} \\\\ ${o1("\\sin\\theta")} & ${o2("\\cos\\theta")} \\end{array}\\right]`,
      Figure: RotationFigure,
    }),
    pergunta({
      title: "Pelas imagens",
      prompt: "Uma transformação linear leva $\\vec e_1$ em $(3, 1)$ e $\\vec e_2$ em $(-1, 2)$. Qual é a matriz dela?",
      answer: { kind: "matrix", value: [[3, -1], [1, 2]] },
      hint: "As imagens viram as colunas, na ordem.",
      explain: `$${texMatrix([[3, -1], [1, 2]])}$: a 1ª coluna é $(3, 1)$ e a 2ª é $(-1, 2)$.`,
    }),
    pergunta({
      title: "Espelho",
      prompt: "Qual é a matriz da reflexão no eixo $x$?",
      answer: { kind: "matrix", value: [[1, 0], [0, -1]] },
      hint: "$\\vec e_1$ está no espelho e fica parado. $\\vec e_2$ aponta para cima: para onde vai?",
      explain: `$\\vec e_1 \\mapsto (1, 0)$ e $\\vec e_2 \\mapsto (0, -1)$, então a matriz é $${texMatrix([[1, 0], [0, -1]])}$.`,
    }),
    pergunta({
      title: "Aplicando",
      prompt: `Com $A = ${texMatrix([[1, 2], [3, 0]])}$, calcule $T(2, -1)$.`,
      answer: { kind: "vector", value: [0, 6] },
      hint: "$T(2, -1) = 2\\,T(\\vec e_1) - T(\\vec e_2) = 2(1, 3) - (2, 0)$.",
      explain: "$2(1, 3) - (2, 0) = (0, 6)$. É o mesmo que multiplicar linha por coluna.",
    }),
  ],
};

export default lesson;
