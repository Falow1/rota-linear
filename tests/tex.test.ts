import katex from "katex";
import { describe, expect, it } from "vitest";
import { clRow, o1 } from "../src/math/format";

const render = (t: string) =>
  katex.renderToString(t, { throwOnError: true, strict: false, trust: (ctx) => ctx.command === "\\htmlClass" });

describe("cores dentro de matrizes no KaTeX", () => {
  it("clRow colore cada entrada e a matriz é aceita", () => {
    const t = `\\begin{vmatrix} \\vec i & \\vec j & \\vec k \\\\ ${clRow("obj1", ["u_1", "u_2", "u_3"])} \\\\ ${clRow("obj2", ["1", "-2", "\\tfrac{1}{2}"])} \\end{vmatrix}`;
    expect(clRow("obj1", ["a", "b"])).toBe("\\htmlClass{obj1}{a} & \\htmlClass{obj1}{b}");
    const html = render(t);
    expect(html).not.toContain("katex-error");
    expect(html.match(/class="enclosing obj1"/g)?.length).toBe(3);
  });

  it("envolver uma linha inteira com & numa cor não funciona (o motivo do clRow)", () => {
    expect(() => render(`\\begin{vmatrix} ${o1("u_1 & u_2")} \\end{vmatrix}`)).toThrow();
  });
});
