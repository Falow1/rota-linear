import { describe, expect, it } from "vitest";
import { eig3, expandFactors, hamiltonCayley, minimalPoly3 } from "../src/math/diag3";
import { mul } from "../src/math/mat";

const close = (A: number[][], B: number[][]) => A.forEach((r, i) => r.forEach((x, j) => expect(x).toBeCloseTo(B[i][j], 6)));

describe("diagonalização 3×3", () => {
  it("autovalor duplo com autoespaço plano: diagonalizável", () => {
    const A = [[4, 1, -1], [2, 5, -2], [1, 1, 2]];
    const e = eig3(A);
    expect(e.kind).toBe("real");
    if (e.kind !== "real") return;
    expect(e.groups.map((g) => [g.value, g.alg, g.geo])).toEqual([[5, 1, 1], [3, 2, 2]]);
    expect(e.diagonalizable).toBe(true);
    // A·P = P·D
    close(mul(A, e.P!), mul(e.P!, e.D!));
    const m = minimalPoly3(A, e);
    expect(m.factors).toEqual([{ value: 5, k: 1 }, { value: 3, k: 1 }]);
    expect(m.equalsChar).toBe(false);
  });

  it("bloco de Jordan: não diagonalizável e minimal com expoente 2", () => {
    const A = [[2, 1, 0], [0, 2, 0], [0, 0, 3]];
    const e = eig3(A);
    if (e.kind !== "real") throw new Error("esperava real");
    expect(e.diagonalizable).toBe(false);
    const g2 = e.groups.find((g) => g.value === 2)!;
    expect([g2.alg, g2.geo]).toEqual([2, 1]);
    const m = minimalPoly3(A, e);
    expect(m.factors).toEqual([{ value: 3, k: 1 }, { value: 2, k: 2 }]);
    expect(m.equalsChar).toBe(true);
  });

  it("matriz escalar: minimal de grau 1", () => {
    const A = [[2, 0, 0], [0, 2, 0], [0, 0, 2]];
    const e = eig3(A);
    if (e.kind !== "real") throw new Error("esperava real");
    expect(e.groups).toHaveLength(1);
    expect(e.groups[0].geo).toBe(3);
    expect(minimalPoly3(A, e).coeffs).toEqual([1, -2]);
  });

  it("rotação: autovalores complexos", () => {
    const e = eig3([[0, -1, 0], [1, 0, 0], [0, 0, 2]]);
    expect(e.kind).toBe("complex");
    if (e.kind !== "complex") return;
    expect(e.real.value).toBe(2);
    expect(e.re).toBeCloseTo(0);
    expect(e.im).toBeCloseTo(1);
  });

  it("Hamilton–Cayley anula A e dá a inversa", () => {
    const A = [[1, 2, 0], [0, 2, 1], [1, 0, 3]];
    const hc = hamiltonCayley(A);
    close(hc.pA, [[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
    close(hc.inv!, hc.invCheck!);
  });

  it("expande fatores", () => {
    expect(expandFactors([{ value: 2, k: 2 }, { value: 3, k: 1 }])).toEqual([1, -7, 16, -12]);
  });
});
