/**
 * Catálogo do curso: trilhas, lições (em ordem) e a ficha de fórmulas de cada lição.
 * O conteúdo das lições (cartões) e os geradores de exercício são carregados sob demanda.
 */

export type TrackId =
  | "vetores"
  | "retas-planos"
  | "conicas"
  | "quadricas"
  | "sistemas"
  | "espacos"
  | "transformacoes"
  | "autovalores";

export interface Track {
  id: TrackId;
  letter: string;
  title: string;
  summary: string;
}

/** Uma linha da ficha de revisão: a fórmula e o que ela diz. */
export interface FichaItem {
  tex: string;
  text: string;
}

export interface LessonMeta {
  id: string;
  slug: string;
  title: string;
  track: TrackId;
  dim: "2d" | "3d";
  summary: string;
  /** Slug do módulo correspondente no Equação Viva (modo livre). */
  livre: string;
  ficha: FichaItem[];
}

export const TRACKS: Track[] = [
  { id: "vetores", letter: "A", title: "Vetores", summary: "Soma, produto escalar, ângulo, projeção, produto vetorial e misto." },
  { id: "retas-planos", letter: "B", title: "Retas e planos", summary: "Equações da reta e do plano, posições relativas e distâncias." },
  { id: "conicas", letter: "C", title: "Cônicas", summary: "Elipse, hipérbole, parábola e a equação geral do 2º grau." },
  { id: "quadricas", letter: "D", title: "Quádricas", summary: "Superfícies do 2º grau e seus traços." },
  { id: "sistemas", letter: "E", title: "Sistemas e matrizes", summary: "Sistemas lineares, escalonamento, determinante e operações com matrizes." },
  { id: "espacos", letter: "F", title: "Espaços vetoriais", summary: "Combinação linear, subespaços, base, mudança de base, núcleo e imagem." },
  { id: "transformacoes", letter: "G", title: "Transformações lineares", summary: "A matriz como transformação do plano e do espaço." },
  { id: "autovalores", letter: "H", title: "Autovalores e ortogonalidade", summary: "Autovetores, diagonalização, Gram–Schmidt e mínimos quadrados." },
];

const L = (
  id: string,
  slug: string,
  title: string,
  track: TrackId,
  dim: "2d" | "3d",
  summary: string,
  ficha: FichaItem[],
  livre = slug,
): LessonMeta => ({ id, slug, title, track, dim, summary, ficha, livre });

export const LESSONS: LessonMeta[] = [
  L("A1", "vetores-no-plano", "Vetores no plano", "vetores", "2d", "Somar, subtrair e esticar setas.", [
    { tex: "\\vec u + \\vec v = (u_1 + v_1,\\; u_2 + v_2)", text: "Soma coordenada a coordenada; no desenho, a diagonal do paralelogramo." },
    { tex: "\\alpha\\vec u = (\\alpha u_1,\\; \\alpha u_2)", text: "Multiplicar por α estica (|α| > 1), encolhe (|α| < 1) ou inverte (α < 0)." },
    { tex: "\\|\\vec u\\| = \\sqrt{u_1^2 + u_2^2}", text: "O tamanho do vetor, pelo teorema de Pitágoras." },
  ]),
  L("A2", "produto-escalar", "Produto escalar", "vetores", "2d", "Quanto dois vetores apontam para o mesmo lado.", [
    { tex: "\\vec u\\cdot\\vec v = u_1v_1 + u_2v_2", text: "Multiplica as coordenadas correspondentes e soma." },
    { tex: "\\vec u\\cdot\\vec v = \\|\\vec u\\|\\,\\|\\vec v\\|\\cos\\theta", text: "O sinal diz se o ângulo é agudo (+), reto (0) ou obtuso (−)." },
    { tex: "\\operatorname{proj}_{\\vec v}\\vec u = \\dfrac{\\vec u\\cdot\\vec v}{\\vec v\\cdot\\vec v}\\,\\vec v", text: "A “sombra” de u na direção de v." },
  ]),
  L("A3", "produto-vetorial", "Produto vetorial e misto", "vetores", "3d", "Um vetor perpendicular aos dois, e o volume.", [
    { tex: "\\vec u\\times\\vec v = \\begin{vmatrix} \\vec i & \\vec j & \\vec k\\\\ u_1 & u_2 & u_3\\\\ v_1 & v_2 & v_3\\end{vmatrix}", text: "Perpendicular a u e a v, com sentido dado pela regra da mão direita." },
    { tex: "\\|\\vec u\\times\\vec v\\| = \\text{área do paralelogramo}", text: "Zero quando u e v são paralelos." },
    { tex: "[\\vec u,\\vec v,\\vec w] = \\vec u\\cdot(\\vec v\\times\\vec w)", text: "Em módulo, o volume do paralelepípedo; zero se forem coplanares." },
  ]),

  L("B1", "reta-no-plano", "Equações da reta", "retas-planos", "2d", "Quatro jeitos de escrever a mesma reta.", [
    { tex: "ax + by + c = 0", text: "Forma geral; (a, b) é um vetor normal à reta." },
    { tex: "y = mx + n,\\quad m = \\dfrac{y_2 - y_1}{x_2 - x_1}", text: "Forma reduzida: m é a inclinação e n corta o eixo y." },
    { tex: "(x, y) = P + t\\,\\vec v", text: "Forma paramétrica: um ponto e uma direção." },
  ]),
  L("B2", "duas-retas", "Duas retas e um ponto", "retas-planos", "2d", "Onde se cruzam, que ângulo fazem e a que distância está um ponto.", [
    { tex: "\\cos\\theta = \\dfrac{|\\vec v_1\\cdot\\vec v_2|}{\\|\\vec v_1\\|\\,\\|\\vec v_2\\|}", text: "Ângulo entre retas: sempre entre 0° e 90°." },
    { tex: "d(P, r) = \\dfrac{|a x_0 + b y_0 + c|}{\\sqrt{a^2 + b^2}}", text: "Distância de P = (x₀, y₀) à reta ax + by + c = 0." },
  ]),
  L("B3", "reta-no-espaco", "Reta no espaço", "retas-planos", "3d", "Um ponto e uma direção, agora em 3D.", [
    { tex: "(x, y, z) = P + t\\,\\vec v", text: "Equação vetorial; cada t dá um ponto da reta." },
    { tex: "\\dfrac{x - x_0}{v_1} = \\dfrac{y - y_0}{v_2} = \\dfrac{z - z_0}{v_3}", text: "Forma simétrica (quando nenhuma coordenada de v é zero)." },
  ]),
  L("B4", "plano-no-espaco", "Plano no espaço", "retas-planos", "3d", "Um ponto e um vetor normal definem o plano.", [
    { tex: "ax + by + cz = d", text: "(a, b, c) é o vetor normal ao plano." },
    { tex: "\\vec n = \\overrightarrow{AB}\\times\\overrightarrow{AC}", text: "Plano por três pontos: a normal vem do produto vetorial." },
  ]),
  L("B5", "posicoes-no-espaco", "Posições e distâncias", "retas-planos", "3d", "Retas reversas, interseções e distâncias no espaço.", [
    { tex: "d(P, \\pi) = \\dfrac{|a x_0 + b y_0 + c z_0 - d|}{\\sqrt{a^2 + b^2 + c^2}}", text: "Distância de ponto a plano." },
    { tex: "[\\overrightarrow{P_1P_2}, \\vec v_1, \\vec v_2] \\ne 0", text: "Duas retas são reversas quando esse produto misto não é zero." },
  ]),

  L("C1", "elipse", "Elipse", "conicas", "2d", "A soma das distâncias aos focos é constante.", [
    { tex: "\\dfrac{(x-h)^2}{a^2} + \\dfrac{(y-k)^2}{b^2} = 1", text: "Elipse de centro (h, k) e semieixos a e b." },
    { tex: "d_1 + d_2 = 2a,\\qquad c^2 = a^2 - b^2", text: "Focos a distância c do centro (a > b)." },
    { tex: "e = \\dfrac{c}{a}", text: "Excentricidade: 0 é circunferência, perto de 1 é bem achatada." },
  ]),
  L("C2", "hiperbole", "Hipérbole", "conicas", "2d", "A diferença das distâncias aos focos é constante.", [
    { tex: "\\dfrac{(x-h)^2}{a^2} - \\dfrac{(y-k)^2}{b^2} = 1", text: "Hipérbole com eixo real horizontal." },
    { tex: "|d_1 - d_2| = 2a,\\qquad c^2 = a^2 + b^2", text: "Agora c é maior que a." },
    { tex: "y - k = \\pm\\dfrac{b}{a}(x - h)", text: "As assíntotas: os ramos se aproximam delas." },
  ]),
  L("C3", "parabola", "Parábola", "conicas", "2d", "Mesma distância do foco e da diretriz.", [
    { tex: "(x-h)^2 = 4p\\,(y-k)", text: "Vértice (h, k), foco a p acima do vértice." },
    { tex: "F = (h,\\; k + p),\\qquad d:\\; y = k - p", text: "Foco e diretriz ficam à mesma distância p do vértice." },
  ]),
  L("C4", "equacao-geral-conicas", "Equação geral do 2º grau", "conicas", "2d", "Reconhecer a cônica pelos coeficientes.", [
    { tex: "Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0", text: "Toda cônica cabe nessa forma." },
    { tex: "B^2 - 4AC \\;\\begin{cases} < 0 & \\text{elipse} \\\\ = 0 & \\text{parábola} \\\\ > 0 & \\text{hipérbole} \\end{cases}", text: "O discriminante classifica (salvo casos degenerados)." },
    { tex: "\\cot 2\\theta = \\dfrac{A - C}{B}", text: "Girar os eixos de θ faz o termo xy sumir." },
  ]),

  L("D1", "quadricas", "Galeria das quádricas", "quadricas", "3d", "Superfícies do 2º grau e seus traços.", [
    { tex: "\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} + \\dfrac{z^2}{c^2} = 1", text: "Elipsoide: todos os traços são elipses (ou um ponto)." },
    { tex: "\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} - \\dfrac{z^2}{c^2} = \\pm 1", text: "Hiperboloide de uma folha (+1) ou de duas folhas (−1)." },
    { tex: "z = \\dfrac{x^2}{a^2} \\pm \\dfrac{y^2}{b^2}", text: "Paraboloide elíptico (+) ou hiperbólico, a “sela” (−)." },
  ]),

  L("E1", "sistemas-lineares", "O que é a solução de um sistema", "sistemas", "2d", "Cada equação é uma reta; a solução é onde todas se encontram.", [
    { tex: "\\text{SPD}:\\ \\text{1 solução} \\quad \\text{SPI}:\\ \\infty \\quad \\text{SI}:\\ \\text{nenhuma}", text: "Retas concorrentes, coincidentes ou paralelas." },
    { tex: "\\det A \\ne 0 \\iff \\text{SPD}", text: "Para sistemas quadrados." },
  ]),
  L("E2", "eliminacao-de-gauss", "Eliminação de Gauss", "sistemas", "3d", "Operações que mudam as equações, mas não a solução.", [
    { tex: "L_i \\leftrightarrow L_j,\\quad L_i \\leftarrow kL_i\\ (k\\ne0),\\quad L_i \\leftarrow L_i + kL_j", text: "As três operações elementares." },
    { tex: "\\operatorname{posto}(A) = \\text{número de pivôs}", text: "Depois de escalonar, conte as linhas não nulas." },
  ]),
  L("E3", "determinante", "Determinante", "sistemas", "2d", "Área (ou volume) com sinal.", [
    { tex: "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc", text: "Área com sinal do paralelogramo das colunas." },
    { tex: "\\det(AB) = \\det A\\,\\det B", text: "Fatores de área se multiplicam." },
    { tex: "\\det A = 0 \\iff A \\text{ não tem inversa}", text: "A matriz achata o plano numa reta (ou num ponto)." },
  ]),
  L("E4", "operacoes-com-matrizes", "Operações com matrizes", "sistemas", "2d", "Produto, transposta e inversa.", [
    { tex: "(AB)_{ij} = \\sum_k a_{ik}\\,b_{kj}", text: "Linha i de A “vezes” coluna j de B." },
    { tex: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}^{-1} = \\dfrac{1}{ad - bc}\\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}", text: "Inversa 2×2: troca a diagonal, muda o sinal da outra e divide pelo det." },
    { tex: "AB \\ne BA \\ \\text{(em geral)}", text: "A ordem importa." },
  ]),

  L("F1", "combinacao-linear", "Combinação linear", "espacos", "2d", "Quais vetores dá para alcançar com c₁v₁ + c₂v₂?", [
    { tex: "\\vec w = c_1\\vec v_1 + c_2\\vec v_2", text: "Achar c₁ e c₂ é resolver um sistema." },
    { tex: "\\operatorname{span}\\{\\vec v_1, \\vec v_2\\}", text: "Todas as combinações: o plano todo, uma reta (se forem paralelos) ou só a origem." },
  ]),
  L("F2", "subespacos", "Subespaços, base e dimensão", "espacos", "3d", "Quando um conjunto é subespaço e quantos vetores o geram.", [
    { tex: "\\vec 0 \\in W,\\quad \\vec u + \\vec v \\in W,\\quad k\\vec u \\in W", text: "As três condições de subespaço." },
    { tex: "\\dim W = \\text{número de vetores de uma base}", text: "Base: gera W e é linearmente independente." },
  ]),
  L("F3", "mudanca-de-base", "Mudança de base", "espacos", "2d", "O mesmo ponto com coordenadas diferentes.", [
    { tex: "\\vec v = x'\\,\\vec b_1 + y'\\,\\vec b_2", text: "[v]_B = (x′, y′) são as coordenadas de v na base B." },
    { tex: "\\vec v = P\\,[\\vec v]_B,\\qquad [\\vec v]_B = P^{-1}\\vec v", text: "P tem os vetores da base nas colunas." },
  ]),
  L("F4", "nucleo-e-imagem", "Núcleo, imagem e posto", "espacos", "3d", "O que a matriz anula e o que ela alcança.", [
    { tex: "N(A) = \\{\\vec x : A\\vec x = \\vec 0\\}", text: "O núcleo: vetores que a matriz leva na origem." },
    { tex: "\\operatorname{posto}(A) + \\operatorname{nulidade}(A) = n", text: "n é o número de colunas." },
  ]),

  L("G1", "matriz-transformacao", "Matriz como transformação", "transformacoes", "2d", "As colunas são as imagens de e₁ e e₂.", [
    { tex: "A = \\big[\\,T(\\vec e_1)\\;\\; T(\\vec e_2)\\,\\big]", text: "Para montar a matriz, veja para onde vão e₁ e e₂." },
    { tex: "R_\\theta = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{bmatrix}", text: "Rotação de θ no sentido anti-horário." },
  ]),
  L("G2", "composicao-e-inversa", "Composição e inversa", "transformacoes", "2d", "Aplicar A e depois B é multiplicar BA.", [
    { tex: "(B\\circ A)(\\vec v) = BA\\,\\vec v", text: "A matriz da direita age primeiro." },
    { tex: "A^{-1}A = I", text: "A inversa desfaz a transformação." },
    { tex: "\\det(BA) = \\det B\\,\\det A", text: "Det 1: muda a forma, mas não a área (ex.: cisalhamento)." },
  ]),
  L("G3", "transformacoes-3d", "Transformações no espaço", "transformacoes", "3d", "Rotações, reflexões, projeções e escalas num cubo.", [
    { tex: "R_z(\\theta) = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta & 0 \\\\ \\sin\\theta & \\cos\\theta & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}", text: "Rotação em torno do eixo z." },
    { tex: "|\\det A| = \\text{fator de volume}", text: "Projeção: det 0, o cubo vira um quadrado sem volume." },
  ]),

  L("H1", "autovalores", "Autovalores e autovetores", "autovalores", "2d", "Direções que a matriz só estica.", [
    { tex: "A\\vec v = \\lambda\\vec v,\\quad \\vec v \\ne \\vec 0", text: "v é autovetor e λ é o autovalor." },
    { tex: "\\det(A - \\lambda I) = 0", text: "Polinômio característico; em 2×2: λ² − (tr A)λ + det A = 0." },
  ]),
  L("H2", "diagonalizacao", "Diagonalização", "autovalores", "2d", "Nos eixos dos autovetores a matriz vira diagonal.", [
    { tex: "A = PDP^{-1}", text: "P: autovetores nas colunas. D: autovalores na diagonal." },
    { tex: "A^k = PD^kP^{-1}", text: "Potências ficam fáceis." },
    { tex: "\\lambda_1\\lambda_2 > 0 \\Rightarrow \\text{elipse},\\quad < 0 \\Rightarrow \\text{hipérbole}", text: "Forma quadrática pelos sinais dos autovalores." },
  ]),
  L("H3", "diagonalizacao-3x3", "Diagonalização 3×3 e Hamilton–Cayley", "autovalores", "3d", "Multiplicidades, autoespaços e p(A) = 0.", [
    { tex: "1 \\le m_g(\\lambda) \\le m_a(\\lambda)", text: "Diagonalizável quando m_g = m_a para todo λ." },
    { tex: "p(A) = 0", text: "Hamilton–Cayley: toda matriz anula o próprio polinômio característico." },
  ]),
  L("H4", "gram-schmidt", "Gram–Schmidt", "autovalores", "2d", "De uma base qualquer a uma base ortonormal.", [
    { tex: "\\vec u_2 = \\vec v_2 - \\operatorname{proj}_{\\vec u_1}\\vec v_2", text: "Tira de v₂ a parte na direção de u₁." },
    { tex: "\\vec e_i = \\dfrac{\\vec u_i}{\\|\\vec u_i\\|}", text: "Depois, normaliza." },
  ]),
  L("H5", "minimos-quadrados", "Mínimos quadrados", "autovalores", "2d", "A reta que melhor se ajusta aos pontos.", [
    { tex: "A^{T}A\\,\\hat{\\vec x} = A^{T}\\vec b", text: "Equações normais." },
    { tex: "\\min \\sum (y_i - \\hat y_i)^2", text: "A melhor reta minimiza a soma dos quadrados dos resíduos." },
  ]),
];

export const trackById = (id: string) => TRACKS.find((t) => t.id === id);
export const lessonBySlug = (slug: string) => LESSONS.find((l) => l.slug === slug);
export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
export const lessonsOf = (track: TrackId) => LESSONS.filter((l) => l.track === track);
export const nextLesson = (id: string) => {
  const i = LESSONS.findIndex((l) => l.id === id);
  return i >= 0 ? LESSONS[i + 1] : undefined;
};

/** Endereço do módulo correspondente no Equação Viva. */
export const livreUrl = (l: LessonMeta) => `https://falow1.github.io/equacao-viva/#/m/${l.livre}`;
