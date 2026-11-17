import { gcd as gcdInt, toFraction } from "./fraction";
import type { Mat } from "./mat";

export interface NumOpts {
  /** Maior denominador mostrado como fração (0 desliga frações). */
  maxDen?: number;
  /** Casas decimais quando não for fração simples. */
  digits?: number;
}

const DEF: Required<NumOpts> = { maxDen: 12, digits: 2 };

function decimalString(x: number, digits: number): string {
  let s = x.toFixed(digits);
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  if (s === "-0") s = "0";
  return s;
}

function normalizeZero(x: number): number {
  return Math.abs(x) < 1e-10 ? 0 : x;
}

/** Número como texto simples (pt-BR): vírgula decimal, sinal de menos tipográfico. */
export function fmt(x: number, opts: NumOpts = {}): string {
  const o = { ...DEF, ...opts };
  if (!Number.isFinite(x)) return x > 0 ? "∞" : x < 0 ? "−∞" : "indefinido";
  x = normalizeZero(x);
  const f = o.maxDen > 0 ? toFraction(x, o.maxDen, 1e-9) : null;
  let s: string;
  if (f) s = f.d === 1 ? String(f.n) : `${f.n}/${f.d}`;
  else s = decimalString(x, o.digits).replace(".", ",");
  return s.replace("-", "−");
}

/** Número em LaTeX. Frações como \frac, decimais com vírgula. */
export function tex(x: number, opts: NumOpts = {}): string {
  const o = { ...DEF, ...opts };
  if (!Number.isFinite(x)) return x > 0 ? "\\infty" : x < 0 ? "-\\infty" : "\\text{indef.}";
  x = normalizeZero(x);
  const f = o.maxDen > 0 ? toFraction(x, o.maxDen, 1e-9) : null;
  if (f) {
    if (f.d === 1) return String(f.n);
    return `${f.n < 0 ? "-" : ""}\\frac{${Math.abs(f.n)}}{${f.d}}`;
  }
  return decimalString(x, o.digits).replace(".", "{,}");
}

/** Raiz quadrada exibida de forma amigável: √8 → 2√2 quando possível. */
export function texSqrt(n: number): string {
  n = normalizeZero(n);
  if (n < 0) return `\\sqrt{${tex(n)}}`;
  const r = Math.sqrt(n);
  if (toFraction(r, 12)) return tex(r);
  const f = toFraction(n, 400);
  if (f && f.n * f.d < 1e9) {
    // √(p/q) = √(p·q)/q, extraindo quadrados perfeitos
    let k = f.n * f.d;
    let out = 1;
    for (let p = 2; p * p <= k; p++) {
      while (k % (p * p) === 0) {
        out *= p;
        k /= p * p;
      }
    }
    const g = gcdInt(out, f.d);
    out /= g;
    const den = f.d / g;
    const num = k === 1 ? String(out) : out === 1 ? `\\sqrt{${k}}` : `${out}\\sqrt{${k}}`;
    return den === 1 ? num : `\\frac{${num}}{${den}}`;
  }
  return tex(r);
}

/** Decimal (sem frações). */
export const texDec = (x: number, digits = 2): string => tex(x, { maxDen: 0, digits });

/** Raiz de um número com forma exata e aproximação: √10 ≈ 3,16; √9 = 3. */
export function texRootApprox(sq: number): string {
  const r = Math.sqrt(Math.max(0, sq));
  if (toFraction(r, 12)) return tex(r);
  if (toFraction(sq, 400)) return `${texSqrt(sq)} \\approx ${texDec(r)}`;
  return texDec(r);
}

/** Envolve um trecho LaTeX numa classe de cor (requer trust no KaTeX). */
export const cl = (cls: string, t: string): string => `\\htmlClass{${cls}}{${t}}`;
export const o1 = (t: string) => cl("obj1", t);
export const o2 = (t: string) => cl("obj2", t);
export const o3 = (t: string) => cl("obj3", t);
export const o4 = (t: string) => cl("obj4", t);
export const o5 = (t: string) => cl("obj5", t);
export const o6 = (t: string) => cl("obj6", t);
/**
 * Linha de matriz colorida: "a & b & c" com cada entrada na classe.
 * O KaTeX não aceita "&" dentro de \htmlClass, então a cor vai célula por célula.
 */
export const clRow = (cls: string, cells: string[]): string => cells.map((c) => cl(cls, c)).join(" & ");

/** "x₀ + k·v" no estilo de livro (x = 2 − 3t), omitindo zeros. */
export function texAffine(c0: number, k: number, v = "t", opts: NumOpts = {}): string {
  c0 = normalizeZero(c0);
  k = normalizeZero(k);
  if (k === 0) return tex(c0, opts);
  const mag = Math.abs(k);
  const term = Math.abs(mag - 1) < 1e-12 ? v : `${tex(mag, opts)}${v}`;
  if (c0 === 0) return (k < 0 ? "-" : "") + term;
  return `${tex(c0, opts)} ${k < 0 ? "-" : "+"} ${term}`;
}

/** Produto "(a)(b)" com parênteses só em negativos. */
export const texPar = (x: number): string => (x < -1e-12 ? `(${tex(x)})` : tex(x));

/** ad − bc com os números. */
export function det2Tex(M: number[][]): string {
  const [[a, b], [c, d]] = M;
  return `${texPar(a)}\\cdot${texPar(d)} - ${texPar(b)}\\cdot${texPar(c)} = ${tex(a * d - b * c)}`;
}

/**
 * Combinação linear limpa: coeficientes e "variáveis" (podem ser LaTeX).
 * Omite zeros, não escreve 1·x, trata sinais. Retorna "0" se tudo zero.
 */
export function texLinear(coeffs: number[], vars: string[], constant = 0, opts: NumOpts = {}): string {
  let s = "";
  const terms: { c: number; v: string }[] = coeffs.map((c, i) => ({ c, v: vars[i] }));
  if (normalizeZero(constant) !== 0) terms.push({ c: constant, v: "" });
  for (const { c, v } of terms) {
    const cc = normalizeZero(c);
    if (cc === 0) continue;
    const neg = cc < 0;
    const mag = Math.abs(cc);
    let body: string;
    if (v === "") body = tex(mag, opts);
    else if (Math.abs(mag - 1) < 1e-10) body = v;
    else body = `${tex(mag, opts)}${v}`;
    if (s === "") s = (neg ? "-" : "") + body;
    else s += (neg ? " - " : " + ") + body;
  }
  return s === "" ? "0" : s;
}

/** Equação linear: lado esquerdo = rhs. */
export function texEquation(coeffs: number[], vars: string[], rhs: number, opts: NumOpts = {}): string {
  return `${texLinear(coeffs, vars, 0, opts)} = ${tex(rhs, opts)}`;
}

/** Polinômio a partir dos coeficientes do maior grau para o menor. */
export function texPoly(coeffs: number[], v = "x", opts: NumOpts = {}): string {
  const deg = coeffs.length - 1;
  const vars = coeffs.map((_, i) => {
    const p = deg - i;
    return p === 0 ? "" : p === 1 ? v : `${v}^{${p}}`;
  });
  const lin = coeffs.slice(0, deg);
  return texLinear(lin, vars.slice(0, deg), coeffs[deg], opts);
}

/** Soma "x + (−3)" vira "x - 3": termo com sinal para concatenar. */
export function texSigned(x: number, opts: NumOpts = {}): string {
  x = normalizeZero(x);
  return x < 0 ? `- ${tex(-x, opts)}` : `+ ${tex(x, opts)}`;
}

/**
 * Coordenadas (a, b, c). Se alguma coordenada tem vírgula decimal, o separador vira
 * ponto e vírgula para não confundir: (2,5; 1).
 */
export function texTuple(v: number[], opts: NumOpts = {}): string {
  const parts = v.map((x) => tex(x, opts));
  return `(${parts.join(parts.some((s) => s.includes("{,}")) ? ";\\ " : ",\\ ")})`;
}

export function fmtTuple(v: number[], opts: NumOpts = {}): string {
  const parts = v.map((x) => fmt(x, opts));
  return `(${parts.join(parts.some((s) => s.includes(",")) ? "; " : ", ")})`;
}

/** Matriz em LaTeX. `bar` = índice da coluna antes da qual vai a barra (matriz aumentada). */
export function texMatrix(M: Mat, opts: NumOpts & { bar?: number; cellClass?: (i: number, j: number) => string | null; delim?: "b" | "v" } = {}): string {
  const cols = M[0]?.length ?? 0;
  const spec = opts.bar !== undefined ? "c".repeat(opts.bar) + "|" + "c".repeat(cols - opts.bar) : "c".repeat(cols);
  const body = M.map((r, i) =>
    r
      .map((x, j) => {
        const t = tex(x, opts);
        const c = opts.cellClass?.(i, j);
        return c ? cl(c, t) : t;
      })
      .join(" & "),
  ).join(" \\\\ ");
  const [l, r] = opts.delim === "v" ? ["\\left|", "\\right|"] : ["\\left[", "\\right]"];
  return `${l}\\begin{array}{${spec}} ${body} \\end{array}${r}`;
}

/** Vetor coluna. */
export const texCol = (v: number[], opts: NumOpts = {}): string => texMatrix(v.map((x) => [x]), opts);

/** Graus com uma casa. */
export function fmtDeg(rad: number): string {
  const d = (rad * 180) / Math.PI;
  return `${decimalString(d, 1).replace(".", ",").replace("-", "−")}°`;
}

/** Graus com uma casa, em LaTeX. */
export function texDeg(rad: number): string {
  const d = (rad * 180) / Math.PI;
  return `${decimalString(d, 1).replace(".", "{,}")}^\\circ`;
}

/** "x − a" (ou só "x" se a = 0). */
export function texShift(v: string, a: number, opts: NumOpts = {}): string {
  a = normalizeZero(a);
  return a === 0 ? v : `${v} ${texSigned(-a, opts)}`;
}
