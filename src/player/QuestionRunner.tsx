import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { checkAnswer } from "../learn/answer";
import { answerRich } from "../learn/answerTex";
import type { Answer, Fig2D, Response, Rich } from "../learn/types";
import { Icon } from "../ui/icons";
import { AnswerInput, emptyResponse, isFilled } from "./AnswerInput";
import { ExerciseFigure } from "./ExerciseFigure";
import { RichText } from "./Rich";
import { Sheet, Stage } from "./Stage";

const PRAISE = ["Isso aí!", "Mandou bem!", "Certinho!", "Perfeito!", "Exato!", "É isso!"];

type Phase = "answer" | "ok" | "retry" | "reveal";

/**
 * Uma pergunta com correção: até 2 tentativas, dica depois do 1º erro e a resposta (com a solução) depois do 2º.
 * Serve para os cartões "pergunta" das lições e para os exercícios da prática.
 */
export function QuestionRunner({
  head,
  title,
  prompt,
  answer,
  hint,
  explain,
  solution,
  fig,
  Figure,
  onNext,
  nextLabel = "Continuar",
}: {
  head?: ReactNode;
  title?: string;
  prompt: Rich;
  answer: Answer;
  hint: Rich;
  explain?: Rich;
  solution?: Rich[];
  fig?: Fig2D;
  Figure?: ComponentType;
  onNext: (firstTry: boolean) => void;
  nextLabel?: string;
}) {
  const [response, setResponse] = useState<Response>(() => emptyResponse(answer));
  const [touched, setTouched] = useState(false);
  const [tries, setTries] = useState(0);
  const [phase, setPhase] = useState<Phase>("answer");
  const [error, setError] = useState<string | null>(null);
  const [showSol, setShowSol] = useState(false);
  const praise = useMemo(() => PRAISE[Math.floor(Math.random() * PRAISE.length)], []);

  const locked = phase === "ok" || phase === "reveal";
  const change = (r: Response) => {
    setResponse(r);
    setTouched(true);
    setError(null);
  };
  const conferir = () => {
    const res = checkAnswer(answer, response);
    if (res.invalid) {
      setError(res.invalid);
      return;
    }
    if (res.ok) {
      setPhase("ok");
      return;
    }
    const n = tries + 1;
    setTries(n);
    setPhase(n >= 2 ? "reveal" : "retry");
  };

  const pointResp = "point" in response ? response.point : undefined;
  const figure = fig ? (
    <ExerciseFigure fig={fig} point={answer.kind === "point" ? pointResp : undefined} onPoint={(p) => change({ point: p })} locked={locked} />
  ) : Figure ? (
    <Figure />
  ) : undefined;

  const status = phase === "ok" ? "ok" : phase === "reveal" ? "bad" : null;
  const sol = solution && solution.length > 0 ? solution : null;

  let sheet: ReactNode = null;
  if (phase === "ok") {
    sheet = (
      <Sheet
        kind="ok"
        title={tries === 0 ? praise : "Agora sim!"}
        actions={
          <>
            {sol && !showSol && (
              <button type="button" className="btn ghost small sheet-ghost" onClick={() => setShowSol(true)}>
                Ver solução
              </button>
            )}
            <button type="button" className="btn ok primary-action" onClick={() => onNext(tries === 0)}>
              {nextLabel}
            </button>
          </>
        }
      >
        {explain && <RichText>{explain}</RichText>}
      </Sheet>
    );
  } else if (phase === "retry") {
    sheet = (
      <Sheet
        kind="bad"
        title="Quase! Tente de novo."
        actions={
          <button
            type="button"
            className="btn bad primary-action"
            onClick={() => {
              setPhase("answer");
              setTouched(answer.kind !== "point");
            }}
          >
            Tentar de novo
          </button>
        }
      >
        <span className="hint">
          <Icon name="bulb" size={18} /> <RichText>{hint}</RichText>
        </span>
      </Sheet>
    );
  } else if (phase === "reveal") {
    sheet = (
      <Sheet
        kind="bad"
        title="Não foi dessa vez"
        actions={
          <button type="button" className="btn bad primary-action" onClick={() => onNext(false)}>
            {nextLabel}
          </button>
        }
      >
        A resposta é <RichText>{answerRich(answer)}</RichText>.{sol ? " Veja a solução acima." : explain ? <> <RichText>{explain}</RichText></> : null}
      </Sheet>
    );
  }

  return (
    <Stage
      figure={figure}
      sheet={sheet}
      actions={
        <button type="button" className="btn primary wide" data-primary disabled={!isFilled(response, touched)} onClick={conferir}>
          Conferir
        </button>
      }
    >
      {head}
      {title && <h2 className="card-title">{title}</h2>}
      <div className="prompt">
        <RichText>{prompt}</RichText>
      </div>
      <form
        className="answer-zone"
        onSubmit={(e) => {
          e.preventDefault();
          if (!locked && phase === "answer" && isFilled(response, touched)) conferir();
        }}
      >
        <AnswerInput answer={answer} response={response} onChange={change} disabled={locked || phase === "retry"} status={status} />
        {/* Enviar com Enter dentro das caixas */}
        <button type="submit" hidden tabIndex={-1} aria-hidden="true" />
      </form>
      {error && (
        <p className="input-error" role="alert">
          {error}
        </p>
      )}
      {sol && (phase === "reveal" || (phase === "ok" && showSol)) && (
        <div className="solution">
          <h3>Solução</h3>
          <ol>
            {sol.map((s, i) => (
              <li key={i}>
                <RichText>{s}</RichText>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Stage>
  );
}
