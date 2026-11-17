import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, o3, tex } from "../math/format";
import { AngleArc, Arrow, DraggablePoint, Fill, Label, Plane2D, type P2 } from "../viz2d";

const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const det2 = (u: P2, v: P2) => u[0] * v[1] - u[1] * v[0];

function AreaFigure() {
  const u: P2 = [2, 1], v: P2 = [1, 3];
  return (
    <Plane2D x={[-1, 4.5]} y={[-1, 4.5]} label="O quadrado unitário vira o paralelogramo das colunas, de área 5">
      <Fill points={[[0, 0], [1, 0], [1, 1], [0, 1]]} color="var(--obj-muted)" opacity={0.25} stroke />
      <Fill points={[[0, 0], u, add(u, v), v]} color="var(--obj3)" opacity={0.2} stroke />
      <Arrow tip={u} color="var(--obj1)" label="coluna 1" dir="se" />
      <Arrow tip={v} color="var(--obj2)" label="coluna 2" dir="nw" />
      <Label at={[1.5, 2]} text="área 5" color="var(--obj3)" dir="e" dist={0} />
    </Plane2D>
  );
}

const TU: P2 = [2, 1];

function FlattenTask({ s, set, done }: { s: { v: number[] }; set: (p: { v: number[] }) => void; done: boolean }) {
  const v = s.v as P2;
  return (
    <Plane2D x={[-4, 5]} y={[-3, 4.5]} label="Arraste a segunda coluna até a área sumir">
      <Fill points={[[0, 0], TU, add(TU, v), v]} color={done ? "var(--obj3)" : "var(--obj4)"} opacity={0.22} stroke />
      <Arrow tip={TU} color="var(--obj1)" label="u" />
      <Arrow tip={v} color="var(--obj2)" label="v" />
      <DraggablePoint point={v} onMove={(p) => set({ v: p })} color="var(--obj2)" />
    </Plane2D>
  );
}

function SwapPredict({ revealed, t }: { revealed: boolean; t: number }) {
  const u: P2 = [2, 1], v: P2 = [1, 3];
  const swapped = revealed && t > 0.5;
  const [a, b] = swapped ? [v, u] : [u, v];
  return (
    <Plane2D x={[-1, 4.5]} y={[-1, 4.5]} label="Paralelogramo e o sentido de giro da coluna 1 para a coluna 2">
      <Fill points={[[0, 0], u, add(u, v), v]} color="var(--obj3)" opacity={0.18} stroke />
      <AngleArc from={a} to={b} r={0.9} color={swapped ? "var(--obj4)" : "var(--obj5)"} />
      <Arrow tip={a} color="var(--obj1)" label="coluna 1" dir={swapped ? "nw" : "se"} />
      <Arrow tip={b} color="var(--obj2)" label="coluna 2" dir={swapped ? "se" : "nw"} />
      <Label at={[2.2, 2.3]} text={swapped ? "det = −5" : "det = 5"} color={swapped ? "var(--obj4)" : "var(--obj3)"} dir="e" dist={0} />
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "O determinante mede área",
      body: (
        <p>
          Pense nas colunas da matriz como duas setas. O paralelogramo que elas formam tem área igual ao <b>módulo do determinante</b>. Na figura, as colunas{" "}
          <b className="obj1">(2, 1)</b> e <b className="obj2">(1, 3)</b> dão det = 2·3 − 1·1 = <b className="obj3">5</b>: o quadradinho de área 1 vira uma
          figura 5 vezes maior.
        </p>
      ),
      tex: `\\det\\left[\\begin{array}{cc} ${o1("2")} & ${o2("1")} \\\\ ${o1("1")} & ${o2("3")} \\end{array}\\right] = 2\\cdot3 - 1\\cdot1 = ${o3("5")}`,
      Figure: AreaFigure,
    }),
    tarefa({
      title: "Achate o paralelogramo",
      body: (
        <p>
          A primeira coluna é <b className="obj1">u = (2, 1)</b>. Arraste a segunda, <b className="obj2">v</b>, até o determinante ficar zero (sem deixar v nulo).
        </p>
      ),
      init: { v: [1, 3] },
      solve: { v: [4, 2] },
      goal: (s) => Math.abs(det2(TU, s.v as P2)) < 1e-9 && Math.hypot(s.v[0], s.v[1]) > 0.1,
      readout: (s) => `\\det[${o1("\\vec u")}\\;${o2("\\vec v")}] = ${tex(det2(TU, s.v as P2))}`,
      Scene: FlattenTask,
      success: (
        <p>
          Com v paralelo a u, o paralelogramo vira um segmento: área zero. Determinante zero quer dizer que as colunas estão na mesma reta, a matriz “achata” o
          plano e <b>não tem inversa</b>.
        </p>
      ),
    }),
    prever({
      title: "Trocando as colunas",
      question: <p>O que acontece com o determinante se trocarmos as duas colunas de lugar?</p>,
      options: ["Troca de sinal", "Não muda", "Dobra", "Vira zero"],
      correct: 0,
      Figure: SwapPredict,
      why: (
        <p>
          A área é a mesma, mas o <b>sentido</b> de giro da coluna 1 para a coluna 2 se inverte. O sinal do determinante guarda esse sentido: positivo no
          anti-horário, negativo no horário.
        </p>
      ),
    }),
    ideia({
      title: "Em 3×3: volume com sinal",
      body: (
        <p>
          Com três colunas no espaço, o determinante é o volume (com sinal) do paralelepípedo que elas formam. Ele pode ser calculado pela primeira linha, com os
          determinantes 2×2 que sobram ao riscar linha e coluna. Duas regras úteis: det(AB) = det A · det B, e A tem inversa exatamente quando det A ≠ 0.
        </p>
      ),
      tex: `\\det\\left[\\begin{array}{ccc} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{array}\\right] = a(ei - fh) - b(di - fg) + c(dh - eg)`,
    }),
    pergunta({
      title: "2×2",
      prompt: "Calcule $\\det\\left[\\begin{array}{cc} 3 & 1 \\\\ 2 & 4 \\end{array}\\right]$.",
      answer: { kind: "number", value: 10, label: "$\\det$" },
      hint: "$ad - bc$: $3\\cdot4 - 1\\cdot2$.",
      explain: "$12 - 2 = 10$.",
    }),
    pergunta({
      title: "3×3",
      prompt: "Calcule $\\det\\left[\\begin{array}{ccc} 1 & 2 & 0 \\\\ 0 & 1 & 3 \\\\ 2 & 0 & 1 \\end{array}\\right]$.",
      answer: { kind: "number", value: 13, label: "$\\det$" },
      hint: "Pela 1ª linha: $1\\cdot(1\\cdot1 - 3\\cdot0) - 2\\cdot(0\\cdot1 - 3\\cdot2) + 0$.",
      explain: "$1\\cdot1 - 2\\cdot(-6) + 0 = 1 + 12 = 13$.",
    }),
    pergunta({
      title: "Achatando com k",
      prompt: "Para que valor de $k$ a matriz $\\left[\\begin{array}{cc} k & 2 \\\\ 3 & 6 \\end{array}\\right]$ tem determinante zero?",
      answer: { kind: "number", value: 1, label: "$k$" },
      hint: "$6k - 2\\cdot3 = 0$.",
      explain: "$6k = 6$, então $k = 1$. As colunas $(1, 3)$ e $(2, 6)$ ficam paralelas.",
    }),
  ],
};

export default lesson;
