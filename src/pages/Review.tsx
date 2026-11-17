import { Link } from "react-router";
import { TRACKS, lessonsOf } from "../learn/catalog";
import { doneCount, reviewCount, useProgress } from "../learn/progress";
import { Icon, TrackIcon } from "../ui/icons";
import { Tex } from "../ui/Tex";

export function Review() {
  const p = useProgress();
  const doneAny = Object.values(p.lessons).some((l) => l.done);
  const due = reviewCount(p);
  return (
    <div className="page">
      <h1>Revisão</h1>
      <p className="muted lead">Exercícios novos do que você já estudou e as fórmulas de cada rota num lugar só.</p>

      <section className="review-hero mt-16">
        <span className="review-ico" aria-hidden="true">
          <Icon name="shuffle" size={34} />
        </span>
        <div className="grow">
          <h2>Revisão misturada</h2>
          <p className="muted">
            8 exercícios sorteados das lições concluídas. Os temas em que você errou aparecem mais, e os que você não pratica há tempo também.
          </p>
          {doneAny ? (
            <p className="small-text">
              {due > 0 ? (
                <>
                  <b className="tabular">{due}</b> {due === 1 ? "tipo de exercício" : "tipos de exercício"} com erro pendente.
                </>
              ) : (
                "Nenhum erro pendente. Revisar mesmo assim ajuda a não esquecer."
              )}
            </p>
          ) : (
            <p className="small-text faint">Conclua uma lição para liberar a revisão.</p>
          )}
        </div>
        {doneAny ? (
          <Link to="/revisao/sessao" className="btn primary">
            Começar revisão
          </Link>
        ) : (
          <button type="button" className="btn primary" disabled>
            Começar revisão
          </button>
        )}
      </section>

      <div className="section-head mt-24">
        <h2>Fichas de fórmulas</h2>
      </div>
      <div className="ficha-list">
        {TRACKS.map((t) => {
          const ls = lessonsOf(t.id);
          const d = doneCount(p, ls.map((l) => l.id));
          return (
            <details key={t.id} className={`ficha-acc t-${t.id}`}>
              <summary>
                <span className="ficha-art">
                  <TrackIcon id={t.id} size={30} />
                </span>
                <span className="grow">
                  <b>{t.title}</b>
                  <small className="faint tabular">
                    {" "}
                    · {d}/{ls.length} concluídas
                  </small>
                </span>
                <Icon name="chevronDown" size={20} />
              </summary>
              <div className="ficha-body">
                {ls.map((l) => (
                  <div key={l.id} className="ficha-lesson">
                    <h3>
                      <Link to={`/licao/${l.slug}`}>{l.title}</Link>
                    </h3>
                    {l.ficha.map((f, i) => (
                      <div key={i} className="ficha-item">
                        <Tex block>{f.tex}</Tex>
                        <p className="muted small-text">{f.text}</p>
                      </div>
                    ))}
                  </div>
                ))}
                <Link to={`/ficha/${t.id}`} className="btn soft small">
                  <Icon name="printer" size={16} /> Versão para imprimir
                </Link>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
