import { useState } from "react";
import { Link, useParams } from "react-router";
import { TRACKS, lessonsOf, livreUrl, trackById, type LessonMeta } from "../learn/catalog";
import { MASTERY, doneCount, statusOf, suggested, useProgress, type LessonStatus } from "../learn/progress";
import { ProgressBar } from "../ui/Feedback";
import { Icon, TrackIcon } from "../ui/icons";
import { NotFound } from "./NotFound";

/** Deslocamento horizontal de cada nó do caminho (zigue-zague), em fração do máximo que cabe na tela (ver `.path-step`). */
const ZIG = [0, 0.67, 1, 0.67, 0, -0.67, -1, -0.67];

const STATUS_TEXT: Record<LessonStatus, string> = {
  nova: "Ainda não começou",
  andamento: "Em andamento",
  concluida: "Concluída",
  dominada: "Dominada",
};

function NodeIcon({ st, n }: { st: LessonStatus; n: number }) {
  if (st === "dominada") return <Icon name="star" size={30} fill />;
  if (st === "concluida") return <Icon name="check" size={32} stroke={3.2} />;
  if (st === "andamento") return <Icon name="play" size={28} fill />;
  return <span className="node-n">{n}</span>;
}

function LessonPopover({ l, st }: { l: LessonMeta; st: LessonStatus }) {
  const p = useProgress();
  const lp = p.lessons[l.id];
  return (
    <div className="node-pop" role="dialog" aria-label={l.title}>
      <div className="row">
        <span className={`chip ${st === "dominada" ? "gold" : st === "concluida" ? "ok" : ""}`}>{STATUS_TEXT[st]}</span>
        {l.dim === "3d" && <span className="chip neutral">3D</span>}
      </div>
      <h3 className="mt-8">{l.title}</h3>
      <p className="muted small-text">{l.summary}</p>
      {lp?.done && lp.best !== undefined && (
        <p className="small-text">
          Melhor prática: <b className="tabular">{lp.best}/6</b>
          {lp.best < MASTERY && <span className="faint"> (acerte {MASTERY} para dominar)</span>}
        </p>
      )}
      <div className="stack mt-8">
        <Link to={`/licao/${l.slug}`} className="btn primary wide">
          {st === "andamento" ? "Continuar" : lp?.done ? "Rever a lição" : "Começar"}
        </Link>
        <Link to={`/licao/${l.slug}/pratica`} className="btn soft wide">
          <Icon name="target" size={18} /> Praticar
        </Link>
        <a href={livreUrl(l)} target="_blank" rel="noreferrer" className="btn ghost small">
          Abrir no Equação Viva <Icon name="external" size={15} />
        </a>
      </div>
    </div>
  );
}

export function TrackPage() {
  const { trackId = "" } = useParams();
  const track = trackById(trackId);
  const p = useProgress();
  const ls = track ? lessonsOf(track.id) : [];
  const next = suggested(p);
  const current = ls.find((l) => l.id === next?.id)?.id ?? null;
  const [open, setOpen] = useState<string | null>(current);
  if (!track) return <NotFound />;
  const done = doneCount(p, ls.map((l) => l.id));
  const idx = TRACKS.indexOf(track);
  const prev = TRACKS[idx - 1], after = TRACKS[idx + 1];

  return (
    <div className={`page t-${track.id}`}>
      <section className="track-banner">
        <div className="grow">
          <span className="chip">Rota {track.num}</span>
          <h1 className="mt-8">{track.title}</h1>
          <p className="muted">{track.summary}</p>
          <div className="row mt-16">
            <div className="grow">
              <ProgressBar value={done / ls.length} label={`Progresso na rota ${track.title}`} />
            </div>
            <span className="small-text tabular">
              <b>{done}</b>/{ls.length}
            </span>
          </div>
        </div>
        <span className="banner-art" aria-hidden="true">
          <TrackIcon id={track.id} size={96} />
        </span>
      </section>

      <ol className="path" aria-label="Lições da rota">
        {ls.map((l, i) => {
          const st = statusOf(p, l.id);
          const isCur = l.id === current;
          const isOpen = open === l.id;
          return (
            <li key={l.id} className="path-step" style={{ ["--z" as string]: ZIG[i % ZIG.length] }}>
              <button
                type="button"
                className={`node ${st}${isCur ? " current" : ""}`}
                aria-expanded={isOpen}
                aria-label={`${l.title}: ${STATUS_TEXT[st]}`}
                onClick={() => setOpen(isOpen ? null : l.id)}
              >
                <NodeIcon st={st} n={i + 1} />
                {isCur && <span className="node-flag">{st === "andamento" ? "Continuar" : "Começar"}</span>}
              </button>
              <span className="node-label">{l.title}</span>
              {isOpen && <LessonPopover l={l} st={st} />}
            </li>
          );
        })}
        <li className="path-step" style={{ ["--z" as string]: ZIG[ls.length % ZIG.length] }}>
          <Link to={`/ficha/${track.id}`} className="node special" aria-label="Ficha de fórmulas da rota">
            <Icon name="book" size={28} />
          </Link>
          <span className="node-label">Ficha de fórmulas</span>
        </li>
        <li className="path-step" style={{ ["--z" as string]: ZIG[(ls.length + 1) % ZIG.length] }}>
          <Link to={`/desafio/${track.id}`} className={`node special trophy${done === ls.length ? " ready" : ""}`} aria-label="Desafio da rota">
            <Icon name="trophy" size={30} />
          </Link>
          <span className="node-label">Desafio da rota</span>
          <span className="faint small-text">8 exercícios misturados</span>
        </li>
      </ol>

      <nav className="track-nav" aria-label="Outras rotas">
        {prev ? (
          <Link to={`/rota/${prev.id}`} className="btn ghost">
            <Icon name="arrowLeft" size={18} /> {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {after && (
          <Link to={`/rota/${after.id}`} className="btn ghost">
            {after.title} <Icon name="arrowRight" size={18} />
          </Link>
        )}
      </nav>
    </div>
  );
}
