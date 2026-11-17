import { rank } from "./mat";
import { clean } from "./tolerance";
import { add, cross, dot, isZeroVec, norm, scale, sub, type Vec3 } from "./vec";

/** Plano n · X = d, ou seja ax + by + cz = d. */
export interface Plane {
  n: Vec3;
  d: number;
}

/** Reta X = p + t·v. */
export interface Line3 {
  p: Vec3;
  v: Vec3;
}

const c3 = (v: Vec3): Vec3 => [clean(v[0]), clean(v[1]), clean(v[2])];

export function planeFromPointNormal(P: Vec3, n: Vec3): Plane {
  return { n, d: clean(dot(n, P)) };
}

export function planeFrom3Points(A: Vec3, B: Vec3, C: Vec3): Plane | null {
  const n = cross(sub(B, A), sub(C, A));
  if (isZeroVec(n, 1e-10)) return null;
  return planeFromPointNormal(A, c3(n));
}

/** Ponto do plano mais próximo da origem. */
export function planePoint(pl: Plane): Vec3 {
  const nn = dot(pl.n, pl.n);
  return c3(scale(pl.n, pl.d / nn));
}

/** Dois vetores diretores (base) do plano. */
export function planeBasis(n: Vec3): [Vec3, Vec3] {
  const m = n.map(Math.abs);
  const e: Vec3 = m[0] <= m[1] && m[0] <= m[2] ? [1, 0, 0] : m[1] <= m[2] ? [0, 1, 0] : [0, 0, 1];
  const u = cross(n, e);
  const v = cross(n, u);
  return [c3(u), c3(v)];
}

/** Diretores "de livro": vetores simples perpendiculares a n. */
export function planeDirectors(n: Vec3): [Vec3, Vec3] {
  const [a, b, c] = n;
  const cands: Vec3[] = [[-b, a, 0], [-c, 0, a], [0, -c, b]].map((v) => c3(v as Vec3));
  const nz = cands.filter((v) => !isZeroVec(v));
  const u = nz[0];
  const w = nz.find((v) => !isZeroVec(cross(u, v), 1e-10)) ?? c3(cross(n, u));
  return [u, w];
}

export function pointOnLine(l: Line3, t: number): Vec3 {
  return add(l.p, scale(l.v, t));
}

export const distPointPlane = (P: Vec3, pl: Plane): number => Math.abs(dot(pl.n, P) - pl.d) / norm(pl.n);

export function footOnPlane(P: Vec3, pl: Plane): Vec3 {
  const t = (dot(pl.n, P) - pl.d) / dot(pl.n, pl.n);
  return c3(sub(P, scale(pl.n, t)));
}

export function footOnLine(P: Vec3, l: Line3): Vec3 {
  const t = dot(sub(P, l.p), l.v) / dot(l.v, l.v);
  return c3(pointOnLine(l, t));
}

export const distPointLine3 = (P: Vec3, l: Line3): number => norm(cross(sub(P, l.p), l.v)) / norm(l.v);

export type LineLinePos =
  | { kind: "coincidentes" }
  | { kind: "paralelas"; distance: number; A: Vec3; B: Vec3 }
  | { kind: "concorrentes"; point: Vec3; angle: number }
  | { kind: "reversas"; distance: number; A: Vec3; B: Vec3; angle: number; mixed: number };

function angleBetweenDirs(u: Vec3, v: Vec3): number {
  return Math.acos(Math.min(1, Math.abs(dot(u, v)) / (norm(u) * norm(v))));
}

export function relLineLine(r: Line3, s: Line3): LineLinePos {
  const w = sub(s.p, r.p);
  const vxw = cross(r.v, s.v);
  if (isZeroVec(vxw, 1e-10)) {
    if (isZeroVec(cross(w, r.v), 1e-10)) return { kind: "coincidentes" };
    const B = footOnLine(r.p, s);
    return { kind: "paralelas", distance: distPointLine3(r.p, s), A: r.p, B };
  }
  const mixed = clean(dot(w, vxw));
  // pontos mais próximos
  const a = dot(r.v, r.v), b = dot(r.v, s.v), c = dot(s.v, s.v), d = dot(r.v, w), e = dot(s.v, w);
  const den = a * c - b * b;
  const t = (d * c - b * e) / den;
  const u = (b * d - a * e) / den;
  const A = c3(pointOnLine(r, t));
  const B = c3(pointOnLine(s, u));
  const angle = angleBetweenDirs(r.v, s.v);
  if (Math.abs(mixed) < 1e-9 * Math.max(1, norm(w) * norm(vxw))) return { kind: "concorrentes", point: A, angle };
  return { kind: "reversas", distance: Math.abs(mixed) / norm(vxw), A, B, angle, mixed };
}

export type LinePlanePos =
  | { kind: "contida" }
  | { kind: "paralela"; distance: number }
  | { kind: "secante"; point: Vec3; angle: number; perpendicular: boolean };

export function relLinePlane(l: Line3, pl: Plane): LinePlanePos {
  const nv = dot(pl.n, l.v);
  if (Math.abs(nv) < 1e-10 * Math.max(1, norm(pl.n) * norm(l.v))) {
    const dist = distPointPlane(l.p, pl);
    return dist < 1e-9 ? { kind: "contida" } : { kind: "paralela", distance: dist };
  }
  const t = (pl.d - dot(pl.n, l.p)) / nv;
  const angle = Math.asin(Math.min(1, Math.abs(nv) / (norm(pl.n) * norm(l.v))));
  return { kind: "secante", point: c3(pointOnLine(l, t)), angle, perpendicular: isZeroVec(cross(pl.n, l.v), 1e-10) };
}

export type PlanePlanePos =
  | { kind: "coincidentes" }
  | { kind: "paralelos"; distance: number }
  | { kind: "secantes"; line: Line3; angle: number };

export function relPlanePlane(p1: Plane, p2: Plane): PlanePlanePos {
  const v = cross(p1.n, p2.n);
  if (isZeroVec(v, 1e-10)) {
    const k = norm(p2.n) / norm(p1.n) * (dot(p1.n, p2.n) > 0 ? 1 : -1);
    const dd = Math.abs(p2.d - k * p1.d) / norm(p2.n);
    return dd < 1e-9 ? { kind: "coincidentes" } : { kind: "paralelos", distance: dd };
  }
  // ponto na interseção: resolve com terceiro plano v · X = 0
  const M = [p1.n, p2.n, v];
  const rhs = [p1.d, p2.d, 0];
  const D = dot(M[0], cross(M[1], M[2]));
  const X: Vec3 = [0, 1, 2].map((j) => {
    const Mj = M.map((row, i) => row.map((x, k) => (k === j ? rhs[i] : x)) as Vec3);
    return dot(Mj[0], cross(Mj[1], Mj[2])) / D;
  }) as Vec3;
  const angle = Math.acos(Math.min(1, Math.abs(dot(p1.n, p2.n)) / (norm(p1.n) * norm(p2.n))));
  return { kind: "secantes", line: { p: c3(X), v: c3(v) }, angle };
}

export type ThreePlanesKind =
  | "ponto"
  | "reta-tres-distintos"
  | "reta-dois-coincidentes"
  | "prisma"
  | "dois-paralelos-secante"
  | "tres-coincidentes"
  | "tres-paralelos"
  | "dois-coincidentes-paralelo";

export const THREE_PLANES_TEXT: Record<ThreePlanesKind, string> = {
  ponto: "Os três planos se cortam em um único ponto: o sistema tem uma solução (SPD).",
  "reta-tres-distintos": "Os três planos são distintos e passam pela mesma reta: infinitas soluções (SPI).",
  "reta-dois-coincidentes": "Dois planos coincidem e o terceiro os corta numa reta: infinitas soluções (SPI).",
  prisma: "Os planos se cortam dois a dois em três retas paralelas (um prisma): não há solução (SI).",
  "dois-paralelos-secante": "Dois planos são paralelos e o terceiro corta ambos: não há solução (SI).",
  "tres-coincidentes": "Os três planos coincidem: infinitas soluções, um plano inteiro (SPI).",
  "tres-paralelos": "Os três planos são paralelos e distintos: não há solução (SI).",
  "dois-coincidentes-paralelo": "Dois planos coincidem e o terceiro é paralelo a eles: não há solução (SI).",
};

export function classifyThreePlanes(ps: [Plane, Plane, Plane]): ThreePlanesKind {
  const A = ps.map((p) => [...p.n]);
  const Aug = ps.map((p) => [...p.n, p.d]);
  const rA = rank(A), rAug = rank(Aug);
  const pairs: [number, number][] = [[0, 1], [0, 2], [1, 2]];
  const rel = pairs.map(([i, j]) => relPlanePlane(ps[i], ps[j]).kind);
  const nCoinc = rel.filter((k) => k === "coincidentes").length;
  const nPar = rel.filter((k) => k === "paralelos").length;
  if (rA === 3) return "ponto";
  if (rA === 2 && rAug === 2) return nCoinc > 0 ? "reta-dois-coincidentes" : "reta-tres-distintos";
  if (rA === 2 && rAug === 3) return nPar > 0 ? "dois-paralelos-secante" : "prisma";
  if (rA === 1 && rAug === 1) return "tres-coincidentes";
  return nCoinc > 0 ? "dois-coincidentes-paralelo" : "tres-paralelos";
}

/** Recorta reta 3D numa caixa [-R, R]³; retorna o segmento visível. */
export function clipLine3(l: Line3, R: number): [Vec3, Vec3] | null {
  let t0 = -Infinity, t1 = Infinity;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(l.v[i]) < 1e-12) {
      if (Math.abs(l.p[i]) > R) return null;
      continue;
    }
    let a = (-R - l.p[i]) / l.v[i], b = (R - l.p[i]) / l.v[i];
    if (a > b) [a, b] = [b, a];
    t0 = Math.max(t0, a);
    t1 = Math.min(t1, b);
  }
  if (t0 > t1) return null;
  return [pointOnLine(l, t0), pointOnLine(l, t1)];
}

/** Polígono do plano recortado pela caixa [-R, R]³ (vértices ordenados). */
export function clipPlane(pl: Plane, R: number): Vec3[] {
  const pts: Vec3[] = [];
  const { n, d } = pl;
  // Interseção do plano com as 12 arestas do cubo: arestas ao longo do eixo i têm as outras coordenadas em ±R.
  for (let i = 0; i < 3; i++) {
    if (Math.abs(n[i]) < 1e-12) continue;
    const j = (i + 1) % 3, k = (i + 2) % 3;
    for (const s1 of [-R, R])
      for (const s2 of [-R, R]) {
        const t = (d - n[j] * s1 - n[k] * s2) / n[i];
        if (t >= -R - 1e-9 && t <= R + 1e-9) {
          const p = [0, 0, 0] as Vec3;
          p[i] = t; p[j] = s1; p[k] = s2;
          pts.push(p);
        }
      }
  }
  if (pts.length < 3) return [];
  const c = scale(pts.reduce((s, p) => add(s, p), [0, 0, 0] as Vec3), 1 / pts.length);
  const [u, v] = planeBasis(n);
  const uniq: Vec3[] = [];
  for (const p of pts) if (!uniq.some((q) => norm(sub(p, q)) < 1e-7)) uniq.push(p);
  return uniq.sort((p, q) => {
    const a = sub(p, c), b = sub(q, c);
    return Math.atan2(dot(a, v), dot(a, u)) - Math.atan2(dot(b, v), dot(b, u));
  });
}
