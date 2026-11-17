import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router";
import { ProgressBar } from "../ui/Feedback";
import { Icon } from "../ui/icons";

/** Barra do topo das telas de estudo: sair, progresso e contador. */
export function PlayerTop({ exitTo, value, count, label }: { exitTo: string; value: number; count?: string; label: string }) {
  return (
    <header className="player-top">
      <Link to={exitTo} className="btn ghost icon-only" aria-label="Sair">
        <Icon name="x" size={24} stroke={2.6} />
      </Link>
      <div className="grow">
        <ProgressBar value={value} label={label} />
      </div>
      {count && <span className="player-count tabular">{count}</span>}
    </header>
  );
}

export type SheetKind = "ok" | "bad" | "info";

/** Folha de retorno que sobe por baixo, no lugar da barra de ação. */
export function Sheet({ kind, title, children, actions }: { kind: SheetKind; title: string; children?: ReactNode; actions: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Leva o foco ao botão principal da folha (Enter continua).
    ref.current?.querySelector<HTMLButtonElement>("button.primary-action")?.focus({ preventScroll: true });
  }, [title]);
  return (
    <div className={`sheet ${kind}`} ref={ref} role="status" aria-live="polite">
      <div className="sheet-inner">
        <div className="sheet-head">
          <span className="sheet-ico" aria-hidden="true">
            <Icon name={kind === "ok" ? "check" : kind === "bad" ? "x" : "sparkle"} size={26} stroke={3} />
          </span>
          <strong className="sheet-title">{title}</strong>
        </div>
        {children && <div className="sheet-body">{children}</div>}
        <div className="sheet-actions">{actions}</div>
      </div>
    </div>
  );
}

/**
 * Palco de um cartão: figura (opcional) e painel com a barra de ação embaixo.
 * Computador: figura à esquerda, painel à direita. Celular: figura em cima, painel embaixo e ação fixa no rodapé.
 * Enter fora de campos e botões aciona o botão principal (data-primary).
 */
export function Stage({
  figure,
  children,
  actions,
  sheet,
  figureLabel,
}: {
  figure?: ReactNode;
  children: ReactNode;
  actions: ReactNode;
  sheet?: ReactNode;
  figureLabel?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.defaultPrevented || e.isComposing) return;
      const t = e.target as HTMLElement | null;
      if (t && t.closest("input, textarea, select, button, a, [role=slider]")) return;
      const btn = root.current?.querySelector<HTMLButtonElement>(".sheet button.primary-action, .actionbar [data-primary]:not(:disabled)");
      if (btn) {
        e.preventDefault();
        btn.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // Cada cartão monta um Stage novo (key no pai): começa do topo.
  useEffect(() => {
    panel.current?.scrollTo?.({ top: 0 });
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className={`stage${figure ? "" : " no-fig"}${sheet ? " has-sheet" : ""}`} ref={root}>
      {figure && (
        <div className="stage-fig" aria-label={figureLabel}>
          {figure}
        </div>
      )}
      <div className="stage-panel">
        <div className="panel-scroll" ref={panel}>
          <div className="panel-inner">{children}</div>
        </div>
        {sheet ?? <div className="actionbar">{actions}</div>}
      </div>
    </div>
  );
}
