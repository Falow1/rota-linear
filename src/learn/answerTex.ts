import { tex, texLinear, texMatrix, texTuple } from "../math/format";
import type { Answer, Rich } from "./types";

/** A resposta certa como texto rico, para "A resposta é…". */
export function answerRich(a: Answer): Rich {
  switch (a.kind) {
    case "number":
      if (a.exact) return `$${a.exact} \\approx ${tex(a.value, { maxDen: 1, digits: 2 })}$`;
      return `$${tex(a.value, { maxDen: 24, digits: 2 })}${a.unit === "°" ? "^\\circ" : ""}$`;
    case "vector":
      if (a.names) return a.names.map((nm, i) => `${nm} = $${tex(a.value[i], { maxDen: 24 })}$`).join(", ");
      return `$${texTuple(a.value, { maxDen: 24 })}$`;
    case "matrix":
      return `$${texMatrix(a.value, { maxDen: 24 })}$`;
    case "choice":
      return a.options[a.correct];
    case "point":
      return `o ponto $${texTuple(a.value)}$`;
    case "linear": {
      const k = a.value.length - 1;
      if (a.rhsForm) {
        // c₁x + c₂y + c₃z = d  (value = [c₁, c₂, c₃, −d])
        return `$${texLinear(a.value.slice(0, k), a.vars)} = ${tex(-a.value[k])}$ (ou qualquer múltiplo dela)`;
      }
      return `$${texLinear(a.value.slice(0, k), a.vars, a.value[k])} = 0$ (ou qualquer múltiplo dela)`;
    }
    case "direction":
      return `$${texTuple(a.value)}$ (ou qualquer múltiplo não nulo)`;
  }
}
