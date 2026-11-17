import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, o3, tex, texMatrix } from "../math/format";
import { Slider } from "../ui/controls";
import { Dot, InfLine, Label, Plane2D, Segment, type P2 } from "../viz2d";

/* Dados da lição: a melhor reta é y = 0,5 + x, com soma dos quadrados 1. */
const PTS: P2[] = [[0, 1], [1, 1], [2, 2], [3, 4]];
const sse = (a: number, b: number) => PTS.reduce((s, [x, y]) => s + (y - a - b * x) ** 2, 0);

function Residuals({ a, b, color }: { a: number; b: number; color: string }) {
  return (
    <>
      {PTS.map(([x, y], i) => (
        <Segment key={i} a={[x, y]} b={[x, a + b * x]} color={color} weight={2.5} />
      ))}
    </>
  );
}

function Points() {
  return (
    <>
      {PTS.map((p, i) => (
        <Dot key={i} at={p} color="var(--obj2)" r={6} />
      ))}
    </>
  );
}

function MissFigure() {
  return (
    <Plane2D x={[-1, 4.5]} y={[-0.5, 5]} label="Quatro pontos que não estão numa reta só, a melhor reta e os resíduos">
      <InfLine p={[0, 0.5]} v={[1, 1]} color="var(--obj1)" weight={3} />
      <Residuals a={0.5} b={1} color="var(--obj5)" />
      <Points />
    </Plane2D>
  );
}

type S = { a: number; b: number };

function FitTask({ s, done }: { s: S; done: boolean }) {
  return (
    <Plane2D x={[-1, 4.5]} y={[-1, 6]} label="A reta y = a + bx, os pontos e os resíduos">
      <InfLine p={[0, s.a]} v={[1, s.b]} color={done ? "var(--obj3)" : "var(--obj1)"} weight={3} />
      <Residuals a={s.a} b={s.b} color="var(--obj5)" />
      <Points />
    </Plane2D>
  );
}

function FitControls({ s, set }: { s: S; set: (p: Partial<S>) => void }) {
  return (
    <>
      <Slider tex={o1("a")} value={s.a} onChange={(a) => set({ a })} min={-2} max={3} step={0.5} />
      <Slider tex={o1("b")} value={s.b} onChange={(b) => set({ b })} min={-1} max={2} step={0.25} />
    </>
  );
}

function MeanPredict({ revealed, t }: { revealed: boolean; t: number }) {
  return (
    <Plane2D x={[-1, 4.5]} y={[-0.5, 5]} label="A melhor reta e a média dos pontos">
      <InfLine p={[0, 0.5]} v={[1, 1]} color="var(--obj1)" weight={3} />
      <Points />
      {revealed && t > 0.3 && (
        <>
          <Segment a={[1.5, -0.5]} b={[1.5, 2]} color="var(--obj3)" dashed />
          <Segment a={[-1, 2]} b={[1.5, 2]} color="var(--obj3)" dashed />
          <Dot at={[1.5, 2]} color="var(--obj3)" r={7} />
          <Label at={[1.5, 2]} text="(x̄, ȳ) = (1,5; 2)" color="var(--obj3)" dir="nw" />
        </>
      )}
    </Plane2D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Nenhuma reta passa por todos",
      body: (
        <p>
          Quatro medidas raramente caem numa reta só: o sistema “a + bxᵢ = yᵢ” não tem solução. Então procuramos a reta que <b>erra menos</b>. Os erros verticais
          são os <b className="obj5">resíduos</b>, e a reta de <b>mínimos quadrados</b> é a que deixa a soma dos quadrados deles a menor possível.
        </p>
      ),
      tex: `\\min_{a,\\,b}\\; \\sum_i \\big(y_i - (a + bx_i)\\big)^2`,
      Figure: MissFigure,
    }),
    tarefa({
      title: "Ajuste a reta",
      body: (
        <p>
          Mexa em <b className="obj1">a</b> (altura) e <b className="obj1">b</b> (inclinação) até a soma dos quadrados dos resíduos ficar a menor possível.
        </p>
      ),
      init: { a: 2, b: 0 },
      solve: { a: 0.5, b: 1 },
      goal: (s) => Math.abs(sse(s.a, s.b) - 1) < 1e-9,
      readout: (s) => `\\sum (\\text{resíduo})^2 = ${tex(sse(s.a, s.b))}`,
      Scene: FitTask,
      Controls: FitControls,
      success: (
        <p>
          a = 0,5 e b = 1: a reta y = 0,5 + x deixa resíduos 0,5, −0,5, −0,5 e 0,5, com soma dos quadrados <b>1</b>. Qualquer outra reta erra mais.
        </p>
      ),
    }),
    prever({
      title: "Onde fica a média?",
      question: (
        <p>
          A média dos pontos é (x̄, ȳ) = (1,5; 2). A melhor reta passa por esse ponto?
        </p>
      ),
      options: ["Sim: ela sempre passa pela média", "Não: só passaria por acaso", "Só se algum ponto estiver em cima da média"],
      correct: 0,
      Figure: MeanPredict,
      why: (
        <p>
          A primeira equação normal é na + b·Σxᵢ = Σyᵢ. Dividindo por n: a + b·x̄ = ȳ. Ou seja, a melhor reta <b>sempre</b> passa pela média dos dados.
        </p>
      ),
    }),
    ideia({
      title: "As equações normais",
      body: (
        <p>
          Escreva o problema como A·(a, b) ≈ y, com linhas (1, xᵢ) em A. A melhor escolha faz o vetor de resíduos ficar <b>perpendicular</b> às colunas de A, o que
          dá as equações normais. É uma projeção: Ax̂ é a sombra de y no espaço das colunas.
        </p>
      ),
      tex: `${o2("A^TA")}\\,\\hat{x} = ${o3("A^T\\vec y")},\\qquad A^TA = \\left[\\begin{array}{cc} n & \\sum x_i \\\\ \\sum x_i & \\sum x_i^2 \\end{array}\\right],\\quad A^T\\vec y = \\left[\\begin{array}{c} \\sum y_i \\\\ \\sum x_iy_i \\end{array}\\right]`,
    }),
    pergunta({
      title: "AᵀA",
      prompt: "Para ajustar $y = a + bx$ aos pontos $(0, 1)$, $(1, 1)$ e $(2, 3)$, calcule $A^TA$.",
      answer: { kind: "matrix", value: [[3, 3], [3, 5]] },
      hint: "$n = 3$, $\\sum x_i = 0 + 1 + 2$ e $\\sum x_i^2 = 0 + 1 + 4$.",
      explain: `$A^TA = ${texMatrix([[3, 3], [3, 5]])}$.`,
    }),
    pergunta({
      title: "Aᵀy",
      prompt: "Para os mesmos pontos $(0, 1)$, $(1, 1)$ e $(2, 3)$, calcule $A^T\\vec y$.",
      answer: { kind: "vector", value: [5, 7] },
      hint: "$\\sum y_i = 1 + 1 + 3$ e $\\sum x_iy_i = 0\\cdot1 + 1\\cdot1 + 2\\cdot3$.",
      explain: "$A^T\\vec y = (5, 7)$.",
    }),
    pergunta({
      title: "A reta",
      prompt: "Resolva as equações normais e dê a reta de mínimos quadrados $y = a + bx$ para $(0, 1)$, $(1, 1)$ e $(2, 3)$.",
      answer: { kind: "vector", value: [2 / 3, 1], names: ["a", "b"] },
      hint: "$\\begin{cases} 3a + 3b = 5 \\\\ 3a + 5b = 7 \\end{cases}$. Subtraia a primeira da segunda.",
      explain: "$2b = 2$, então $b = 1$ e $3a = 5 - 3 = 2$, ou seja, $a = \\tfrac23$. A reta é $y = \\tfrac23 + x$.",
    }),
  ],
};

export default lesson;
