import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { fmt } from "../math/format";
import { sliderGeometry, stepValue } from "./sliderGeometry";
import { Tex } from "./Tex";

/** Campo numérico que aceita vírgula ou ponto e só confirma valores válidos. */
export function NumberField({
  value,
  onChange,
  step = 0.5,
  min,
  max,
  label,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}) {
  const shown = Number.isFinite(value) ? String(Math.round(value * 1000) / 1000).replace(".", ",") : "";
  const [text, setText] = useState(shown);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(shown);
  }, [shown, focused]);
  const parse = (s: string): number | null => {
    const t = s.trim().replace(",", ".").replace("−", "-");
    if (t === "" || t === "-" || t === ".") return null;
    if (/^-?\d+\/\d+$/.test(t)) {
      const [a, b] = t.split("/").map(Number);
      return b === 0 ? null : a / b;
    }
    const v = Number(t);
    return Number.isFinite(v) ? v : null;
  };
  const parsed = parse(text);
  return (
    <input
      className={`num ${parsed === null && text.trim() !== "" && text.trim() !== "-" ? "invalid" : ""} ${className ?? ""}`}
      inputMode="decimal"
      aria-label={label}
      value={focused ? text : shown}
      onFocus={() => {
        setFocused(true);
        setText(shown);
      }}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        setText(e.target.value);
        let v = parse(e.target.value);
        if (v !== null) {
          if (min !== undefined) v = Math.max(min, v);
          if (max !== undefined) v = Math.min(max, v);
          onChange(v);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const k = e.shiftKey ? step / 5 : step;
          let v = (Number.isFinite(value) ? value : 0) + (e.key === "ArrowUp" ? k : -k);
          v = Math.round(v * 1000) / 1000;
          if (min !== undefined) v = Math.max(min, v);
          if (max !== undefined) v = Math.min(max, v);
          onChange(v);
          setText(String(v).replace(".", ","));
        }
      }}
    />
  );
}

const OBJ = /\bobj[1-6]\b/;
const sliderPos = (f: number) => `calc(var(--th) / 2 + (100% - var(--th)) * ${f.toFixed(4)})`;

/** Botão − ou + do slider: um passo por toque; segurando, repete (espera 400 ms, depois a cada 60 ms). */
function StepButton({ dir, value, step, min, max, onChange, name }: { dir: 1 | -1; value: number; step: number; min: number; max: number; onChange: (v: number) => void; name: string }) {
  const latest = useRef(value);
  latest.current = value;
  const timer = useRef(0);
  const stop = () => {
    window.clearTimeout(timer.current);
    window.clearInterval(timer.current);
  };
  useEffect(() => stop, []);
  const bump = () => {
    latest.current = stepValue(latest.current, dir, step, min, max);
    onChange(latest.current);
  };
  return (
    <button
      type="button"
      className="step-btn"
      aria-label={`${dir < 0 ? "Diminuir" : "Aumentar"} ${name}`}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        bump();
        stop();
        timer.current = window.setTimeout(() => {
          timer.current = window.setInterval(bump, 60);
        }, 400);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onClick={(e) => {
        if (e.detail === 0) bump(); // teclado ou leitor de tela (o toque já agiu no pointerdown)
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {dir < 0 ? "−" : "+"}
    </button>
  );
}

/**
 * Slider com rótulo (texto ou LaTeX) e campo numérico ao lado.
 * A cor segue o objeto que o parâmetro controla (`color`, ou a classe objN do rótulo); senão, a cor de destaque.
 * Se o intervalo cruza o zero, o preenchimento vai do zero até a bolinha e o zero ganha uma marca.
 */
export function Slider({
  label,
  tex,
  value,
  onChange,
  min,
  max,
  step = 0.5,
  className,
  color,
}: {
  label?: ReactNode;
  tex?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  className?: string;
  /** "obj1" … "obj6" ou qualquer cor CSS */
  color?: string;
}) {
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const g = sliderGeometry(value, min, max);
  const objName = color ?? (tex ?? "").match(OBJ)?.[0] ?? className?.match(OBJ)?.[0];
  const name = typeof label === "string" ? label : (tex ?? "valor").replace(/\\htmlClass\{[^}]*\}\{([^}]*)\}/g, "$1");

  // O mouse pode soltar fora do slider: escuta a janela enquanto arrasta.
  useEffect(() => {
    if (!dragging) return;
    const end = () => setDragging(false);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [dragging]);

  const style = {
    ...(objName ? { "--sl": OBJ.test(objName) ? `var(--${objName})` : objName } : {}),
    "--pos": sliderPos(g.p),
    "--from": g.fromEdge ? "0px" : sliderPos(g.lo),
    "--to": sliderPos(g.hi),
    ...(g.z !== null ? { "--zero": sliderPos(g.z) } : {}),
  } as CSSProperties;

  return (
    <div className="control-row">
      <label htmlFor={id} className={className}>
        {tex ? <Tex>{tex}</Tex> : label}
      </label>
      <div className="slider" style={style} data-dragging={dragging ? "" : undefined}>
        <span className="slider-track" />
        <span className="slider-fill" />
        {g.z !== null && <span className="slider-zero" />}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerDown={() => setDragging(true)}
          onBlur={() => setDragging(false)}
        />
        <output className="slider-bubble" htmlFor={id} aria-hidden="true">
          {fmt(value)}
        </output>
      </div>
      <div className="slider-num">
        <StepButton dir={-1} value={value} step={step} min={min} max={max} onChange={onChange} name={name} />
        <NumberField value={value} onChange={onChange} step={step} label={name} />
        <StepButton dir={1} value={value} step={step} min={min} max={max} onChange={onChange} name={name} />
      </div>
    </div>
  );
}

/** Entrada de vetor (a; b; c). */
export function VecInput({
  label,
  value,
  onChange,
  step = 0.5,
  className,
}: {
  label?: string;
  value: number[];
  onChange: (v: number[]) => void;
  step?: number;
  className?: string;
}) {
  return (
    <div className="vec-input">
      {label && (
        <span className={`vlabel ${className ?? ""}`}>
          <Tex>{label}</Tex>
        </span>
      )}
      <span className="paren">(</span>
      {value.map((x, i) => (
        <NumberField
          key={i}
          value={x}
          step={step}
          label={`${label ?? "vetor"} coordenada ${i + 1}`}
          onChange={(v) => onChange(value.map((y, j) => (j === i ? v : y)))}
        />
      ))}
      <span className="paren">)</span>
    </div>
  );
}

/** Entrada de matriz; `bar` desenha a barra da matriz aumentada antes dessa coluna. */
export function MatrixInput({
  value,
  onChange,
  bar,
  label,
  colClass,
}: {
  value: number[][];
  onChange: (M: number[][]) => void;
  bar?: number;
  label?: string;
  colClass?: (j: number) => string | undefined;
}) {
  const cols = value[0].length;
  return (
    <div className="row">
      {label && <Tex>{label}</Tex>}
      <div className="matrix-input" style={{ gridTemplateColumns: `repeat(${cols}, auto)` }} role="group" aria-label={label ?? "matriz"}>
        {value.map((r, i) =>
          r.map((x, j) => (
            <div key={`${i}-${j}`} className={`${bar !== undefined && j === bar ? "bar" : ""} ${colClass?.(j) ?? ""}`}>
              <NumberField
                value={x}
                label={`linha ${i + 1}, coluna ${j + 1}`}
                onChange={(v) => onChange(value.map((row, a) => row.map((y, b) => (a === i && b === j ? v : y))))}
              />
            </div>
          )),
        )}
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  label: string;
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Marca com `fade-r` as fórmulas que continuam além da borda direita (e ainda não foram roladas até o fim),
 * para o CSS desenhar um degradê indicando que há mais.
 */
export function useScrollFade(ref: RefObject<HTMLElement | null>) {
  const update = () => {
    ref.current?.querySelectorAll<HTMLElement>(".katex-display").forEach((d) => {
      d.classList.toggle("fade-r", d.scrollWidth - d.clientWidth - d.scrollLeft > 2);
    });
  };
  useLayoutEffect(update);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, true);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update, true);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Fórmula em destaque (com rolagem horizontal se for larga). */
export function Formula({ tex, className }: { tex: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollFade(ref);
  return (
    <div className={`formula ${className ?? ""}`} ref={ref}>
      <Tex block>{tex}</Tex>
    </div>
  );
}
