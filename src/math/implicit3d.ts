/**
 * Superfície implícita F(x, y, z) = 0 por "marching tetrahedra" (variante do marching cubes
 * com tabelas pequenas). Retorna posições e normais (pelo gradiente) de triângulos soltos.
 */
const CORNERS = [
  [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
  [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1],
];
const TETS = [
  [0, 6, 1, 2], [0, 6, 2, 3], [0, 6, 3, 7],
  [0, 6, 7, 4], [0, 6, 4, 5], [0, 6, 5, 1],
];

export interface Mesh {
  positions: Float32Array;
  normals: Float32Array;
}

export function marchingTetra(F: (x: number, y: number, z: number) => number, R: number, res: number): Mesh {
  const n = res;
  const h = (2 * R) / n;
  const N1 = n + 1;
  const vals = new Float64Array(N1 * N1 * N1);
  for (let k = 0; k <= n; k++)
    for (let j = 0; j <= n; j++)
      for (let i = 0; i <= n; i++) {
        const v = F(-R + i * h, -R + j * h, -R + k * h);
        vals[(k * N1 + j) * N1 + i] = Number.isFinite(v) ? v : NaN;
      }
  const pos: number[] = [];
  const cp = new Float64Array(8 * 3);
  const cv = new Float64Array(8);
  const edge = (a: number, b: number) => {
    const va = cv[a], vb = cv[b];
    const t = va === vb ? 0.5 : va / (va - vb);
    pos.push(
      cp[a * 3] + t * (cp[b * 3] - cp[a * 3]),
      cp[a * 3 + 1] + t * (cp[b * 3 + 1] - cp[a * 3 + 1]),
      cp[a * 3 + 2] + t * (cp[b * 3 + 2] - cp[a * 3 + 2]),
    );
  };
  for (let k = 0; k < n; k++)
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        let anyNeg = false, anyPos = false, bad = false;
        for (let c = 0; c < 8; c++) {
          const [ox, oy, oz] = CORNERS[c];
          const v = vals[((k + oz) * N1 + (j + oy)) * N1 + (i + ox)];
          if (Number.isNaN(v)) bad = true;
          cv[c] = v;
          if (v < 0) anyNeg = true; else anyPos = true;
          cp[c * 3] = -R + (i + ox) * h;
          cp[c * 3 + 1] = -R + (j + oy) * h;
          cp[c * 3 + 2] = -R + (k + oz) * h;
        }
        if (bad || !anyNeg || !anyPos) continue;
        for (const t of TETS) {
          const inside = t.filter((c) => cv[c] < 0);
          const outside = t.filter((c) => cv[c] >= 0);
          if (inside.length === 0 || inside.length === 4) continue;
          if (inside.length === 1 || inside.length === 3) {
            const lone = inside.length === 1 ? inside[0] : outside[0];
            const others = inside.length === 1 ? outside : inside;
            for (const o of others) edge(lone, o);
          } else {
            const [a, b] = inside, [c, d] = outside;
            edge(a, c); edge(a, d); edge(b, d);
            edge(a, c); edge(b, d); edge(b, c);
          }
        }
      }
  const positions = new Float32Array(pos);
  const normals = new Float32Array(pos.length);
  const e = h * 0.25;
  for (let p = 0; p < pos.length; p += 3) {
    const x = pos[p], y = pos[p + 1], z = pos[p + 2];
    let gx = F(x + e, y, z) - F(x - e, y, z);
    let gy = F(x, y + e, z) - F(x, y - e, z);
    let gz = F(x, y, z + e) - F(x, y, z - e);
    const L = Math.hypot(gx, gy, gz) || 1;
    gx /= L; gy /= L; gz /= L;
    normals[p] = gx; normals[p + 1] = gy; normals[p + 2] = gz;
  }
  // Orienta cada triângulo de acordo com o gradiente, para a iluminação dos dois lados ficar coerente.
  for (let t = 0; t < positions.length; t += 9) {
    const ax = positions[t], ay = positions[t + 1], az = positions[t + 2];
    const ux = positions[t + 3] - ax, uy = positions[t + 4] - ay, uz = positions[t + 5] - az;
    const vx = positions[t + 6] - ax, vy = positions[t + 7] - ay, vz = positions[t + 8] - az;
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    const gx = normals[t] + normals[t + 3] + normals[t + 6];
    const gy = normals[t + 1] + normals[t + 4] + normals[t + 7];
    const gz = normals[t + 2] + normals[t + 5] + normals[t + 8];
    if (cx * gx + cy * gy + cz * gz < 0) {
      for (const arr of [positions, normals])
        for (let c = 0; c < 3; c++) {
          const tmp = arr[t + 3 + c];
          arr[t + 3 + c] = arr[t + 6 + c];
          arr[t + 6 + c] = tmp;
        }
    }
  }
  return { positions, normals };
}
