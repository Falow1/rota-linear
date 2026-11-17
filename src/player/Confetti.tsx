import { useMemo, type CSSProperties } from "react";

const COLORS = ["var(--t-vetores)", "var(--t-retas-planos)", "var(--t-conicas)", "var(--t-quadricas)", "var(--t-sistemas)", "var(--gold)", "var(--t-autovalores)"];

/** Confete em CSS (some com "reduzir movimento"). */
export function Confetti({ n = 36 }: { n?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        dur: 1.6 + Math.random() * 1.2,
        rot: Math.random() * 360,
        drift: (Math.random() - 0.5) * 140,
        color: COLORS[i % COLORS.length],
        round: Math.random() < 0.35,
      })),
    [n],
  );
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          className={b.round ? "round" : ""}
          style={
            {
              left: `${b.left}%`,
              background: b.color,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.dur}s`,
              "--rot": `${b.rot}deg`,
              "--drift": `${b.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
