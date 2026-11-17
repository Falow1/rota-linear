import { conicF } from "../math/conics";
import type { Fig2D } from "../learn/types";
import { Arrow, Dot, DraggablePoint, Fill, GeneralLine, ImplicitCurve, Plane2D, Segment, type P2 } from "../viz2d";
import { useMemo } from "react";

const col = (n: number) => (n === 0 ? "var(--obj-muted)" : `var(--obj${n})`);

function ConicItem({ k, color }: { k: { A: number; B: number; C: number; D: number; E: number; F: number }; color: string }) {
  const F = useMemo(() => conicF(k), [k.A, k.B, k.C, k.D, k.E, k.F]); // eslint-disable-line react-hooks/exhaustive-deps
  return <ImplicitCurve F={F} color={color} />;
}

/** Desenha a figura de um exercício (descrita como dados). Com `point`, mostra o ponto arrastável da resposta. */
export function ExerciseFigure({ fig, point, onPoint, locked }: { fig: Fig2D; point?: P2; onPoint?: (p: P2) => void; locked?: boolean }) {
  const [x0, x1, y0, y1] = fig.view;
  return (
    <Plane2D x={[x0, x1]} y={[y0, y1]} label="Figura do exercício">
      {fig.items.map((it, i) => {
        switch (it.t) {
          case "vec":
            return <Arrow key={i} tail={it.from} tip={it.to} color={col(it.color)} label={it.label} />;
          case "pt":
            return <Dot key={i} at={it.at} color={col(it.color)} label={it.label} />;
          case "line":
            return <GeneralLine key={i} a={it.a} b={it.b} c={it.c} color={col(it.color)} dashed={it.dashed} />;
          case "seg":
            return <Segment key={i} a={it.a} b={it.b} color={col(it.color)} dashed={it.dashed} weight={2.5} />;
          case "poly":
            return <Fill key={i} points={it.points} color={col(it.color)} opacity={0.18} stroke />;
          case "conic":
            return <ConicItem key={i} k={it.k} color={col(it.color)} />;
        }
      })}
      {point && onPoint && !locked && <DraggablePoint point={point} onMove={onPoint} color="var(--text-3)" label="?" />}
      {point && locked && <Dot at={point} color="var(--text-3)" label="?" />}
    </Plane2D>
  );
}
