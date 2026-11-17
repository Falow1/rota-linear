import { describe, expect, it } from "vitest";
import { classifyConic, type ConicCoeffs, type ConicKind } from "../src/math/conics";
import { eig2 } from "../src/math/eigen";
import { fmt, tex, texLinear, texPoly } from "../src/math/format";
import { lineFromPoints, reduced, relLines, segmentary, distPointLine } from "../src/math/lines";
import { nullspace, solveSystem } from "../src/math/linsys";
import { det, inverse, rank } from "../src/math/mat";
import { eliminationSteps } from "../src/math/rref";
import { classifyThreePlanes, relLineLine, relLinePlane, type Plane } from "../src/math/space";
import { marchingSquares } from "../src/math/implicit2d";
import { gramSchmidt, leastSquares } from "../src/math/orthogonal";
import { dot } from "../src/math/vec";

const C = (A: number, B: number, Cc: number, D: number, E: number, F: number): ConicCoeffs => ({ A, B, C: Cc, D, E, F });

describe("cônicas", () => {
  const cases: [string, ConicCoeffs, ConicKind][] = [
    ["circunferência", C(1, 0, 1, 0, 0, -4), "circunferencia"],
    ["circunferência transladada", C(1, 0, 1, -2, 4, -4), "circunferencia"],
    ["elipse", C(1, 0, 4, 0, 0, -4), "elipse"],
    ["elipse rotacionada", C(5, -6, 5, 0, 0, -8), "elipse"],
    ["hipérbole", C(1, 0, -1, 0, 0, -1), "hiperbole"],
    ["hipérbole xy = 1", C(0, 1, 0, 0, 0, -1), "hiperbole"],
    ["parábola", C(1, 0, 0, 0, -1, 0), "parabola"],
    ["parábola rotacionada", C(1, 2, 1, -8, 8, 0), "parabola"],
    ["retas concorrentes", C(1, 0, -1, 0, 0, 0), "retas-concorrentes"],
    ["retas paralelas", C(1, 0, 0, 0, 0, -1), "retas-paralelas"],
    ["reta dupla", C(1, -2, 1, 0, 0, 0), "reta-dupla"],
    ["ponto", C(1, 0, 1, 0, 0, 0), "ponto"],
    ["vazio", C(1, 0, 1, 0, 0, 1), "vazio"],
    ["vazio parabólico", C(1, 0, 0, 0, 0, 1), "vazio"],
  ];
  for (const [name, k, kind] of cases) it(name, () => expect(classifyConic(k).kind).toBe(kind));

  it("elipse x²/4 + y² = 1: semieixos, focos e excentricidade", () => {
    const info = classifyConic(C(1, 0, 4, 0, 0, -4));
    expect(info.a).toBeCloseTo(2);
    expect(info.b).toBeCloseTo(1);
    expect(info.e).toBeCloseTo(Math.sqrt(3) / 2);
    expect(Math.abs(info.foci[0][0])).toBeCloseTo(Math.sqrt(3));
  });

  it("parábola y = x²: foco em (0, 1/4)", () => {
    const info = classifyConic(C(1, 0, 0, 0, -1, 0));
    expect(info.foci[0][0]).toBeCloseTo(0);
    expect(info.foci[0][1]).toBeCloseTo(0.25);
  });

  it("os focos de uma elipse rotacionada satisfazem d1 + d2 = 2a", () => {
    const k = C(5, -6, 5, 0, 0, -8);
    const info = classifyConic(k);
    const [f1, f2] = info.foci;
    const P = info.vertices[2];
    const d = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    expect(d(P, f1) + d(P, f2)).toBeCloseTo(2 * info.a!);
    const F = (x: number, y: number) => k.A * x * x + k.B * x * y + k.C * y * y + k.D * x + k.E * y + k.F;
    for (const v of info.vertices) expect(F(v[0], v[1])).toBeCloseTo(0);
  });
});

describe("espaço", () => {
  const L = (p: number[], v: number[]) => ({ p: p as [number, number, number], v: v as [number, number, number] });
  it("retas concorrentes", () => expect(relLineLine(L([0, 0, 0], [1, 0, 0]), L([0, 1, 0], [0, 1, 0])).kind).toBe("concorrentes"));
  it("retas paralelas", () => expect(relLineLine(L([0, 0, 0], [1, 0, 0]), L([0, 1, 0], [2, 0, 0])).kind).toBe("paralelas"));
  it("retas coincidentes", () => expect(relLineLine(L([0, 0, 0], [1, 1, 0]), L([2, 2, 0], [-1, -1, 0])).kind).toBe("coincidentes"));
  it("retas reversas com distância 1", () => {
    const r = relLineLine(L([0, 0, 0], [1, 0, 0]), L([0, 0, 1], [0, 1, 0]));
    expect(r.kind).toBe("reversas");
    if (r.kind === "reversas") expect(r.distance).toBeCloseTo(1);
  });
  it("reta contida em plano", () => expect(relLinePlane(L([1, 0, 0], [0, 1, 0]), { n: [1, 0, 0], d: 1 }).kind).toBe("contida"));
  it("reta paralela a plano", () => expect(relLinePlane(L([2, 0, 0], [0, 1, 0]), { n: [1, 0, 0], d: 1 }).kind).toBe("paralela"));

  const P = (a: number, b: number, c: number, d: number): Plane => ({ n: [a, b, c], d });
  const three: [string, [Plane, Plane, Plane], string][] = [
    ["ponto", [P(1, 0, 0, 1), P(0, 1, 0, 1), P(0, 0, 1, 1)], "ponto"],
    ["reta (três distintos)", [P(1, 0, 0, 0), P(0, 1, 0, 0), P(1, 1, 0, 0)], "reta-tres-distintos"],
    ["reta (dois coincidentes)", [P(1, 0, 0, 0), P(2, 0, 0, 0), P(0, 1, 0, 0)], "reta-dois-coincidentes"],
    ["prisma", [P(1, 0, 0, 0), P(0, 1, 0, 0), P(1, 1, 0, 3)], "prisma"],
    ["dois paralelos e um secante", [P(1, 0, 0, 0), P(1, 0, 0, 2), P(0, 1, 0, 0)], "dois-paralelos-secante"],
    ["três coincidentes", [P(1, 1, 1, 1), P(2, 2, 2, 2), P(-1, -1, -1, -1)], "tres-coincidentes"],
    ["três paralelos", [P(0, 0, 1, 0), P(0, 0, 1, 1), P(0, 0, 1, 2)], "tres-paralelos"],
    ["dois coincidentes e um paralelo", [P(0, 0, 1, 0), P(0, 0, 2, 0), P(0, 0, 1, 2)], "dois-coincidentes-paralelo"],
  ];
  for (const [name, ps, kind] of three) it(`três planos: ${name}`, () => expect(classifyThreePlanes(ps)).toBe(kind));
});

describe("sistemas e escalonamento", () => {
  it("SPD", () => {
    const r = solveSystem([[1, 1, 3], [1, -1, 1]]);
    expect(r.type).toBe("SPD");
    expect(r.particular).toEqual([2, 1]);
  });
  it("SPI", () => {
    const r = solveSystem([[1, 1, 2], [2, 2, 4]]);
    expect(r.type).toBe("SPI");
    expect(r.directions.length).toBe(1);
  });
  it("SI", () => expect(solveSystem([[1, 1, 2], [1, 1, 3]]).type).toBe("SI"));
  it("linha nula e troca de linhas", () => {
    const steps = eliminationSteps([[0, 1, 2], [1, 1, 3], [0, 0, 0]], "jordan", 2);
    expect(steps[1].kind).toBe("swap");
    expect(steps[steps.length - 1].matrix).toEqual([[1, 0, 1], [0, 1, 2], [0, 0, 0]]);
  });
  it("Gauss deixa forma escalonada", () => {
    const steps = eliminationSteps([[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]], "gauss", 3);
    const M = steps[steps.length - 1].matrix;
    expect(M[1][0]).toBe(0);
    expect(M[2][0]).toBe(0);
    expect(M[2][1]).toBe(0);
    const r = solveSystem([[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]]);
    expect(r.particular).toEqual([2, 3, -1]);
  });
  it("núcleo e posto", () => {
    expect(rank([[1, 2], [2, 4]])).toBe(1);
    const N = nullspace([[1, 2], [2, 4]]);
    expect(N.length).toBe(1);
    expect(dot([1, 2], N[0])).toBeCloseTo(0);
  });
  it("determinante e inversa", () => {
    expect(det([[1, 2], [3, 4]])).toBe(-2);
    expect(det([[2, 0, 1], [1, 3, 2], [1, 1, 1]])).toBe(0);
    expect(det([[2, 0, 1], [1, 3, 2], [1, 1, 2]])).toBe(6);
    expect(det([[1, 2, 0, 0], [0, 1, 0, 0], [0, 0, 2, 0], [3, 0, 0, 1]])).toBe(2);
    expect(det([[0, 1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 3]])).toBe(-3);
    expect(inverse([[1, 2], [2, 4]])).toBeNull();
    expect(inverse([[2, 0], [0, 4]])).toEqual([[0.5, 0], [0, 0.25]]);
  });
});

describe("autovalores 2×2", () => {
  it("reais distintos", () => {
    const e = eig2([[2, 1], [1, 2]]);
    expect(e.kind).toBe("distinct");
    if (e.kind === "distinct") expect(e.values).toEqual([3, 1]);
  });
  it("repetido com dois autovetores", () => expect(eig2([[3, 0], [0, 3]]).kind).toBe("repeated-full"));
  it("repetido defectivo", () => {
    const e = eig2([[1, 1], [0, 1]]);
    expect(e.kind).toBe("repeated-defective");
    if (e.kind === "repeated-defective") expect(e.vectors[0]).toEqual([1, 0]);
  });
  it("complexos", () => expect(eig2([[0, -1], [1, 0]]).kind).toBe("complex"));
  it("autovetor satisfaz Av = λv", () => {
    const A = [[4, 1], [2, 3]];
    const e = eig2(A);
    if (e.kind !== "distinct") throw new Error();
    e.vectors.forEach((v, i) => {
      const Av = [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
      expect(Av[0]).toBeCloseTo(e.values[i] * v[0]);
      expect(Av[1]).toBeCloseTo(e.values[i] * v[1]);
    });
  });
});

describe("formatação", () => {
  it("números", () => {
    expect(fmt(-0)).toBe("0");
    expect(fmt(0.5)).toBe("1/2");
    expect(fmt(-0.75)).toBe("−3/4");
    expect(fmt(Math.SQRT2)).toBe("1,41");
    expect(tex(-0.5)).toBe("-\\frac{1}{2}");
    expect(tex(1.25)).toBe("\\frac{5}{4}");
    expect(tex(Math.PI)).toBe("3{,}14");
  });
  it("equação linear sem 0x, 1x e + -", () => {
    expect(texLinear([1, -1], ["x", "y"], 3)).toBe("x - y + 3");
    expect(texLinear([0, 2], ["x", "y"], -1)).toBe("2y - 1");
    expect(texLinear([-1, 0], ["x", "y"], 0)).toBe("-x");
    expect(texLinear([0, 0], ["x", "y"], 0)).toBe("0");
  });
  it("polinômio", () => {
    expect(texPoly([1, -5, 6], "\\lambda")).toBe("\\lambda^{2} - 5\\lambda + 6");
    expect(texPoly([1, 0, -1])).toBe("x^{2} - 1");
  });
});

describe("retas no plano", () => {
  it("formas da reta", () => {
    const l = lineFromPoints([0, 1], [2, 5])!;
    expect(l).toEqual({ a: 2, b: -1, c: 1 });
    expect(reduced(l)).toEqual({ m: 2, n: 1 });
    expect(segmentary(l)).toEqual({ p: -0.5, q: 1 });
    expect(reduced(lineFromPoints([1, 0], [1, 3])!)).toBeNull();
  });
  it("posição relativa e distância", () => {
    expect(relLines({ a: 1, b: 1, c: -2 }, { a: 2, b: 2, c: -4 }).kind).toBe("coincidentes");
    expect(relLines({ a: 1, b: 1, c: -2 }, { a: 1, b: 1, c: 0 }).kind).toBe("paralelas");
    expect(distPointLine([0, 0], { a: 3, b: 4, c: -10 }).d).toBeCloseTo(2);
  });
});

describe("outros", () => {
  it("marching squares encontra a circunferência", () => {
    const segs = marchingSquares((x, y) => x * x + y * y - 4, [-3, 3], [-3, 3], 40, 40);
    expect(segs.length).toBeGreaterThan(40);
    for (let i = 0; i < segs.length; i += 2) expect(Math.hypot(segs[i], segs[i + 1])).toBeCloseTo(2, 1);
  });
  it("Gram–Schmidt gera vetores ortogonais", () => {
    const { orthogonal } = gramSchmidt([[1, 1, 0], [1, 0, 1], [0, 1, 1]]);
    expect(dot(orthogonal[0], orthogonal[1])).toBeCloseTo(0);
    expect(dot(orthogonal[0], orthogonal[2])).toBeCloseTo(0);
    expect(dot(orthogonal[1], orthogonal[2])).toBeCloseTo(0);
  });
  it("mínimos quadrados recupera reta exata", () => {
    const r = leastSquares([[0, 1], [1, 3], [2, 5]], 1)!;
    expect(r.coeffs[0]).toBeCloseTo(1);
    expect(r.coeffs[1]).toBeCloseTo(2);
  });
});
