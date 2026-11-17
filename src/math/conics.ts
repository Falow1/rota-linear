import { tex } from "./format";
import { clean } from "./tolerance";
import type { Vec2 } from "./vec";

const fr = (v: string, d: number): string => (Math.abs(d - 1) < 1e-12 ? v : `\\frac{${v}}{${tex(d)}}`);

/** Ax² + Bxy + Cy² + Dx + Ey + F = 0 */
export interface ConicCoeffs {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
}

export type ConicKind =
  | "elipse"
  | "circunferencia"
  | "hiperbole"
  | "parabola"
  | "ponto"
  | "vazio"
  | "retas-concorrentes"
  | "retas-paralelas"
  | "reta-dupla"
  | "reta"
  | "plano-todo";

export const CONIC_NAMES: Record<ConicKind, string> = {
  elipse: "Elipse",
  circunferencia: "Circunferência",
  hiperbole: "Hipérbole",
  parabola: "Parábola",
  ponto: "Um único ponto (elipse degenerada)",
  vazio: "Conjunto vazio: nenhum ponto real satisfaz a equação",
  "retas-concorrentes": "Par de retas concorrentes (hipérbole degenerada)",
  "retas-paralelas": "Par de retas paralelas (parábola degenerada)",
  "reta-dupla": "Uma reta contada duas vezes (parábola degenerada)",
  reta: "Reta: a equação é do 1º grau, não é uma cônica",
  "plano-todo": "Todos os pontos do plano (a equação é 0 = 0)",
};

export interface LineRep {
  p: Vec2;
  v: Vec2;
}

export interface ConicInfo {
  kind: ConicKind;
  name: string;
  /** B² − 4AC */
  disc: number;
  genus: "elíptico" | "hiperbólico" | "parabólico" | "linear";
  /** Ângulo de rotação dos eixos (rad). */
  theta: number;
  /** Coeficientes depois da rotação (sem termo xy). */
  rotated: { A: number; C: number; D: number; E: number; F: number };
  /** Origem do sistema x'y' (centro ou vértice) em coordenadas originais. */
  origin: Vec2;
  /** Equação canônica em LaTeX, nas coordenadas x', y'. */
  canonical: string;
  a?: number;
  b?: number;
  c?: number;
  e?: number;
  p?: number;
  foci: Vec2[];
  vertices: Vec2[];
  asymptotes: LineRep[];
  directrix?: LineRep;
  /** Eixo principal (focal) como reta. */
  axis?: LineRep;
  /** Retas da cônica degenerada. */
  lines: LineRep[];
}

export function classifyConic(k: ConicCoeffs): ConicInfo {
  const { A, B, C, D, E, F } = k;
  const sq = Math.max(Math.abs(A), Math.abs(B), Math.abs(C));
  const sAll = Math.max(sq, Math.abs(D), Math.abs(E), Math.abs(F), 1e-300);
  const eps = 1e-9;
  const theta = Math.abs(B) < eps * sAll ? 0 : 0.5 * Math.atan2(B, A - C);
  const cs = Math.cos(theta), sn = Math.sin(theta);
  const A1 = A * cs * cs + B * cs * sn + C * sn * sn;
  const C1 = A * sn * sn - B * cs * sn + C * cs * cs;
  const D1 = D * cs + E * sn;
  const E1 = -D * sn + E * cs;
  const F1 = F;
  const toOrig = (x: number, y: number): Vec2 => [clean(x * cs - y * sn, 1e-9), clean(x * sn + y * cs, 1e-9)];
  const dirOrig = (x: number, y: number): Vec2 => toOrig(x, y);
  const disc = clean(B * B - 4 * A * C, 1e-9);
  const genus: ConicInfo["genus"] = sq < eps * sAll ? "linear" : disc < 0 ? "elíptico" : disc > 0 ? "hiperbólico" : "parabólico";
  const base = {
    disc,
    genus,
    theta,
    rotated: { A: clean(A1, 1e-9), C: clean(C1, 1e-9), D: clean(D1, 1e-9), E: clean(E1, 1e-9), F: F1 },
    foci: [] as Vec2[],
    vertices: [] as Vec2[],
    asymptotes: [] as LineRep[],
    lines: [] as LineRep[],
  };
  const make = (kind: ConicKind, rest: Partial<ConicInfo> & { origin: Vec2; canonical: string }): ConicInfo => ({
    ...base,
    kind,
    name: CONIC_NAMES[kind],
    ...rest,
  });

  const zA = Math.abs(A1) < eps * Math.max(sq, 1e-300) || sq === 0;
  const zC = Math.abs(C1) < eps * Math.max(sq, 1e-300) || sq === 0;

  // Sem termos quadráticos
  if (zA && zC) {
    if (Math.abs(D) < eps * sAll && Math.abs(E) < eps * sAll) {
      return make(Math.abs(F) < eps * sAll ? "plano-todo" : "vazio", { origin: [0, 0], canonical: `0 = ${tex(-F)}` });
    }
    const n2 = D * D + E * E;
    const p: Vec2 = [(-F * D) / n2, (-F * E) / n2];
    return make("reta", { origin: p, canonical: "", lines: [{ p, v: [-E, D] }] });
  }

  // Centro definido
  if (!zA && !zC) {
    const h = -D1 / (2 * A1), kk = -E1 / (2 * C1);
    const K = A1 * h * h + C1 * kk * kk - F1;
    const center = toOrig(h, kk);
    const kScale = Math.max(1, Math.abs(F1), Math.abs(A1 * h * h), Math.abs(C1 * kk * kk));
    const Kz = Math.abs(K) < 1e-9 * kScale;
    if (A1 * C1 > 0) {
      if (Kz) return make("ponto", { origin: center, canonical: `${tex(A1)}x'^2 ${C1 < 0 ? "-" : "+"} ${tex(Math.abs(C1))}y'^2 = 0`, vertices: [center] });
      const p = K / A1, q = K / C1;
      if (p < 0) return make("vazio", { origin: center, canonical: `${fr("x'^2", p)} + ${fr("y'^2", q)} = 1` });
      if (Math.abs(p - q) < 1e-9 * Math.max(p, q)) {
        const r = Math.sqrt(p);
        return make("circunferencia", { origin: center, canonical: `x'^2 + y'^2 = ${tex(p)}`, a: r, b: r, c: 0, e: 0, foci: [center] });
      }
      const alongX = p > q;
      const a = Math.sqrt(Math.max(p, q)), b = Math.sqrt(Math.min(p, q));
      const c = Math.sqrt(a * a - b * b);
      const u = alongX ? dirOrig(1, 0) : dirOrig(0, 1);
      const w = alongX ? dirOrig(0, 1) : dirOrig(1, 0);
      const at = (s: number, dir: Vec2): Vec2 => [clean(center[0] + s * dir[0], 1e-9), clean(center[1] + s * dir[1], 1e-9)];
      return make("elipse", {
        origin: center,
        canonical: `${fr("x'^2", p)} + ${fr("y'^2", q)} = 1`,
        a, b, c, e: c / a,
        foci: [at(c, u), at(-c, u)],
        vertices: [at(a, u), at(-a, u), at(b, w), at(-b, w)],
        axis: { p: center, v: u },
      });
    }
    // A1 * C1 < 0
    if (Kz) {
      const m = Math.sqrt(-A1 / C1);
      const lines = [{ p: center, v: dirOrig(1, m) }, { p: center, v: dirOrig(1, -m) }];
      return make("retas-concorrentes", { origin: center, canonical: `y' = \\pm ${tex(m)}\\,x'`, lines, vertices: [center] });
    }
    const p = K / A1, q = K / C1;
    const alongX = p > 0;
    const a2 = alongX ? p : q, b2 = alongX ? -q : -p;
    const a = Math.sqrt(a2), b = Math.sqrt(b2), c = Math.sqrt(a2 + b2);
    const u = alongX ? dirOrig(1, 0) : dirOrig(0, 1);
    const at = (s: number): Vec2 => [clean(center[0] + s * u[0], 1e-9), clean(center[1] + s * u[1], 1e-9)];
    const asym = alongX
      ? [dirOrig(a, b), dirOrig(a, -b)]
      : [dirOrig(b, a), dirOrig(-b, a)];
    return make("hiperbole", {
      origin: center,
      canonical: alongX
        ? `${fr("x'^2", a2)} - ${fr("y'^2", b2)} = 1`
        : `${fr("y'^2", a2)} - ${fr("x'^2", b2)} = 1`,
      a, b, c, e: c / a,
      foci: [at(c), at(-c)],
      vertices: [at(a), at(-a)],
      asymptotes: asym.map((v) => ({ p: center, v })),
      axis: { p: center, v: u },
    });
  }

  // Parabólico: exatamente um coeficiente quadrático nulo após a rotação
  if (zC) {
    // A1 x'² + D1 x' + E1 y' + F1 = 0
    const h = -D1 / (2 * A1);
    const G = F1 - A1 * h * h;
    if (Math.abs(E1) < eps * sAll) {
      const K = -G / A1;
      const vert = dirOrig(0, 1);
      if (Math.abs(K) < 1e-9 * Math.max(1, Math.abs(G))) {
        const p0 = toOrig(h, 0);
        return make("reta-dupla", { origin: p0, canonical: `x'^2 = 0`, lines: [{ p: p0, v: vert }] });
      }
      if (K < 0) return make("vazio", { origin: toOrig(h, 0), canonical: `x'^2 = ${tex(K)}` });
      const r = Math.sqrt(K);
      return make("retas-paralelas", {
        origin: toOrig(h, 0),
        canonical: `x'^2 = ${tex(K)}`,
        lines: [{ p: toOrig(h + r, 0), v: vert }, { p: toOrig(h - r, 0), v: vert }],
      });
    }
    const kk = -G / E1;
    const fourP = -E1 / A1;
    const p = fourP / 4;
    const vertex = toOrig(h, kk);
    return make("parabola", {
      origin: vertex,
      canonical: `x'^2 = ${tex(fourP)}\\,y'`,
      p, e: 1,
      foci: [toOrig(h, kk + p)],
      vertices: [vertex],
      directrix: { p: toOrig(h, kk - p), v: dirOrig(1, 0) },
      axis: { p: vertex, v: dirOrig(0, 1) },
    });
  }
  // zA: C1 y'² + D1 x' + E1 y' + F1 = 0
  const kk = -E1 / (2 * C1);
  const G = F1 - C1 * kk * kk;
  if (Math.abs(D1) < eps * sAll) {
    const K = -G / C1;
    const horiz = dirOrig(1, 0);
    if (Math.abs(K) < 1e-9 * Math.max(1, Math.abs(G))) {
      const p0 = toOrig(0, kk);
      return make("reta-dupla", { origin: p0, canonical: `y'^2 = 0`, lines: [{ p: p0, v: horiz }] });
    }
    if (K < 0) return make("vazio", { origin: toOrig(0, kk), canonical: `y'^2 = ${tex(K)}` });
    const r = Math.sqrt(K);
    return make("retas-paralelas", {
      origin: toOrig(0, kk),
      canonical: `y'^2 = ${tex(K)}`,
      lines: [{ p: toOrig(0, kk + r), v: horiz }, { p: toOrig(0, kk - r), v: horiz }],
    });
  }
  const h = -G / D1;
  const fourP = -D1 / C1;
  const p = fourP / 4;
  const vertex = toOrig(h, kk);
  return make("parabola", {
    origin: vertex,
    canonical: `y'^2 = ${tex(fourP)}\\,x'`,
    p, e: 1,
    foci: [toOrig(h + p, kk)],
    vertices: [vertex],
    directrix: { p: toOrig(h - p, kk), v: dirOrig(0, 1) },
    axis: { p: vertex, v: dirOrig(1, 0) },
  });
}

/** F(x, y) da cônica, para o plotador implícito. */
export const conicF = (k: ConicCoeffs) => (x: number, y: number): number =>
  k.A * x * x + k.B * x * y + k.C * y * y + k.D * x + k.E * y + k.F;
