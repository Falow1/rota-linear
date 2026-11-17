import { Link, useParams } from "react-router";
import { TRACKS, lessonsOf, trackById } from "../learn/catalog";
import { Icon } from "../ui/icons";
import { Tex } from "../ui/Tex";
import { NotFound } from "./NotFound";

/** Ficha de fórmulas de uma rota (ou de todas, em /ficha/todas), pensada para imprimir. */
export default function FichaPage() {
  const { trackId = "" } = useParams();
  const all = trackId === "todas";
  const tracks = all ? TRACKS : [trackById(trackId)].filter((t) => t !== undefined);
  if (tracks.length === 0) return <NotFound />;
  return (
    <div className="page ficha-page">
      <div className="row wrap no-print">
        <Link to="/revisao" className="btn ghost small">
          <Icon name="arrowLeft" size={16} /> Revisão
        </Link>
        <span className="grow" />
        {!all && (
          <Link to="/ficha/todas" className="btn ghost small">
            Todas as rotas
          </Link>
        )}
        <button type="button" className="btn soft small" onClick={() => window.print()}>
          <Icon name="printer" size={16} /> Imprimir
        </button>
      </div>
      <h1 className="mt-16">{all ? "Ficha de fórmulas: GAAL" : `Ficha: ${tracks[0].title}`}</h1>
      {tracks.map((t) => (
        <section key={t.id} className={`ficha-sheet t-${t.id}`}>
          {all && <h2 className="ficha-track">{t.title}</h2>}
          {lessonsOf(t.id).map((l) => (
            <div key={l.id} className="ficha-lesson">
              <h3>{l.title}</h3>
              {l.ficha.map((f, i) => (
                <div key={i} className="ficha-item">
                  <Tex block>{f.tex}</Tex>
                  <p className="muted small-text">{f.text}</p>
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
