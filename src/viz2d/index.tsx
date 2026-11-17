import {
  Coordinates,
  Line,
  Mafs,
  MovablePoint,
  Plot,
  Point,
  Polygon,
  Vector,
  usePaneContext,
  useTransformContext,
  vec,
} from "mafs";
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { marchingSquares } from "../math/implicit2d";
import { snapValue, useSnap } from "../state/context";
import { Icon } from "../ui/icons";

export type P2 = [number, number];

export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = (w: number, h: number) => setSize((s) => (Math.abs(s.w - w) < 1 && Math.abs(s.h - h) < 1 ? s : { w, h }));
    // Mede já na montagem: o ResizeObserver só avisa no próximo quadro (e alguns navegadores atrasam isso).
    apply(el.clientWidth, el.clientHeight);
    const ro = new ResizeObserver(([e]) => apply(e.contentRect.width, e.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

/** Plano cartesiano com zoom, arraste do fundo e botão de enquadrar. */
export function Plane2D({
  children,
  x = [-5, 5],
  y = [-5, 5],
  onClick,
  overlay,
  label = "Gráfico interativo",
}: {
  children: ReactNode;
  x?: P2;
  y?: P2;
  onClick?: (p: P2) => void;
  overlay?: ReactNode;
  label?: string;
}) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const [key, setKey] = useState(0);
  return (
    <div ref={ref} style={{ position: "absolute", inset: 0 }} role="figure" aria-label={label}>
      {size.h > 0 && size.w > 0 && (
        <Mafs
          key={key}
          height={size.h}
          width={size.w}
          pan
          zoom={{ min: 0.2, max: 5 }}
          viewBox={{ x, y, padding: 0.5 }}
          preserveAspectRatio="contain"
          onClick={onClick ? (p) => onClick(p as P2) : undefined}
        >
          <Coordinates.Cartesian subdivisions={false} />
          {children}
        </Mafs>
      )}
      <div className="graph-overlay tr">
        <button type="button" className="btn small frame-btn" onClick={() => setKey((k) => k + 1)} title="Voltar ao enquadramento inicial" aria-label="Enquadrar">
          <Icon name="frame" size={18} />
          <span className="frame-label">Enquadrar</span>
        </button>
      </div>
      {overlay}
    </div>
  );
}

/** Rótulo com contorno da cor do fundo para ficar legível sobre linhas. */
const DIRS: Record<string, [number, number]> = {
  n: [0, -1], ne: [0.75, -0.75], e: [1, 0], se: [0.75, 0.75], s: [0, 1], sw: [-0.75, 0.75], w: [-1, 0], nw: [-0.75, -0.75],
};

export function Label({ at, text, color = "var(--text)", dir = "ne", size = 15, dist = 17 }: { at: P2; text: string; color?: string; dir?: "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw"; size?: number; dist?: number }) {
  const { viewTransform, userTransform } = useTransformContext();
  if (!Number.isFinite(at[0]) || !Number.isFinite(at[1])) return null;
  const [px, py] = vec.transform(at, vec.matrixMult(viewTransform, userTransform));
  const [dx, dy] = DIRS[dir];
  const anchor = dx > 0.1 ? "start" : dx < -0.1 ? "end" : "middle";
  const baseline = dy < -0.1 ? "auto" : dy > 0.1 ? "hanging" : "middle";
  return (
    <text
      x={px + dx * dist}
      y={py + dy * dist}
      textAnchor={anchor}
      dominantBaseline={baseline}
      fontSize={size}
      className="mafs-label"
      style={{ fill: color }}
    >
      {text}
    </text>
  );
}

/** Ponto arrastável com encaixe opcional na grade e rótulo. */
export function DraggablePoint({
  point,
  onMove,
  color = "var(--obj1)",
  label,
  dir = "ne",
  constrain,
  noSnap = false,
}: {
  point: P2;
  onMove: (p: P2) => void;
  color?: string;
  label?: string;
  dir?: "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";
  constrain?: (p: P2) => P2;
  noSnap?: boolean;
}) {
  const { snap, step } = useSnap();
  const c = (p: vec.Vector2): vec.Vector2 => {
    let q: P2 = [p[0], p[1]];
    if (snap && !noSnap) q = [snapValue(q[0], step), snapValue(q[1], step)];
    if (constrain) q = constrain(q);
    return q;
  };
  return (
    <>
      <MovablePoint point={point} onMove={(p) => onMove([p[0], p[1]])} color={color} constrain={c} />
      {label && <Label at={point} text={label} color={color} dir={dir} />}
    </>
  );
}

/** Vetor (seta) com rótulo opcional na ponta. */
export function Arrow({
  tail = [0, 0],
  tip,
  color = "var(--obj1)",
  label,
  dir,
  weight = 3,
  dashed = false,
  opacity = 1,
}: {
  tail?: P2;
  tip: P2;
  color?: string;
  label?: string;
  dir?: "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";
  weight?: number;
  dashed?: boolean;
  opacity?: number;
}) {
  const len = Math.hypot(tip[0] - tail[0], tip[1] - tail[1]);
  if (!Number.isFinite(len)) return null;
  const auto = (() => {
    const a = Math.atan2(tip[1] - tail[1], tip[0] - tail[0]);
    const dirs = ["e", "ne", "n", "nw", "w", "sw", "s", "se"] as const;
    return dirs[((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8];
  })();
  return (
    <>
      {len > 1e-9 && <Vector tail={tail} tip={tip} color={color} weight={weight} style={dashed ? "dashed" : "solid"} opacity={opacity} />}
      {label && <Label at={tip} text={label} color={color} dir={dir ?? auto} />}
    </>
  );
}

export const Segment = ({ a, b, color = "var(--obj-muted)", dashed = false, weight = 2, opacity = 1 }: { a: P2; b: P2; color?: string; dashed?: boolean; weight?: number; opacity?: number }) =>
  Number.isFinite(a[0] + a[1] + b[0] + b[1]) ? <Line.Segment point1={a} point2={b} color={color} style={dashed ? "dashed" : "solid"} weight={weight} opacity={opacity} /> : null;

/** Reta infinita por um ponto com direção v. */
export function InfLine({ p, v, color = "var(--obj1)", dashed = false, weight = 2.5, opacity = 1 }: { p: P2; v: P2; color?: string; dashed?: boolean; weight?: number; opacity?: number }) {
  if (Math.hypot(v[0], v[1]) < 1e-12 || !Number.isFinite(p[0] + p[1] + v[0] + v[1])) return null;
  return <Line.ThroughPoints point1={p} point2={[p[0] + v[0], p[1] + v[1]]} color={color} style={dashed ? "dashed" : "solid"} weight={weight} opacity={opacity} />;
}

/** Reta ax + by + c = 0. */
export function GeneralLine({ a, b, c, color, dashed, weight }: { a: number; b: number; c: number; color?: string; dashed?: boolean; weight?: number }) {
  const n2 = a * a + b * b;
  if (n2 < 1e-18) return null;
  const p: P2 = [(-c * a) / n2, (-c * b) / n2];
  return <InfLine p={p} v={[-b, a]} color={color} dashed={dashed} weight={weight} />;
}

export function Dot({ at, color = "var(--text)", label, dir = "ne", r = 5 }: { at: P2; color?: string; label?: string; dir?: "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw"; r?: number }) {
  if (!Number.isFinite(at[0]) || !Number.isFinite(at[1])) return null;
  return (
    <>
      <Point x={at[0]} y={at[1]} color={color} svgCircleProps={{ r }} />
      {label && <Label at={at} text={label} color={color} dir={dir} />}
    </>
  );
}

/** Arco de ângulo no vértice `at`, do vetor `from` ao vetor `to` (menor ângulo). */
export function AngleArc({ at = [0, 0], from, to, r = 0.7, color = "var(--obj5)" }: { at?: P2; from: P2; to: P2; r?: number; color?: string }) {
  if (Math.hypot(...from) < 1e-9 || Math.hypot(...to) < 1e-9) return null;
  const a0 = Math.atan2(from[1], from[0]);
  let d = Math.atan2(to[1], to[0]) - a0;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  if (Math.abs(d) < 1e-6) return null;
  return <Plot.Parametric xy={(t) => [at[0] + r * Math.cos(a0 + t * d), at[1] + r * Math.sin(a0 + t * d)]} domain={[0, 1]} color={color} weight={2.5} />;
}

/** Ponto na bissetriz entre as direções u e v, a distância r do vértice. */
export function bisector(u: P2, v: P2, r: number, at: P2 = [0, 0]): P2 {
  const nu = Math.hypot(...u) || 1, nv = Math.hypot(...v) || 1;
  let b: P2 = [u[0] / nu + v[0] / nv, u[1] / nu + v[1] / nv];
  if (Math.hypot(...b) < 1e-6) b = [-u[1], u[0]];
  const nb = Math.hypot(...b);
  return [at[0] + (b[0] / nb) * r, at[1] + (b[1] / nb) * r];
}

/** Marca de ângulo reto. */
export function RightAngle({ at, u, v, s = 0.3, color = "var(--obj-muted)" }: { at: P2; u: P2; v: P2; s?: number; color?: string }) {
  const nu = Math.hypot(...u), nv = Math.hypot(...v);
  if (nu < 1e-9 || nv < 1e-9) return null;
  const a: P2 = [at[0] + (u[0] / nu) * s, at[1] + (u[1] / nu) * s];
  const b: P2 = [a[0] + (v[0] / nv) * s, a[1] + (v[1] / nv) * s];
  const c: P2 = [at[0] + (v[0] / nv) * s, at[1] + (v[1] / nv) * s];
  return (
    <>
      <Segment a={a} b={b} color={color} weight={1.5} />
      <Segment a={b} b={c} color={color} weight={1.5} />
    </>
  );
}

export function Fill({ points, color = "var(--obj1)", opacity = 0.15, stroke = false }: { points: P2[]; color?: string; opacity?: number; stroke?: boolean }) {
  if (points.some((p) => !Number.isFinite(p[0] + p[1]))) return null;
  return <Polygon points={points} color={color} fillOpacity={opacity} strokeOpacity={stroke ? 0.8 : 0} weight={stroke ? 1.5 : 0} />;
}

/** Curva implícita F(x, y) = 0 desenhada por marching squares sobre a área visível. */
export function ImplicitCurve({ F, color = "var(--obj1)", weight = 3, res = 160, dashed = false }: { F: (x: number, y: number) => number; color?: string; weight?: number; res?: number; dashed?: boolean }) {
  const { xPaneRange, yPaneRange } = usePaneContext();
  const { viewTransform, userTransform } = useTransformContext();
  const m = vec.matrixMult(viewTransform, userTransform);
  const [x0, x1] = xPaneRange;
  const [y0, y1] = yPaneRange;
  const segs = useMemo(() => {
    const w = x1 - x0, h = y1 - y0;
    const nx = w >= h ? res : Math.max(20, Math.round((res * w) / h));
    const ny = h >= w ? res : Math.max(20, Math.round((res * h) / w));
    return marchingSquares(F, [x0, x1], [y0, y1], nx, ny);
  }, [F, x0, x1, y0, y1, res]);
  let d = "";
  for (let i = 0; i < segs.length; i += 4) {
    const [ax, ay] = vec.transform([segs[i], segs[i + 1]], m);
    const [bx, by] = vec.transform([segs[i + 2], segs[i + 3]], m);
    d += `M${ax.toFixed(1)} ${ay.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}`;
  }
  return <path d={d} style={{ stroke: color }} strokeWidth={weight} fill="none" strokeLinecap="round" strokeDasharray={dashed ? "6 6" : undefined} />;
}

/** Grade gerada por dois vetores b1, b2 (imagem da grade canônica por [b1 b2]). */
export function BasisGrid({ b1, b2, n = 8, color = "var(--obj4)", opacity = 0.35, origin = [0, 0] }: { b1: P2; b2: P2; n?: number; color?: string; opacity?: number; origin?: P2 }) {
  const lines: ReactNode[] = [];
  const at = (i: number, j: number): P2 => [origin[0] + i * b1[0] + j * b2[0], origin[1] + i * b1[1] + j * b2[1]];
  for (let i = -n; i <= n; i++) {
    lines.push(<Line.Segment key={`a${i}`} point1={at(i, -n)} point2={at(i, n)} color={color} opacity={i === 0 ? 0.9 : opacity} weight={i === 0 ? 2 : 1.2} />);
    lines.push(<Line.Segment key={`b${i}`} point1={at(-n, i)} point2={at(n, i)} color={color} opacity={i === 0 ? 0.9 : opacity} weight={i === 0 ? 2 : 1.2} />);
  }
  return <>{lines}</>;
}

/** Figura "F" de referência (para enxergar reflexões). */
export const F_SHAPE: P2[] = [
  [0, 0], [0.4, 0], [0.4, 1.0], [1.0, 1.0], [1.0, 1.35], [0.4, 1.35], [0.4, 1.65], [1.2, 1.65], [1.2, 2.0], [0, 2.0],
];

export const applyM = (M: number[][], p: P2): P2 => [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]];

export { Plot };
