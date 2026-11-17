import type { ComponentType, ReactNode } from "react";

/**
 * Texto com fórmulas: trechos entre $…$ viram TeX em linha e entre $$…$$ viram TeX em destaque.
 * Usado em enunciados, dicas e soluções (dados puros, testáveis sem DOM).
 */
export type Rich = string;

/* ---------- Respostas ---------- */

export type Answer =
  /**
   * Um número. `tol` é a tolerância absoluta; `unit` aparece ao lado do campo (ex.: "°").
   * `exact` é a forma exata em TeX quando o valor é irracional (ex.: "\sqrt{5}"), para mostrar "√5 ≈ 2,24".
   */
  | { kind: "number"; value: number; tol?: number; unit?: string; label?: Rich; exact?: string }
  /** Um vetor (uma caixa por coordenada). `names` rotula as caixas. */
  | { kind: "vector"; value: number[]; tol?: number; names?: string[] }
  | { kind: "matrix"; value: number[][]; tol?: number }
  | { kind: "choice"; options: Rich[]; correct: number }
  /** Ponto arrastado no gráfico do exercício. */
  | { kind: "point"; value: [number, number]; tol?: number }
  /**
   * Coeficientes de uma equação linear "c₁·v₁ + … + cₙ·vₙ + c₀ = 0" (vars = ["x","y"], value = [a, b, c]).
   * Qualquer múltiplo não nulo é a mesma reta (ou plano), então também é aceito.
   */
  | { kind: "linear"; value: number[]; vars: string[]; rhsForm?: boolean }
  /** Uma direção (autovetor, vetor do núcleo): qualquer múltiplo não nulo serve. */
  | { kind: "direction"; value: number[]; names?: string[] };

/** O que a pessoa digitou ou escolheu. */
export type Response = { fields: string[] } | { choice: number } | { point: [number, number] };

export interface CheckResult {
  ok: boolean;
  /** Erro de leitura (o texto não é um número); não conta como tentativa. */
  invalid?: string;
}

/* ---------- Exercícios gerados ---------- */

export type Rng = () => number;

/** Figura de exercício descrita como dados (sem React), desenhada por ExerciseFigure. */
export interface Fig2D {
  view: [number, number, number, number];
  items: FigItem[];
}

export type FigItem =
  | { t: "vec"; to: [number, number]; from?: [number, number]; color: number; label?: string }
  | { t: "pt"; at: [number, number]; color: number; label?: string }
  | { t: "line"; a: number; b: number; c: number; color: number; dashed?: boolean }
  | { t: "seg"; a: [number, number]; b: [number, number]; color: number; dashed?: boolean }
  | { t: "poly"; points: [number, number][]; color: number }
  | { t: "conic"; k: { A: number; B: number; C: number; D: number; E: number; F: number }; color: number };

export interface Exercise {
  prompt: Rich;
  figure?: Fig2D;
  answer: Answer;
  /** Dica depois do primeiro erro. */
  hint: Rich;
  /** Solução passo a passo (cada item é uma linha). */
  solution: Rich[];
}

export interface Generator {
  /** Único no curso: "A2.angulo". */
  id: string;
  title: string;
  level: 1 | 2 | 3;
  make: (rng: Rng) => Exercise;
}

/* ---------- Cartões de lição ---------- */

export interface IdeaCard {
  kind: "ideia";
  title: string;
  body: ReactNode;
  /** Fórmula em destaque (TeX). */
  tex?: string;
  Figure?: ComponentType;
}

/** Estado de uma tarefa: números, vetores e matrizes, para poder animar até a solução. */
export type TaskState = Record<string, number | number[] | number[][]>;

export interface TaskCard<S extends TaskState = TaskState> {
  kind: "tarefa";
  title: string;
  body: ReactNode;
  init: S;
  /** Estado que cumpre a meta (o "Me mostra" anima até ele). */
  solve: S;
  goal: (s: S) => boolean;
  /** Leitura ao vivo (TeX), por exemplo "u·v = 3,5". */
  readout?: (s: S) => string;
  Scene: ComponentType<{ s: S; set: (patch: Partial<S>) => void; done: boolean }>;
  /** Controles no painel (sliders), para cenas 3D ou parâmetros que não se arrastam. */
  Controls?: ComponentType<{ s: S; set: (patch: Partial<S>) => void }>;
  success: ReactNode;
}

export interface PredictCard {
  kind: "prever";
  title: string;
  question: ReactNode;
  /** Palpite por opção… */
  options?: Rich[];
  correct?: number;
  /** …ou por ponto fantasma arrastado no gráfico. */
  ghost?: { start: [number, number]; truth: [number, number]; tol?: number };
  /** `t` vai de 0 a 1 durante a revelação. */
  Figure: ComponentType<{ revealed: boolean; t: number; guess: [number, number] | null; setGuess: (p: [number, number]) => void }>;
  why: ReactNode;
}

export interface QuestionCard {
  kind: "pergunta";
  title?: string;
  prompt: Rich;
  answer: Answer;
  hint: Rich;
  explain: Rich;
  Figure?: ComponentType;
  /** Figura em dados (para perguntas de ponto). */
  fig?: Fig2D;
}

export type Card = IdeaCard | TaskCard<any> | PredictCard | QuestionCard; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface LessonContent {
  cards: Card[];
}

/** Ajuda de tipos para escrever tarefas com o estado tipado. */
export const tarefa = <S extends TaskState>(c: Omit<TaskCard<S>, "kind">): TaskCard<S> => ({ kind: "tarefa", ...c });
export const ideia = (c: Omit<IdeaCard, "kind">): IdeaCard => ({ kind: "ideia", ...c });
export const prever = (c: Omit<PredictCard, "kind">): PredictCard => ({ kind: "prever", ...c });
export const pergunta = (c: Omit<QuestionCard, "kind">): QuestionCard => ({ kind: "pergunta", ...c });
