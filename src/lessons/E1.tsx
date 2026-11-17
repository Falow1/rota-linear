import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, tex } from "../math/format";
import { Slider } from "../ui/controls";
import { Dot, GeneralLine, Label, Plane2D } from "../viz2d";

function MeetFigure() {
  return (
    <Plane2D x={[-1, 5.5]} y={[-1.5, 5.5]} label="Retas 2x − y = 1 e x + y = 5 se encontrando em (2, 3)">
      <GeneralLine a={2} b={-1} c={-1} color="var(--obj1)" weight={3} />
      <GeneralLine a={1} b={1} c={-5} color="var(--obj2)" weight={3} />
      <Label at={[3.2, 5.4]} text="2x − y = 1" color="var(--obj1)" dir="e" />
      <Label at={[0.3, 4.7]} text="x + y = 5" color="var(--obj2)" dir="ne" />
      <Dot at={[2, 3]} color="var(--obj3)" r={6} label="(2, 3)" dir="e" />
    </Plane2D>
  );
}

/* x + 2y = 4 e 2x + ky = 6 */
const kind = (k: number) => (Math.abs(k - 4) < 1e-9 ? "SI" : "SPD");

function KTask({ s, done }: { s: { k: number }; done: boolean }) {
  const D = s.k - 4;
  const X = Math.abs(D) > 1e-9 ? ([(4 * s.k - 12) / D, -2 / D] as [number, number]) : null;
  return (
    <Plane2D x={[-4, 8]} y={[-4, 5]} label="Retas x + 2y = 4 e 2x + ky = 6">
      <GeneralLine a={1} b={2} c={-4} color="var(--obj1)" weight={3} />
      <GeneralLine a={2} b={s.k} c={-6} color={done ? "var(--obj3)" : "var(--obj2)"} weight={3} />
      {X && Math.abs(X[0]) < 30 && Math.abs(X[1]) < 30 && <Dot at={X} color="var(--text)" label="solução" dir="se" />}
    </Plane2D>
  );
}

function KControls({ s, set }: { s: { k: number }; set: (p: { k: number }) => void }) {
  return <Slider tex={o2("k")} value={s.k} onChange={(k) => set({ k })} min={-2} max={6} step={0.5} />;
}

function SamePredict({ revealed, t }: { revealed: boolean; t: number }) {
  return (
    <Plane2D x={[-3, 5]} y={[-4, 3]} label="Retas x − y = 2 e 3x − 3y = 6">
      {revealed && (
        <g style={{ opacity: t }}>
          <GeneralLine a={1} b={-1} c={-2} color="var(--obj1)" weight={7} />
          <GeneralLine a={3} b={-3} c={-6} color="var(--obj2)" weight={3} dashed />
        </g>
      )}
    </Plane2D>
  );
}

function ParallelFigure() {
  return (
    <Plane2D x={[-3, 5]} y={[-3, 4]} label="Duas retas paralelas: sistema sem solução">
      <GeneralLine a={1} b={2} c={-4} color="var(--obj1)" weight={3} />
      <GeneralLine a={2} b={4} c={-6} color="var(--obj2)" weight={3} />
      <Label at={[-2, 3]} text="x + 2y = 4" color="var(--obj1)" dir="e" />
      <Label at={[-2.4, 1.3]} text="2x + 4y = 6" color="var(--obj2)" dir="s" />
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Cada equação é uma reta",
      body: (
        <p>
          Num sistema com duas incógnitas, cada equação é uma reta do plano. Resolver o sistema é achar os pontos que estão nas <b>duas</b> retas ao mesmo tempo.
          Aqui, <b className="obj1">2x − y = 1</b> e <b className="obj2">x + y = 5</b> se encontram em <b className="obj3">(2, 3)</b>.
        </p>
      ),
      tex: `\\begin{cases} ${o1("2x - y = 1")} \\\\ ${o2("x + y = 5")} \\end{cases} \\iff \\left[\\begin{array}{cc} 2 & -1 \\\\ 1 & 1 \\end{array}\\right] \\left[\\begin{array}{c} x \\\\ y \\end{array}\\right] = \\left[\\begin{array}{c} 1 \\\\ 5 \\end{array}\\right]`,
      Figure: MeetFigure,
    }),
    tarefa({
      title: "Deixe o sistema sem solução",
      body: (
        <p>
          O sistema é <b className="obj1">x + 2y = 4</b> e <b className="obj2">2x + ky = 6</b>. Mude <b className="obj2">k</b> até o sistema ficar{" "}
          <b>impossível</b>: nenhum ponto nas duas retas.
        </p>
      ),
      init: { k: 1 },
      solve: { k: 4 },
      goal: (s) => kind(s.k) === "SI",
      readout: (s) => `\\det = 1\\cdot ${tex(s.k)} - 2\\cdot 2 = ${tex(s.k - 4)}`,
      Scene: KTask,
      Controls: KControls,
      success: (
        <p>
          Com k = 4 o determinante zera: a 2ª equação vira 2x + 4y = 6, com os coeficientes do dobro da 1ª. Mas 6 não é o dobro de 4, então as retas são
          paralelas distintas.
        </p>
      ),
    }),
    prever({
      title: "Quantas soluções?",
      question: (
        <p>
          O sistema <b className="obj1">x − y = 2</b> e <b className="obj2">3x − 3y = 6</b> tem…
        </p>
      ),
      options: ["Uma solução", "Nenhuma solução", "Infinitas soluções"],
      correct: 2,
      Figure: SamePredict,
      why: (
        <p>
          A 2ª equação é a 1ª multiplicada por 3, inclusive o lado direito. As duas retas são a <b>mesma</b>: qualquer ponto dela resolve o sistema. É um
          sistema possível e indeterminado.
        </p>
      ),
    }),
    ideia({
      title: "Os três casos",
      body: (
        <>
          <p>Com duas retas no plano só há três possibilidades:</p>
          <ul>
            <li>
              Elas se cruzam: <b>uma</b> solução (sistema possível e determinado). Acontece quando o determinante é diferente de zero.
            </li>
            <li>
              São paralelas distintas, como na figura: <b>nenhuma</b> solução (impossível).
            </li>
            <li>
              São a mesma reta: <b>infinitas</b> soluções (possível e indeterminado).
            </li>
          </ul>
          <p>Determinante zero só diz que não é o primeiro caso; para separar os outros dois, olhe o lado direito.</p>
        </>
      ),
      tex: `\\det\\left[\\begin{array}{cc} a & b \\\\ c & d \\end{array}\\right] = ad - bc \\ne 0 \\iff \\text{uma única solução}`,
      Figure: ParallelFigure,
    }),
    pergunta({
      title: "Resolva",
      prompt: "Resolva o sistema $\\begin{cases} 3x + y = 7 \\\\ x - y = 1 \\end{cases}$",
      answer: { kind: "vector", value: [2, 1] },
      hint: "Some as equações: o $y$ some.",
      explain: "Somando: $4x = 8$, então $x = 2$. Da 2ª equação, $y = x - 1 = 1$. Solução: $(2, 1)$.",
    }),
    pergunta({
      title: "O valor de k",
      prompt: "Para que valor de $k$ o sistema $\\begin{cases} x + 3y = 2 \\\\ 2x + ky = 5 \\end{cases}$ não tem solução?",
      answer: { kind: "number", value: 6, label: "$k$" },
      hint: "Sem solução pede determinante zero: $1\\cdot k - 3\\cdot2 = 0$. Depois confira o lado direito.",
      explain: "$k - 6 = 0 \\Rightarrow k = 6$. Aí a 2ª equação tem coeficientes $2$ vezes os da 1ª, mas $5 \\ne 2\\cdot2$: retas paralelas, nenhuma solução.",
    }),
  ],
};

export default lesson;
