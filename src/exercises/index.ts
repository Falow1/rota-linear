import type { Generator } from "../learn/types";

/**
 * Geradores de exercício, um arquivo por rota (A.ts … H.ts), cada um exportando
 * `{ A1: Generator[], A2: Generator[], … }`. Carregados sob demanda.
 */
export type TrackGens = Record<string, Generator[]>;

const MODS = import.meta.glob<{ default: TrackGens }>("./[A-H].ts");

export async function loadTrackGens(letter: string): Promise<TrackGens> {
  const load = MODS[`./${letter}.ts`];
  return load ? (await load()).default : {};
}

/** Geradores de várias lições (agrupa por rota para carregar cada arquivo uma vez). */
export async function loadGens(lessonIds: string[]): Promise<Record<string, Generator[]>> {
  const letters = [...new Set(lessonIds.map((id) => id[0]))];
  const packs = await Promise.all(letters.map(loadTrackGens));
  const out: Record<string, Generator[]> = {};
  for (const pack of packs) for (const [id, gens] of Object.entries(pack)) if (lessonIds.includes(id)) out[id] = gens;
  return out;
}
