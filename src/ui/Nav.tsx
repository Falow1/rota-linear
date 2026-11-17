import { useState } from "react";
import { Link, NavLink } from "react-router";
import { liveStreak, reviewCount, useProgress } from "../learn/progress";
import { currentTheme, saveTheme } from "../theme";
import { Icon, type IconName } from "./icons";

/** Logo: um caminho que sai de um ponto e termina numa seta. */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo">
      <rect width="32" height="32" rx="9" fill="var(--brand)" />
      <path d="M8 24c0-6 4-7 8-8s8-2 8-8" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="8" cy="24" r="3" fill="#fff" />
      <path d="M19.5 6.5 24.5 7l-.5 5" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ITEMS: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: "/", label: "Início", icon: "home", end: true },
  { to: "/trilhas", label: "Trilhas", icon: "route" },
  { to: "/revisao", label: "Revisão", icon: "cards" },
  { to: "/sobre", label: "Sobre", icon: "info" },
];

function ThemeButton() {
  const [dark, setDark] = useState(() => currentTheme() === "dark");
  return (
    <button
      type="button"
      className="btn ghost icon-only"
      aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}
      title={dark ? "Tema claro" : "Tema escuro"}
      onClick={() => {
        saveTheme(dark ? "light" : "dark");
        setDark(!dark);
      }}
    >
      <Icon name={dark ? "sun" : "moon"} size={20} />
    </button>
  );
}

export function Streak() {
  const p = useProgress();
  const days = liveStreak(p);
  return (
    <span className={`streak${days > 0 ? " on" : ""}`} title={`${days} ${days === 1 ? "dia seguido" : "dias seguidos"} de estudo`}>
      <Icon name="flame" size={20} fill={days > 0} />
      <span className="tabular">{days}</span>
      <span className="sr-only">{days === 1 ? "dia seguido" : "dias seguidos"} de estudo</span>
    </span>
  );
}

/**
 * Navegação: barra superior no computador; no celular, barra superior só com a marca
 * e as abas numa barra inferior (perto do polegar).
 */
export function Nav() {
  const p = useProgress();
  const due = reviewCount(p);
  const links = ITEMS.map((it) => (
    <NavLink key={it.to} to={it.to} end={it.end} className="nav-link">
      <span className="nav-ico">
        <Icon name={it.icon} size={22} />
        {it.to === "/revisao" && due > 0 && <span className="dot" aria-label={`${due} para revisar`} />}
      </span>
      <span>{it.label}</span>
    </NavLink>
  ));
  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Rota Linear, início">
          <Logo />
          <span className="brand-name">
            Rota <b>Linear</b>
          </span>
        </Link>
        <nav className="nav-top" aria-label="Principal">
          {links}
        </nav>
        <div className="row top-actions">
          <Streak />
          <ThemeButton />
        </div>
      </header>
      <nav className="nav-bottom" aria-label="Principal">
        {links}
      </nav>
    </>
  );
}
