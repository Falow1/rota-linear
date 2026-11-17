import { useEffect, useRef } from "react";
import { fieldCount } from "../learn/answer";
import type { Answer, Response } from "../learn/types";
import { fmt } from "../math/format";
import { Tex } from "../ui/Tex";
import { RichText } from "./Rich";

/** Resposta inicial vazia para cada tipo. */
export function emptyResponse(a: Answer, pointStart: [number, number] = [0, 0]): Response {
  if (a.kind === "choice") return { choice: -1 };
  if (a.kind === "point") return { point: pointStart };
  return { fields: Array(fieldCount(a)).fill("") };
}

/** Já dá para conferir? (escolheu uma opção, preencheu todas as caixas, mexeu o ponto) */
export function isFilled(r: Response, touched = true): boolean {
  if ("choice" in r) return r.choice >= 0;
  if ("point" in r) return touched;
  return r.fields.every((f) => f.trim() !== "");
}

function Field({
  value,
  onChange,
  label,
  disabled,
  autoFocus,
  wide,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  disabled?: boolean;
  autoFocus?: boolean;
  wide?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // No celular, não abre o teclado sozinho (cobriria a pergunta).
    if (autoFocus && !window.matchMedia?.("(pointer: coarse)").matches) ref.current?.focus({ preventScroll: true });
  }, [autoFocus]);
  return (
    <input
      ref={ref}
      className={`ans${wide ? " wide" : ""}`}
      inputMode="decimal"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

const LETTERS = "ABCDEFGH";

export function AnswerInput({
  answer,
  response,
  onChange,
  disabled = false,
  status,
}: {
  answer: Answer;
  response: Response;
  onChange: (r: Response) => void;
  disabled?: boolean;
  /** Depois de conferir: pinta a opção escolhida. */
  status?: "ok" | "bad" | null;
}) {
  if (answer.kind === "choice") {
    const sel = "choice" in response ? response.choice : -1;
    return (
      <div className="options" role="radiogroup" aria-label="Opções">
        {answer.options.map((o, i) => {
          const picked = sel === i;
          const cls = picked ? (status === "ok" ? " right" : status === "bad" ? " wrong" : " picked") : "";
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={picked}
              className={`option${cls}`}
              disabled={disabled}
              onClick={() => onChange({ choice: i })}
            >
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
    );
  }

  if (answer.kind === "point") {
    const p = "point" in response ? response.point : [0, 0];
    return (
      <p className="point-hint">
        Arraste o ponto <b className="ghost-dot">?</b> no gráfico até a resposta. Agora: <Tex>{`(${fmt(p[0])},\\ ${fmt(p[1])})`.replace(/−/g, "-")}</Tex>
      </p>
    );
  }

  const fields = "fields" in response ? response.fields : [];
  const set = (i: number, v: string) => onChange({ fields: fields.map((f, j) => (j === i ? v : f)) });
  const status_ = status ? ` ${status}` : "";

  if (answer.kind === "number") {
    return (
      <div className={`ans-row${status_}`}>
        {answer.label && (
          <span className="ans-label">
            <RichText>{answer.label}</RichText> =
          </span>
        )}
        <Field value={fields[0] ?? ""} onChange={(v) => set(0, v)} label="Resposta" disabled={disabled} autoFocus wide />
        {answer.unit && <span className="ans-unit">{answer.unit}</span>}
      </div>
    );
  }

  if (answer.kind === "vector" || answer.kind === "direction") {
    const names = answer.names;
    return (
      <div className={`ans-row vec${status_}`}>
        <span className="paren">(</span>
        {fields.map((f, i) => (
          <span key={i} className="vec-cell">
            {names && <span className="cell-name">{names[i]}</span>}
            <Field value={f} onChange={(v) => set(i, v)} label={names ? names[i] : `coordenada ${i + 1}`} disabled={disabled} autoFocus={i === 0} />
            {i < fields.length - 1 && <span className="sep">,</span>}
          </span>
        ))}
        <span className="paren">)</span>
      </div>
    );
  }

  if (answer.kind === "matrix") {
    const cols = answer.value[0].length;
    return (
      <div className={`ans-matrix${status_}`} style={{ gridTemplateColumns: `repeat(${cols}, auto)` }} role="group" aria-label="Matriz">
        {fields.map((f, i) => (
          <Field
            key={i}
            value={f}
            onChange={(v) => set(i, v)}
            label={`linha ${Math.floor(i / cols) + 1}, coluna ${(i % cols) + 1}`}
            disabled={disabled}
            autoFocus={i === 0}
          />
        ))}
      </div>
    );
  }

  // linear: [a] x + [b] y + [c] = 0   ou   [a] x + [b] y + [c] z = [d]
  const nv = answer.vars.length;
  return (
    <div className={`ans-row lin${status_}`}>
      {answer.vars.map((v, i) => (
        <span key={v} className="lin-term">
          {i > 0 && <span className="op">+</span>}
          <Field value={fields[i] ?? ""} onChange={(x) => set(i, x)} label={`coeficiente de ${v}`} disabled={disabled} autoFocus={i === 0} />
          <Tex>{v}</Tex>
        </span>
      ))}
      {answer.rhsForm ? (
        <span className="lin-term">
          <span className="op">=</span>
          <Field value={fields[nv] ?? ""} onChange={(x) => set(nv, x)} label="lado direito" disabled={disabled} />
        </span>
      ) : (
        <span className="lin-term">
          <span className="op">+</span>
          <Field value={fields[nv] ?? ""} onChange={(x) => set(nv, x)} label="termo independente" disabled={disabled} />
          <span className="op">= 0</span>
        </span>
      )}
    </div>
  );
}
