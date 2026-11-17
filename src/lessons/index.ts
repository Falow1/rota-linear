import type { LessonContent } from "../learn/types";

/** Conteúdo de cada lição (cartões), carregado só quando a lição abre. */
const MODS = import.meta.glob<{ default: LessonContent }>("./[A-H][0-9].tsx");

export const hasLesson = (id: string) => `./${id}.tsx` in MODS;

export async function loadLesson(id: string): Promise<LessonContent | null> {
  const load = MODS[`./${id}.tsx`];
  return load ? (await load()).default : null;
}
