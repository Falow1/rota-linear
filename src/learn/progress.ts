import { useSyncExternalStore } from "react";
import { LESSONS, lessonsOf, type LessonMeta, type TrackId } from "./catalog";

/**
 * Progresso guardado só neste navegador (localStorage). Sem conta, sem servidor.
 * Se o armazenamento não estiver disponível (aba anônima, bloqueado), o site funciona igual
 * e só não lembra o progresso depois de recarregar.
 */

export interface LessonProgress {
  /** Cartão em que a pessoa parou. */
  card: number;
  done: boolean;
  /** Perguntas da lição acertadas de primeira, do total. */
  firstTry: number;
  total: number;
  /** Contagem da passada em andamento (para retomar sem perder os acertos). */
  run?: { firstTry: number; total: number };
  /** Melhor e última nota na prática (de 0 a 6) e quando foi. */
  best?: number;
  last?: number;
  at?: number;
  /** Quando a lição foi concluída pela última vez (ms); guia a próxima sugestão. */
  doneAt?: number;
}

export interface Progress {
  v: 1;
  lessons: Record<string, LessonProgress>;
  /** Erros por gerador de exercício (alimenta a revisão). */
  misses: Record<string, number>;
  /** Última vez que cada gerador foi praticado (ms). */
  seen: Record<string, number>;
  streak: { last: string; days: number };
}

const KEY = "rota-linear:v1";
const EMPTY: Progress = { v: 1, lessons: {}, misses: {}, seen: {}, streak: { last: "", days: 0 } };

/** Aceita qualquer coisa lida do armazenamento e devolve um Progress válido. */
export function migrate(raw: unknown): Progress {
  if (!raw || typeof raw !== "object") return structuredClone(EMPTY);
  const r = raw as Partial<Progress>;
  if (r.v !== 1) return structuredClone(EMPTY);
  const obj = (x: unknown) => (x && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, unknown>) : {});
  const lessons: Record<string, LessonProgress> = {};
  for (const [id, lp] of Object.entries(obj(r.lessons))) {
    const p = obj(lp);
    lessons[id] = {
      card: Number.isInteger(p.card) ? (p.card as number) : 0,
      done: p.done === true,
      firstTry: Number(p.firstTry) || 0,
      total: Number(p.total) || 0,
      ...(Number.isFinite(obj(p.run).total) ? { run: { firstTry: Number(obj(p.run).firstTry) || 0, total: obj(p.run).total as number } } : {}),
      ...(Number.isFinite(p.best) ? { best: p.best as number } : {}),
      ...(Number.isFinite(p.last) ? { last: p.last as number } : {}),
      ...(Number.isFinite(p.at) ? { at: p.at as number } : {}),
      ...(Number.isFinite(p.doneAt) ? { doneAt: p.doneAt as number } : {}),
    };
  }
  const nums = (x: unknown) => Object.fromEntries(Object.entries(obj(x)).filter(([, v]) => Number.isFinite(v))) as Record<string, number>;
  const st = obj(r.streak);
  return {
    v: 1,
    lessons,
    misses: nums(r.misses),
    seen: nums(r.seen),
    streak: { last: typeof st.last === "string" ? st.last : "", days: Number(st.days) || 0 },
  };
}

function load(): Progress {
  try {
    const s = localStorage.getItem(KEY);
    return s ? migrate(JSON.parse(s)) : structuredClone(EMPTY);
  } catch {
    return structuredClone(EMPTY);
  }
}

let state: Progress = typeof window === "undefined" ? structuredClone(EMPTY) : load();
const listeners = new Set<() => void>();

function commit(next: Progress) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* sem armazenamento: fica só na memória */
  }
  listeners.forEach((l) => l());
}

/** Outra aba mudou o progresso. */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      state = load();
      listeners.forEach((l) => l());
    }
  });
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const getProgress = () => state;
export const useProgress = () => useSyncExternalStore(subscribe, getProgress, getProgress);

const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Conta um dia de estudo (seguidos se ontem também teve). */
export function bumpStreak(p: Progress, now = new Date()): Progress["streak"] {
  const t = today(now);
  if (p.streak.last === t) return p.streak;
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  return { last: t, days: p.streak.last === today(y) ? p.streak.days + 1 : 1 };
}

/** Dias seguidos que ainda valem (zera se pulou um dia). */
export function liveStreak(p: Progress, now = new Date()): number {
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  return p.streak.last === today(now) || p.streak.last === today(y) ? p.streak.days : 0;
}

const lp = (id: string): LessonProgress => state.lessons[id] ?? { card: 0, done: false, firstTry: 0, total: 0 };

export function saveCard(id: string, card: number, run?: { firstTry: number; total: number }) {
  const cur = lp(id);
  if (cur.card === card && cur.run?.firstTry === run?.firstTry && cur.run?.total === run?.total) return;
  commit({ ...state, lessons: { ...state.lessons, [id]: { ...cur, card, ...(run ? { run: { ...run } } : {}) } } });
}

const withoutRun = ({ run: _run, ...rest }: LessonProgress): LessonProgress => rest;

export function finishLesson(id: string, firstTry: number, total: number) {
  const cur = lp(id);
  commit({
    ...state,
    lessons: {
      ...state.lessons,
      [id]: { ...withoutRun(cur), card: 0, done: true, firstTry: Math.max(cur.done ? cur.firstTry : 0, firstTry), total, doneAt: Date.now() },
    },
    streak: bumpStreak(state),
  });
}

/** Registra uma sessão de prática de uma lição (nota de 0 a total). */
export function savePractice(id: string, score: number) {
  const cur = lp(id);
  commit({
    ...state,
    lessons: { ...state.lessons, [id]: { ...cur, best: Math.max(cur.best ?? 0, score), last: score, at: Date.now() } },
    streak: bumpStreak(state),
  });
}

/** Registra o resultado de cada exercício (acertou de primeira ou não). */
export function recordExercise(genId: string, ok: boolean) {
  const misses = { ...state.misses };
  if (ok) {
    if (misses[genId]) misses[genId] = Math.max(0, misses[genId] - 1);
    if (!misses[genId]) delete misses[genId];
  } else misses[genId] = (misses[genId] ?? 0) + 1;
  commit({ ...state, misses, seen: { ...state.seen, [genId]: Date.now() } });
}

/** Revisão misturada ou desafio terminados: conta o dia. */
export function touchStreak() {
  commit({ ...state, streak: bumpStreak(state) });
}

export function resetProgress() {
  commit(structuredClone(EMPTY));
}

/* ---------- Leituras ---------- */

export const MASTERY = 5;

export type LessonStatus = "nova" | "andamento" | "concluida" | "dominada";

export function statusOf(p: Progress, id: string): LessonStatus {
  const l = p.lessons[id];
  if (!l) return "nova";
  if (l.done && (l.best ?? 0) >= MASTERY) return "dominada";
  if (l.done) return "concluida";
  return l.card > 0 ? "andamento" : "nova";
}

/** Lição concluída mais recentemente (só conta quem tem data de conclusão). */
function lastDone(p: Progress): string | undefined {
  let best: string | undefined;
  let t = -Infinity;
  for (const [id, l] of Object.entries(p.lessons)) {
    if (l.done && l.doneAt !== undefined && l.doneAt > t) {
      t = l.doneAt;
      best = id;
    }
  }
  return best;
}

/**
 * Primeira lição não concluída depois de `afterId`, na ordem do curso; no fim, dá a volta e procura do começo.
 * Sem `afterId`, é a primeira não concluída do curso. Quem começa pela rota 5 segue para a 5, a 6… e só depois volta à 1.
 */
export function nextOpen(p: Progress, afterId?: string): LessonMeta | undefined {
  const start = afterId ? LESSONS.findIndex((l) => l.id === afterId) + 1 : 0;
  for (let k = 0; k < LESSONS.length; k++) {
    const l = LESSONS[(start + k) % LESSONS.length];
    if (!p.lessons[l.id]?.done) return l;
  }
  return undefined;
}

/** Próxima lição sugerida: a que está em andamento, ou a seguinte à última concluída. */
export function suggested(p: Progress): LessonMeta | undefined {
  return LESSONS.find((l) => statusOf(p, l.id) === "andamento") ?? nextOpen(p, lastDone(p));
}

/** Por onde seguir dentro de uma rota: a lição em andamento, ou a primeira não concluída. Rota completa: nenhuma. */
export function trackNext(p: Progress, trackId: TrackId): LessonMeta | undefined {
  const ls = lessonsOf(trackId);
  return ls.find((l) => statusOf(p, l.id) === "andamento") ?? ls.find((l) => !p.lessons[l.id]?.done);
}

export const doneCount = (p: Progress, ids: string[]) => ids.filter((id) => p.lessons[id]?.done).length;

/** Todas as lições da rota concluídas: a revisão da rota fica liberada. */
export const trackComplete = (p: Progress, trackId: TrackId) => lessonsOf(trackId).every((l) => p.lessons[l.id]?.done);

/** Geradores com erros pendentes, das lições já concluídas. */
export function reviewCount(p: Progress): number {
  return Object.keys(p.misses).filter((g) => p.lessons[g.split(".")[0]]?.done && p.misses[g] > 0).length;
}
