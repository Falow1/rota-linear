import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { lessonBySlug, livreUrl, nextLesson, trackById, type LessonMeta } from "../learn/catalog";
import { finishLesson, getProgress, saveCard } from "../learn/progress";
import type { Card, LessonContent } from "../learn/types";
import { loadLesson } from "../lessons";
import { NotFound } from "../pages/NotFound";
import { Loading } from "../ui/Feedback";
import { Icon } from "../ui/icons";
import { Tex } from "../ui/Tex";
import { Confetti } from "./Confetti";
import { IdeaView, PredictView, TaskView } from "./cards";
import { QuestionRunner } from "./QuestionRunner";
import { PlayerTop } from "./Stage";

function CardView({ card, onNext }: { card: Card; onNext: (firstTry?: boolean) => void }) {
  switch (card.kind) {
    case "ideia":
      return <IdeaView card={card} onNext={() => onNext()} />;
    case "tarefa":
      return <TaskView card={card} onNext={() => onNext()} />;
    case "prever":
      return <PredictView card={card} onNext={() => onNext()} />;
    case "pergunta":
      return (
        <QuestionRunner
          head={
            <span className="card-kind">
              <Icon name="sparkle" size={16} /> Pergunta
            </span>
          }
          title={card.title}
          prompt={card.prompt}
          answer={card.answer}
          hint={card.hint}
          explain={card.explain}
          fig={card.fig}
          Figure={card.Figure}
          onNext={(ft) => onNext(ft)}
        />
      );
  }
}

function Finish({ meta, firstTry, total }: { meta: LessonMeta; firstTry: number; total: number }) {
  const next = nextLesson(meta.id);
  return (
    <div className="finish">
      <Confetti />
      <div className="finish-inner">
        <span className="finish-badge" aria-hidden="true">
          <Icon name="check" size={56} stroke={3.4} />
        </span>
        <h1>Lição concluída!</h1>
        <p className="muted">{meta.title}</p>
        {total > 0 && (
          <div className="finish-stats">
            <span className="chip ok">
              <Icon name="target" size={16} /> {firstTry}/{total} de primeira
            </span>
          </div>
        )}
        <section className="finish-ficha">
          <h2>
            <Icon name="book" size={20} /> Para a ficha
          </h2>
          {meta.ficha.map((f, i) => (
            <div key={i} className="ficha-item">
              <Tex block>{f.tex}</Tex>
              <p className="muted small-text">{f.text}</p>
            </div>
          ))}
        </section>
        <div className="finish-actions">
          <Link to={`/licao/${meta.slug}/pratica`} className="btn primary wide">
            <Icon name="target" size={18} /> Praticar agora
          </Link>
          {next && (
            <Link to={`/licao/${next.slug}`} className="btn soft wide">
              Próxima: {next.title} <Icon name="arrowRight" size={18} />
            </Link>
          )}
          <div className="row wrap" style={{ justifyContent: "center" }}>
            <Link to={`/rota/${meta.track}`} className="btn ghost small">
              Voltar à rota
            </Link>
            <a href={livreUrl(meta)} target="_blank" rel="noreferrer" className="btn ghost small">
              Abrir no Equação Viva <Icon name="external" size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LessonPage() {
  const { slug = "" } = useParams();
  const meta = lessonBySlug(slug);
  const [content, setContent] = useState<LessonContent | null | undefined>(undefined);
  const [idx, setIdx] = useState(() => {
    const lp = meta ? getProgress().lessons[meta.id] : undefined;
    return lp && !lp.done ? lp.card : 0;
  });
  const stats = useRef(
    (() => {
      const lp = meta ? getProgress().lessons[meta.id] : undefined;
      return lp && !lp.done && lp.card > 0 && lp.run ? { ...lp.run } : { firstTry: 0, total: 0 };
    })(),
  );
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!meta) return;
    let alive = true;
    setContent(undefined);
    loadLesson(meta.id).then((c) => alive && setContent(c));
    return () => {
      alive = false;
    };
  }, [meta]);

  if (!meta) return <NotFound />;
  const track = trackById(meta.track)!;
  if (content === undefined) return <Loading text="Abrindo a lição…" />;
  if (content === null)
    return (
      <div className={`page narrow center-page t-${track.id}`}>
        <h1>Lição em construção</h1>
        <p className="muted">O conteúdo de “{meta.title}” ainda está sendo preparado.</p>
        <Link to={`/rota/${track.id}`} className="btn primary mt-16">
          Voltar à rota
        </Link>
      </div>
    );

  const cards = content.cards;
  const i = Math.min(idx, cards.length - 1);
  const advance = (firstTry?: boolean) => {
    if (firstTry !== undefined) {
      stats.current.total++;
      if (firstTry) stats.current.firstTry++;
    }
    if (i + 1 >= cards.length) {
      finishLesson(meta.id, stats.current.firstTry, stats.current.total);
      setFinished(true);
    } else {
      saveCard(meta.id, i + 1, stats.current);
      setIdx(i + 1);
    }
  };

  return (
    <div className={`player t-${track.id}`}>
      <PlayerTop
        exitTo={`/rota/${track.id}`}
        value={finished ? 1 : i / cards.length}
        count={finished ? undefined : `${i + 1}/${cards.length}`}
        label={`Progresso na lição ${meta.title}`}
      />
      {finished ? (
        <Finish meta={meta} firstTry={stats.current.firstTry} total={stats.current.total} />
      ) : (
        <CardView key={i} card={cards[i]} onNext={advance} />
      )}
    </div>
  );
}
