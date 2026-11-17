/**
 * Marching squares: devolve segmentos [x1, y1, x2, y2, ...] da curva F(x, y) = 0
 * dentro da janela [x0, x1] × [y0, y1], numa grade nx × ny.
 */
export function marchingSquares(
  F: (x: number, y: number) => number,
  xr: [number, number],
  yr: [number, number],
  nx: number,
  ny: number,
): number[] {
  const dx = (xr[1] - xr[0]) / nx;
  const dy = (yr[1] - yr[0]) / ny;
  const vals = new Float64Array((nx + 1) * (ny + 1));
  for (let j = 0; j <= ny; j++)
    for (let i = 0; i <= nx; i++) {
      const v = F(xr[0] + i * dx, yr[0] + j * dy);
      vals[j * (nx + 1) + i] = Number.isFinite(v) ? v : NaN;
    }
  const out: number[] = [];
  const at = (i: number, j: number) => vals[j * (nx + 1) + i];
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const v0 = at(i, j), v1 = at(i + 1, j), v2 = at(i + 1, j + 1), v3 = at(i, j + 1);
      if (Number.isNaN(v0) || Number.isNaN(v1) || Number.isNaN(v2) || Number.isNaN(v3)) continue;
      const x0 = xr[0] + i * dx, y0 = yr[0] + j * dy, x1 = x0 + dx, y1 = y0 + dy;
      const s0 = v0 > 0, s1 = v1 > 0, s2 = v2 > 0, s3 = v3 > 0;
      if (s0 === s1 && s1 === s2 && s2 === s3) continue;
      const pts: (number[] | null)[] = [null, null, null, null];
      const interp = (a: number, b: number) => (a === b ? 0.5 : a / (a - b));
      if (s0 !== s1) { const t = interp(v0, v1); pts[0] = [x0 + t * dx, y0]; }
      if (s1 !== s2) { const t = interp(v1, v2); pts[1] = [x1, y0 + t * dy]; }
      if (s2 !== s3) { const t = interp(v3, v2); pts[2] = [x0 + t * dx, y1]; }
      if (s3 !== s0) { const t = interp(v0, v3); pts[3] = [x0, y0 + t * dy]; }
      const present = [0, 1, 2, 3].filter((k) => pts[k]);
      if (present.length === 2) {
        const [a, b] = present;
        // Evita "segmentos" falsos em polos (troca de sinal por descontinuidade)
        const big = Math.max(Math.abs(v0), Math.abs(v1), Math.abs(v2), Math.abs(v3));
        const small = Math.min(Math.abs(v0), Math.abs(v1), Math.abs(v2), Math.abs(v3));
        if (big > 1e6 && small > 1e3) continue;
        out.push(pts[a]![0], pts[a]![1], pts[b]![0], pts[b]![1]);
      } else if (present.length === 4) {
        const center = (v0 + v1 + v2 + v3) / 4 > 0;
        const pairs = center === s0 ? [[0, 1], [2, 3]] : [[3, 0], [1, 2]];
        for (const [a, b] of pairs) out.push(pts[a]![0], pts[a]![1], pts[b]![0], pts[b]![1]);
      }
    }
  return out;
}
