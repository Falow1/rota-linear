import { Fragment } from "react";
import type { Rich } from "../learn/types";
import { Tex } from "../ui/Tex";

const TOKEN = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$|\*\*[^*]+?\*\*)/g;

/** Texto com $TeX$ em linha, $$TeX$$ em destaque e **negrito**. */
export function RichText({ children, className }: { children: Rich; className?: string }) {
  const parts = children.split(TOKEN).filter((s) => s !== "");
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith("$$")) return <Tex key={i} block>{p.slice(2, -2)}</Tex>;
        if (p.startsWith("$")) return <Tex key={i}>{p.slice(1, -1)}</Tex>;
        if (p.startsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </span>
  );
}
