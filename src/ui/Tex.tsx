import katex from "katex";
import { memo, useMemo } from "react";

const cache = new Map<string, string>();

export function renderTex(tex: string, display: boolean): string {
  const key = (display ? "D:" : "I:") + tex;
  const hit = cache.get(key);
  if (hit) return hit;
  const html = katex.renderToString(tex, {
    displayMode: display,
    throwOnError: false,
    strict: false,
    trust: (ctx) => ctx.command === "\\htmlClass",
  });
  // Em desenvolvimento, fórmula que o KaTeX não conseguiu ler vira erro no console.
  if (import.meta.env.DEV && html.includes("katex-error")) console.error("Erro de KaTeX:", tex);
  if (cache.size > 2000) cache.clear();
  cache.set(key, html);
  return html;
}

/** Fórmula LaTeX. `block` centraliza em linha própria. */
export const Tex = memo(function Tex({ children, block = false, className }: { children: string; block?: boolean; className?: string }) {
  const html = useMemo(() => renderTex(children, block), [children, block]);
  const Tag = block ? "div" : "span";
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
});
