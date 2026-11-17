import type { ReactNode } from "react";
import type { TrackId } from "../learn/catalog";

/** Ícones de interface (traço de 2 px, herdam a cor do texto). */
const PATHS = {
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  reset: (
    <>
      <path d="M4 12a8 8 0 1 0 2.6-5.9" />
      <path d="M4 4v5h5" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.1 1.1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.1-1.1" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  grid: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 9.5h16M4 14.5h16M9.5 4v16M14.5 4v16" />
    </>
  ),
  drag: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="m10 4.5 2-1.5 2 1.5M10 19.5l2 1.5 2-1.5M4.5 10 3 12l1.5 2M19.5 10l1.5 2-1.5 2" />
    </>
  ),
  edit: (
    <>
      <rect x="3.5" y="7" width="17" height="10" rx="2" />
      <path d="M8 10.5v3M12 10v4M16 10.5h-1.5a1.5 1.5 0 0 0 0 3H16" />
    </>
  ),
  share: (
    <>
      <circle cx="17.5" cy="5.5" r="2.5" />
      <circle cx="6.5" cy="12" r="2.5" />
      <circle cx="17.5" cy="18.5" r="2.5" />
      <path d="m8.7 10.7 6.6-3.9M8.7 13.3l6.6 3.9" />
    </>
  ),
  flask: (
    <>
      <path d="M9.5 3h5M10 3v6.2L4.8 18.3A1.8 1.8 0 0 0 6.4 21h11.2a1.8 1.8 0 0 0 1.6-2.7L14 9.2V3" />
      <path d="M7.2 15h9.6" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  frame: <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" />,
  locate: (
    <>
      <circle cx="12" cy="12" r="6.5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
    </>
  ),
  orbit: (
    <>
      <ellipse cx="12" cy="12" rx="9.5" ry="4.2" transform="rotate(-24 12 12)" />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
      <circle cx="19.6" cy="7.6" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  cube: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </>
  ),
  home: (
    <>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5h4.5V15h3v4.5H18V10" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" />
    </>
  ),
  cards: (
    <>
      <rect x="3.5" y="7" width="13" height="13" rx="2.5" />
      <path d="M8 4h10.5A2.5 2.5 0 0 1 21 6.5V17" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.6v.2" />
    </>
  ),
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" />,
  flame: <path d="M12 21c-3.9 0-7-2.8-7-6.6 0-2.6 1.4-4.4 3-6 .2 1.6 1 2.8 2.2 3.3C10 8 11.3 5.3 14 3c.3 3 1.6 4.6 3 6.2 1.3 1.5 2 3 2 5.2 0 3.8-3.1 6.6-7 6.6z" />,
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20.5h7M9.5 17h5v3.5h-5z" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5M8 7.5h8" />
    </>
  ),
  play: <path d="M8 5.5v13l10.5-6.5z" />,
  bulb: (
    <>
      <path d="M9 17.5h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" />
    </>
  ),
  x: <path d="M7 7l10 10M17 7 7 17" />,
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" />
    </>
  ),
  sparkle: <path d="M12 3c.6 4.3 2.7 6.4 7 7-4.3.6-6.4 2.7-7 7-.6-4.3-2.7-6.4-7-7 4.3-.6 6.4-2.7 7-7zM19 16c.3 1.6 1 2.3 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.2 2.2-.9 2.5-2.5z" />,
  external: (
    <>
      <path d="M14 4h6v6M20 4l-8.5 8.5" />
      <path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
    </>
  ),
  printer: (
    <>
      <path d="M7 9V3.5h10V9M7 17H5a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 5 9h14a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 19 17h-2" />
      <path d="M7 14h10v6.5H7z" />
    </>
  ),
  trash: <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5" />,
  shuffle: <path d="M3.5 7h3.6a4 4 0 0 1 3.2 1.6l3.4 6.8a4 4 0 0 0 3.2 1.6h3.6M17.5 4.5 20.5 7l-3 2.5M3.5 17h3.6a4 4 0 0 0 3.2-1.6M13.7 8.6A4 4 0 0 1 16.9 7M17.5 14.5l3 2.5-3 2.5" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18, fill = false, stroke = 2 }: { name: IconName; size?: number; fill?: boolean; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="icon">
      {PATHS[name]}
    </svg>
  );
}

/**
 * Ícone de cada rota: formas cheias em dois tons (o tom claro é a mesma cor com transparência).
 * A cor vem de `currentColor` (normalmente a cor da rota ou branco sobre ela).
 */
const SOFT = { fill: "currentColor", fillOpacity: 0.28, stroke: "none" } as const;
const SOLID = { fill: "currentColor", stroke: "none" } as const;

const TRACK_ICONS: Record<TrackId, ReactNode> = {
  // dois vetores saindo de um ponto e o paralelogramo entre eles
  vetores: (
    <>
      <polygon points="8,32 26,27 33,9 15,14" {...SOFT} />
      <path d="M8 32 22.5 28" />
      <path d="M8 32 13.4 18" />
      <polygon points="27.5,26.6 20.6,31.1 19.3,24.8" {...SOLID} />
      <polygon points="15,13.6 16.5,21.5 10.4,19.3" {...SOLID} />
      <circle cx="8" cy="32" r="3.2" {...SOLID} />
    </>
  ),
  // plano inclinado atravessado por uma reta, com o vetor normal
  "retas-planos": (
    <>
      <polygon points="4,27 17,33 36,24 23,18" {...SOFT} />
      <path d="M3 13 37 31" strokeDasharray="0.1 5" />
      <path d="M20 25.5V9" />
      <polygon points="20,4 24,11 16,11" {...SOLID} />
      <circle cx="20" cy="25.5" r="3" {...SOLID} />
    </>
  ),
  // parábola com o foco e a diretriz
  conicas: (
    <>
      <path d="M6 7c2.5 16 8 22 14 22s11.5-6 14-22" />
      <path d="M6 35h28" strokeDasharray="0.1 5" />
      <circle cx="20" cy="20" r="3.2" {...SOLID} />
      <path d="M20 29v6" opacity="0.5" />
    </>
  ),
  // hiperboloide de uma folha (ampulheta)
  quadricas: (
    <>
      <ellipse cx="20" cy="8.5" rx="12" ry="4" {...SOFT} />
      <ellipse cx="20" cy="8.5" rx="12" ry="4" />
      <path d="M8 8.5c4 7 4 16 0 23M32 8.5c-4 7-4 16 0 23" />
      <path d="M8 31.5c2.5 2.6 21.5 2.6 24 0" />
      <ellipse cx="20" cy="20" rx="6.5" ry="2.2" opacity="0.45" />
    </>
  ),
  // três retas que se encontram num ponto: a solução
  sistemas: (
    <>
      <path d="M4 30 36 12M6 8l28 26M20 4v32" opacity="0.55" />
      <circle cx="20" cy="21" r="6.5" {...SOFT} />
      <circle cx="20" cy="21" r="3.2" {...SOLID} />
    </>
  ),
  // canto de um cubo com os três vetores da base
  espacos: (
    <>
      <polygon points="12,28 12,12 26,6 26,22" {...SOFT} />
      <path d="M12 28h17.5M12 28V11.5M12 28l-6 6" />
      <polygon points="34,28 28,31.5 28,24.5" {...SOLID} />
      <polygon points="12,7 15.5,13 8.5,13" {...SOLID} />
      <polygon points="3.5,36.5 5,29.6 10.4,35" {...SOLID} />
      <circle cx="12" cy="28" r="2.6" {...SOLID} />
    </>
  ),
  // quadrado girando, com o rastro da rotação
  transformacoes: (
    <>
      <rect x="9" y="9" width="16" height="16" rx="2.5" opacity="0.45" strokeDasharray="0.1 4.5" />
      <rect x="15" y="15" width="16" height="16" rx="2.5" transform="rotate(-24 23 23)" {...SOFT} />
      <rect x="15" y="15" width="16" height="16" rx="2.5" transform="rotate(-24 23 23)" />
      <path d="M8 31a13 13 0 0 1-3.2-12" />
      <polygon points="3.6,15.6 8,20.4 1.9,21.4" {...SOLID} />
    </>
  ),
  // elipse com os dois eixos principais (as direções dos autovetores)
  autovalores: (
    <>
      <ellipse cx="20" cy="20" rx="16" ry="8" transform="rotate(-35 20 20)" {...SOFT} />
      <path d="M20 20 31 12.3M20 20l-4.6-6.6" />
      <polygon points="35.5,9.1 30.6,15.9 27.8,11.9" {...SOLID} />
      <polygon points="13,10.2 18.6,13.2 14.3,16.2" {...SOLID} />
      <circle cx="20" cy="20" r="3" {...SOLID} />
    </>
  ),
};

export function TrackIcon({ id, size = 40 }: { id: TrackId; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="track-icon">
      {TRACK_ICONS[id]}
    </svg>
  );
}
