import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { loadGens } from "../exercises";
import { LESSONS, lessonBySlug, lessonsOf, trackById, type LessonMeta, type Track } from "../learn/catalog";
import { MASTERY, getProgress, recordExercise, savePractice, touchStreak } from "../learn/progress";
import { freshSeed, mulberry32 } from "../learn/rng";
import { challengeSet, practiceSet, reviewSet, type Item } from "../learn/session";
import type { Exercise } from "../learn/types";
import { NotFound } from "../pages/NotFound";
import { Loading, Ring } from "../ui/Feedback";
import { Icon } from "../ui/icons";
import { Confetti } from "./Confetti";
import { QuestionRunner } from "./QuestionRunner";
import { RichText } from "./Rich";
import { PlayerTop } from "./Stage";

type Mode = "licao" | "desafio" | "revisao";

interface Result {
  item: Item;
  ex: Exercise;
  ok: boolean;
}

const LEVEL = ["", "Básico", "Médio", "Desafio"];

function useSession(mode: Mode, lesson: LessonMeta | undefined, track: Track | undefined, nonce: number) {
  const [items, setItems] = useState<Item[] | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    setItems(undefined);
    const p = getProgress();
    const ids =
      mode === "licao" ? (lesson ? [lesson.id] : []) : mode === "desafio" ? (track ? lessonsOf(track.id).map((l) => l.id) : []) : LESSONS.filter((l) => p.lessons[l.id]?.done).map((l) => l.id);
    if (ids.length === 0) {
      setItems(null);
      return;
    }
    loadGens(ids).then((byLesson) => {
      if (!alive) return;
      const r = mulberry32(freshSeed());
      const all = ids.flatMap((id) => byLesson[id] ?? []);
      if (all.length === 0) return setItems(null);
      setItems(mode === "licao" ? practiceSet(all, p.misses, r) : mode === "desafio" ? challengeSet(all, r) : reviewSet(all, p, r));
    });
    return () => {
      alive = false;
    };
  }, [mode, lesson, track, nonce]);
  return items;
}

export default function PracticePage({ mode }: { mode: Mode }) {
  const { slug = "", trackId = "" } = useParams();
  const lesson = mode === "licao" ? lessonBySlug(slug) : undefined;
  const track = mode === "licao" ? (lesson ? trackById(lesson.track) : undefined) : mode === "desafio" ? trackById(trackId) : undefined;
  const [nonce, setNonce] = useState(0);
  const items = useSession(mode, lesson, track, nonce);
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<Result[]>([]);

  const exercises = useMemo(() => items?.map((it) => it.gen.make(mulberry32(it.seed))) ?? [], [items]);

  if ((mode === "licao" && !lesson) || (mode === "desafio" && !track)) return <NotFound />;

  const exitTo = mode === "revisao" ? "/revisao" : `/trilha/${track!.id}`;
  const theme = track ? `t-${track.id}` : "";
  const label = mode === "licao" ? `Prática: ${lesson!.title}` : mode === "desafio" ? `Desafio: ${track!.title}` : "Revisão misturada";

  if (items === undefined) return <Loading text="Sorteando exercícios…" />;
  if (items === null || items.length === 0)
    return (
      <div className={`page narrow center-page ${theme}`}>
        <h1>{mode === "revisao" ? "Nada para revisar ainda" : "Exercícios em construção"}</h1>
        <p className="muted">{mode === "revisao" ? "Conclua uma lição para liberar a revisão misturada." : "Os exercícios desta parte ainda estão sendo preparados."}</p>
        <Link to={exitTo} className="btn primary mt-16">
          Voltar
        </Link>
      </div>
    );

  const n = items.length;
  const done = results.length >= n;

  const restart = () => {
    setResults([]);
    setIdx(0);
    setNonce((k) => k + 1);
  };

  const onNext = (ok: boolean) => {
    const item = items[idx];
    recordExercise(item.gen.id, ok);
    const next = [...results, { item, ex: exercises[idx], ok }];
    setResults(next);
    if (next.length >= n) {
      const score = next.filter((r) => r.ok).length;
      if (mode === "licao") savePractice(lesson!.id, score);
      else touchStreak();
    } else setIdx(idx + 1);
  };

  if (done) {
    const score = results.filter((r) => r.ok).length;
    const mastered = mode === "licao" && score >= MASTERY;
    const msg =
      score === n ? "Perfeito!" : mastered ? "Lição dominada!" : score >= n / 2 ? "Bom trabalho!" : "Vale mais uma rodada";
    const sub =
      mode === "licao"
        ? mastered
          ? "A lição ganhou a estrela no caminho da trilha."
          : `Acerte ${MASTERY} de ${n} de primeira para dominar a lição.`
        : mode === "desafio"
          ? "Os erros entram na sua revisão misturada."
          : "Os temas que você errou vão aparecer de novo nas próximas revisões.";
    return (
      <div className={`player ${theme}`}>
        <PlayerTop exitTo={exitTo} value={1} label={label} />
        <div className="finish">
          {score >= n - 1 && <Confetti />}
          <div className="finish-inner">
            <Ring value={score / n} size={132} stroke={12}>
              <span className="score tabular">
                {score}/{n}
              </span>
            </Ring>
            <h1 className="mt-16">
              {msg} {mastered && <Icon name="star" size={28} fill />}
            </h1>
            <p className="muted">{sub}</p>
            <ul className="result-list">
              {results.map((r, i) => (
                <li key={i} className={r.ok ? "ok" : "bad"}>
                  <details>
                    <summary>
                      <span className="res-ico" aria-hidden="true">
                        <Icon name={r.ok ? "check" : "x"} size={18} stroke={3} />
                      </span>
                      <span className="grow">{r.item.gen.title}</span>
                      <span className="sr-only">{r.ok ? "acertou de primeira" : "errou"}</span>
                      <Icon name="chevronDown" size={18} />
                    </summary>
                    <div className="res-sol">
                      <RichText>{r.ex.prompt}</RichText>
                      <ol>
                        {r.ex.solution.map((s, j) => (
                          <li key={j}>
                            <RichText>{s}</RichText>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
            <div className="finish-actions">
              <button type="button" className="btn primary wide" onClick={restart}>
                <Icon name="shuffle" size={18} /> {mode === "revisao" ? "Outra revisão" : "Praticar de novo"}
              </button>
              {mode === "licao" && score < n / 2 && (
                <Link to={`/licao/${lesson!.slug}`} className="btn soft wide">
                  Rever a lição
                </Link>
              )}
              <Link to={exitTo} className="btn ghost">
                {mode === "revisao" ? "Voltar à revisão" : "Voltar à trilha"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ex = exercises[idx];
  const gen = items[idx].gen;
  return (
    <div className={`player ${theme}`}>
      <PlayerTop exitTo={exitTo} value={idx / n} count={`${idx + 1}/${n}`} label={label} />
      <QuestionRunner
        key={`${nonce}-${idx}`}
        head={
          <div className="row wrap ex-head">
            <span className="card-kind">
              <Icon name="target" size={16} /> {gen.title}
            </span>
            <span className={`level l${gen.level}`}>{LEVEL[gen.level]}</span>
            {mode !== "licao" && <span className="chip neutral">{lessonTitle(gen.id)}</span>}
          </div>
        }
        prompt={ex.prompt}
        answer={ex.answer}
        hint={ex.hint}
        solution={ex.solution}
        fig={ex.figure}
        onNext={onNext}
        nextLabel={idx + 1 >= n ? "Ver resultado" : "Continuar"}
      />
    </div>
  );
}

const lessonTitle = (genId: string) => LESSONS.find((l) => l.id === genId.split(".")[0])?.title ?? "";
