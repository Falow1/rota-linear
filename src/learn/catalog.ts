/**
 * Catálogo do curso: rotas, lições (em ordem) e o resumo de fórmulas de cada lição.
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
  /** Número da rota (1 a 8), como aparece na tela. */
  num: number;
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
  { id: "vetores", num: 1, title: "Setas e produtos", summary: "Vetores: soma, produto escalar, ângulo, projeção, produto vetorial e misto." },
  { id: "retas-planos", num: 2, title: "Retas, planos e distâncias", summary: "Equações da reta e do plano, posições relativas e distâncias." },
  { id: "conicas", num: 3, title: "Curvas do 2º grau", summary: "Cônicas: elipse, hipérbole, parábola e a equação geral." },
  { id: "quadricas", num: 4, title: "Superfícies do 2º grau", summary: "Quádricas: elipsoides, hiperboloides, paraboloides e seus cortes." },
  { id: "sistemas", num: 5, title: "Equações e matrizes", summary: "Sistemas lineares, escalonamento, determinante e contas com matrizes." },
  { id: "espacos", num: 6, title: "Bases e subespaços", summary: "Espaços vetoriais: combinação linear, base, dimensão, núcleo e imagem." },
  { id: "transformacoes", num: 7, title: "Matrizes que movem", summary: "Transformações lineares do plano e do espaço." },
  { id: "autovalores", num: 8, title: "Autovetores e projeções", summary: "Autovalores, diagonalização, Gram–Schmidt e mínimos quadrados." },
];

const L = (
  id: string,
  slug: string,
  title: string,
  track: TrackId,
  dim: "2d" | "3d",
  summary: string,
  livre: string,
  ficha: FichaItem[],
): LessonMeta => ({ id, slug, title, track, dim, summary, ficha, livre });

export const LESSONS: LessonMeta[] = [
  L("A1", "somar-e-esticar", "Somar e esticar vetores", "vetores", "2d", "Setas que se emendam, invertem e mudam de tamanho.", "vetores-no-plano", [
    { tex: "\\vec u + \\vec v = (u_1 + v_1,\\; u_2 + v_2)", text: "Soma coordenada a coordenada; no desenho, a diagonal do paralelogramo." },
    { tex: "\\alpha\\vec u = (\\alpha u_1,\\; \\alpha u_2)", text: "Multiplicar por α estica (|α| > 1), encolhe (|α| < 1) ou inverte (α < 0)." },
    { tex: "\\|\\vec u\\| = \\sqrt{u_1^2 + u_2^2}", text: "O tamanho do vetor, pelo teorema de Pitágoras." },
  ]),
  L("A2", "angulo-pelo-produto-escalar", "O ângulo pelo produto escalar", "vetores", "2d", "Quanto dois vetores apontam para o mesmo lado.", "produto-escalar", [
    { tex: "\\vec u\\cdot\\vec v = u_1v_1 + u_2v_2", text: "Multiplica as coordenadas correspondentes e soma." },
    { tex: "\\vec u\\cdot\\vec v = \\|\\vec u\\|\\,\\|\\vec v\\|\\cos\\theta", text: "O sinal diz se o ângulo é agudo (+), reto (0) ou obtuso (−)." },
    { tex: "\\operatorname{proj}_{\\vec v}\\vec u = \\dfrac{\\vec u\\cdot\\vec v}{\\vec v\\cdot\\vec v}\\,\\vec v", text: "A “sombra” de u na direção de v." },
  ]),
  L("A3", "area-e-volume", "Área e volume com produtos", "vetores", "3d", "Produto vetorial e produto misto no espaço.", "produto-vetorial", [
    { tex: "\\vec u\\times\\vec v = \\begin{vmatrix} \\vec i & \\vec j & \\vec k\\\\ u_1 & u_2 & u_3\\\\ v_1 & v_2 & v_3\\end{vmatrix}", text: "Perpendicular a u e a v, com sentido dado pela regra da mão direita." },
    { tex: "\\|\\vec u\\times\\vec v\\| = \\text{área do paralelogramo}", text: "Zero quando u e v são paralelos." },
    { tex: "[\\vec u,\\vec v,\\vec w] = \\vec u\\cdot(\\vec v\\times\\vec w)", text: "Em módulo, o volume do paralelepípedo; zero se forem coplanares." },
  ]),

  L("B1", "jeitos-de-escrever-a-reta", "Quatro jeitos de escrever uma reta", "retas-planos", "2d", "Geral, reduzida, segmentária e paramétrica.", "reta-no-plano", [
    { tex: "ax + by + c = 0", text: "Forma geral; (a, b) é um vetor normal à reta." },
    { tex: "y = mx + n,\\quad m = \\dfrac{y_2 - y_1}{x_2 - x_1}", text: "Forma reduzida: m é a inclinação e n corta o eixo y." },
    { tex: "(x, y) = P + t\\,\\vec v", text: "Forma paramétrica: um ponto e uma direção." },
  ]),
  L("B2", "cruzamentos-e-distancias", "Cruzamentos, ângulos e distâncias", "retas-planos", "2d", "Onde duas retas se cruzam e a que distância fica um ponto.", "duas-retas", [
    { tex: "\\cos\\theta = \\dfrac{|\\vec v_1\\cdot\\vec v_2|}{\\|\\vec v_1\\|\\,\\|\\vec v_2\\|}", text: "Ângulo entre retas: sempre entre 0° e 90°." },
    { tex: "d(P, r) = \\dfrac{|a x_0 + b y_0 + c|}{\\sqrt{a^2 + b^2}}", text: "Distância de P = (x₀, y₀) à reta ax + by + c = 0." },
  ]),
  L("B3", "retas-atravessando-o-espaco", "Retas atravessando o espaço", "retas-planos", "3d", "Um ponto e uma direção, agora em 3D.", "reta-no-espaco", [
    { tex: "(x, y, z) = P + t\\,\\vec v", text: "Equação vetorial; cada t dá um ponto da reta." },
    { tex: "\\dfrac{x - x_0}{v_1} = \\dfrac{y - y_0}{v_2} = \\dfrac{z - z_0}{v_3}", text: "Forma simétrica (quando nenhuma coordenada de v é zero)." },
  ]),
  L("B4", "plano-e-normal", "O plano e seu vetor normal", "retas-planos", "3d", "Um ponto e uma normal bastam para o plano.", "plano-no-espaco", [
    { tex: "ax + by + cz = d", text: "(a, b, c) é o vetor normal ao plano." },
    { tex: "\\vec n = \\overrightarrow{AB}\\times\\overrightarrow{AC}", text: "Plano por três pontos: a normal vem do produto vetorial." },
  ]),
  L("B5", "reversas-paralelas-secantes", "Reversas, paralelas ou secantes", "retas-planos", "3d", "Posições relativas e distâncias no espaço.", "posicoes-no-espaco", [
    { tex: "d(P, \\pi) = \\dfrac{|a x_0 + b y_0 + c z_0 - d|}{\\sqrt{a^2 + b^2 + c^2}}", text: "Distância de ponto a plano." },
    { tex: "[\\overrightarrow{P_1P_2}, \\vec v_1, \\vec v_2] \\ne 0", text: "Duas retas são reversas quando esse produto misto não é zero." },
  ]),

  L("C1", "elipse-soma-constante", "Elipse: a soma que não muda", "conicas", "2d", "A soma das distâncias aos focos é sempre 2a.", "elipse", [
    { tex: "\\dfrac{(x-h)^2}{a^2} + \\dfrac{(y-k)^2}{b^2} = 1", text: "Elipse de centro (h, k) e semieixos a e b." },
    { tex: "d_1 + d_2 = 2a,\\qquad c^2 = a^2 - b^2", text: "Focos a distância c do centro (a > b)." },
    { tex: "e = \\dfrac{c}{a}", text: "Excentricidade: 0 é circunferência, perto de 1 é bem achatada." },
  ]),
  L("C2", "hiperbole-diferenca-constante", "Hipérbole: a diferença que não muda", "conicas", "2d", "Dois ramos que se aproximam das assíntotas.", "hiperbole", [
    { tex: "\\dfrac{(x-h)^2}{a^2} - \\dfrac{(y-k)^2}{b^2} = 1", text: "Hipérbole com eixo real horizontal." },
    { tex: "|d_1 - d_2| = 2a,\\qquad c^2 = a^2 + b^2", text: "Agora c é maior que a." },
    { tex: "y - k = \\pm\\dfrac{b}{a}(x - h)", text: "As assíntotas: os ramos se aproximam delas." },
  ]),
  L("C3", "parabola-foco-diretriz", "Parábola: foco e diretriz", "conicas", "2d", "Cada ponto fica à mesma distância dos dois.", "parabola", [
    { tex: "(x-h)^2 = 4p\\,(y-k)", text: "Vértice (h, k), foco a p acima do vértice." },
    { tex: "F = (h,\\; k + p),\\qquad d:\\; y = k - p", text: "Foco e diretriz ficam à mesma distância p do vértice." },
  ]),
  L("C4", "qual-conica-e-essa", "Qual cônica é essa?", "conicas", "2d", "Reconhecer a curva pelos coeficientes.", "equacao-geral-conicas", [
    { tex: "Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0", text: "Toda cônica cabe nessa forma." },
    { tex: "B^2 - 4AC \\;\\begin{cases} < 0 & \\text{elipse} \\\\ = 0 & \\text{parábola} \\\\ > 0 & \\text{hipérbole} \\end{cases}", text: "O discriminante classifica (salvo casos degenerados)." },
    { tex: "\\cot 2\\theta = \\dfrac{A - C}{B}", text: "Girar os eixos de θ faz o termo xy sumir." },
  ]),

  L("D1", "fatias-de-quadricas", "Cortando quádricas em fatias", "quadricas", "3d", "Cada corte é uma cônica, e os cortes entregam a superfície.", "quadricas", [
    { tex: "\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} + \\dfrac{z^2}{c^2} = 1", text: "Elipsoide: todos os traços são elipses (ou um ponto)." },
    { tex: "\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} - \\dfrac{z^2}{c^2} = \\pm 1", text: "Hiperboloide de uma folha (+1) ou de duas folhas (−1)." },
    { tex: "z = \\dfrac{x^2}{a^2} \\pm \\dfrac{y^2}{b^2}", text: "Paraboloide elíptico (+) ou hiperbólico, a “sela” (−)." },
  ]),

  L("E1", "onde-as-equacoes-se-encontram", "Onde as equações se encontram", "sistemas", "2d", "Uma, nenhuma ou infinitas soluções.", "sistemas-lineares", [
    { tex: "\\text{SPD}:\\ \\text{1 solução} \\quad \\text{SPI}:\\ \\infty \\quad \\text{SI}:\\ \\text{nenhuma}", text: "Retas concorrentes, coincidentes ou paralelas." },
    { tex: "\\det A \\ne 0 \\iff \\text{SPD}", text: "Para sistemas quadrados." },
  ]),
  L("E2", "escalonar-sem-mudar-a-resposta", "Escalonar sem mudar a resposta", "sistemas", "3d", "Operações elementares e o método de Gauss.", "eliminacao-de-gauss", [
    { tex: "L_i \\leftrightarrow L_j,\\quad L_i \\leftarrow kL_i\\ (k\\ne0),\\quad L_i \\leftarrow L_i + kL_j", text: "As três operações elementares." },
    { tex: "\\operatorname{posto}(A) = \\text{número de pivôs}", text: "Depois de escalonar, conte as linhas não nulas." },
  ]),
  L("E3", "area-com-sinal", "Determinante: área com sinal", "sistemas", "2d", "Quanto a matriz estica, encolhe ou achata o plano.", "determinante", [
    { tex: "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc", text: "Área com sinal do paralelogramo das colunas." },
    { tex: "\\det(AB) = \\det A\\,\\det B", text: "Fatores de área se multiplicam." },
    { tex: "\\det A = 0 \\iff A \\text{ não tem inversa}", text: "A matriz achata o plano numa reta (ou num ponto)." },
  ]),
  L("E4", "multiplicar-transpor-inverter", "Multiplicar, transpor, inverter", "sistemas", "2d", "As contas com matrizes, e por que a ordem importa.", "operacoes-com-matrizes", [
    { tex: "(AB)_{ij} = \\sum_k a_{ik}\\,b_{kj}", text: "Linha i de A “vezes” coluna j de B." },
    { tex: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}^{-1} = \\dfrac{1}{ad - bc}\\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}", text: "Inversa 2×2: troca a diagonal, muda o sinal da outra e divide pelo det." },
    { tex: "AB \\ne BA \\ \\text{(em geral)}", text: "A ordem importa." },
  ]),

  L("F1", "ate-onde-dois-vetores-alcancam", "Até onde dois vetores alcançam", "espacos", "2d", "Combinações lineares e o espaço gerado.", "combinacao-linear", [
    { tex: "\\vec w = c_1\\vec v_1 + c_2\\vec v_2", text: "Achar c₁ e c₂ é resolver um sistema." },
    { tex: "\\operatorname{span}\\{\\vec v_1, \\vec v_2\\}", text: "Todas as combinações: o plano todo, uma reta (se forem paralelos) ou só a origem." },
  ]),
  L("F2", "quando-e-subespaco", "Quando um conjunto é subespaço", "espacos", "3d", "Base e dimensão sem decorar.", "subespacos", [
    { tex: "\\vec 0 \\in W,\\quad \\vec u + \\vec v \\in W,\\quad k\\vec u \\in W", text: "As três condições de subespaço." },
    { tex: "\\dim W = \\text{número de vetores de uma base}", text: "Base: gera W e é linearmente independente." },
  ]),
  L("F3", "trocar-de-regua", "Trocar de régua: mudança de base", "espacos", "2d", "O mesmo ponto, com outras coordenadas.", "mudanca-de-base", [
    { tex: "\\vec v = x'\\,\\vec b_1 + y'\\,\\vec b_2", text: "[v]_B = (x′, y′) são as coordenadas de v na base B." },
    { tex: "\\vec v = P\\,[\\vec v]_B,\\qquad [\\vec v]_B = P^{-1}\\vec v", text: "P tem os vetores da base nas colunas." },
  ]),
  L("F4", "o-que-a-matriz-apaga", "O que a matriz apaga e o que alcança", "espacos", "3d", "Núcleo, imagem e posto.", "nucleo-e-imagem", [
    { tex: "N(A) = \\{\\vec x : A\\vec x = \\vec 0\\}", text: "O núcleo: vetores que a matriz leva na origem." },
    { tex: "\\operatorname{posto}(A) + \\operatorname{nulidade}(A) = n", text: "n é o número de colunas." },
  ]),

  L("G1", "colunas-sao-destinos", "As colunas são destinos", "transformacoes", "2d", "A matriz diz para onde vão e₁ e e₂.", "matriz-transformacao", [
    { tex: "A = \\big[\\,T(\\vec e_1)\\;\\; T(\\vec e_2)\\,\\big]", text: "Para montar a matriz, veja para onde vão e₁ e e₂." },
    { tex: "R_\\theta = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{bmatrix}", text: "Rotação de θ no sentido anti-horário." },
  ]),
  L("G2", "encadear-e-desfazer", "Encadear e desfazer", "transformacoes", "2d", "Composição BA e a matriz inversa.", "composicao-e-inversa", [
    { tex: "(B\\circ A)(\\vec v) = BA\\,\\vec v", text: "A matriz da direita age primeiro." },
    { tex: "A^{-1}A = I", text: "A inversa desfaz a transformação." },
    { tex: "\\det(BA) = \\det B\\,\\det A", text: "Det 1: muda a forma, mas não a área (ex.: cisalhamento)." },
  ]),
  L("G3", "girar-refletir-achatar", "Girar, refletir e achatar no espaço", "transformacoes", "3d", "Transformações 3D aplicadas a um cubo.", "transformacoes-3d", [
    { tex: "R_z(\\theta) = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta & 0 \\\\ \\sin\\theta & \\cos\\theta & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}", text: "Rotação em torno do eixo z." },
    { tex: "|\\det A| = \\text{fator de volume}", text: "Projeção: det 0, o cubo vira um quadrado sem volume." },
  ]),

  L("H1", "direcoes-que-so-esticam", "Direções que só esticam", "autovalores", "2d", "Autovalores e autovetores.", "autovalores", [
    { tex: "A\\vec v = \\lambda\\vec v,\\quad \\vec v \\ne \\vec 0", text: "v é autovetor e λ é o autovalor." },
    { tex: "\\det(A - \\lambda I) = 0", text: "Polinômio característico; em 2×2: λ² − (tr A)λ + det A = 0." },
  ]),
  L("H2", "diagonalizar-e-trocar-de-eixos", "Diagonalizar é trocar de eixos", "autovalores", "2d", "Na base dos autovetores, a matriz vira diagonal.", "diagonalizacao", [
    { tex: "A = PDP^{-1}", text: "P: autovetores nas colunas. D: autovalores na diagonal." },
    { tex: "A^k = PD^kP^{-1}", text: "Potências ficam fáceis." },
    { tex: "\\lambda_1\\lambda_2 > 0 \\Rightarrow \\text{elipse},\\quad < 0 \\Rightarrow \\text{hipérbole}", text: "Forma quadrática pelos sinais dos autovalores." },
  ]),
  L("H3", "autoespacos-em-3d", "Autoespaços em 3D", "autovalores", "3d", "Multiplicidades e o teorema de Hamilton–Cayley.", "diagonalizacao-3x3", [
    { tex: "1 \\le m_g(\\lambda) \\le m_a(\\lambda)", text: "Diagonalizável quando m_g = m_a para todo λ." },
    { tex: "p(A) = 0", text: "Hamilton–Cayley: toda matriz anula o próprio polinômio característico." },
  ]),
  L("H4", "endireitar-uma-base", "Endireitar uma base", "autovalores", "2d", "Gram–Schmidt: de vetores tortos a uma base ortonormal.", "gram-schmidt", [
    { tex: "\\vec u_2 = \\vec v_2 - \\operatorname{proj}_{\\vec u_1}\\vec v_2", text: "Tira de v₂ a parte na direção de u₁." },
    { tex: "\\vec e_i = \\dfrac{\\vec u_i}{\\|\\vec u_i\\|}", text: "Depois, normaliza." },
  ]),
  L("H5", "a-reta-que-mais-se-aproxima", "A reta que mais se aproxima", "autovalores", "2d", "Mínimos quadrados e as equações normais.", "minimos-quadrados", [
    { tex: "A^{T}A\\,\\hat{\\vec x} = A^{T}\\vec y", text: "Equações normais; o vetor y guarda os valores medidos." },
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
