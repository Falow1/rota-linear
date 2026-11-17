import { ideia, pergunta, prever, tarefa, type LessonContent } from "../learn/types";
import { o1, o2, o4, tex, texMatrix } from "../math/format";
import { useLoop } from "../player/anim";
import { Slider } from "../ui/controls";
import { Arrow3D, Parallelepiped, Point3D, Scene3D, Seg3D, type V3 } from "../viz3d";

const E1: V3 = [1, 0, 0], E2: V3 = [0, 1, 0], E3: V3 = [0, 0, 1];

/** Rotação de θ em torno de z aplicada ao cubo unitário. */
function SpinFigure() {
  const t = useLoop(5000, 600);
  const th = t * Math.PI * 1.5;
  const c = Math.cos(th), s = Math.sin(th);
  const u: V3 = [c, s, 0], v: V3 = [-s, c, 0];
  return (
    <Scene3D R={2.2} label="O cubo unitário girando em torno do eixo z">
      <Parallelepiped u={u} v={v} w={E3} color="obj4" opacity={0.2} />
      <Arrow3D to={u} color="obj1" label="T(e₁)" width={3} />
      <Arrow3D to={v} color="obj2" label="T(e₂)" width={3} />
      <Arrow3D to={E3} color="obj3" label="T(e₃) = e₃" width={3} />
    </Scene3D>
  );
}

/* A = [1 0 1; 0 1 0,5; 0 0 c]: det = c. */
const colW = (c: number): V3 => [1, 0.5, c];

function FlattenTask({ s, done }: { s: { c: number }; done: boolean }) {
  const w = colW(s.c);
  return (
    <Scene3D R={3} label="A imagem do cubo unitário pela matriz com terceira coluna (1; 0,5; c)">
      <Parallelepiped u={E1} v={E2} w={E3} color="obj-muted" opacity={0.08} />
      <Parallelepiped u={E1} v={E2} w={w} color={done ? "obj3" : "obj4"} opacity={0.25} />
      <Arrow3D to={w} color="obj2" label="T(e₃)" width={4} />
      <Arrow3D to={E1} color="obj1" label="T(e₁)" width={3} />
      <Arrow3D to={E2} color="obj1" label="T(e₂)" width={3} />
    </Scene3D>
  );
}

function FlattenControls({ s, set }: { s: { c: number }; set: (p: { c: number }) => void }) {
  return <Slider tex={o2("c")} value={s.c} onChange={(c) => set({ c })} min={-2} max={2} step={0.25} />;
}

function MirrorPredict({ revealed, t }: { revealed: boolean; t: number }) {
  const z = revealed ? 1 - 2 * t : 1;
  return (
    <Scene3D R={2.2} label="O cubo unitário e a reflexão no plano xy">
      <Parallelepiped u={E1} v={E2} w={[0, 0, z]} color="obj4" opacity={0.25} />
      <Arrow3D to={[0, 0, z]} color="obj2" label={revealed && t > 0.9 ? "T(e₃) = −e₃" : "e₃"} width={3} />
      <Point3D at={[0.5, 0.5, 0]} color="obj-muted" />
    </Scene3D>
  );
}

const CORNERS: V3[] = [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];

function ShadowFigure() {
  return (
    <Scene3D R={2.2} label="Projeção no plano xy: o cubo vira a sombra, um quadrado sem volume">
      <Parallelepiped u={E1} v={E2} w={E3} color="obj4" opacity={0.14} />
      <Parallelepiped u={E1} v={E2} w={[0, 0, 0.001]} color="obj5" opacity={0.45} />
      {CORNERS.map((p, i) => (
        <Seg3D key={i} a={p} b={[p[0], p[1], 0]} color="obj5" dashed />
      ))}
    </Scene3D>
  );
}

const lesson: LessonContent = {
  cards: [
    ideia({
      title: "Três colunas, três destinos",
      body: (
        <p>
          No espaço vale a mesma regra: as colunas de uma matriz 3×3 são as imagens de <b className="obj1">e₁</b>, <b className="obj2">e₂</b> e{" "}
          <b className="obj3">e₃</b>. Para girar em torno do eixo z, e₃ fica parado e e₁, e₂ giram como no plano. O cubo unitário vai junto.
        </p>
      ),
      tex: `R_z(\\theta) = \\left[\\begin{array}{ccc} ${o1("\\cos\\theta")} & ${o2("-\\sin\\theta")} & 0 \\\\ ${o1("\\sin\\theta")} & ${o2("\\cos\\theta")} & 0 \\\\ 0 & 0 & \\htmlClass{obj3}{1} \\end{array}\\right]`,
      Figure: SpinFigure,
    }),
    tarefa({
      title: "Achate o cubo",
      body: (
        <p>
          A matriz leva e₁ e e₂ neles mesmos e e₃ em <b className="obj2">(1; 0,5; c)</b>. Ajuste <b className="obj2">c</b> até o cubo virar uma figura sem
          volume.
        </p>
      ),
      init: { c: 1.5 },
      solve: { c: 0 },
      goal: (s) => Math.abs(s.c) < 1e-9,
      readout: (s) => `\\det ${texMatrix([[1, 0, 1], [0, 1, 0.5], [0, 0, s.c]])} = ${tex(s.c)}`,
      Scene: FlattenTask,
      Controls: FlattenControls,
      success: (
        <p>
          Com c = 0, as três colunas ficam no plano xy e o cubo vira um paralelogramo achatado: volume 0, det 0. O volume da imagem é sempre |det A| vezes o
          volume original.
        </p>
      ),
    }),
    prever({
      title: "No espelho",
      question: (
        <p>
          A reflexão no plano xy leva (x, y, z) em (x, y, −z). O determinante dela é −1. Qual é o volume do cubo unitário depois da reflexão?
        </p>
      ),
      options: ["1", "−1", "0", "2"],
      correct: 0,
      Figure: MirrorPredict,
      why: (
        <p>
          Volume é |det| = <b>1</b>: o cubo só foi espelhado para baixo. O sinal negativo do determinante não fala de tamanho, fala de <b>orientação</b>: a
          figura virou a imagem no espelho.
        </p>
      ),
    }),
    ideia({
      title: "Projeções não têm volta",
      body: (
        <p>
          A projeção no plano xy apaga a altura: (x, y, z) vai em (x, y, 0). O cubo inteiro vira a sua <b className="obj5">sombra</b>. Como pontos de alturas
          diferentes caem no mesmo lugar, não há como desfazer: det = 0 e a matriz não tem inversa.
        </p>
      ),
      tex: `P = \\left[\\begin{array}{ccc} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & ${o4("0")} \\end{array}\\right],\\qquad \\det P = 0`,
      Figure: ShadowFigure,
    }),
    pergunta({
      title: "Giro em torno de z",
      prompt: "Gire $(1, 2, 3)$ de $90°$ em torno do eixo $z$, no sentido anti-horário visto de cima.",
      answer: { kind: "vector", value: [-2, 1, 3] },
      hint: "A altura $z$ não muda. No plano $xy$, o giro de 90° faz $(x, y) \\mapsto (-y, x)$.",
      explain: "$(1, 2) \\mapsto (-2, 1)$ e $z = 3$ fica. Resultado: $(-2, 1, 3)$.",
    }),
    pergunta({
      title: "Espelho no plano yz",
      prompt: "Qual é a matriz da reflexão no plano $yz$?",
      answer: { kind: "matrix", value: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] },
      hint: "O plano $yz$ é $x = 0$. Quem troca de sinal?",
      explain: `Só $x$ troca de sinal: $${texMatrix([[-1, 0, 0], [0, 1, 0], [0, 0, 1]])}$.`,
    }),
    pergunta({
      title: "Volume novo",
      prompt: `Um sólido de volume $2$ passa pela matriz $${texMatrix([[2, 0, 0], [0, 3, 0], [0, 0, 0.5]])}$. Qual é o novo volume?`,
      answer: { kind: "number", value: 6, label: "volume" },
      hint: "Matriz diagonal: o determinante é o produto da diagonal.",
      explain: "$\\det = 2\\cdot3\\cdot\\tfrac12 = 3$, então o volume vira $3\\cdot2 = 6$.",
    }),
  ],
};

export default lesson;
