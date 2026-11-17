import type { Progress } from "./progress";
import { shuffle } from "./rng";
import type { Generator, Rng } from "./types";

export interface Item {
  gen: Generator;
  seed: number;
}

const seedOf = (r: Rng) => (r() * 2 ** 32) >>> 0;

/** Sorteio com pesos, sem repetir enquanto houver opções. */
function weightedPick<T>(r: Rng, xs: T[], w: (x: T) => number, n: number): T[] {
  const pool = xs.slice();
  const out: T[] = [];
  while (out.length < n && xs.length > 0) {
    if (pool.length === 0) pool.push(...xs);
    const ws = pool.map(w);
    const total = ws.reduce((a, b) => a + b, 0);
    let k = r() * total;
    let i = 0;
    while (i < pool.length - 1 && k >= ws[i]) k -= ws[i++];
    out.push(pool[i]);
    pool.splice(i, 1);
  }
  return out;
}

/**
 * Prática de uma lição: cada gerador aparece uma vez (do nível mais fácil ao mais difícil)
 * e as vagas que sobram vão para os níveis mais altos e para os que a pessoa mais erra.
 */
export function practiceSet(gens: Generator[], misses: Record<string, number>, r: Rng, n = 6): Item[] {
  const byLevel = gens.slice().sort((a, b) => a.level - b.level);
  const chosen = byLevel.slice(0, n);
  if (chosen.length < n) chosen.push(...weightedPick(r, byLevel, (g) => g.level + 2 * (misses[g.id] ?? 0), n - chosen.length));
  return chosen.sort((a, b) => a.level - b.level).map((gen) => ({ gen, seed: seedOf(r) }));
}

/** Desafio da rota: exercícios de todas as lições, de preferência os de nível 2 e 3, misturados. */
export function challengeSet(gens: Generator[], r: Rng, n = 8): Item[] {
  const picked = weightedPick(r, gens, (g) => (g.level === 1 ? 0.5 : g.level), n);
  return shuffle(r, picked).map((gen) => ({ gen, seed: seedOf(r) }));
}

/**
 * Revisão misturada: peso maior para o que a pessoa errou e para o que não pratica há dias.
 * Peso = 1 + 2·erros + min(3, dias sem praticar / 2); nunca praticado conta como 3 dias.
 */
export function reviewSet(gens: Generator[], p: Progress, r: Rng, now = Date.now(), n = 8): Item[] {
  const DAY = 86_400_000;
  const w = (g: Generator) => {
    const days = p.seen[g.id] ? (now - p.seen[g.id]) / DAY : 6;
    return 1 + 2 * (p.misses[g.id] ?? 0) + Math.min(3, days / 2);
  };
  return shuffle(r, weightedPick(r, gens, w, n)).map((gen) => ({ gen, seed: seedOf(r) }));
}
