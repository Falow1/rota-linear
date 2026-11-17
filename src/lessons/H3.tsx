import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o4, o5, tex, texMatrix } from "../math/format";
import { Slider } from "../ui/controls";
import { Arrow3D, Line3D, PlaneMesh, Point3D, Scene3D } from "../viz3d";

/* A = [3 1 1; 1 3 1; 1 1 3]: λ = 5 na reta de (1, 1, 1) e λ = 2 no plano x + y + z = 0. */
const A = [[3, 1, 1], [1, 3, 1], [1, 1, 3]];
const detShift = (l: number) => (5 - l) * (2 - l) ** 2;

function SpacesFigure() {
  return (
    <Scene3D R={3.5} label="Autoespaço de λ = 2 (um plano) e de λ = 5 (uma reta)">
      <PlaneMesh plane={{ n: [1, 1, 1], d: 0 }} color="obj4" opacity={0.25} R={3.5} />
      <Line3D line={{ p: [0, 0, 0], v: [1, 1, 1] }} color="obj5" width={3} R={3.5} />
      <Arrow3D to={[2, -2, 0]} color="obj4" label="Au = 2u" width={5} opacity={0.6} />
      <Arrow3D to={[1, -1, 0]} color="obj1" label="u" width={3} />
      <Arrow3D to={[2.5, 2.5, 2.5]} color="obj5" label="Aw = 5w" width={5} opacity={0.6} />
      <Arrow3D to={[0.5, 0.5, 0.5]} color="obj1" label="w" width={3} />
    </Scene3D>
  );
}

function SpaceTask({ s, done }: { s: { l: number } ; done: boolean }) {
  const d = detShift(s.l);
  return (
    <Scene3D R={3.5} label="As soluções de (A − λI)v = 0 para o λ escolhido">
      {s.l === 2 && <PlaneMesh plane={{ n: [1, 1, 1], d: 0 }} color={done ? "obj3" : "obj4"} opacity={0.3} R={3.5} />}
      {s.l === 5 && <Line3D line={{ p: [0, 0, 0], v: [1, 1, 1] }} color="obj5" width={4} R={3.5} />}
      <Point3D at={[0, 0, 0]} color={d === 0 ? "obj3" : "text"} size={0.12} label={d === 0 ? undefined : "só v = 0"} />
    </Scene3D>
  );
}

function SpaceControls({ s, set }: { s: { l: number }; set: (p: { l: number }) => void }) {
  return <Slider tex={o4("\\lambda")} value={s.l} onChange={(l) => set({ l })} min={0} max={6} step={0.5} />;
}

function DefectPredict({ revealed, t }: { revealed: boolean; t: number }) {
  return (
    <Scene3D R={3} label="e₂ e a imagem Ae₂ pela matriz [2 1 0; 0 2 0; 0 0 3]">
      <Arrow3D to={[0, 1, 0]} color="obj2" label="e₂" width={3} />
      <Arrow3D to={[1, 2, 0]} color="obj2" label="Ae₂" width={3} opacity={0.6} />
      {revealed && t > 0.3 && (
        <>
          <Line3D line={{ p: [0, 0, 0], v: [1, 0, 0] }} color="obj4" width={4} R={3} />
          <Line3D line={{ p: [0, 0, 0], v: [0, 0, 1] }} color="obj5" width={4} R={3} />
          <Arrow3D to={[1.6, 0, 0]} color="obj4" label="λ = 2: só esta reta" width={3} />
          <Arrow3D to={[0, 0, 1.6]} color="obj5" label="λ = 3" width={3} />
        </>
      )}
    </Scene3D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Um autoespaço pode ser um plano",
      body: (
        <p>
          Em 3D, o conjunto dos autovetores de um mesmo λ (junto com o vetor nulo) é o <b>autoespaço</b> de λ. Ele pode ser uma reta ou um plano. Para A = [3 1 1;
          1 3 1; 1 1 3], o autovalor <b className="obj5">5</b> tem a reta de (1, 1, 1), e o autovalor <b className="obj4">2</b> tem o plano x + y + z = 0 inteiro:
          todo vetor desse plano só dobra.
        </p>
      ),
      tex: `A = ${texMatrix(A)},\\qquad p(\\lambda) = (\\lambda - ${o5("5")})(\\lambda - ${o4("2")})^2`,
      Figure: SpacesFigure,
    }),
    tarefa({
      title: "Encontre o plano de autovetores",
      body: (
        <p>
          Mude <b className="obj4">λ</b> e veja as soluções de (A − λI)v = 0. Na maioria dos valores só sobra v = 0. Ache o λ cujo autoespaço é um plano.
        </p>
      ),
      init: { l: 0 },
      solve: { l: 2 },
      goal: (s) => s.l === 2,
      readout: (s) => `\\det(A - ${tex(s.l)}I) = ${tex(detShift(s.l))}`,
      Scene: SpaceTask,
      Controls: SpaceControls,
      success: (
        <p>
          Em λ = 2, A − 2I = [1 1 1; 1 1 1; 1 1 1] tem posto 1: sobram 2 variáveis livres, e o autoespaço é um plano. A multiplicidade <b>geométrica</b> de λ = 2 é
          2, igual à algébrica.
        </p>
      ),
    }),
    prever({
      title: "Sempre diagonaliza?",
      question: (
        <p>
          A matriz [2 1 0; 0 2 0; 0 0 3] tem λ = 2 repetido duas vezes e λ = 3. Ela é diagonalizável?
        </p>
      ),
      options: ["Não: falta um autovetor para λ = 2", "Sim: ela é triangular", "Sim: tem dois autovalores diferentes"],
      correct: 0,
      Figure: DefectPredict,
      why: (
        <p>
          A − 2I = [0 1 0; 0 0 0; 0 0 1] tem posto 2: o autoespaço de λ = 2 é <b>só uma reta</b> (o eixo x). Como e₂ vai em (1, 2, 0), que sai da reta dele, não
          dá para montar três autovetores independentes. m<sub>g</sub> = 1 &lt; m<sub>a</sub> = 2: não diagonaliza.
        </p>
      ),
    }),
    ideia({
      title: "Hamilton–Cayley",
      body: (
        <p>
          Toda matriz quadrada anula o próprio polinômio característico: troque λ por A e o número por um múltiplo de I, e o resultado é a matriz nula. Isso dá um
          jeito de escrever potências altas de A com as mais baixas, e até a inversa. Para A = [3 1 1; 1 3 1; 1 1 3], p(λ) = λ³ − 9λ² + 24λ − 20.
        </p>
      ),
      tex: `A^3 - 9A^2 + 24A - 20I = 0 \\;\\Rightarrow\\; A^{-1} = \\tfrac{1}{20}\\left(A^2 - 9A + 24I\\right)`,
    }),
    pergunta({
      title: "Triangular",
      prompt: `Quais são os autovalores de $${texMatrix([[1, 2, 3], [0, 4, 5], [0, 0, -2]])}$, em ordem crescente?`,
      answer: { kind: "vector", value: [-2, 1, 4], names: ["λ₁", "λ₂", "λ₃"] },
      hint: "Numa matriz triangular, os autovalores estão na diagonal.",
      explain: "$\\det(A - \\lambda I) = (1 - \\lambda)(4 - \\lambda)(-2 - \\lambda)$: os autovalores são $-2$, $1$ e $4$.",
    }),
    pergunta({
      title: "Quantos autovetores?",
      prompt: `Qual é a multiplicidade geométrica de $\\lambda = 3$ em $${texMatrix([[3, 1, 0], [0, 3, 0], [0, 0, 1]])}$?`,
      answer: { kind: "number", value: 1, label: "$m_g$" },
      hint: "$m_g = 3 - \\operatorname{posto}(A - 3I)$.",
      explain: `$A - 3I = ${texMatrix([[0, 1, 0], [0, 0, 0], [0, 0, -2]])}$ tem posto $2$, então $m_g = 1$ (embora $m_a = 2$).`,
    }),
    pergunta({
      title: "Lendo o polinômio",
      prompt: "O polinômio característico de uma matriz $3\\times3$ é $\\lambda^3 - 6\\lambda^2 + 11\\lambda - 6$. Quanto vale $\\det A$?",
      answer: { kind: "number", value: 6, label: "$\\det A$" },
      hint: "Com $p(\\lambda) = \\det(\\lambda I - A)$, o termo constante é $p(0) = \\det(-A) = -\\det A$.",
      explain: "$-\\det A = -6$, então $\\det A = 6$. Confere: as raízes são $1$, $2$ e $3$, e $1\\cdot2\\cdot3 = 6$.",
    }),
  ],
};

export default lesson;
