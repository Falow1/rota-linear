import { useEffect, useRef, useState } from "react";
import type { IdeaCard, PredictCard, TaskCard, TaskState } from "../learn/types";
import { Formula } from "../ui/controls";
import { Icon } from "../ui/icons";
import { Tex } from "../ui/Tex";
import { useAnimateTo, useTween } from "./anim";
import { RichText } from "./Rich";
import { Sheet, Stage } from "./Stage";

function Kind({ icon, children }: { icon: "bulb" | "target" | "eye" | "sparkle"; children: string }) {
  return (
    <span className="card-kind">
      <Icon name={icon} size={16} /> {children}
    </span>
  );
}

/* ---------- Ideia ---------- */

export function IdeaView({ card, onNext }: { card: IdeaCard; onNext: () => void }) {
  const F = card.Figure;
  return (
    <Stage
      figure={F ? <F /> : undefined}
      actions={
        <button type="button" className="btn primary wide" data-primary onClick={onNext}>
          Continuar
        </button>
      }
    >
      <Kind icon="bulb">Ideia</Kind>
      <h2 className="card-title">{card.title}</h2>
      <div className="card-body">{card.body}</div>
      {card.tex && <Formula tex={card.tex} className="key-formula" />}
    </Stage>
  );
}

/* ---------- Tarefa ---------- */

export function TaskView<S extends TaskState>({ card, onNext }: { card: TaskCard<S>; onNext: () => void }) {
  const [s, setS] = useState<S>(card.init);
  const sRef = useRef(s);
  sRef.current = s;
  const [achieved, setAchieved] = useState(false);
  const [showing, setShowing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const animate = useAnimateTo<S>(() => sRef.current, setS, 1000);
  const ok = card.goal(s);

  useEffect(() => {
    if (ok && !achieved && !showing) {
      setAchieved(true);
      setSheetOpen(true);
    }
  }, [ok, achieved, showing]);

  const set = (patch: Partial<S>) => {
    if (showing) return;
    setS((cur) => ({ ...cur, ...patch }));
  };
  const showMe = () => {
    setShowing(true);
    animate(card.solve, () => {
      setShowing(false);
      setAchieved(true);
      setSheetOpen(true);
    });
  };
  const Scene = card.Scene;
  return (
    <Stage
      figure={<Scene s={s} set={set} done={achieved && ok} />}
      sheet={
        sheetOpen ? (
          <Sheet
            kind="ok"
            title="Meta cumprida!"
            actions={
              <>
                <button type="button" className="btn ghost small sheet-ghost" onClick={() => setSheetOpen(false)}>
                  Continuar mexendo
                </button>
                <button type="button" className="btn ok primary-action" onClick={onNext}>
                  Continuar
                </button>
              </>
            }
          >
            {card.success}
          </Sheet>
        ) : undefined
      }
      actions={
        <>
          {!achieved && (
            <button type="button" className="btn soft" onClick={showMe} disabled={showing}>
              <Icon name="eye" size={18} /> Me mostra
            </button>
          )}
          <button type="button" className={`btn ${achieved ? "ok" : "primary"} grow`} data-primary disabled={!achieved} onClick={onNext}>
            {achieved ? "Continuar" : "Cumpra a meta"}
          </button>
        </>
      }
    >
      <Kind icon="target">Tarefa</Kind>
      <h2 className="card-title">{card.title}</h2>
      <div className="card-body">{card.body}</div>
      {card.Controls && (
        <div className="task-controls">
          <card.Controls s={s} set={set} />
        </div>
      )}
      {card.readout && (
        <div className={`readout${ok ? " hit" : ""}`} aria-live="polite">
          <span className="readout-ico" aria-hidden="true">
            <Icon name={ok ? "check" : "target"} size={18} stroke={ok ? 3 : 2} />
          </span>
          <Tex>{card.readout(s)}</Tex>
        </div>
      )}
    </Stage>
  );
}

/* ---------- Prever ---------- */

const LETTERS = "ABCDEFGH";

export function PredictView({ card, onNext }: { card: PredictCard; onNext: () => void }) {
  const [pick, setPick] = useState(-1);
  const [guess, setGuess] = useState<[number, number] | null>(card.ghost ? card.ghost.start : null);
  const [moved, setMoved] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const t = useTween(revealed, 1300);
  const doneAnim = revealed && t >= 1;

  const ready = card.options ? pick >= 0 : moved;
  const right = card.options
    ? pick === card.correct
    : !!(guess && card.ghost && Math.hypot(guess[0] - card.ghost.truth[0], guess[1] - card.ghost.truth[1]) <= (card.ghost.tol ?? 0.6));

  const F = card.Figure;
  return (
    <Stage
      figure={
        <F
          revealed={revealed}
          t={t}
          guess={guess}
          setGuess={(p) => {
            if (revealed) return;
            setGuess(p);
            setMoved(true);
          }}
        />
      }
      sheet={
        doneAnim ? (
          <Sheet
            kind={right ? "ok" : "info"}
            title={right ? (card.options ? "Previsão certa!" : "Na mosca!") : card.options ? "Olha só o que acontece" : "Quase! Veja onde fica"}
            actions={
              <button type="button" className={`btn ${right ? "ok" : "primary"} primary-action`} onClick={onNext}>
                Continuar
              </button>
            }
          >
            {card.why}
          </Sheet>
        ) : undefined
      }
      actions={
        <button type="button" className="btn primary wide" data-primary disabled={!ready || revealed} onClick={() => setRevealed(true)}>
          <Icon name="eye" size={18} /> {revealed ? "Revelando…" : "Revelar"}
        </button>
      }
    >
      <Kind icon="eye">Preveja</Kind>
      <h2 className="card-title">{card.title}</h2>
      <div className="card-body">{card.question}</div>
      {card.options ? (
        <div className="options" role="radiogroup" aria-label="Seu palpite">
          {card.options.map((o, i) => {
            const picked = pick === i;
            const state = revealed ? (i === card.correct ? " right" : picked ? " wrong" : "") : picked ? " picked" : "";
            return (
              <button key={i} type="button" role="radio" aria-checked={picked} className={`option${state}`} disabled={revealed} onClick={() => setPick(i)}>
                <span className="opt-key" aria-hidden="true">
                  {LETTERS[i]}
                </span>
                <span className="opt-text">
                  <RichText>{o}</RichText>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="point-hint">
          {moved ? "Palpite marcado. Pode ajustar ou revelar." : (
            <>
              Arraste o ponto <b className="ghost-dot">?</b> até onde você acha que fica.
            </>
          )}
        </p>
      )}
    </Stage>
  );
}
