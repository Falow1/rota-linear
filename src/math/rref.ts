import { tex } from "./format";
import { clone, type Mat } from "./mat";
import { clean } from "./tolerance";

export interface RowStep {
  kind: "start" | "swap" | "scale" | "add";
  /** Operação elementar em LaTeX, ex.: L_2 \leftarrow L_2 - 3L_1 */
  tex: string;
  /** Matriz depois da operação. */
  matrix: Mat;
  /** Linhas alteradas por esta operação. */
  rows: number[];
}

const L = (i: number) => `L_{${i + 1}}`;

function coefTex(f: number): string {
  return Math.abs(f - 1) < 1e-12 ? "" : tex(f, { maxDen: 100, digits: 3 });
}

/**
 * Escalonamento passo a passo.
 * - "gauss": forma escalonada (zeros abaixo dos pivôs).
 * - "jordan": forma escalonada reduzida (pivôs 1 e zeros acima e abaixo).
 * `coefCols` limita a busca de pivôs às colunas dos coeficientes (matriz aumentada).
 */
export function eliminationSteps(A: Mat, mode: "gauss" | "jordan", coefCols = A[0].length): RowStep[] {
  const M = clone(A);
  const rows = M.length;
  const cols = M[0].length;
  const steps: RowStep[] = [{ kind: "start", tex: "\\text{Matriz inicial}", matrix: clone(M), rows: [] }];
  const snap = () => M.map((r) => r.map((x) => clean(x, 1e-9)));
  let r = 0;
  for (let c = 0; c < coefCols && r < rows; c++) {
    let p = -1;
    // Preferência didática: uma linha com pivô 1 ou -1; senão a primeira não nula.
    for (let i = r; i < rows; i++) if (Math.abs(Math.abs(M[i][c]) - 1) < 1e-12) { p = i; break; }
    if (p < 0) for (let i = r; i < rows; i++) if (Math.abs(M[i][c]) > 1e-10) { p = i; break; }
    if (p < 0) continue;
    if (p !== r) {
      [M[p], M[r]] = [M[r], M[p]];
      steps.push({ kind: "swap", tex: `${L(r)} \\leftrightarrow ${L(p)}`, matrix: snap(), rows: [r, p] });
    }
    if (mode === "jordan" && Math.abs(M[r][c] - 1) > 1e-12) {
      const k = 1 / M[r][c];
      for (let j = 0; j < cols; j++) M[r][j] *= k;
      M[r][c] = 1;
      steps.push({ kind: "scale", tex: `${L(r)} \\leftarrow ${coefTex(k)}${L(r)}`, matrix: snap(), rows: [r] });
    }
    for (let i = mode === "jordan" ? 0 : r + 1; i < rows; i++) {
      if (i === r || Math.abs(M[i][c]) < 1e-12) continue;
      const f = M[i][c] / M[r][c];
      for (let j = 0; j < cols; j++) M[i][j] -= f * M[r][j];
      M[i][c] = 0;
      const sign = f > 0 ? "-" : "+";
      steps.push({ kind: "add", tex: `${L(i)} \\leftarrow ${L(i)} ${sign} ${coefTex(Math.abs(f))}${L(r)}`, matrix: snap(), rows: [i] });
    }
    r++;
  }
  return steps;
}
