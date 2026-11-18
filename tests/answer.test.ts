import { describe, expect, it } from "vitest";
import { checkAnswer, parseNumber, proportional, tryNumber } from "../src/learn/answer";
import { migrate, nextOpen, suggested, trackComplete, trackNext } from "../src/learn/progress";
import { mulberry32 } from "../src/learn/rng";
import { practiceSet, reviewSet } from "../src/learn/session";
import type { Generator } from "../src/learn/types";

describe("leitor de respostas", () => {
  it("números, vírgula, frações, raízes e π", () => {
    expect(parseNumber("-3")).toBe(-3);
    expect(parseNumber("2,5")).toBe(2.5);
    expect(parseNumber("2.5")).toBe(2.5);
    expect(parseNumber("3/4")).toBe(0.75);
    expect(parseNumber("−3/4")).toBe(-0.75);
    expect(parseNumber("√2")).toBeCloseTo(Math.SQRT2);
    expect(parseNumber("2√3")).toBeCloseTo(2 * Math.sqrt(3));
    expect(parseNumber("sqrt(8)")).toBeCloseTo(Math.sqrt(8));
    expect(parseNumber("(1+√5)/2")).toBeCloseTo((1 + Math.sqrt(5)) / 2);
    expect(parseNumber("-2/√5")).toBeCloseTo(-2 / Math.sqrt(5));
    expect(parseNumber("π/2")).toBeCloseTo(Math.PI / 2);
    expect(parseNumber("2^3")).toBe(8);
    expect(parseNumber(" 7 ")).toBe(7);
  });

  it("mensagens em português para o que não dá para ler", () => {
    expect(() => parseNumber("")).toThrow(/Preencha/);
    expect(() => parseNumber("1,2,3")).toThrow(/vírgula/);
    expect(() => parseNumber("2+")).toThrow();
    expect(() => parseNumber("(2")).toThrow(/parêntese/);
    expect(() => parseNumber("x")).toThrow(/símbolo/);
    expect(() => parseNumber("1/0")).toThrow(/zero/);
    expect(() => parseNumber("√-4")).toThrow(/negativo/);
    expect(tryNumber("abc")).toBeNull();
  });

  it("confere cada tipo de resposta", () => {
    expect(checkAnswer({ kind: "number", value: 0.75 }, { fields: ["3/4"] }).ok).toBe(true);
    expect(checkAnswer({ kind: "number", value: Math.sqrt(13), tol: 0.0051 }, { fields: ["3,61"] }).ok).toBe(true);
    expect(checkAnswer({ kind: "number", value: Math.sqrt(13), tol: 0.0051 }, { fields: ["3,6"] }).ok).toBe(false);
    expect(checkAnswer({ kind: "number", value: 2 }, { fields: ["abc"] }).invalid).toBeTruthy();
    expect(checkAnswer({ kind: "vector", value: [1, -2] }, { fields: ["1", "-2"] }).ok).toBe(true);
    expect(checkAnswer({ kind: "matrix", value: [[1, 2], [3, 4]] }, { fields: ["1", "2", "3", "4"] }).ok).toBe(true);
    expect(checkAnswer({ kind: "choice", options: ["a", "b"], correct: 1 }, { choice: 1 }).ok).toBe(true);
    expect(checkAnswer({ kind: "point", value: [2, 1] }, { point: [2.1, 1] }).ok).toBe(true);
    expect(checkAnswer({ kind: "point", value: [2, 1] }, { point: [2.5, 1] }).ok).toBe(false);
    // reta 2x − y + 3 = 0: qualquer múltiplo serve
    expect(checkAnswer({ kind: "linear", value: [2, -1, 3], vars: ["x", "y"] }, { fields: ["-4", "2", "-6"] }).ok).toBe(true);
    expect(checkAnswer({ kind: "linear", value: [2, -1, 3], vars: ["x", "y"] }, { fields: ["2", "-1", "4"] }).ok).toBe(false);
    expect(checkAnswer({ kind: "linear", value: [2, -1, 3], vars: ["x", "y"] }, { fields: ["0", "0", "0"] }).invalid).toBeTruthy();
    // plano x + 2y − z = 4 escrito com o lado direito
    expect(checkAnswer({ kind: "linear", value: [1, 2, -1, -4], vars: ["x", "y", "z"], rhsForm: true }, { fields: ["2", "4", "-2", "8"] }).ok).toBe(true);
    expect(checkAnswer({ kind: "direction", value: [1, -2] }, { fields: ["-3", "6"] }).ok).toBe(true);
    expect(checkAnswer({ kind: "direction", value: [1, -2] }, { fields: ["0", "0"] }).invalid).toBeTruthy();
  });

  it("proporcionalidade", () => {
    expect(proportional([1, 2, 3], [-2, -4, -6])).toBe(true);
    expect(proportional([1, 0], [0, 1])).toBe(false);
    expect(proportional([0, 0], [0, 0])).toBe(false);
  });
});

describe("progresso guardado", () => {
  it("aceita lixo e versões desconhecidas sem quebrar", () => {
    expect(migrate(null).lessons).toEqual({});
    expect(migrate({ v: 2 }).lessons).toEqual({});
    expect(migrate("texto").v).toBe(1);
    const p = migrate({ v: 1, lessons: { A1: { card: 3, done: true, firstTry: "x", best: 5 } }, misses: { "A1.comb": 2, bad: "x" } });
    expect(p.lessons.A1).toEqual({ card: 3, done: true, firstTry: 0, total: 0, best: 5 });
    expect(p.misses).toEqual({ "A1.comb": 2 });
  });

  it("guarda quando a lição foi concluída", () => {
    expect(migrate({ v: 1, lessons: { A1: { card: 0, done: true, doneAt: 123 } } }).lessons.A1.doneAt).toBe(123);
    expect(migrate({ v: 1, lessons: { A1: { card: 0, done: true, doneAt: "ontem" } } }).lessons.A1.doneAt).toBeUndefined();
  });
});

describe("ordem livre e próxima lição", () => {
  const done = (_id: string, doneAt?: number) => ({ card: 0, done: true, firstTry: 0, total: 0, ...(doneAt ? { doneAt } : {}) });
  const prog = (lessons: Record<string, unknown>) => migrate({ v: 1, lessons });

  it("sem progresso, sugere a primeira lição do curso", () => {
    expect(suggested(prog({}))?.id).toBe("A1");
    expect(nextOpen(prog({}))?.id).toBe("A1");
  });

  it("quem começa por outra rota segue nela, não volta para a rota 1", () => {
    expect(suggested(prog({ E1: done("E1", 10) }))?.id).toBe("E2");
    // Terminou a rota 5 (E1–E4): segue para a rota 6.
    expect(suggested(prog({ E1: done("E1", 1), E2: done("E2", 2), E3: done("E3", 3), E4: done("E4", 4) }))?.id).toBe("F1");
  });

  it("a lição em andamento tem prioridade", () => {
    expect(suggested(prog({ E1: done("E1", 10), C2: { card: 3, done: false } }))?.id).toBe("C2");
  });

  it("a próxima lição pula as que já foram feitas fora de ordem e dá a volta no fim", () => {
    expect(nextOpen(prog({ A1: done("A1"), A2: done("A2"), A3: done("A3") }), "A1")?.id).toBe("B1");
    expect(nextOpen(prog({ H5: done("H5") }), "H5")?.id).toBe("A1");
    expect(nextOpen(prog({ A1: done("A1") }), "H5")?.id).toBe("A2");
  });

  it("cada rota marca a sua próxima lição e libera a revisão quando completa", () => {
    const p = prog({ E2: done("E2"), F1: { card: 2, done: false } });
    expect(trackNext(p, "sistemas")?.id).toBe("E1");
    expect(trackNext(p, "espacos")?.id).toBe("F1");
    expect(trackComplete(p, "sistemas")).toBe(false);
    const q = prog({ A1: done("A1"), A2: done("A2"), A3: done("A3") });
    expect(trackComplete(q, "vetores")).toBe(true);
    expect(trackNext(q, "vetores")).toBeUndefined();
  });

  it("antes da data de conclusão existir, segue a ordem do curso", () => {
    expect(suggested(prog({ A1: done("A1"), E1: done("E1") }))?.id).toBe("A2");
  });
});

describe("montagem das sessões", () => {
  const g = (id: string, level: 1 | 2 | 3): Generator => ({ id, title: id, level, make: () => ({ prompt: "", answer: { kind: "number", value: 0 }, hint: "", solution: [] }) });
  const gens = [g("X1.c", 3), g("X1.a", 1), g("X1.b", 2)];

  it("prática: todos os geradores, do mais fácil ao mais difícil, 6 itens", () => {
    const s = practiceSet(gens, {}, mulberry32(1));
    expect(s).toHaveLength(6);
    for (const id of ["X1.a", "X1.b", "X1.c"]) expect(s.some((i) => i.gen.id === id)).toBe(true);
    expect(s[0].gen.id).toBe("X1.a");
    const levels = s.map((i) => i.gen.level);
    expect([...levels].sort()).toEqual(levels);
  });

  it("revisão: o gerador com mais erros aparece mais", () => {
    const p = migrate({ v: 1, lessons: {}, misses: { "X1.a": 5 }, seen: { "X1.b": Date.now(), "X1.c": Date.now(), "X1.a": Date.now() } });
    let a = 0;
    for (let k = 0; k < 50; k++) a += reviewSet(gens, p, mulberry32(k), Date.now(), 3).filter((i) => i.gen.id === "X1.a").length;
    expect(a).toBe(50); // sem repetir enquanto houver opções: aparece em toda sessão de 3
    const s = reviewSet(gens, p, mulberry32(7), Date.now(), 8);
    expect(s.filter((i) => i.gen.id === "X1.a").length).toBeGreaterThanOrEqual(2);
  });
});
