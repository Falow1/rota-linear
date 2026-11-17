import { tex, texPar, texSqrt, texTuple } from "../math/format";
import { toFraction } from "../math/fraction";
import type { Answer } from "../learn/types";

/** Número em TeX com frações até denominador 60. */
export const n = (x: number) => tex(x, { maxDen: 60 });
/** Entre parênteses se negativo (para produtos). */
export const p = texPar;
/** Tupla (a; b; c). */
export const tp = (v: number[]) => texTuple(v, { maxDen: 60 });

/** √k é inteiro? */
export const isSquare = (k: number) => Number.isInteger(Math.sqrt(k));

/**
 * Resposta para √k: valor exato e, quando irracional, tolerância que aceita 2 casas decimais.
 * Devolve também o TeX simplificado (2√3) para usar na solução.
 */
export function sqrtAnswer(k: number, label?: string): { answer: Answer; texv: string } {
  const exact = isSquare(k);
  return {
    answer: { kind: "number", value: Math.sqrt(k), tol: exact ? 1e-6 : ROUND2, label, ...(exact ? {} : { exact: texSqrt(k) }) },
    texv: texSqrt(k),
  };
}

/** Tolerância que aceita a resposta arredondada para 2 casas (erro máximo 0,005). */
export const ROUND2 = 0.0051;

/** Avisa no enunciado que vale responder com √ ou com 2 casas. */
export const SQRT_NOTE = " Pode responder com raiz (ex.: 2√3) ou com duas casas decimais.";

/** A fração é "bonita" (denominador até `maxDen`)? */
export const nice = (x: number, maxDen = 12) => toFraction(x, maxDen, 1e-9) !== null;

/** Sinal para escrever "a + b" corretamente: "+ 3" ou "- 3". */
export const sg = (x: number) => (x < 0 ? `- ${tex(-x)}` : `+ ${tex(x)}`);
