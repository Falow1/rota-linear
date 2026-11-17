import { isZero } from "./tolerance";

export type Vec = number[];
export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

export const add = <T extends Vec>(u: T, v: T): T => u.map((x, i) => x + v[i]) as T;
export const sub = <T extends Vec>(u: T, v: T): T => u.map((x, i) => x - v[i]) as T;
export const scale = <T extends Vec>(u: T, k: number): T => u.map((x) => x * k) as T;
export const dot = (u: Vec, v: Vec): number => u.reduce((s, x, i) => s + x * v[i], 0);
export const norm = (u: Vec): number => Math.sqrt(dot(u, u));
export const isZeroVec = (u: Vec, eps = 1e-9): boolean => u.every((x) => isZero(x, eps));
export const lerp = <T extends Vec>(u: T, v: T, t: number): T => u.map((x, i) => x + (v[i] - x) * t) as T;

export function normalize<T extends Vec>(u: T): T {
  const n = norm(u);
  return n === 0 ? u : scale(u, 1 / n);
}

export function cross(u: Vec3, v: Vec3): Vec3 {
  return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
}

/** Componente z do produto vetorial no plano. */
export const cross2 = (u: Vec2 | Vec, v: Vec2 | Vec): number => u[0] * v[1] - u[1] * v[0];

/** Produto misto [u, v, w] = u · (v × w). */
export const triple = (u: Vec3, v: Vec3, w: Vec3): number => dot(u, cross(v, w));

/** Ângulo em radianos entre u e v; null se algum for nulo. */
export function angle(u: Vec, v: Vec): number | null {
  const nu = norm(u);
  const nv = norm(v);
  if (isZero(nu) || isZero(nv)) return null;
  const c = Math.max(-1, Math.min(1, dot(u, v) / (nu * nv)));
  return Math.acos(c);
}

/** Projeção ortogonal de u sobre v; null se v = 0. */
export function proj<T extends Vec>(u: T, v: T): T | null {
  const vv = dot(v, v);
  if (isZero(vv)) return null;
  return scale(v, dot(u, v) / vv);
}

/** Componente de u ortogonal a v. */
export function reject<T extends Vec>(u: T, v: T): T | null {
  const p = proj(u, v);
  return p ? sub(u, p) : null;
}

export function isParallel(u: Vec, v: Vec, eps = 1e-9): boolean {
  if (u.length === 2) return Math.abs(cross2(u, v)) < eps * Math.max(1, norm(u) * norm(v));
  return norm(cross(u as Vec3, v as Vec3)) < eps * Math.max(1, norm(u) * norm(v));
}

export const deg = (rad: number): number => (rad * 180) / Math.PI;
export const rad = (d: number): number => (d * Math.PI) / 180;
