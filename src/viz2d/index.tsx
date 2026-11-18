import { Line, Mafs, MovablePoint, Plot, Polygon, usePaneContext, useTransformContext, vec } from "mafs";
import { useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { marchingSquares } from "../math/implicit2d";
import { snapValue, useSnap } from "../state/context";
import { Icon } from "../ui/icons";

/**
 * Figuras 2D do Rota Linear. O Mafs cuida de zoom, arraste e pontos móveis; o desenho (grade de pontos,
 * setas, etiquetas) é próprio, em coordenadas de tela.
 */

export type P2 = [number, number];
type Dir = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

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

/** Matriz que leva coordenadas do gráfico para pixels. */
function usePx() {
  const { viewTransform, userTransform } = useTransformContext();
  const m = vec.matrixMult(viewTransform, userTransform);
  return (p: P2): P2 => vec.transform(p, m) as P2;
}

const finite = (...xs: number[]) => xs.every(Number.isFinite);

/* ---------- Grade de pontos e eixos ---------- */

/** Passo "redondo" (1, 2, 5, 10…) que deixa ao menos `minPx` pixels entre marcas. */
function niceStep(unitPx: number, minPx: number) {
  const steps = [1, 2, 5, 10, 20, 50, 100];
  return steps.find((s) => s * unitPx >= minPx) ?? 100;
}

function DotGrid() {
  const id = useId().replace(/:/g, "");
  const { viewTransform } = useTransformContext();
  const { xPaneRange, yPaneRange } = usePaneContext();
  const [xMin, xMax] = xPaneRange;
  const [yMin, yMax] = yPaneRange;
  const [vxMin, vyMin] = vec.transform([xMin, yMin], viewTransform);
  const [vxMax, vyMax] = vec.transform([xMax, yMax], viewTransform);
  const unit = vec.transform([1, 0], viewTransform)[0];
  const dotStep = niceStep(unit, 16);
  const labStep = niceStep(unit, 30);
  const s = dotStep * unit;
  const ticks = (a: number, b: number) => {
    const out: number[] = [];
    for (let k = Math.ceil(a / labStep) * labStep; k <= b; k += labStep) if (Math.abs(k) > 1e-9) out.push(k);
    return out;
  };
  const ax = 9; // tamanho da pontinha dos eixos
  return (
    <g className="rl-grid" aria-hidden="true">
      <defs>
        <pattern id={`dots-${id}`} x={0} y={0} width={s} height={s} patternUnits="userSpaceOnUse">
          {[0, s].flatMap((x) => [0, s].map((y) => <circle key={`${x},${y}`} cx={x} cy={y} r={1.6} className="rl-grid-dot" />))}
        </pattern>
      </defs>
      <rect x={vxMin} y={vyMax} width={vxMax - vxMin} height={vyMin - vyMax} fill={`url(#dots-${id})`} />
      <line x1={vxMin} y1={0} x2={vxMax} y2={0} className="rl-axis" />
      <line x1={0} y1={vyMin} x2={0} y2={vyMax} className="rl-axis" />
      <path d={`M${vxMax - 14 - ax} ${-ax * 0.7}L${vxMax - 14} 0L${vxMax - 14 - ax} ${ax * 0.7}`} className="rl-axis-tip" />
      <path d={`M${-ax * 0.7} ${vyMax + 14 + ax}L0 ${vyMax + 14}L${ax * 0.7} ${vyMax + 14 + ax}`} className="rl-axis-tip" />
      <text x={vxMax - 16} y={-14} textAnchor="end" className="rl-axis-name">
        x
      </text>
      <text x={14} y={vyMax + 18} dominantBaseline="hanging" className="rl-axis-name">
        y
      </text>
      {ticks(xMin, xMax).map((k) => (
        <text key={`x${k}`} x={k * unit} y={-9} textAnchor="middle" className="rl-tick">
          {String(k).replace("-", "−")}
        </text>
      ))}
      {ticks(yMin, yMax).map((k) => (
        <text key={`y${k}`} x={-9} y={vec.transform([0, k], viewTransform)[1]} textAnchor="end" dominantBaseline="central" className="rl-tick">
          {String(k).replace("-", "−")}
        </text>
      ))}
    </g>
  );
}

/** Plano cartesiano com zoom, arraste do fundo e botão de recentrar. */
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
    <div ref={ref} className="plane2d" role="figure" aria-label={label}>
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
          <DotGrid />
          {children}
        </Mafs>
      )}
      <button type="button" className="recenter-btn" onClick={() => setKey((k) => k + 1)} title="Recentrar o gráfico" aria-label="Recentrar o gráfico">
        <Icon name="locate" size={20} />
      </button>
      {overlay}
    </div>
  );
}

/* ---------- Etiquetas ---------- */

const DIRS: Record<Dir, [number, number]> = {
  n: [0, -1], ne: [0.75, -0.75], e: [1, 0], se: [0.75, 0.75], s: [0, 1], sw: [-0.75, 0.75], w: [-1, 0], nw: [-0.75, -0.75],
};

/** Etiqueta (pílula colorida) presa a um ponto do gráfico. */
export function Label({ at, text, color = "var(--text)", dir = "ne", dist = 15 }: { at: P2; text: string; color?: string; dir?: Dir; size?: number; dist?: number }) {
  const px = usePx();
  if (!finite(at[0], at[1])) return null;
  const [x, y] = px(at);
  const [dx, dy] = DIRS[dir];
  const tx = dx > 0.1 ? "0%" : dx < -0.1 ? "-100%" : "-50%";
  const ty = dy < -0.1 ? "-100%" : dy > 0.1 ? "0%" : "-50%";
  const W = 320, H = 60;
  return (
    <foreignObject x={x + dx * dist - W / 2} y={y + dy * dist - H / 2} width={W} height={H} className="fig-chip-box">
      <span className="fig-chip" style={{ "--chip": color, left: W / 2, top: H / 2, transform: `translate(${tx}, ${ty})` } as CSSProperties}>
        {text}
      </span>
    </foreignObject>
  );
}

/* ---------- Pontos ---------- */

/** Ponto arrastável (alça com anel pontilhado) com encaixe opcional na grade e etiqueta. */
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
  dir?: Dir;
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
  // O Mafs não aceita aria-label no ponto: o nome (com a posição atual) entra pelo DOM.
  const wrap = useRef<SVGGElement>(null);
  const fmt = (x: number) => String(Math.round(x * 100) / 100).replace(".", ",").replace("-", "−");
  const aria = `Ponto ${label && label !== "?" ? label + " " : ""}arrastável em (${fmt(point[0])}; ${fmt(point[1])}). Use as setas do teclado para mover.`;
  useLayoutEffect(() => {
    wrap.current?.querySelector(".mafs-movable-point")?.setAttribute("aria-label", aria);
  }, [aria]);
  return (
    <>
      <g ref={wrap}>
        <MovablePoint point={point} onMove={(p) => onMove([p[0], p[1]])} color={color} constrain={c} />
      </g>
      {label && <Label at={point} text={label} color={color} dir={dir} dist={22} />}
    </>
  );
}

/** Ponto fixo: bolinha com aro da cor do fundo. */
export function Dot({ at, color = "var(--text)", label, dir = "ne", r = 5 }: { at: P2; color?: string; label?: string; dir?: Dir; r?: number }) {
  const px = usePx();
  if (!finite(at[0], at[1])) return null;
  const [x, y] = px(at);
  return (
    <>
      <circle cx={x} cy={y} r={r + 0.5} className="rl-dot" style={{ fill: color }} />
      {label && <Label at={at} text={label} color={color} dir={dir} />}
    </>
  );
}

/* ---------- Setas e linhas ---------- */

const autoDir = (tail: P2, tip: P2): Dir => {
  const a = Math.atan2(tip[1] - tail[1], tip[0] - tail[0]);
  const dirs = ["e", "ne", "n", "nw", "w", "sw", "s", "se"] as const;
  return dirs[((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8];
};

/**
 * Vetor: traço arredondado sobre um halo suave, ponta arredondada e um anel marcando onde a seta começa.
 * `dashed` desenha o traço pontilhado.
 */
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
  dir?: Dir;
  weight?: number;
  dashed?: boolean;
  opacity?: number;
}) {
  const px = usePx();
  if (!finite(tail[0], tail[1], tip[0], tip[1])) return null;
  const [ax, ay] = px(tail);
  const [bx, by] = px(tip);
  const len = Math.hypot(bx - ax, by - ay);
  const lab = label ? <Label at={tip} text={label} color={color} dir={dir ?? autoDir(tail, tip)} /> : null;
  if (len < 0.5) return lab;
  const ux = (bx - ax) / len, uy = (by - ay) / len;
  const hl = Math.min(9 + weight * 1.7, len * 0.6);
  const hw = hl * 0.62;
  const cx = bx - ux * hl, cy = by - uy * hl;
  const w = weight + 0.5;
  const head = `M${bx} ${by}L${cx - uy * hw} ${cy + ux * hw}L${cx + uy * hw} ${cy - ux * hw}Z`;
  const shaft = `M${ax} ${ay}L${cx + ux * 2} ${cy + uy * 2}`;
  return (
    <>
      <g className="rl-arrow" style={{ "--a": color, opacity } as CSSProperties}>
        {!dashed && <path d={shaft} className="rl-arrow-halo" strokeWidth={w + 8} />}
        <path d={shaft} className="rl-arrow-shaft" strokeWidth={w} strokeDasharray={dashed ? `0 ${w * 2.4}` : undefined} />
        <path d={head} className="rl-arrow-head" />
        {!dashed && len > hl * 1.6 && <circle cx={ax} cy={ay} r={w * 0.75 + 1.5} className="rl-arrow-tail" />}
      </g>
      {lab}
    </>
  );
}

/** Segmento entre dois pontos (`dashed` = pontilhado). */
export function Segment({ a, b, color = "var(--obj-muted)", dashed = false, weight = 2, opacity = 1 }: { a: P2; b: P2; color?: string; dashed?: boolean; weight?: number; opacity?: number }) {
  const px = usePx();
  if (!finite(a[0], a[1], b[0], b[1])) return null;
  const [ax, ay] = px(a);
  const [bx, by] = px(b);
  return (
    <path
      d={`M${ax} ${ay}L${bx} ${by}`}
      className="rl-line"
      style={{ stroke: color, opacity }}
      strokeWidth={weight}
      strokeDasharray={dashed ? `0 ${Math.max(5, weight * 2.6)}` : undefined}
    />
  );
}

/** Reta infinita por um ponto com direção v. */
export function InfLine({ p, v, color = "var(--obj1)", dashed = false, weight = 2.5, opacity = 1 }: { p: P2; v: P2; color?: string; dashed?: boolean; weight?: number; opacity?: number }) {
  if (Math.hypot(v[0], v[1]) < 1e-12 || !finite(p[0], p[1], v[0], v[1])) return null;
  return (
    <g className={dashed ? "rl-inf dotted" : "rl-inf"}>
      <Line.ThroughPoints point1={p} point2={[p[0] + v[0], p[1] + v[1]]} color={color} weight={weight} opacity={opacity} />
    </g>
  );
}

/** Reta ax + by + c = 0. */
export function GeneralLine({ a, b, c, color, dashed, weight }: { a: number; b: number; c: number; color?: string; dashed?: boolean; weight?: number }) {
  const n2 = a * a + b * b;
  if (n2 < 1e-18) return null;
  const p: P2 = [(-c * a) / n2, (-c * b) / n2];
  return <InfLine p={p} v={[-b, a]} color={color} dashed={dashed} weight={weight} />;
}

/* ---------- Ângulos e regiões ---------- */

/** Ângulo no vértice `at`, do vetor `from` ao vetor `to` (o menor): setor preenchido com borda no arco. */
export function AngleArc({ at = [0, 0], from, to, r = 0.7, color = "var(--obj5)" }: { at?: P2; from: P2; to: P2; r?: number; color?: string }) {
  const px = usePx();
  if (Math.hypot(...from) < 1e-9 || Math.hypot(...to) < 1e-9) return null;
  const a0 = Math.atan2(from[1], from[0]);
  let d = Math.atan2(to[1], to[0]) - a0;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  if (Math.abs(d) < 1e-6) return null;
  const pts: P2[] = [];
  for (let i = 0; i <= 28; i++) {
    const t = a0 + (d * i) / 28;
    pts.push(px([at[0] + r * Math.cos(t), at[1] + r * Math.sin(t)]));
  }
  const [vx, vy] = px(at);
  const arc = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
  return (
    <g className="rl-angle" style={{ "--a": color } as CSSProperties}>
      <path d={`M${vx} ${vy}${arc.replace(/^M/, "L")}Z`} className="rl-angle-fill" />
      <path d={arc} className="rl-angle-arc" />
    </g>
  );
}

/** Ponto na bissetriz entre as direções u e v, a distância r do vértice. */
export function bisector(u: P2, v: P2, r: number, at: P2 = [0, 0]): P2 {
  const nu = Math.hypot(...u) || 1, nv = Math.hypot(...v) || 1;
  let b: P2 = [u[0] / nu + v[0] / nv, u[1] / nu + v[1] / nv];
  if (Math.hypot(...b) < 1e-6) b = [-u[1], u[0]];
  const nb = Math.hypot(...b);
  return [at[0] + (b[0] / nb) * r, at[1] + (b[1] / nb) * r];
}

/** Marca de ângulo reto: um quadradinho preenchido. */
export function RightAngle({ at, u, v, s = 0.3, color = "var(--obj-muted)" }: { at: P2; u: P2; v: P2; s?: number; color?: string }) {
  const nu = Math.hypot(...u), nv = Math.hypot(...v);
  if (nu < 1e-9 || nv < 1e-9) return null;
  const a: P2 = [at[0] + (u[0] / nu) * s, at[1] + (u[1] / nu) * s];
  const b: P2 = [a[0] + (v[0] / nv) * s, a[1] + (v[1] / nv) * s];
  const c: P2 = [at[0] + (v[0] / nv) * s, at[1] + (v[1] / nv) * s];
  return <Polygon points={[at, a, b, c]} color={color} fillOpacity={0.3} strokeOpacity={0.9} weight={1.5} />;
}

export function Fill({ points, color = "var(--obj1)", opacity = 0.15, stroke = false }: { points: P2[]; color?: string; opacity?: number; stroke?: boolean }) {
  if (points.some((p) => !finite(p[0], p[1]))) return null;
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
  return <path d={d} style={{ stroke: color }} strokeWidth={weight} fill="none" strokeLinecap="round" strokeDasharray={dashed ? `0 ${weight * 2.6}` : undefined} />;
}

/** Curva paramétrica t ↦ (x, y): elipses, ramos de hipérbole e parábolas que mudam durante uma animação. */
export function ParamCurve({ xy, domain, color = "var(--obj1)", weight = 3, dashed = false, opacity = 1 }: { xy: (t: number) => P2; domain: P2; color?: string; weight?: number; dashed?: boolean; opacity?: number }) {
  return (
    <g className={dashed ? "rl-curve dotted" : "rl-curve"}>
      <Plot.Parametric xy={xy} domain={domain} color={color} weight={weight} opacity={opacity} />
    </g>
  );
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

/** Figura "L" com bandeirinha, de referência (para enxergar reflexões e rotações). */
export const F_SHAPE: P2[] = [
  [0, 0], [1.4, 0], [1.4, 0.4], [0.4, 0.4], [0.4, 1.3], [1.0, 1.55], [0.4, 1.8], [0.4, 2.1], [0, 2.1],
];

export const applyM = (M: number[][], p: P2): P2 => [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]];

export { Plot };
