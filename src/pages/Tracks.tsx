import { Link } from "react-router";
import { TRACKS, lessonsOf, type Track } from "../learn/catalog";
import { doneCount, statusOf, useProgress } from "../learn/progress";
import { Ring } from "../ui/Feedback";
import { Icon, TrackIcon } from "../ui/icons";

/** Cartão de trilha com anel de progresso. `compact` é a versão da página inicial. */
export function TrackCard({ track, compact = false }: { track: Track; compact?: boolean }) {
  const p = useProgress();
  const ls = lessonsOf(track.id);
  const done = doneCount(p, ls.map((l) => l.id));
  return (
    <Link to={`/trilha/${track.id}`} className={`track-card t-${track.id}${compact ? " compact" : ""}`}>
      <span className="track-art">
        <TrackIcon id={track.id} size={compact ? 40 : 48} />
      </span>
      <span className="track-body">
        <span className="track-letter">Trilha {track.letter}</span>
        <span className="track-title">{track.title}</span>
        {!compact && <span className="track-summary">{track.summary}</span>}
        <span className="track-count tabular">
          {done}/{ls.length} {ls.length === 1 ? "lição" : "lições"}
        </span>
      </span>
      <Ring value={done / ls.length} size={compact ? 46 : 54} stroke={compact ? 5 : 6}>
        {done === ls.length ? <Icon name="check" size={18} stroke={3} /> : null}
      </Ring>
      {!compact && (
        <span className="track-dots" aria-hidden="true">
          {ls.map((l) => (
            <span key={l.id} className={`tdot ${statusOf(p, l.id)}`} title={l.title} />
          ))}
        </span>
      )}
    </Link>
  );
}

export function Tracks() {
  return (
    <div className="page">
      <h1>Trilhas</h1>
      <p className="muted lead">
        Oito trilhas, na ordem da disciplina. Nada fica trancado: siga a ordem sugerida ou pule para o que precisar estudar.
      </p>
      <div className="track-grid big mt-16">
        {TRACKS.map((t) => (
          <TrackCard key={t.id} track={t} />
        ))}
      </div>
    </div>
  );
}
