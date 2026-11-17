import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, o3, texMatrix, texTuple } from "../math/format";
import { Arrow, BasisGrid, Dot, DraggablePoint, Label, Plane2D, Segment, type P2 } from "../viz2d";

const comb = (b1: P2, b2: P2, c: P2): P2 => [c[0] * b1[0] + c[1] * b2[0], c[0] * b1[1] + c[1] * b2[1]];

/* Base B da lição: b₁ = (1, 1), b₂ = (−1, 1). [v]_B = ((x + y)/2, (y − x)/2). */
const B1: P2 = [1, 1], B2: P2 = [-1, 1];
const coordB = (v: P2): P2 => [(v[0] + v[1]) / 2, (v[1] - v[0]) / 2];

function RulerFigure() {
  const v: P2 = [1, 3];
  const a = comb(B1, B2, [2, 0]);
  return (
    <Plane2D x={[-3, 4]} y={[-1.5, 4.5]} label="O mesmo ponto lido na régua padrão e na régua inclinada da base B">
      <BasisGrid b1={B1} b2={B2} n={6} color="var(--obj4)" opacity={0.35} />
      <Arrow tip={a} color="var(--obj1)" weight={2} opacity={0.55} />
      <Arrow tail={a} tip={v} color="var(--obj2)" weight={2} opacity={0.55} />
      <Arrow tip={B1} color="var(--obj1)" label="b₁" dir="se" />
      <Arrow tip={B2} color="var(--obj2)" label="b₂" dir="sw" />
      <Dot at={v} color="var(--obj3)" r={6} label="v = (1, 3)" dir="ne" />
      <Label at={[1.1, 2.4]} text="na base B: (2, 1)" color="var(--obj4)" dir="e" />
    </Plane2D>
  );
}

const TARGET_B: P2 = [1, -2];
const TARGET = comb(B1, B2, TARGET_B);

function PlaceTask({ s, set, done }: { s: { v: number[] }; set: (p: { v: number[] }) => void; done: boolean }) {
  const v = s.v as P2;
  return (
    <Plane2D x={[-3, 4.5]} y={[-3, 3]} label="Arraste o ponto até as coordenadas pedidas na base B">
      <BasisGrid b1={B1} b2={B2} n={7} color="var(--obj4)" opacity={0.35} />
      <Arrow tip={B1} color="var(--obj1)" label="b₁" dir="nw" />
      <Arrow tip={B2} color="var(--obj2)" label="b₂" dir="sw" />
      <DraggablePoint point={v} onMove={(p) => set({ v: p })} color={done ? "var(--obj3)" : "var(--obj5)"} />
    </Plane2D>
  );
}

/* Base C da previsão: c₁ = (1, 0), c₂ = (1, 2). */
const C1: P2 = [1, 0], C2: P2 = [1, 2];
const GUESS_B: P2 = [2, 1];
const GUESS_TRUTH = comb(C1, C2, GUESS_B);

function GhostPredict({ revealed, t, guess, setGuess }: { revealed: boolean; t: number; guess: P2 | null; setGuess: (p: P2) => void }) {
  const step = comb(C1, C2, [2 * Math.min(1, t * 2), 0]);
  const end = comb(C1, C2, [2, Math.max(0, t * 2 - 1)]);
  return (
    <Plane2D x={[-1.5, 5]} y={[-1.5, 3.5]} label="Onde fica o ponto de coordenadas (2, 1) na base c₁, c₂?">
      <BasisGrid b1={C1} b2={C2} n={4} color="var(--obj4)" opacity={0.25} />
      <Arrow tip={C1} color="var(--obj1)" label="c₁" dir="s" />
      <Arrow tip={C2} color="var(--obj2)" label="c₂" dir="nw" />
      {revealed && (
        <>
          <Arrow tip={step} color="var(--obj1)" weight={2} opacity={0.6} />
          {t > 0.5 && <Arrow tail={step} tip={end} color="var(--obj2)" weight={2} opacity={0.6} />}
          {t > 0.98 && <Dot at={GUESS_TRUTH} color="var(--obj3)" r={6} label="(4, 2)" dir="ne" />}
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

function MatrixFigure() {
  const v: P2 = [1, 3];
  return (
    <Plane2D x={[-3, 4]} y={[-1.5, 4.5]} label="As colunas da matriz P são os vetores da base">
      <BasisGrid b1={B1} b2={B2} n={6} color="var(--obj4)" opacity={0.2} />
      <Segment a={[0, 0]} b={v} color="var(--obj3)" dashed />
      <Arrow tip={B1} color="var(--obj1)" label="coluna 1" dir="se" />
      <Arrow tip={B2} color="var(--obj2)" label="coluna 2" dir="sw" />
      <Dot at={v} color="var(--obj3)" r={6} label="P·(2, 1) = (1, 3)" dir="ne" />
    </Plane2D>
  );
}

const P_B = [[1, -1], [1, 1]];

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Outra régua",
      body: (
        <p>
          Coordenadas dependem da régua. Com a <b>base B</b> formada por <b className="obj1">b₁ = (1, 1)</b> e <b className="obj2">b₂ = (−1, 1)</b>, o ponto{" "}
          <b className="obj3">v = (1, 3)</b> é 2b₁ + 1b₂. Então, na base B, as coordenadas dele são <b>[v]<sub>B</sub> = (2, 1)</b>: o mesmo ponto, outra leitura.
        </p>
      ),
      tex: `${o3("\\vec v")} = 2\\,${o1("\\vec b_1")} + 1\\,${o2("\\vec b_2")} \\quad\\Longleftrightarrow\\quad [\\vec v]_B = (2, 1)`,
      Figure: RulerFigure,
    }),
    tarefa({
      title: "Ache o ponto pela base",
      body: (
        <p>
          Arraste o ponto até ele ter coordenadas <b>[v]<sub>B</sub> = (1, −2)</b>: ande 1 vez <b className="obj1">b₁</b> e −2 vezes <b className="obj2">b₂</b> pela
          grade inclinada.
        </p>
      ),
      init: { v: [0, 0] },
      solve: { v: TARGET },
      goal: (s) => Math.hypot(s.v[0] - TARGET[0], s.v[1] - TARGET[1]) < 1e-9,
      readout: (s) => `\\vec v = ${texTuple(s.v)}\\qquad [\\vec v]_B = ${texTuple(coordB(s.v as P2))}`,
      Scene: PlaceTask,
      success: (
        <p>
          v = 1·(1, 1) − 2·(−1, 1) = <b>(3, −1)</b>. Na régua padrão, o mesmo ponto é (3, −1); na base B, é (1, −2).
        </p>
      ),
    }),
    prever({
      title: "Palpite na grade",
      question: (
        <p>
          Com a base <b className="obj1">c₁ = (1, 0)</b>, <b className="obj2">c₂ = (1, 2)</b>, onde fica o ponto de coordenadas <b>(2, 1)</b> nessa base?
          Arraste o ponto até o seu palpite.
        </p>
      ),
      ghost: { start: [-1, 2.5], truth: GUESS_TRUTH, tol: 0.6 },
      Figure: GhostPredict,
      why: (
        <p>
          2·(1, 0) + 1·(1, 2) = <b>(4, 2)</b>. Ande duas vezes c₁ e uma vez c₂. É só seguir a grade da base, como se ela fosse o quadriculado.
        </p>
      ),
    }),
    ideia({
      title: "A matriz que traduz",
      body: (
        <p>
          Coloque os vetores da base como colunas de uma matriz P. Multiplicar P pelas coordenadas na base dá o vetor na régua padrão. Para o caminho de volta, use
          a inversa: [v]<sub>B</sub> = P⁻¹v. Aqui, P·(2, 1) = (1, 3).
        </p>
      ),
      tex: `P = [${o1("\\vec b_1")}\\;${o2("\\vec b_2")}] = ${texMatrix(P_B)},\\qquad ${o3("\\vec v")} = P\\,[\\vec v]_B,\\qquad [\\vec v]_B = P^{-1}${o3("\\vec v")}`,
      Figure: MatrixFigure,
    }),
    pergunta({
      title: "Coordenadas na base",
      prompt: "Na base $\\vec b_1 = (1, 1)$, $\\vec b_2 = (1, -1)$, quais são as coordenadas de $(5, 1)$?",
      answer: { kind: "vector", value: [3, 2], names: ["c₁", "c₂"] },
      hint: "Resolva $c_1 + c_2 = 5$ e $c_1 - c_2 = 1$.",
      explain: "Somando: $2c_1 = 6$, então $c_1 = 3$ e $c_2 = 2$. Confira: $3(1, 1) + 2(1, -1) = (5, 1)$.",
    }),
    pergunta({
      title: "De volta à régua padrão",
      prompt: "Com $\\vec b_1 = (1, 2)$ e $\\vec b_2 = (3, 1)$, o vetor $\\vec v$ tem $[\\vec v]_B = (2, -1)$. Quanto vale $\\vec v$?",
      answer: { kind: "vector", value: [-1, 3] },
      hint: "$\\vec v = 2\\vec b_1 - 1\\vec b_2$.",
      explain: "$2(1, 2) - (3, 1) = (2 - 3,\\; 4 - 1) = (-1, 3)$.",
    }),
    pergunta({
      title: "A matriz de volta",
      prompt: "Para $\\vec b_1 = (2, 1)$ e $\\vec b_2 = (1, 1)$, qual matriz transforma $\\vec v$ em $[\\vec v]_B$?",
      answer: { kind: "matrix", value: [[1, -1], [-1, 2]] },
      hint: `É $P^{-1}$, com $P = ${texMatrix([[2, 1], [1, 1]])}$. O determinante é $1$.`,
      explain: `Com $\\det P = 1$: troque o 2 com o 1 da diagonal e mude o sinal dos outros. $P^{-1} = ${texMatrix([[1, -1], [-1, 2]])}$.`,
    }),
  ],
};

export default lesson;
