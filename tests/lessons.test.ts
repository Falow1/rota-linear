import katex from "katex";
import { describe, expect, it } from "vitest";
import { answerAsResponse, checkAnswer } from "../src/learn/answer";
import { LESSONS } from "../src/learn/catalog";
import type { LessonContent, Rich } from "../src/learn/types";

/** Todas as lições escritas (A1.tsx … H5.tsx). */
const mods = import.meta.glob<{ default: LessonContent }>("../src/lessons/[A-H][0-9].tsx", { eager: true });
const lessons = Object.entries(mods).map(([path, m]) => ({ id: path.match(/([A-H]\d)\.tsx$/)![1], cards: m.default.cards }));

function texErr(t: string): string | null {
  try {
    katex.renderToString(t, { throwOnError: true, strict: false, trust: true });
    return null;
  } catch (e) {
    return `${t} → ${(e as Error).message}`;
  }
}

/** Cada trecho $…$ e $$…$$ precisa ser TeX válido, sem cifrão sobrando. */
function richErr(rich: Rich): string | null {
  const parts = rich.match(/\$\$[\s\S]+?\$\$|\$[^$]+?\$/g) ?? [];
  for (const p of parts) {
    const e = texErr(p.startsWith("$$") ? p.slice(2, -2) : p.slice(1, -1));
    if (e) return e;
  }
  if (rich.replace(/\$\$[\s\S]+?\$\$|\$[^$]+?\$/g, "").includes("$")) return `cifrão sem par em: ${rich}`;
  return null;
}

describe("lições", () => {
  it("cada arquivo corresponde a uma lição do catálogo", () => {
    for (const l of lessons) expect(LESSONS.some((m) => m.id === l.id), l.id).toBe(true);
  });

  it.each(lessons.map((l) => [l.id, l] as const))("%s: fórmulas válidas, tarefas resolvíveis, perguntas coerentes", (_id, l) => {
    expect(l.cards.length).toBeGreaterThanOrEqual(4);
    l.cards.forEach((c, i) => {
      const where = `${l.id} cartão ${i + 1}`;
      switch (c.kind) {
        case "ideia":
          if (c.tex) expect(texErr(c.tex), where).toBeNull();
          break;
        case "tarefa":
          expect(c.goal(c.solve), `${where}: o "Me mostra" não cumpre a meta`).toBe(true);
          expect(c.goal(c.init), `${where}: a meta já começa cumprida`).toBe(false);
          if (c.readout) {
            expect(texErr(c.readout(c.init)), where).toBeNull();
            expect(texErr(c.readout(c.solve)), where).toBeNull();
          }
          break;
        case "prever":
          if (c.options) {
            expect(c.correct, where).toBeGreaterThanOrEqual(0);
            expect(c.correct!, where).toBeLessThan(c.options.length);
            for (const o of c.options) expect(richErr(o), where).toBeNull();
          } else expect(c.ghost, `${where}: prever sem opções nem ponto`).toBeTruthy();
          break;
        case "pergunta":
          for (const r of [c.prompt, c.hint, c.explain]) expect(richErr(r), where).toBeNull();
          if (c.answer.kind === "choice") for (const o of c.answer.options) expect(richErr(o), where).toBeNull();
          expect(checkAnswer(c.answer, answerAsResponse(c.answer)).ok, `${where}: a própria resposta foi recusada`).toBe(true);
          if (c.answer.kind === "point") expect(c.fig ?? c.Figure, `${where}: pergunta de ponto sem figura`).toBeTruthy();
          break;
      }
    });
  });
});
