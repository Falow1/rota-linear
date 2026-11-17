import type { Rng } from "./types";

/** Gerador pseudoaleatório com semente (mulberry32): a mesma semente gera o mesmo exercício. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Inteiro em [lo, hi]. */
export const int = (r: Rng, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

/** Inteiro em [lo, hi] diferente de zero. */
export function nz(r: Rng, lo: number, hi: number): number {
  for (;;) {
    const v = int(r, lo, hi);
    if (v !== 0) return v;
  }
}

export const pick = <T>(r: Rng, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)];

export const sign = (r: Rng) => (r() < 0.5 ? -1 : 1);

export function shuffle<T>(r: Rng, xs: readonly T[]): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Repete `make` até `ok` aceitar (para garantir números "bonitos"). */
export function until<T>(make: () => T, ok: (x: T) => boolean, tries = 200): T {
  for (let i = 0; i < tries; i++) {
    const x = make();
    if (ok(x)) return x;
  }
  throw new Error("Gerador não encontrou um caso válido");
}

/** Vetor de inteiros em [lo, hi]. */
export const ivec = (r: Rng, n: number, lo: number, hi: number) => Array.from({ length: n }, () => int(r, lo, hi));

/** Embaralha opções mantendo o índice da correta (a correta é a primeira da lista recebida). */
export function choices<T>(r: Rng, correct: T, wrong: T[]): { options: T[]; correct: number } {
  const all = shuffle(r, [correct, ...wrong]);
  return { options: all, correct: all.indexOf(correct) };
}

/** Semente nova (para cada sessão de prática). */
export const freshSeed = () => (Math.random() * 2 ** 32) >>> 0;
