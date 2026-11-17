import katex from "katex";
import { describe, expect, it } from "vitest";
import { LESSONS } from "../src/learn/catalog";
import { answerAsResponse, checkAnswer, proportional } from "../src/learn/answer";
import { answerRich } from "../src/learn/answerTex";
import { mulberry32 } from "../src/learn/rng";
import type { Answer, Exercise, Generator, Response, Rich } from "../src/learn/types";

/** Todos os arquivos de exercícios (A.ts … H.ts). */
const packs = import.meta.glob<{ default: Record<string, Generator[]> }>("../src/exercises/[A-H].ts", { eager: true });
const all = Object.entries(packs).flatMap(([, m]) => Object.entries(m.default).flatMap(([lesson, gens]) => gens.map((g) => ({ lesson, g }))));

const SEEDS = 300;

/** Cada trecho $…$ e $$…$$ precisa ser TeX válido. */
function texOk(rich: Rich): string | null {
  const parts = rich.match(/\$\$[\s\S]+?\$\$|\$[^$]+?\$/g) ?? [];
  for (const p of parts) {
    const t = p.startsWith("$$") ? p.slice(2, -2) : p.slice(1, -1);
    try {
      katex.renderToString(t, { throwOnError: true, strict: false, trust: true });
    } catch (e) {
      return `${t} → ${(e as Error).message}`;
    }
  }
  // Cifrão sobrando (fórmula sem fechar)
  const rest = rich.replace(/\$\$[\s\S]+?\$\$|\$[^$]+?\$/g, "");
  if (rest.includes("$")) return `cifrão sem par em: ${rich}`;
  return null;
}

function richOf(ex: Exercise): Rich[] {
  const a = ex.answer;
  return [
    ex.prompt,
    ex.hint,
    ...ex.solution,
    answerRich(a),
    ...(a.kind === "choice" ? a.options : []),
    ...(a.kind === "number" && a.label ? [a.label] : []),
  ];
}

function finite(a: Answer): boolean {
  switch (a.kind) {
    case "number":
      return Number.isFinite(a.value);
    case "choice":
      return Number.isInteger(a.correct) && a.correct >= 0 && a.correct < a.options.length;
    case "matrix":
      return a.value.flat().every(Number.isFinite);
    case "point":
      return a.value.every(Number.isFinite);
    default:
      return a.value.every(Number.isFinite);
  }
}

/** Uma resposta errada típica (que precisa ser recusada). */
function wrong(a: Answer): Response | null {
  const s = (x: number) => String(x);
  switch (a.kind) {
    case "number":
      return { fields: [s(a.value + Math.max(1, (a.tol ?? 0) * 3))] };
    case "vector":
      return { fields: a.value.map((x, i) => s(i === 0 ? x + 1 : x)) };
    case "matrix":
      return { fields: a.value.flat().map((x, i) => s(i === 0 ? x + 1 : x)) };
    case "choice":
      return { choice: (a.correct + 1) % a.options.length };
    case "point":
      return { point: [a.value[0] + 1, a.value[1]] };
    case "linear":
    case "direction": {
      for (let i = 0; i < a.value.length; i++) {
        const w = a.value.map((x, j) => (j === i ? x + 1 : x));
        if (!proportional(w, a.value)) {
          const f = a.kind === "linear" && a.rhsForm ? w.map((x, j) => (j === w.length - 1 ? -x : x)) : w;
          return { fields: f.map(s) };
        }
      }
      return null;
    }
  }
}

describe("geradores de exercício", () => {
  it("têm ids únicos, ligados a lições que existem", () => {
    const ids = all.map((x) => x.g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const { lesson, g } of all) {
      expect(LESSONS.some((l) => l.id === lesson)).toBe(true);
      expect(g.id.startsWith(`${lesson}.`)).toBe(true);
    }
  });

  it.each(all.map((x) => [x.g.id, x.g] as const))("%s: resposta própria aceita, errada recusada, TeX válido", (_id, g) => {
    for (let seed = 1; seed <= SEEDS; seed++) {
      const ex = g.make(mulberry32(seed * 7919));
      expect(finite(ex.answer), `seed ${seed}: resposta não finita`).toBe(true);
      const res = checkAnswer(ex.answer, answerAsResponse(ex.answer));
      expect(res.ok, `seed ${seed}: a própria resposta foi recusada (${JSON.stringify(ex.answer)})`).toBe(true);
      const w = wrong(ex.answer);
      if (w) expect(checkAnswer(ex.answer, w).ok, `seed ${seed}: resposta errada aceita (${JSON.stringify(ex.answer)})`).toBe(false);
      if (seed <= 40) for (const r of richOf(ex)) expect(texOk(r), `seed ${seed}`).toBeNull();
      if (ex.answer.kind === "point") expect(ex.figure, "exercício de ponto sem figura").toBeTruthy();
      expect(ex.solution.length).toBeGreaterThan(0);
    }
  });
});
