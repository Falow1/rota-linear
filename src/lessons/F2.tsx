import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, o3, tex, texEquation } from "../math/format";
import { Slider } from "../ui/controls";
import { Arrow3D, Line3D, PlaneMesh, Point3D, Seg3D, Scene3D, type V3 } from "../viz3d";

const XYZ = ["x", "y", "z"];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

function RulesFigure() {
  const u: V3 = [1, 0, 1], v: V3 = [0, 1, 1];
  return (
    <Scene3D R={3.5} label="Plano x + y − z = 0 com dois vetores dele e a soma, que continua no plano">
      <PlaneMesh plane={{ n: [1, 1, -1], d: 0 }} color="obj4" opacity={0.25} R={3.5} />
      <Arrow3D to={u} color="obj1" label="u" width={3} />
      <Arrow3D to={v} color="obj2" label="v" width={3} />
      <Seg3D a={u} b={add(u, v)} dashed />
      <Seg3D a={v} b={add(u, v)} dashed />
      <Arrow3D to={add(u, v)} color="obj3" label="u + v" width={4} />
      <Point3D at={[0, 0, 0]} color="text" label="0" />
    </Scene3D>
  );
}

/* Plano x + y + 2z = d; P está nele para todo d e 2P só fica nele quando d = 0. */
const N: V3 = [1, 1, 2];
const P = (d: number): V3 => [1, 1, (d - 2) / 2];
const on = (X: V3, d: number) => Math.abs(X[0] + X[1] + 2 * X[2] - d) < 1e-9;

function ShiftTask({ s, done }: { s: { d: number }; done: boolean }) {
  const p = P(s.d), q: V3 = [2 * p[0], 2 * p[1], 2 * p[2]];
  const ok = on(q, s.d);
  return (
    <Scene3D R={4} label="Plano x + y + 2z = d, um ponto P dele e o dobro 2P">
      <PlaneMesh plane={{ n: N, d: s.d }} color={done ? "obj3" : "obj4"} opacity={0.28} />
      <Arrow3D to={q} color={ok ? "obj3" : "obj5"} label={ok ? "2P (no plano)" : "2P (fora do plano)"} width={3} dashed={!ok} />
      <Arrow3D to={p} color="obj1" label="P" width={4} />
      <Point3D at={[0, 0, 0]} color="text" label="0" />
    </Scene3D>
  );
}

function ShiftControls({ s, set }: { s: { d: number }; set: (p: { d: number }) => void }) {
  return <Slider tex={o2("d")} value={s.d} onChange={(d) => set({ d })} min={-2} max={4} step={0.5} />;
}

function AxesPredict({ revealed, t }: { revealed: boolean; t: number }) {
  const u: V3 = [2, 0, 0], v: V3 = [0, 2, 0];
  return (
    <Scene3D R={3.5} label="O conjunto formado pelo eixo x e pelo eixo y">
      <Line3D line={{ p: [0, 0, 0], v: [1, 0, 0] }} color="obj4" width={5} R={3.5} />
      <Line3D line={{ p: [0, 0, 0], v: [0, 1, 0] }} color="obj4" width={5} R={3.5} />
      <Arrow3D to={u} color="obj1" label="u" width={3} />
      <Arrow3D to={v} color="obj2" label="v" width={3} />
      {revealed && t > 0.4 && (
        <>
          <Seg3D a={u} b={add(u, v)} dashed />
          <Seg3D a={v} b={add(u, v)} dashed />
          <Arrow3D to={add(u, v)} color="obj5" label="u + v: fora dos eixos" width={4} />
        </>
      )}
    </Scene3D>
  );
}

function BaseFigure() {
  return (
    <Scene3D R={3.5} label="O plano x + y − z = 0 é gerado por dois vetores: dimensão 2">
      <PlaneMesh plane={{ n: [1, 1, -1], d: 0 }} color="obj4" opacity={0.25} R={3.5} />
      <Line3D line={{ p: [0, 0, 0], v: [1, -1, 0] }} color="obj5" width={3} R={3.5} dashed />
      <Arrow3D to={[1, 0, 1]} color="obj1" label="(1, 0, 1)" width={4} />
      <Arrow3D to={[0, 1, 1]} color="obj2" label="(0, 1, 1)" width={4} />
      <Point3D at={[0, 0, 0]} color="text" label="0" />
    </Scene3D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Três regras",
      body: (
        <>
          <p>
            Um <b>subespaço</b> é um pedaço do espaço que é “fechado” para as contas com vetores. Ele precisa:
          </p>
          <ul>
            <li>conter a origem;</li>
            <li>
              conter <b className="obj3">u + v</b> sempre que contém <b className="obj1">u</b> e <b className="obj2">v</b>;
            </li>
            <li>conter todo múltiplo ku de um vetor u dele.</li>
          </ul>
          <p>Retas e planos que passam pela origem cumprem as três.</p>
        </>
      ),
      tex: `${o1("\\vec u")}, ${o2("\\vec v")} \\in W \\;\\Rightarrow\\; ${o3("\\vec u + \\vec v")} \\in W \\;\\text{e}\\; k\\,${o1("\\vec u")} \\in W`,
      Figure: RulesFigure,
    }),
    tarefa({
      title: "Leve o plano até a origem",
      body: (
        <p>
          O plano x + y + 2z = <b className="obj2">d</b> contém o ponto <b className="obj1">P</b>. Mova o plano até o dobro <b>2P</b> também ficar nele.
        </p>
      ),
      init: { d: 4 },
      solve: { d: 0 },
      goal: (s) => on([2 * P(s.d)[0], 2 * P(s.d)[1], 2 * P(s.d)[2]], s.d),
      readout: (s) => `${texEquation(N, XYZ, s.d)}\\qquad 2P\\cdot(1,1,2) = ${tex(2 * s.d)}`,
      Scene: ShiftTask,
      Controls: ShiftControls,
      success: (
        <p>
          Só com d = 0. Um plano que não passa pela origem falha logo na primeira regra, e o dobro de um ponto dele já cai fora. Em equações: um conjunto dado por
          equações lineares é subespaço exatamente quando o lado direito é <b>zero</b>.
        </p>
      ),
    }),
    prever({
      title: "Dois eixos juntos",
      question: (
        <p>
          O conjunto formado pelo <b>eixo x</b> e pelo <b>eixo y</b> (os pontos que estão em um deles) contém a origem e todos os múltiplos dos seus vetores. Ele é
          subespaço?
        </p>
      ),
      options: ["Não: a soma de dois vetores dele pode sair dele", "Sim: contém a origem", "Sim: cada eixo é um subespaço"],
      correct: 0,
      Figure: AxesPredict,
      why: (
        <p>
          (2, 0, 0) + (0, 2, 0) = (2, 2, 0), que não está em nenhum dos eixos. Falha a regra da soma. Juntar dois subespaços não costuma dar um subespaço; o menor
          subespaço que contém os dois eixos é o plano xy inteiro.
        </p>
      ),
    }),
    ideia({
      title: "Base e dimensão",
      body: (
        <p>
          Uma <b>base</b> de um subespaço é um conjunto de vetores LI que gera o subespaço todo. Todas as bases têm o mesmo número de vetores: é a{" "}
          <b>dimensão</b>. O plano x + y − z = 0 tem base <b className="obj1">(1, 0, 1)</b>, <b className="obj2">(0, 1, 1)</b>, então dimensão 2. Um terceiro vetor
          do plano, como o tracejado (1, −1, 0), já seria combinação dos dois.
        </p>
      ),
      tex: `\\dim \\operatorname{span}\\{\\vec v_1, \\dots, \\vec v_k\\} = \\operatorname{posto}\\,[\\vec v_1 \\;\\cdots\\; \\vec v_k]`,
      Figure: BaseFigure,
    }),
    pergunta({
      title: "Qual é subespaço?",
      prompt: "Qual destes conjuntos é um subespaço de $\\mathbb{R}^3$?",
      answer: {
        kind: "choice",
        options: ["$\\{(x, y, z) : x + y = 0\\}$", "$\\{(x, y, z) : x + y = 1\\}$", "$\\{(x, y, z) : x \\ge 0\\}$", "$\\{(x, y, z) : xy = 0\\}$"],
        correct: 0,
      },
      hint: "Teste a origem e a regra da soma em cada um. Desigualdades falham com múltiplos negativos.",
      explain:
        "$x + y = 0$ é um plano pela origem. $x + y = 1$ não contém a origem; $x \\ge 0$ falha com $k = -1$; e $xy = 0$ é a união de dois planos, que falha na soma.",
    }),
    pergunta({
      title: "Dimensão do span",
      prompt: "Qual é a dimensão do espaço gerado por $(1, 2, 0)$, $(2, 4, 0)$ e $(0, 0, 1)$?",
      answer: { kind: "number", value: 2, label: "dimensão" },
      hint: "O segundo vetor é o dobro do primeiro. Quantos sobram independentes?",
      explain: "$(2, 4, 0) = 2(1, 2, 0)$ não acrescenta nada. Sobram $(1, 2, 0)$ e $(0, 0, 1)$, que são LI: dimensão $2$.",
    }),
    pergunta({
      title: "Ajustando o lado direito",
      prompt: "Para que valor de $k$ o plano $2x + y - z = k - 3$ é um subespaço?",
      answer: { kind: "number", value: 3, label: "$k$" },
      hint: "Ele precisa passar pela origem.",
      explain: "Com $x = y = z = 0$ o lado esquerdo é $0$, então $k - 3 = 0$ e $k = 3$.",
    }),
  ],
};

export default lesson;
