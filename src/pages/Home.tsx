import { Link } from "react-router";
import { LESSONS, TRACKS, trackById } from "../learn/catalog";
import { MASTERY, doneCount, liveStreak, reviewCount, statusOf, suggested, useProgress } from "../learn/progress";
import { ProgressBar } from "../ui/Feedback";
import { Icon, TrackIcon } from "../ui/icons";
import { TrackCard } from "./Tracks";

export function Home() {
  const p = useProgress();
  const next = suggested(p);
  const track = next ? trackById(next.track)! : null;
  const done = doneCount(p, LESSONS.map((l) => l.id));
  const mastered = LESSONS.filter((l) => (p.lessons[l.id]?.best ?? 0) >= MASTERY && p.lessons[l.id]?.done).length;
  const due = reviewCount(p);
  const streak = liveStreak(p);
  const started = Object.keys(p.lessons).length > 0;
  const st = next ? statusOf(p, next.id) : null;
  const inLesson = next ? p.lessons[next.id]?.card ?? 0 : 0;

  return (
    <div className="page">
      <section className={`hero-card ${track ? `t-${track.id}` : ""}`}>
        {next && track ? (
          <>
            <div className="hero-text">
              <span className="chip">
                {track.letter} · {track.title}
              </span>
              <h1>{started ? (st === "andamento" ? "Continue de onde parou" : "Próxima parada") : "Bora começar?"}</h1>
              <p className="hero-lesson">
                <strong>{next.title}</strong>
                <span className="muted"> · {next.summary}</span>
              </p>
              {st === "andamento" && <p className="faint small-text">Você estava no cartão {inLesson + 1}.</p>}
              <div className="row wrap mt-16">
                <Link to={`/licao/${next.slug}`} className="btn primary">
                  <Icon name="play" size={18} fill />
                  {st === "andamento" ? "Continuar lição" : "Começar lição"}
                </Link>
                {!started && (
                  <Link to="/trilhas" className="btn soft">
                    Ver todas as trilhas
                  </Link>
                )}
              </div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <TrackIcon id={track.id} size={120} />
            </div>
          </>
        ) : (
          <div className="hero-text">
            <span className="chip gold">
              <Icon name="trophy" size={16} /> Tudo concluído
            </span>
            <h1>Você terminou as 29 lições!</h1>
            <p className="muted">Agora é manter afiado: a revisão misturada traz exercícios novos do que você mais errou.</p>
            <div className="row wrap mt-16">
              <Link to="/revisao" className="btn primary">
                Ir para a revisão
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="stats" aria-label="Seu progresso">
        <div className="stat">
          <span className="stat-ico ok">
            <Icon name="check" size={22} stroke={3} />
          </span>
          <span>
            <b className="tabular">
              {done}/{LESSONS.length}
            </b>
            <small>lições concluídas</small>
          </span>
        </div>
        <div className="stat">
          <span className="stat-ico gold">
            <Icon name="star" size={22} fill />
          </span>
          <span>
            <b className="tabular">{mastered}</b>
            <small>{mastered === 1 ? "dominada" : "dominadas"}</small>
          </span>
        </div>
        <div className="stat">
          <span className={`stat-ico flame${streak > 0 ? " on" : ""}`}>
            <Icon name="flame" size={22} fill={streak > 0} />
          </span>
          <span>
            <b className="tabular">{streak}</b>
            <small>{streak === 1 ? "dia seguido" : "dias seguidos"}</small>
          </span>
        </div>
        <Link to="/revisao" className="stat link">
          <span className="stat-ico brand">
            <Icon name="cards" size={22} />
          </span>
          <span>
            <b className="tabular">{due}</b>
            <small>para revisar</small>
          </span>
        </Link>
      </section>

      <section className="mt-24">
        <div className="section-head">
          <h2>Trilhas</h2>
          <Link to="/trilhas" className="btn ghost small">
            Ver detalhes <Icon name="arrowRight" size={16} />
          </Link>
        </div>
        <div className="track-grid">
          {TRACKS.map((t) => (
            <TrackCard key={t.id} track={t} compact />
          ))}
        </div>
      </section>

      {started && (
        <section className="mt-24 card how">
          <h2>Como cada lição funciona</h2>
          <ul className="how-list">
            <li>
              <Icon name="bulb" size={22} /> <span><b>Ideias</b> curtas, uma por cartão, com o gráfico ao lado.</span>
            </li>
            <li>
              <Icon name="eye" size={22} /> <span><b>Preveja</b> antes de ver: chute, depois confira.</span>
            </li>
            <li>
              <Icon name="target" size={22} /> <span><b>Tarefas</b> no gráfico: arraste até cumprir a meta.</span>
            </li>
            <li>
              <Icon name="trophy" size={22} /> <span><b>Prática</b> com exercícios novos a cada vez. Acerte 5 de 6 para dominar.</span>
            </li>
          </ul>
        </section>
      )}
      <ProgressStrip done={done} />
    </div>
  );
}

/** Faixa final com o progresso do curso inteiro. */
function ProgressStrip({ done }: { done: number }) {
  return (
    <section className="mt-24 course-progress">
      <div className="row">
        <span className="muted small-text grow">Progresso no curso</span>
        <span className="small-text tabular">
          <b>{Math.round((done / LESSONS.length) * 100)}%</b>
        </span>
      </div>
      <ProgressBar value={done / LESSONS.length} label="Progresso no curso" />
      <p className="faint small-text mt-8">
        {TRACKS.length} trilhas · {LESSONS.length} lições · o progresso fica salvo só neste navegador

      </p>
    </section>
  );
}
