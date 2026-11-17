import { describe, expect, it } from "vitest";
import { sliderGeometry, stepValue } from "../src/ui/sliderGeometry";

describe("preenchimento do slider", () => {
  it("intervalo sem zero: preenche da esquerda até a bolinha", () => {
    const g = sliderGeometry(2, 0.5, 6.5);
    expect(g.z).toBeNull();
    expect(g.fromEdge).toBe(true);
    expect(g.lo).toBe(0);
    expect(g.hi).toBeCloseTo(0.25);
    expect(g.p).toBeCloseTo(0.25);
  });

  it("intervalo que cruza o zero: preenche do zero até a bolinha, para os dois lados", () => {
    const pos = sliderGeometry(2.5, -5, 5);
    expect(pos.z).toBeCloseTo(0.5);
    expect(pos.lo).toBeCloseTo(0.5);
    expect(pos.hi).toBeCloseTo(0.75);
    const neg = sliderGeometry(-2.5, -5, 5);
    expect(neg.lo).toBeCloseTo(0.25);
    expect(neg.hi).toBeCloseTo(0.5);
    const zero = sliderGeometry(0, -3, 6);
    expect(zero.lo).toBeCloseTo(zero.hi);
  });

  it("valor fora do intervalo fica preso nas pontas", () => {
    expect(sliderGeometry(99, 0, 10).p).toBe(1);
    expect(sliderGeometry(-99, -5, 5).lo).toBe(0);
    expect(sliderGeometry(NaN, 0, 10).p).toBe(0);
  });

  it("passo dos botões − e + sem erro de ponto flutuante e preso no intervalo", () => {
    expect(stepValue(0.1, 1, 0.2, -5, 5)).toBe(0.3);
    expect(stepValue(4.9, 1, 0.5, -5, 5)).toBe(5);
    expect(stepValue(-4.9, -1, 0.5, -5, 5)).toBe(-5);
  });

  it("valor digitado fora do intervalo: o passo anda em direção ao intervalo e não pula para a ponta", () => {
    expect(stepValue(100, -1, 0.5, 0, 10)).toBe(99.5);
    expect(stepValue(100, 1, 0.5, 0, 10)).toBe(100);
    expect(stepValue(-20, 1, 1, -5, 5)).toBe(-19);
    expect(stepValue(-20, -1, 1, -5, 5)).toBe(-20);
  });
});
