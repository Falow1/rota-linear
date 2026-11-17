import type { Answer, CheckResult, Response } from "./types";

/**
 * Leitor de respostas digitadas. Aceita números com vírgula ou ponto, frações, raízes e π:
 *   -3   2,5   3/4   √2   2√3   sqrt(8)   π   (1+√5)/2   -2/√5
 * Sem eval e sem bibliotecas: um analisador recursivo pequeno, com mensagens em português.
 */

type Tok = { t: "num"; v: number } | { t: "op"; v: string } | { t: "sqrt" } | { t: "pi" } | { t: "(" } | { t: ")" };

class ParseError extends Error {}

function tokenize(src: string): Tok[] {
  const s = src
    .replace(/\s+/g, "")
    .replace(/[−–]/g, "-")
    .replace(/[×·]/g, "*")
    .replace(/÷/g, "/")
    .replace(/sqrt|raiz/gi, "√")
    .replace(/pi/gi, "π");
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.,]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.,]/.test(s[j])) j++;
      const raw = s.slice(i, j);
      // Vírgula decimal (padrão brasileiro) ou ponto; mais de um separador é erro.
      if ((raw.match(/[.,]/g) ?? []).length > 1) throw new ParseError("Use só uma vírgula (ou ponto) em cada número.");
      const v = Number(raw.replace(",", "."));
      if (!Number.isFinite(v) || raw === "." || raw === ",") throw new ParseError(`Não entendi o número “${raw}”.`);
      out.push({ t: "num", v });
      i = j;
    } else if ("+-*/^".includes(c)) {
      out.push({ t: "op", v: c });
      i++;
    } else if (c === "√") {
      out.push({ t: "sqrt" });
      i++;
    } else if (c === "π") {
      out.push({ t: "pi" });
      i++;
    } else if (c === "(" || c === ")") {
      out.push({ t: c });
      i++;
    } else {
      throw new ParseError(`Não entendi o símbolo “${c}”. Use números, frações (3/4), √ e π.`);
    }
  }
  return out;
}

/**
 * Gramática (multiplicação implícita entre fatores: 2√3, 3π, 2(1+√2)):
 *   expr   := term (('+'|'-') term)*
 *   term   := unary (('*'|'/') unary | unary)*
 *   unary  := '-' unary | '+' unary | power
 *   power  := atom ('^' unary)?
 *   atom   := num | π | √ atom | '(' expr ')'
 */
function parseTokens(toks: Tok[]): number {
  let p = 0;
  const peek = () => toks[p];
  const startsAtom = (t: Tok | undefined) => !!t && (t.t === "num" || t.t === "pi" || t.t === "sqrt" || t.t === "(");

  const atom = (): number => {
    const t = toks[p];
    if (!t) throw new ParseError("A resposta terminou antes do esperado.");
    if (t.t === "num") {
      p++;
      return t.v;
    }
    if (t.t === "pi") {
      p++;
      return Math.PI;
    }
    if (t.t === "sqrt") {
      p++;
      const nx = peek();
      const neg = nx?.t === "op" && nx.v === "-";
      if (neg) p++;
      const v = startsAtom(peek()) ? (neg ? -atom() : atom()) : NaN;
      if (Number.isNaN(v)) throw new ParseError("Falta o número depois do √.");
      if (v < 0) throw new ParseError("Raiz de número negativo não é um número real.");
      return Math.sqrt(v);
    }
    if (t.t === "(") {
      p++;
      const v = expr();
      if (peek()?.t !== ")") throw new ParseError("Faltou fechar um parêntese.");
      p++;
      return v;
    }
    throw new ParseError("Falta um número em algum ponto.");
  };
  const power = (): number => {
    const b = atom();
    const t = peek();
    if (t?.t === "op" && t.v === "^") {
      p++;
      return Math.pow(b, unary());
    }
    return b;
  };
  const unary = (): number => {
    const t = peek();
    if (t?.t === "op" && (t.v === "-" || t.v === "+")) {
      p++;
      const v = unary();
      return t.v === "-" ? -v : v;
    }
    return power();
  };
  const term = (): number => {
    let v = unary();
    for (;;) {
      const t = peek();
      if (t?.t === "op" && (t.v === "*" || t.v === "/")) {
        p++;
        const r = unary();
        if (t.v === "/") {
          if (r === 0) throw new ParseError("Divisão por zero.");
          v /= r;
        } else v *= r;
      } else if (startsAtom(t)) {
        v *= power();
      } else return v;
    }
  };
  const expr = (): number => {
    let v = term();
    for (;;) {
      const t = peek();
      if (t?.t === "op" && (t.v === "+" || t.v === "-")) {
        p++;
        const r = term();
        v = t.v === "+" ? v + r : v - r;
      } else return v;
    }
  };

  const v = expr();
  if (p < toks.length) throw new ParseError(toks[p].t === ")" ? "Tem um parêntese fechando sem ter aberto." : "Não entendi o fim da resposta.");
  return v;
}

/** Lê um número digitado. Lança Error com mensagem em português se não der. */
export function parseNumber(src: string): number {
  const s = src.trim();
  if (s === "") throw new ParseError("Preencha a resposta.");
  const toks = tokenize(s);
  if (toks.length === 0) throw new ParseError("Preencha a resposta.");
  const v = parseTokens(toks);
  if (!Number.isFinite(v)) throw new ParseError("Esse valor não é um número finito.");
  return v;
}

/** Versão que devolve null em vez de lançar. */
export function tryNumber(src: string): number | null {
  try {
    return parseNumber(src);
  } catch {
    return null;
  }
}

const DEF_TOL = 1e-6;
const close = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol + 1e-9 * Math.max(1, Math.abs(b));

/** Lê todos os campos; devolve a mensagem do primeiro inválido. */
function readFields(fields: string[]): { values: number[] } | { invalid: string } {
  const values: number[] = [];
  for (let i = 0; i < fields.length; i++) {
    try {
      values.push(parseNumber(fields[i]));
    } catch (e) {
      const msg = (e as Error).message;
      return { invalid: fields.length > 1 ? `Caixa ${i + 1}: ${msg}` : msg };
    }
  }
  return { values };
}

/** Os dois vetores são múltiplos não nulos um do outro? */
export function proportional(u: number[], v: number[], tol = 1e-6): boolean {
  if (u.length !== v.length) return false;
  const nu = Math.hypot(...u), nv = Math.hypot(...v);
  if (nu < 1e-12 || nv < 1e-12) return false;
  // |u × v| = 0 generalizado: todas as "áreas" uᵢvⱼ − uⱼvᵢ nulas (normalizadas).
  for (let i = 0; i < u.length; i++)
    for (let j = i + 1; j < u.length; j++) if (Math.abs(u[i] * v[j] - u[j] * v[i]) / (nu * nv) > tol) return false;
  return true;
}

/** Quantos campos de texto a resposta pede. */
export function fieldCount(a: Answer): number {
  switch (a.kind) {
    case "number":
      return 1;
    case "vector":
    case "direction":
      return a.value.length;
    case "matrix":
      return a.value.length * a.value[0].length;
    case "linear":
      return a.value.length;
    default:
      return 0;
  }
}

export function checkAnswer(a: Answer, r: Response): CheckResult {
  if (a.kind === "choice") return { ok: "choice" in r && r.choice === a.correct };
  if (a.kind === "point") {
    if (!("point" in r)) return { ok: false, invalid: "Arraste o ponto no gráfico." };
    const tol = a.tol ?? 0.26;
    return { ok: Math.hypot(r.point[0] - a.value[0], r.point[1] - a.value[1]) <= tol };
  }
  if (!("fields" in r)) return { ok: false, invalid: "Preencha a resposta." };
  const read = readFields(r.fields);
  if ("invalid" in read) return { ok: false, invalid: read.invalid };
  const v = read.values;
  // Forma "… = d": o último campo é o lado direito, que vale −(termo independente).
  if (a.kind === "linear" && a.rhsForm) v[v.length - 1] = -v[v.length - 1];
  switch (a.kind) {
    case "number":
      return { ok: close(v[0], a.value, a.tol ?? DEF_TOL) };
    case "vector":
      return { ok: v.length === a.value.length && v.every((x, i) => close(x, a.value[i], a.tol ?? DEF_TOL)) };
    case "matrix": {
      const flat = a.value.flat();
      return { ok: v.length === flat.length && v.every((x, i) => close(x, flat[i], a.tol ?? DEF_TOL)) };
    }
    case "linear":
    case "direction":
      if (v.every((x) => Math.abs(x) < 1e-12)) return { ok: false, invalid: a.kind === "direction" ? "O vetor nulo não serve: escolha uma direção." : "Os coeficientes não podem ser todos zero." };
      return { ok: proportional(v, a.value) };
  }
}

/** Resposta certa como campos de texto (para preencher "Mostrar resposta" e para os testes). */
export function answerAsResponse(a: Answer): Response {
  const s = (x: number) => String(Math.round(x * 1e9) / 1e9);
  switch (a.kind) {
    case "choice":
      return { choice: a.correct };
    case "point":
      return { point: a.value };
    case "number":
      return { fields: [s(a.value)] };
    case "matrix":
      return { fields: a.value.flat().map(s) };
    case "linear":
      return { fields: a.value.map((x, i) => s(a.rhsForm && i === a.value.length - 1 ? -x : x)) };
    default:
      return { fields: a.value.map(s) };
  }
}
