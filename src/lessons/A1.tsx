import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { fmt, o1, o2, o3, texTuple } from "../math/format";
import { useLoop } from "../player/anim";
import { Arrow, Dot, DraggablePoint, Fill, Label, Plane2D, Segment, type P2 } from "../viz2d";

const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const same = (a: P2, b: P2) => Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;

function Components() {
  return (
    <Plane2D x={[-1, 5]} y={[-1, 4]} label="Vetor u = (3, 2) com suas componentes">
      <Segment a={[0, 0]} b={[3, 0]} color="var(--obj5)" dashed weight={2.5} />
      <Segment a={[3, 0]} b={[3, 2]} color="var(--obj5)" dashed weight={2.5} />
      <Label at={[1.5, 0]} text="3 para a direita" color="var(--obj5)" dir="s" />
      <Label at={[3, 1]} text="2 para cima" color="var(--obj5)" dir="e" />
      <Arrow tip={[3, 2]} color="var(--obj1)" label="u = (3, 2)" weight={4} />
    </Plane2D>
  );
}

/** v desliza da origem até a ponta de u: a soma é emendar as setas. */
function SumSlide() {
  const t = useLoop(1800, 1400);
  const u: P2 = [3, 1], v: P2 = [1, 2.5];
  const tail: P2 = [u[0] * t, u[1] * t];
  return (
    <Plane2D x={[-1, 5.5]} y={[-1, 4.5]} label="Soma de vetores pela regra do paralelogramo">
      <Fill points={[[0, 0], u, add(u, v), v]} color="var(--obj3)" opacity={0.1 * t} />
      <Arrow tip={u} color="var(--obj1)" label="u" />
      <Arrow tip={v} color="var(--obj2)" label="v" opacity={0.35} />
      <Arrow tail={tail} tip={add(tail, v)} color="var(--obj2)" label={t > 0.9 ? "v" : undefined} />
      {t > 0.98 && <Arrow tip={add(u, v)} color="var(--obj3)" label="u + v" weight={4} />}
    </Plane2D>
  );
}

const U: P2 = [3, 2];

function SumTask({ s, set }: { s: { v: number[] }; set: (p: { v: number[] }) => void }) {
  const v = s.v as P2;
  const w = add(U, v);
  return (
    <Plane2D x={[-2, 7]} y={[-3, 5]} label="Arraste a ponta de v">
      <Segment a={U} b={w} color="var(--obj2)" dashed weight={1.5} opacity={0.6} />
      <Arrow tip={U} color="var(--obj1)" label="u" />
      <Arrow tip={v} color="var(--obj2)" label="v" />
      <Arrow tip={w} color="var(--obj3)" label="u + v" weight={4} />
      <Label at={[5, 1]} text="alvo" color="var(--text-3)" dir="ne" />
      <Segment a={[4.8, 1]} b={[5.2, 1]} color="var(--text-3)" weight={3} />
      <Segment a={[5, 0.8]} b={[5, 1.2]} color="var(--text-3)" weight={3} />
      <DraggablePoint point={v} onMove={(p) => set({ v: p })} color="var(--obj2)" />
    </Plane2D>
  );
}

const PU: P2 = [3, 2], PV: P2 = [1, 3];
const DIFF: P2 = [PU[0] - PV[0], PU[1] - PV[1]];

function DiffFigure({ revealed, t, guess, setGuess }: { revealed: boolean; t: number; guess: P2 | null; setGuess: (p: P2) => void }) {
  const minusV: P2 = [-PV[0], -PV[1]];
  const tail: P2 = [PU[0] * t, PU[1] * t];
  return (
    <Plane2D x={[-2, 5]} y={[-3, 4.5]} label="Onde fica u − v?">
      <Arrow tip={PU} color="var(--obj1)" label="u" />
      <Arrow tip={PV} color="var(--obj2)" label="v" />
      {revealed && (
        <>
          <Arrow tail={tail} tip={add(tail, minusV)} color="var(--obj2)" dashed label={t > 0.9 ? "−v" : undefined} />
          {t > 0.98 && <Arrow tip={DIFF} color="var(--obj3)" label="u − v" weight={4} />}
          {t > 0.98 && <Segment a={PV} b={PU} color="var(--obj3)" dashed weight={2} />}
        </>
      )}
      {guess && (revealed ? <Dot at={guess} color="var(--text-3)" label="seu palpite" dir="sw" /> : <DraggablePoint point={guess} onMove={setGuess} color="var(--text-3)" label="?" />)}
    </Plane2D>
  );
}

/** u e αu com α variando de −2 a 2. */
function ScaleLoop() {
  const t = useLoop(3200, 600);
  const a = -2 + 4 * t;
  const u: P2 = [2, 1];
  const au: P2 = [a * u[0], a * u[1]];
  return (
    <Plane2D x={[-5, 5]} y={[-3, 3]} label="Vetor u e o múltiplo αu">
      <Arrow tip={au} color="var(--obj4)" weight={6} opacity={0.75} label={`α = ${fmt(Math.round(a * 10) / 10)}`} />
      <Arrow tip={u} color="var(--obj1)" label="u" />
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Um vetor é uma seta",
      body: (
        <p>
          Um vetor tem <b>tamanho</b>, <b>direção</b> e <b>sentido</b>. No plano, duas coordenadas bastam: <b className="obj1">u = (3, 2)</b> quer dizer
          “ande 3 para a direita e 2 para cima”. Não importa de onde a seta sai: o que define o vetor é o deslocamento.
        </p>
      ),
      Figure: Components,
    }),
    ideia({
      title: "Somar é emendar setas",
      body: (
        <p>
          Para somar <b className="obj1">u</b> e <b className="obj2">v</b>, coloque o começo de v na ponta de u. A seta da origem até o fim é{" "}
          <b className="obj3">u + v</b>. Ela também é a diagonal do paralelogramo formado por u e v. Nas contas, basta somar coordenada com coordenada.
        </p>
      ),
      tex: `${o1("\\vec u")} + ${o2("\\vec v")} = (u_1 + v_1,\\; u_2 + v_2)`,
      Figure: SumSlide,
    }),
    tarefa({
      title: "Chegue no alvo",
      body: (
        <p>
          Com <b className="obj1">u = (3, 2)</b> fixo, arraste a ponta de <b className="obj2">v</b> até que <b className="obj3">u + v</b> caia exatamente
          no alvo <b>(5, 1)</b>.
        </p>
      ),
      init: { v: [1, 2] },
      solve: { v: [2, -1] },
      goal: (s) => same(add(U, s.v as P2), [5, 1]),
      readout: (s) => `${o1("\\vec u")} + ${o2("\\vec v")} = ${o3(texTuple(add(U, s.v as P2)))}`,
      Scene: SumTask,
      success: (
        <p>
          v = (2, −1). Para ir de (3, 2) até (5, 1) faltam 2 para a direita e 1 para baixo: é a <b>diferença</b> entre o alvo e u.
        </p>
      ),
    }),
    prever({
      title: "E a diferença?",
      question: (
        <p>
          Agora <b className="obj1">u = (3, 2)</b> e <b className="obj2">v = (1, 3)</b>. Onde fica a ponta de <b className="obj3">u − v</b>? Arraste o ponto
          até o seu palpite.
        </p>
      ),
      ghost: { start: [-1, -2], truth: DIFF, tol: 0.6 },
      Figure: DiffFigure,
      why: (
        <p>
          u − v = u + (−v) = (3 − 1, 2 − 3) = <b>(2, −1)</b>. Vire v ao contrário e emende na ponta de u. Repare: a mesma seta liga a ponta de v à
          ponta de u.
        </p>
      ),
    }),
    ideia({
      title: "Esticar, encolher, inverter",
      body: (
        <p>
          Multiplicar por um número α muda o tamanho: com |α| &gt; 1 a seta estica, com |α| &lt; 1 encolhe. Se α é <b>negativo</b>, o sentido vira. A
          direção (a reta onde a seta está) nunca muda.
        </p>
      ),
      tex: `\\alpha\\,${o1("\\vec u")} = (\\alpha u_1,\\; \\alpha u_2)`,
      Figure: ScaleLoop,
    }),
    pergunta({
      title: "Tamanho de um vetor",
      prompt: "Pelo teorema de Pitágoras, $\\|\\vec u\\| = \\sqrt{u_1^2 + u_2^2}$. Qual é o tamanho de $\\vec u = (3, 4)$?",
      answer: { kind: "number", value: 5, label: "$\\|\\vec u\\|$" },
      hint: "Some os quadrados das coordenadas e tire a raiz: $\\sqrt{3^2 + 4^2}$.",
      explain: "$\\|\\vec u\\| = \\sqrt{9 + 16} = \\sqrt{25} = 5$.",
    }),
    pergunta({
      title: "Combinação",
      prompt: `Com $\\vec u = (1, 3)$ e $\\vec v = (4, -1)$, calcule $2\\vec u - \\vec v$.`,
      answer: { kind: "vector", value: [-2, 7] },
      hint: "Primeiro $2\\vec u = (2, 6)$. Depois subtraia $\\vec v$ coordenada a coordenada.",
      explain: `$2\\vec u - \\vec v = (2 - 4,\\; 6 - (-1)) = ${texTuple([-2, 7])}$.`,
    }),
  ],
};

export default lesson;
