import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, texDec, texTuple } from "../math/format";
import { add, cross, norm, type Vec3 } from "../math/vec";
import { Slider } from "../ui/controls";
import { Arrow3D, Parallelepiped, Poly3D, Scene3D, type V3 } from "../viz3d";

const U: Vec3 = [2, 1, 0], V: Vec3 = [0, 2, 1];
const W = cross(U, V); // (1, −2, 4)

function CrossFigure() {
  return (
    <Scene3D R={4} label="u, v e o produto vetorial u × v">
      <Poly3D points={[[0, 0, 0], U, add(U, V), V] as V3[]} color="obj5" opacity={0.25} />
      <Arrow3D to={U as V3} color="obj1" label="u" />
      <Arrow3D to={V as V3} color="obj2" label="v" />
      <Arrow3D to={W as V3} color="obj3" label="u × v" width={4} />
    </Scene3D>
  );
}

function SwapFigure({ revealed, t }: { revealed: boolean; t: number }) {
  const back: V3 = [-W[0] * t, -W[1] * t, -W[2] * t];
  return (
    <Scene3D R={4} label="u × v e v × u">
      <Poly3D points={[[0, 0, 0], U, add(U, V), V] as V3[]} color="obj5" opacity={0.2} />
      <Arrow3D to={U as V3} color="obj1" label="u" />
      <Arrow3D to={V as V3} color="obj2" label="v" />
      <Arrow3D to={W as V3} color="obj3" label="u × v" width={4} opacity={revealed ? 0.45 : 1} />
      {revealed && t > 0.02 && <Arrow3D to={back} color="obj4" label={t > 0.9 ? "v × u" : undefined} width={4} />}
    </Scene3D>
  );
}

const TU: Vec3 = [2, 1, 0];

function AreaScene({ s }: { s: { v: number[] } }) {
  const v = s.v as Vec3;
  const w = cross(TU, v);
  return (
    <Scene3D R={4} label="Ajuste v até a área ser zero">
      <Poly3D points={[[0, 0, 0], TU, add(TU, v), v] as V3[]} color="obj5" opacity={0.3} />
      <Arrow3D to={TU as V3} color="obj1" label="u" />
      <Arrow3D to={v as V3} color="obj2" label="v" />
      {norm(w) > 1e-6 && <Arrow3D to={w as V3} color="obj3" label="u × v" width={4} />}
    </Scene3D>
  );
}

function AreaControls({ s, set }: { s: { v: number[] }; set: (p: { v: number[] }) => void }) {
  const v = s.v;
  const put = (i: number, x: number) => set({ v: v.map((y, j) => (j === i ? x : y)) });
  return (
    <>
      <Slider tex={o2("v_1")} value={v[0]} onChange={(x) => put(0, x)} min={-4} max={4} step={0.5} />
      <Slider tex={o2("v_2")} value={v[1]} onChange={(x) => put(1, x)} min={-4} max={4} step={0.5} />
      <Slider tex={o2("v_3")} value={v[2]} onChange={(x) => put(2, x)} min={-4} max={4} step={0.5} />
    </>
  );
}

function BoxFigure() {
  const u: V3 = [2.5, 0, 0], v: V3 = [0.8, 2.2, 0], w: V3 = [0.6, 0.5, 2];
  return (
    <Scene3D R={4} label="Paralelepípedo gerado por u, v e w">
      <Parallelepiped u={u} v={v} w={w} color="obj4" opacity={0.2} />
      <Arrow3D to={u} color="obj1" label="u" />
      <Arrow3D to={v} color="obj2" label="v" />
      <Arrow3D to={w} color="obj6" label="w" />
    </Scene3D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Um vetor perpendicular aos dois",
      body: (
        <>
          <p>
            No espaço existe um produto que dá um <b>vetor</b>: <b className="obj3">u × v</b>, perpendicular a <b className="obj1">u</b> e a{" "}
            <b className="obj2">v</b> ao mesmo tempo. O tamanho dele é a <b>área</b> do paralelogramo laranja.
          </p>
          <p>
            O sentido segue a <b>regra da mão direita</b>: dedos de u para v, polegar aponta para u × v. Gire a cena com o mouse ou o dedo.
          </p>
        </>
      ),
      tex: `${o1("\\vec u")}\\times${o2("\\vec v")} = (u_2v_3 - u_3v_2,\\; u_3v_1 - u_1v_3,\\; u_1v_2 - u_2v_1)`,
      Figure: CrossFigure,
    }),
    prever({
      title: "Trocando a ordem",
      question: (
        <p>
          Se em vez de u × v calcularmos <b className="obj4">v × u</b>, o que acontece com o vetor?
        </p>
      ),
      options: ["Fica igual", "Mesmo tamanho, sentido oposto", "Fica perpendicular a u × v", "Vira o vetor nulo"],
      correct: 1,
      Figure: SwapFigure,
      why: (
        <p>
          v × u = −(u × v). A área é a mesma, mas a mão direita, indo de v para u, aponta para o outro lado. O produto vetorial{" "}
          <b>não é comutativo</b>.
        </p>
      ),
    }),
    tarefa({
      title: "Zere a área",
      body: (
        <p>
          Com <b className="obj1">u = (2, 1, 0)</b> fixo, ajuste <b className="obj2">v</b> até o paralelogramo sumir, isto é, até ‖u × v‖ = 0.
        </p>
      ),
      init: { v: [0, 2, 1] },
      solve: { v: [4, 2, 0] },
      goal: (s) => norm(cross(TU, s.v as Vec3)) < 1e-9 && norm(s.v) > 0.1,
      readout: (s) => `\\|${o1("\\vec u")}\\times${o2("\\vec v")}\\| = ${texDec(norm(cross(TU, s.v as Vec3)), 2)}`,
      Scene: AreaScene,
      Controls: AreaControls,
      success: (
        <p>
          A área some quando v é <b>paralelo</b> a u, isto é, quando v é múltiplo de (2, 1, 0). Por isso u × v = 0 é o teste de paralelismo no espaço.
        </p>
      ),
    }),
    ideia({
      title: "Produto misto: o volume",
      body: (
        <p>
          Com três vetores, o <b>produto misto</b> [u, v, w] = u · (v × w) é um número. Em módulo, ele é o <b>volume</b> do paralelepípedo. Se der zero, os
          três vetores estão num mesmo plano (são <b>coplanares</b>).
        </p>
      ),
      tex: `[${o1("\\vec u")}, ${o2("\\vec v")}, \\vec w] = \\begin{vmatrix} u_1 & u_2 & u_3 \\\\ v_1 & v_2 & v_3 \\\\ w_1 & w_2 & w_3 \\end{vmatrix}`,
      Figure: BoxFigure,
    }),
    pergunta({
      title: "Na conta",
      prompt: "Calcule $\\vec u\\times\\vec v$ para $\\vec u = (1, 2, 0)$ e $\\vec v = (0, 1, 3)$.",
      answer: { kind: "vector", value: [6, -3, 1] },
      hint: "Primeira coordenada: $u_2v_3 - u_3v_2 = 2\\cdot3 - 0\\cdot1$. Faça o mesmo padrão para as outras.",
      explain: `$(2\\cdot3 - 0\\cdot1,\\; 0\\cdot0 - 1\\cdot3,\\; 1\\cdot1 - 2\\cdot0) = ${texTuple([6, -3, 1])}$.`,
    }),
    pergunta({
      title: "Área",
      prompt: "Qual é a área do paralelogramo gerado por $\\vec u = (3, 0, 0)$ e $\\vec v = (1, 2, 0)$?",
      answer: { kind: "number", value: 6, label: "área" },
      hint: "A área é $\\|\\vec u\\times\\vec v\\|$. Aqui $\\vec u\\times\\vec v = (0, 0, 6)$.",
      explain: `$\\vec u\\times\\vec v = (0, 0, 6)$, cujo tamanho é $6$. Faz sentido: base 3 e altura 2.`,
    }),
  ],
};

export default lesson;
