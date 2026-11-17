import { Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { marchingTetra } from "../math/implicit3d";
import { clipLine3, clipPlane, type Line3, type Plane } from "../math/space";
import { Icon } from "../ui/icons";
import { useDismiss } from "../ui/useDismiss";

export type V3 = [number, number, number];

/* ---------- Cores a partir dos tokens CSS ---------- */

const TOKENS = ["obj1", "obj2", "obj3", "obj4", "obj5", "obj6", "obj-muted", "text", "text-2", "text-3", "grid", "grid-strong", "grid-dot", "axis", "surface"] as const;
type Token = (typeof TOKENS)[number];

function readColors(): Record<Token, string> {
  const cs = getComputedStyle(document.documentElement);
  const out = {} as Record<Token, string>;
  for (const t of TOKENS) out[t] = cs.getPropertyValue(`--${t}`).trim() || "#888888";
  return out;
}

export function useThemeColors() {
  const [c, setC] = useState(readColors);
  useEffect(() => {
    const upd = () => setC(readColors());
    window.addEventListener("themechange", upd);
    return () => window.removeEventListener("themechange", upd);
  }, []);
  return c;
}

/** Aceita nome de token ("obj1") ou cor CSS literal. */
export function useColor(name: string): string {
  const c = useThemeColors();
  return (c as Record<string, string>)[name] ?? name;
}

/* ---------- Cena ---------- */

type View = "inclinada" | "cima" | "frente" | "lado";
const VIEWS: Record<View, V3> = {
  inclinada: [9, -8, 6],
  cima: [0, -0.01, 15],
  frente: [0, -15, 0.01],
  lado: [15, 0, 0.01],
};

function ViewController({ view, nonce, R }: { view: View; nonce: number; R: number }) {
  const { camera, controls, size, invalidate } = useThree();
  /** Distância que enquadra uma esfera de raio ~1,4R no menor dos dois campos de visão. */
  const fitDist = (w: number, h: number) => {
    const vfov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * (w / Math.max(1, h)));
    return (R * 1.4) / Math.sin(Math.min(vfov, hfov) / 2);
  };
  const lastFit = useRef<number | null>(null);
  useEffect(() => {
    const dist = fitDist(size.width, size.height);
    lastFit.current = dist;
    const p = VIEWS[view];
    const n = Math.hypot(...p);
    camera.position.set((p[0] / n) * dist, (p[1] / n) * dist, (p[2] / n) * dist);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    const c = controls as unknown as OrbitControlsImpl | null;
    if (c) {
      c.target.set(0, 0, 0);
      c.update();
    }
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, nonce, camera, controls, R, size.width > 0]);
  // O gráfico mudou de tamanho (alça do celular, janela, girar o aparelho): mantém o ângulo e o zoom escolhidos
  // e só ajusta a distância na mesma proporção do novo enquadramento, para a cena não ficar cortada.
  useEffect(() => {
    if (size.width <= 0 || size.height <= 0) return;
    const d = fitDist(size.width, size.height);
    const prev = lastFit.current;
    lastFit.current = d;
    if (prev === null || Math.abs(d / prev - 1) < 0.01) return;
    const c = controls as unknown as OrbitControlsImpl | null;
    const target = c ? c.target : new THREE.Vector3();
    camera.position.sub(target).multiplyScalar(d / prev).add(target);
    c?.update();
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);
  return null;
}

const VIEW_LABEL: Record<View, string> = { inclinada: "Inclinada", cima: "De cima", frente: "De frente", lado: "De lado" };

/** Figura estreita: as vistas viram um chip só, que abre um menu para cima. */
function ViewMenu({ view, onPick }: { view: View; onPick: (v: View) => void }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDismiss(open, () => setOpen(false), box);
  return (
    <div className="compact" ref={box} style={{ position: "relative" }}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="orbit" size={16} />
        {VIEW_LABEL[view]}
        <Icon name="chevronDown" size={14} />
      </button>
      {open && (
        <div className="view-menu" role="menu" aria-label="Vista">
          {(Object.keys(VIEW_LABEL) as View[]).map((v) => (
            <button
              key={v}
              type="button"
              role="menuitemradio"
              aria-checked={view === v}
              onClick={() => {
                onPick(v);
                setOpen(false);
              }}
            >
              {VIEW_LABEL[v]}
              {view === v && <Icon name="check" size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Celular com pouca memória: menos pixels por quadro no 3D. */
const lowEndTouch = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(pointer: coarse)").matches &&
  ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;

export function Scene3D({ children, R = 4, overlay, label = "Cena 3D interativa", grid = true, axes = true }: { children: ReactNode; R?: number; overlay?: ReactNode; label?: string; grid?: boolean; axes?: boolean }) {
  const [view, setView] = useState<View>("inclinada");
  const [nonce, setNonce] = useState(0);
  const dpr = useMemo<[number, number]>(() => [1, lowEndTouch() ? 1.5 : 2], []);
  const dist = R * 3.3;
  const go = (v: View) => {
    setView(v);
    setNonce((n) => n + 1);
  };
  const init = VIEWS.inclinada;
  const n0 = Math.hypot(...init);
  return (
    <div className="scene3d" role="figure" aria-label={`${label}. Arraste para girar, use a roda para aproximar.`}>
      {/* frameloop "demand": só redesenha quando algo muda (girar, arrastar, mudar um valor), poupando bateria */}
      <Canvas
        camera={{ position: [(init[0] / n0) * dist, (init[1] / n0) * dist, (init[2] / n0) * dist], up: [0, 0, 1], fov: 38, near: 0.1, far: 200 }}
        dpr={dpr}
        frameloop="demand"
        style={{ touchAction: "none" }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, -6, 10]} intensity={1.4} />
        <directionalLight position={[-6, 5, -4]} intensity={0.5} />
        {grid && <GridXY R={R} />}
        {axes && <Axes3D R={R} />}
        {children}
        <OrbitControls makeDefault enableDamping dampingFactor={0.12} minDistance={3} maxDistance={60} />
        <ViewController view={view} nonce={nonce} R={R} />
      </Canvas>
      <div className="view-chips" role="group" aria-label="Ponto de vista">
        {(Object.keys(VIEW_LABEL) as View[]).map((v) => (
          <button key={v} type="button" className="full" aria-pressed={view === v} onClick={() => go(v)} title={v === "inclinada" ? "Volta à vista inicial" : undefined}>
            {v === "inclinada" && <Icon name="orbit" size={15} />}
            {VIEW_LABEL[v]}
          </button>
        ))}
        <ViewMenu view={view} onPick={go} />
      </div>
      {overlay}
    </div>
  );
}

/** Piso: placa translúcida no plano xy com um ponto em cada inteiro. */
function GridXY({ R }: { R: number }) {
  const dot = useColor("grid-dot");
  const floor = useColor("grid");
  const ref = useRef<THREE.InstancedMesh>(null);
  const n = (2 * R + 1) ** 2;
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    let k = 0;
    for (let i = -R; i <= R; i++)
      for (let j = -R; j <= R; j++) {
        o.position.set(i, j, 0.002);
        o.updateMatrix();
        m.setMatrixAt(k++, o.matrix);
      }
    m.instanceMatrix.needsUpdate = true;
  }, [R]);
  return (
    <>
      <mesh position={[0, 0, -0.004]}>
        <planeGeometry args={[2 * R + 0.6, 2 * R + 0.6]} />
        <meshBasicMaterial color={floor} transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, n]}>
        <circleGeometry args={[0.045, 12]} />
        <meshBasicMaterial color={dot} side={THREE.DoubleSide} />
      </instancedMesh>
    </>
  );
}

const AXES: { d: V3; name: string }[] = [
  { d: [1, 0, 0], name: "x" },
  { d: [0, 1, 0], name: "y" },
  { d: [0, 0, 1], name: "z" },
];

/** Eixos: semieixo positivo cheio, negativo apagado, bolinhas nos inteiros e o nome na ponta. */
function Axes3D({ R }: { R: number }) {
  const col = useColor("axis");
  const L = R + 0.6;
  const ticks = useMemo(() => {
    const out: V3[] = [];
    for (const { d } of AXES) for (let k = 1; k <= R; k++) out.push([d[0] * k, d[1] * k, d[2] * k]);
    return out;
  }, [R]);
  return (
    <>
      {AXES.map(({ d, name }) => (
        <group key={name}>
          <Line points={[[0, 0, 0], [d[0] * L, d[1] * L, d[2] * L]]} color={col} lineWidth={2} />
          <Line points={[[0, 0, 0], [-d[0] * L, -d[1] * L, -d[2] * L]]} color={col} lineWidth={1.25} transparent opacity={0.35} />
          <Label3D at={[d[0] * (L + 0.3), d[1] * (L + 0.3), d[2] * (L + 0.3)]} text={name} color="axis" className="axis-name" />
        </group>
      ))}
      {ticks.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshBasicMaterial color={col} />
        </mesh>
      ))}
    </>
  );
}

/* ---------- Primitivas ---------- */

export function Label3D({ at, text, color = "text", offset = [0, 0], className }: { at: V3; text: string; color?: string; size?: number; weight?: number; offset?: [number, number]; className?: string }) {
  // Rótulo em DOM puro, reposicionado a cada quadro (sem criar raízes React por rótulo).
  const c = useColor(color);
  const { gl, camera, size: vp, invalidate } = useThree();
  const el = useMemo(() => document.createElement("span"), []);
  const pos = useRef(at);
  pos.current = at;
  // Com frameloop "demand", mover só o rótulo também precisa pedir um quadro novo.
  useEffect(() => invalidate(), [at[0], at[1], at[2], invalidate]); // eslint-disable-line react-hooks/exhaustive-deps
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useLayoutEffect(() => {
    gl.domElement.parentElement?.appendChild(el);
    return () => el.remove();
  }, [gl, el]);
  useLayoutEffect(() => {
    el.className = className ? `label3d ${className}` : "label3d";
    el.textContent = text;
    Object.assign(el.style, { position: "absolute", left: "0", top: "0", color: c, pointerEvents: "none", willChange: "transform" });
  }, [el, text, c, className]);
  useFrame(() => {
    const p = pos.current;
    if (p.some((x) => !Number.isFinite(x))) {
      el.style.display = "none";
      return;
    }
    tmp.set(p[0], p[1], p[2]).project(camera);
    if (tmp.z > 1) {
      el.style.display = "none";
      return;
    }
    el.style.display = "";
    const x = (tmp.x * 0.5 + 0.5) * vp.width + offset[0];
    const y = (-tmp.y * 0.5 + 0.5) * vp.height + offset[1];
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
  });
  return null;
}

/**
 * Seta 3D sólida: tubo, ponta larga e uma esfera onde a seta começa. `width` é a espessura relativa (3 = padrão).
 * Com `dashed`, o tubo vira uma linha pontilhada.
 */
export function Arrow3D({ from = [0, 0, 0], to, color = "obj1", width = 3, head = 0.34, label, dashed = false, opacity = 1 }: { from?: V3; to: V3; color?: string; width?: number; head?: number; label?: string; dashed?: boolean; opacity?: number }) {
  const c = useColor(color);
  const d = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const len = d.length();
  if (!Number.isFinite(len)) return null;
  if (len < 1e-9) return label ? <Label3D at={to} text={label} color={color} /> : null;
  const dir = d.clone().normalize();
  const r = 0.018 * width;
  const h = Math.min(head, len * 0.45);
  const shaft = Math.max(0, len - h * 0.9);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const mid = new THREE.Vector3(...from).addScaledVector(dir, shaft / 2);
  const headC = new THREE.Vector3(...to).addScaledVector(dir, -h / 2);
  const base = new THREE.Vector3(...to).addScaledVector(dir, -h);
  const lab = new THREE.Vector3(...to).addScaledVector(dir, 0.4);
  const mat = <meshStandardMaterial color={c} roughness={0.4} metalness={0.05} transparent={opacity < 1} opacity={opacity} />;
  return (
    <>
      {dashed ? (
        <Line points={[from, [base.x, base.y, base.z]]} color={c} lineWidth={width} dashed dashSize={0.06} gapSize={0.12} transparent={opacity < 1} opacity={opacity} />
      ) : (
        <>
          <mesh position={mid} quaternion={q}>
            <cylinderGeometry args={[r, r, shaft, 14]} />
            {mat}
          </mesh>
          <mesh position={from}>
            <sphereGeometry args={[r * 1.9, 14, 10]} />
            {mat}
          </mesh>
        </>
      )}
      <mesh position={headC} quaternion={q}>
        <coneGeometry args={[Math.max(h * 0.4, r * 3), h, 20]} />
        {mat}
      </mesh>
      {label && <Label3D at={[lab.x, lab.y, lab.z]} text={label} color={color} />}
    </>
  );
}

export function Seg3D({ a, b, color = "obj-muted", width = 2, dashed = false, opacity = 1 }: { a: V3; b: V3; color?: string; width?: number; dashed?: boolean; opacity?: number }) {
  const c = useColor(color);
  if ([...a, ...b].some((x) => !Number.isFinite(x))) return null;
  return <Line points={[a, b]} color={c} lineWidth={width} dashed={dashed} dashSize={0.15} gapSize={0.1} transparent={opacity < 1} opacity={opacity} />;
}

export function Point3D({ at, color = "text", size = 0.09, label, labelOffset }: { at: V3; color?: string; size?: number; label?: string; labelOffset?: V3 }) {
  const c = useColor(color);
  if (at.some((x) => !Number.isFinite(x))) return null;
  const lo = labelOffset ?? [0.25, 0.25, 0.25];
  return (
    <>
      <mesh position={at}>
        <sphereGeometry args={[size, 20, 14]} />
        <meshStandardMaterial color={c} />
      </mesh>
      {label && <Label3D at={[at[0] + lo[0], at[1] + lo[1], at[2] + lo[2]]} text={label} color={color} />}
    </>
  );
}

/** Polígono plano (convexo) preenchido. */
export function Poly3D({ points, color = "obj1", opacity = 0.35, outline = true }: { points: V3[]; color?: string; opacity?: number; outline?: boolean }) {
  const c = useColor(color);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    if (points.length < 3) return g;
    const pos: number[] = [];
    for (let i = 1; i < points.length - 1; i++) pos.push(...points[0], ...points[i], ...points[i + 1]);
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return g;
  }, [points]);
  useEffect(() => () => geom.dispose(), [geom]);
  if (points.length < 3 || points.some((p) => p.some((x) => !Number.isFinite(x)))) return null;
  return (
    <>
      <mesh geometry={geom}>
        <meshStandardMaterial color={c} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {outline && <Line points={[...points, points[0]]} color={c} lineWidth={1.5} />}
    </>
  );
}

/** Plano n·X = d recortado no cubo [-R, R]³. */
export function PlaneMesh({ plane, color = "obj1", opacity = 0.3, R = 4 }: { plane: Plane; color?: string; opacity?: number; R?: number }) {
  const pts = useMemo(() => (Math.hypot(...plane.n) < 1e-12 ? [] : (clipPlane(plane, R) as V3[])), [plane.n[0], plane.n[1], plane.n[2], plane.d, R]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Poly3D points={pts} color={color} opacity={opacity} />;
}

/** Reta recortada no cubo [-R, R]³. */
export function Line3D({ line, color = "obj1", width = 3, R = 4, dashed = false }: { line: Line3; color?: string; width?: number; R?: number; dashed?: boolean }) {
  if (Math.hypot(...line.v) < 1e-12) return null;
  const seg = clipLine3(line, R + 0.5);
  if (!seg) return null;
  return <Seg3D a={seg[0] as V3} b={seg[1] as V3} color={color} width={width} dashed={dashed} />;
}

/** Conjunto de segmentos soltos [a0, b0, a1, b1, ...]; `onTop` desenha por cima das superfícies. */
export function Segments3D({ points, color = "obj3", width = 3, onTop = false }: { points: V3[]; color?: string; width?: number; onTop?: boolean }) {
  const c = useColor(color);
  if (points.length < 2) return null;
  return <Line points={points} segments color={c} lineWidth={width} depthTest={!onTop} renderOrder={onTop ? 10 : 0} />;
}

/** Superfície implícita F(x, y, z) = 0. */
export function ImplicitSurface({ F, R = 4, res = 40, color = "obj1", opacity = 0.85, deps }: { F: (x: number, y: number, z: number) => number; R?: number; res?: number; color?: string; opacity?: number; deps: unknown[] }) {
  const c = useColor(color);
  const geom = useMemo(() => {
    const m = marchingTetra(F, R, res);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(m.positions, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(m.normals, 3));
    return g;
  }, [...deps, R, res]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => geom.dispose(), [geom]);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color={c} side={THREE.DoubleSide} transparent={opacity < 1} opacity={opacity} roughness={0.55} metalness={0.05} depthWrite={opacity >= 1} />
    </mesh>
  );
}

/** Paralelepípedo gerado por u, v, w a partir da origem. */
export function Parallelepiped({ u, v, w, color = "obj4", opacity = 0.18 }: { u: V3; v: V3; w: V3; color?: string; opacity?: number }) {
  const add = (...vs: V3[]): V3 => vs.reduce((s, x) => [s[0] + x[0], s[1] + x[1], s[2] + x[2]], [0, 0, 0] as V3);
  const O: V3 = [0, 0, 0];
  const faces: V3[][] = [
    [O, u, add(u, v), v],
    [w, add(u, w), add(u, v, w), add(v, w)],
    [O, u, add(u, w), w],
    [v, add(u, v), add(u, v, w), add(v, w)],
    [O, v, add(v, w), w],
    [u, add(u, v), add(u, v, w), add(u, w)],
  ];
  return (
    <>
      {faces.map((f, i) => (
        <Poly3D key={i} points={f} color={color} opacity={opacity} />
      ))}
    </>
  );
}

export function useStableRef<T>(v: T) {
  const r = useRef(v);
  r.current = v;
  return r;
}
