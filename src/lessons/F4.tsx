import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o3, o4, o5, texMatrix, texTuple } from "../math/format";
import { Slider } from "../ui/controls";
import { Arrow3D, Line3D, PlaneMesh, Point3D, Scene3D, type V3 } from "../viz3d";

/* A tem posto 2: a 3ª linha é a soma das outras duas. Núcleo: direção (−1, −1, 1). Imagem: plano z = x + y. */
const A = [[1, 0, 1], [0, 1, 1], [1, 1, 2]];
const mulA = (v: number[]): V3 => [0, 1, 2].map((i) => A[i][0] * v[0] + A[i][1] * v[1] + A[i][2] * v[2]) as V3;
const IMAGE = { n: [1, 1, -1] as V3, d: 0 };
const KER: V3 = [-1, -1, 1];

function KerImFigure() {
  return (
    <Scene3D R={3.5} label="A imagem de A é um plano e o núcleo é uma reta">
      <PlaneMesh plane={IMAGE} color="obj4" opacity={0.25} R={3.5} />
      <Line3D line={{ p: [0, 0, 0], v: KER }} color="obj5" width={4} R={3.5} />
      <Arrow3D to={[1, 0, 1]} color="obj1" label="coluna 1" width={3} />
      <Arrow3D to={[0, 1, 1]} color="obj1" label="coluna 2" width={3} />
      <Point3D at={[0, 0, 0]} color="text" label="0" />
    </Scene3D>
  );
}

type S = { v: number[] };

function KernelTask({ s, done }: { s: S; done: boolean }) {
  const v = s.v as V3, Av = mulA(v);
  const zero = Math.hypot(...Av) < 1e-9;
  return (
    <Scene3D R={4} label="O vetor v e a imagem Av; o objetivo é Av = 0">
      <PlaneMesh plane={IMAGE} color="obj4" opacity={0.18} />
      {done && <Line3D line={{ p: [0, 0, 0], v: KER }} color="obj5" width={3} dashed />}
      {Math.hypot(...v) > 1e-9 && <Arrow3D to={v} color="obj1" label="v" width={4} />}
      {!zero && <Arrow3D to={Av} color="obj3" label="Av" width={3} />}
      <Point3D at={[0, 0, 0]} color={zero ? "obj3" : "text"} label={zero ? "Av = 0" : "0"} />
    </Scene3D>
  );
}

function KernelControls({ s, set }: { s: S; set: (p: S) => void }) {
  const put = (i: number, x: number) => set({ v: s.v.map((y, j) => (j === i ? x : y)) });
  return (
    <>
      <Slider tex={o1("x")} value={s.v[0]} onChange={(x) => put(0, x)} min={-2} max={2} step={0.5} />
      <Slider tex={o1("y")} value={s.v[1]} onChange={(x) => put(1, x)} min={-2} max={2} step={0.5} />
      <Slider tex={o1("z")} value={s.v[2]} onChange={(x) => put(2, x)} min={-2} max={2} step={0.5} />
    </>
  );
}

function CountPredict({ revealed, t }: { revealed: boolean; t: number }) {
  return (
    <Scene3D R={3.5} label="Matriz 3×3 de posto 2: a imagem é um plano">
      <PlaneMesh plane={IMAGE} color="obj4" opacity={0.25} R={3.5} />
      {revealed && t > 0.3 && <Line3D line={{ p: [0, 0, 0], v: KER }} color="obj5" width={4} R={3.5} />}
      {revealed && t > 0.6 && <Arrow3D to={[-1.5, -1.5, 1.5]} color="obj5" label="núcleo: dimensão 1" width={3} />}
      <Point3D at={[0, 0, 0]} color="text" label="0" />
    </Scene3D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "O que some e o que sobra",
      body: (
        <p>
          Uma matriz A leva vetores em vetores. O <b className="obj5">núcleo</b> é o conjunto dos v com Av = 0: o que a matriz apaga. A <b className="obj4">imagem</b>{" "}
          é o conjunto de todos os Av: aonde a matriz consegue chegar. A imagem é gerada pelas <b className="obj1">colunas</b>. Aqui a 3ª coluna é a soma das duas
          primeiras, então a imagem é só um plano, e o núcleo é a reta que vai para a origem.
        </p>
      ),
      tex: `A = ${texMatrix(A)},\\qquad ${o5("\\ker A")} = \\{\\vec v : A\\vec v = \\vec 0\\},\\qquad ${o4("\\operatorname{Im} A")} = \\{A\\vec v\\}`,
      Figure: KerImFigure,
    }),
    tarefa({
      title: "Ache um vetor que some",
      body: (
        <p>
          Ajuste <b className="obj1">v = (x, y, z)</b> até <b className="obj3">Av</b> virar o vetor nulo, sem deixar v nulo. Dica: a 1ª linha pede x + z = 0 e a
          2ª pede y + z = 0.
        </p>
      ),
      init: { v: [1, 0, 0] },
      solve: { v: KER },
      goal: (s) => Math.hypot(...mulA(s.v)) < 1e-9 && Math.hypot(...s.v) > 0.1,
      readout: (s) => `A\\,${o1("\\vec v")} = ${o3(texTuple(mulA(s.v)))}`,
      Scene: KernelTask,
      Controls: KernelControls,
      success: (
        <p>
          Qualquer múltiplo de <b>(−1, −1, 1)</b> serve: o núcleo é essa reta inteira. Achar o núcleo é resolver o sistema homogêneo Av = 0.
        </p>
      ),
    }),
    prever({
      title: "Contando dimensões",
      question: (
        <p>
          Uma matriz 3×3 tem posto 2, ou seja, a imagem é um plano. Qual é a dimensão do núcleo?
        </p>
      ),
      options: ["1", "0", "2", "3"],
      correct: 0,
      Figure: CountPredict,
      why: (
        <p>
          São 3 incógnitas e 2 pivôs: sobra <b>1 variável livre</b>, então o núcleo é uma reta. Em geral, posto + nulidade = número de colunas.
        </p>
      ),
    }),
    ideia({
      title: "Posto mais nulidade",
      body: (
        <p>
          Para uma matriz com n colunas, cada coluna ou vira um pivô (e ajuda a formar a imagem) ou vira uma variável livre (e ajuda a formar o núcleo). Por isso
          as dimensões somam n. E um vetor b está na imagem exatamente quando o sistema Ax = b tem solução.
        </p>
      ),
      tex: `\\underbrace{${o4("\\dim \\operatorname{Im} A")}}_{\\text{posto}} + \\underbrace{${o5("\\dim \\ker A")}}_{\\text{nulidade}} = n`,
    }),
    pergunta({
      title: "Nulidade",
      prompt: "Uma matriz $3\\times4$ tem posto $2$. Qual é a nulidade?",
      answer: { kind: "number", value: 2, label: "nulidade" },
      hint: "Posto + nulidade = número de colunas.",
      explain: "$4 - 2 = 2$: o núcleo é um plano dentro de $\\mathbb{R}^4$.",
    }),
    pergunta({
      title: "Vetor do núcleo",
      prompt: `Dê um vetor não nulo do núcleo de $${texMatrix([[1, 2, -1], [0, 1, 1]])}$.`,
      answer: { kind: "direction", value: [3, -1, 1] },
      hint: "Da 2ª linha, $y = -z$. Substitua na 1ª: $x + 2y - z = 0$. Escolha $z = 1$.",
      explain: "Com $z = 1$: $y = -1$ e $x = -2y + z = 3$. O núcleo é a reta de $(3, -1, 1)$; qualquer múltiplo serve.",
    }),
    pergunta({
      title: "Está na imagem?",
      prompt: `O vetor $(1, 2, 4)$ está na imagem de $${texMatrix([[1, 0], [0, 1], [1, 1]])}$?`,
      answer: { kind: "choice", options: ["Sim", "Não"], correct: 1 },
      hint: "Tente $c_1(1, 0, 1) + c_2(0, 1, 1) = (1, 2, 4)$. As duas primeiras coordenadas já fixam $c_1$ e $c_2$.",
      explain: "$c_1 = 1$ e $c_2 = 2$ dão $(1, 2, 3)$, não $(1, 2, 4)$. O sistema não tem solução, então o vetor não está na imagem.",
    }),
  ],
};

export default lesson;
