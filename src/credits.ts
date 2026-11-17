/**
 * Créditos do trabalho. Edite aqui: o rodapé e a página Sobre leem deste arquivo.
 * Campos vazios simplesmente não aparecem no site.
 */
export const CREDITS = {
  disciplina: "Geometria Analítica e Álgebra Linear",
  instituicao: "UNEMAT",
  curso: "",
  professor: "",
  /** Integrantes do grupo, na ordem em que devem aparecer. */
  autores: ["Gabriel Egnes", "Gabriel Vinicius", "Gustavo", "Rhonny", "Lairo"] as string[],
  /** Ex.: "2026/2" */
  periodo: "",
};

/** "A, B e C" */
const listaPtBr = (nomes: string[]) =>
  nomes.length < 2 ? nomes.join("") : `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;

/** Linha de detalhes (curso, professor, integrantes, período) sem os campos vazios. */
export function creditDetails(): string[] {
  const c = CREDITS;
  return [
    c.curso && `Curso: ${c.curso}`,
    c.professor && `Professor(a): ${c.professor}`,
    c.autores.length > 0 && `${c.autores.length > 1 ? "Integrantes" : "Autor(a)"}: ${listaPtBr(c.autores)}`,
    c.periodo && `Período: ${c.periodo}`,
  ].filter((x): x is string => Boolean(x));
}
