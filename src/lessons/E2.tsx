import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, o3, tex, texLinear } from "../math/format";
import { useLoop } from "../player/anim";
import { Slider } from "../ui/controls";
import { Dot, GeneralLine, Plane2D } from "../viz2d";
import { PlaneMesh, Point3D, Scene3D } from "../viz3d";

/** L₂ ← L₂ − m·L₁ em x + y = 3 e 2x − y = 0: a reta 2 gira em volta da solução (1, 2). */
function TurnFigure() {
  const t = useLoop(3000, 1200);
  const m = 2 * t;
  return (
    <Plane2D x={[-2, 5]} y={[-1, 5]} label="A segunda reta gira em volta da solução durante a operação">
      <GeneralLine a={1} b={1} c={-3} color="var(--obj1)" weight={3} />
      <GeneralLine a={2 - m} b={-1 - m} c={3 * m} color="var(--obj2)" weight={3} />
      <Dot at={[1, 2]} color="var(--obj3)" r={6} label="(1, 2)" dir="e" />
    </Plane2D>
  );
}

/* x + 2y = 4 (L₁) e 3x + y = 7 (L₂); solução (2, 1). */
const row = (m: number) => [3 - m, 1 - 2 * m, 7 - 4 * m];

function OpTask({ s, done }: { s: { m: number }; done: boolean }) {
  const [a, b, c] = row(s.m);
  return (
    <Plane2D x={[-2, 6]} y={[-2, 4.5]} label="Retas L₁ e L₂ − m·L₁">
      <GeneralLine a={1} b={2} c={-4} color="var(--obj1)" weight={3} />
      <GeneralLine a={a} b={b} c={-c} color={done ? "var(--obj3)" : "var(--obj2)"} weight={3} />
      <Dot at={[2, 1]} color="var(--obj3)" r={6} label="(2, 1)" dir="ne" />
    </Plane2D>
  );
}

function OpControls({ s, set }: { s: { m: number }; set: (p: { m: number }) => void }) {
  return <Slider tex={o2("m")} value={s.m} onChange={(m) => set({ m })} min={-2} max={4} step={0.5} />;
}

function KeepPredict({ revealed, t }: { revealed: boolean; t: number }) {
  const m = revealed ? 3 * t : 0;
  const [a, b, c] = row(m);
  return (
    <Plane2D x={[-2, 6]} y={[-2, 4.5]} label="L₂ ← L₂ − 3L₁ aplicada aos poucos">
      <GeneralLine a={1} b={2} c={-4} color="var(--obj1)" weight={3} />
      <GeneralLine a={a} b={b} c={-c} color="var(--obj2)" weight={3} />
      {revealed && t > 0.9 && <Dot at={[2, 1]} color="var(--obj3)" r={6} label="a solução não saiu do lugar" dir="ne" />}
    </Plane2D>
  );
}

function ThreePlanes() {
  return (
    <Scene3D R={4} label="Três planos que se encontram no ponto (1, 2, 3)">
      <PlaneMesh plane={{ n: [1, 1, 1], d: 6 }} color="obj1" opacity={0.25} />
      <PlaneMesh plane={{ n: [0, 1, 2], d: 8 }} color="obj2" opacity={0.25} />
      <PlaneMesh plane={{ n: [0, 0, 3], d: 9 }} color="obj4" opacity={0.25} />
      <Point3D at={[1, 2, 3]} color="obj3" size={0.14} label="(1, 2, 3)" />
    </Scene3D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Trocar o sistema por um mais fácil",
      body: (
        <>
          <p>Três operações nas equações não mudam as soluções:</p>
          <ul>
            <li>trocar duas equações de lugar;</li>
            <li>multiplicar uma equação por um número diferente de zero;</li>
            <li>somar a uma equação um múltiplo de outra.</li>
          </ul>
          <p>
            Na figura, <b className="obj2">2x − y = 0</b> recebe −2 vezes <b className="obj1">x + y = 3</b> aos poucos. A reta gira, mas continua passando pela
            solução <b className="obj3">(1, 2)</b>: no fim, vira y = 2.
          </p>
        </>
      ),
      tex: `L_2 \\leftarrow L_2 - 2L_1:\\quad ${o2("2x - y = 0")} \\;\\longrightarrow\\; ${o2("-3y = -6")}`,
      Figure: TurnFigure,
    }),
    tarefa({
      title: "Zere o x da segunda equação",
      body: (
        <p>
          O sistema é <b className="obj1">L₁: x + 2y = 4</b> e <b className="obj2">L₂: 3x + y = 7</b>. Aplique L₂ ← L₂ − <b className="obj2">m</b>·L₁ e escolha m
          para o x sumir da segunda equação.
        </p>
      ),
      init: { m: 0 },
      solve: { m: 3 },
      goal: (s) => Math.abs(row(s.m)[0]) < 1e-9,
      readout: (s) => {
        const [a, b, c] = row(s.m);
        return `L_2 - ${tex(s.m)}L_1:\\; ${texLinear([a, b], ["x", "y"])} = ${tex(c)}`;
      },
      Scene: OpTask,
      Controls: OpControls,
      success: (
        <p>
          Com m = 3, a segunda equação vira −5y = −5, então y = 1, e da primeira sai x = 2. Para zerar uma entrada, o m é sempre “entrada a zerar ÷ pivô”: 3 ÷ 1.
        </p>
      ),
    }),
    prever({
      title: "O que fica igual",
      question: <p>Ao aplicar L₂ ← L₂ − 3L₁, o que não muda?</p>,
      options: ["As soluções do sistema", "Os coeficientes de cada equação", "O lado direito das equações", "A inclinação das retas"],
      correct: 0,
      Figure: KeepPredict,
      why: (
        <p>
          Tudo o que satisfaz L₁ e L₂ também satisfaz L₂ − 3L₁, e vice-versa. As equações mudam, as retas giram, mas o <b>conjunto de soluções</b> é o mesmo. É isso
          que permite escalonar sem medo.
        </p>
      ),
    }),
    ideia({
      title: "Escalonar e voltar de baixo para cima",
      body: (
        <p>
          Com três incógnitas, cada equação é um plano. O <b>método de Gauss</b> zera, coluna por coluna, tudo o que está abaixo de cada pivô. A matriz fica em{" "}
          <b>escada</b>: a última equação tem uma incógnita só, a de cima tem duas… e a solução sai de baixo para cima. Aqui os três planos se encontram em{" "}
          <b className="obj3">(1, 2, 3)</b>.
        </p>
      ),
      tex: `\\left[\\begin{array}{ccc|c} ${o1("1")} & 1 & 1 & 6 \\\\ 0 & ${o1("1")} & 2 & 8 \\\\ 0 & 0 & ${o1("3")} & 9 \\end{array}\\right] \\Rightarrow ${o3("z = 3,\\; y = 2,\\; x = 1")}`,
      Figure: ThreePlanes,
    }),
    pergunta({
      title: "De baixo para cima",
      prompt: "Resolva $\\begin{cases} x + y + z = 6 \\\\ y + 2z = 8 \\\\ 3z = 9 \\end{cases}$",
      answer: { kind: "vector", value: [1, 2, 3] },
      hint: "A última equação já dá z. Substitua na do meio para achar y, e depois na primeira.",
      explain: "$z = 3$; $y = 8 - 2\\cdot3 = 2$; $x = 6 - 2 - 3 = 1$. Solução: $(1, 2, 3)$.",
    }),
    pergunta({
      title: "Próxima operação",
      prompt: "Em $\\left[\\begin{array}{cc|c} 2 & 1 & 3 \\\\ 6 & 5 & 1 \\end{array}\\right]$, qual operação zera o 6?",
      answer: { kind: "choice", options: ["$L_2 \\leftarrow L_2 - 3L_1$", "$L_2 \\leftarrow L_2 + 3L_1$", "$L_2 \\leftarrow L_2 - 6L_1$", "$L_1 \\leftarrow L_1 - 3L_2$"], correct: 0 },
      hint: "O pivô é 2. Quantas vezes 2 cabe em 6?",
      explain: "$6 - 3\\cdot2 = 0$: a operação é $L_2 \\leftarrow L_2 - 3L_1$, e a linha 2 vira $(0, 2 \\mid -8)$.",
    }),
    pergunta({
      title: "Posto",
      prompt: "Qual é o posto de $\\left[\\begin{array}{ccc} 1 & 2 & 3 \\\\ 2 & 4 & 6 \\\\ 1 & 0 & 1 \\end{array}\\right]$?",
      answer: { kind: "number", value: 2, label: "posto" },
      hint: "A 2ª linha é o dobro da 1ª. Escalone e conte as linhas que sobram não nulas.",
      explain: "$L_2 \\leftarrow L_2 - 2L_1$ zera a 2ª linha; a 3ª não é múltipla da 1ª. Sobram 2 linhas não nulas: posto $2$.",
    }),
  ],
};

export default lesson;
