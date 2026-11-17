import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import "@fontsource-variable/nunito";
import "katex/dist/katex.min.css";
import "mafs/core.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/controls.css";
import "./styles/shell.css";
import "./styles/pages.css";
import "./styles/player.css";
import "./styles/graph.css";
import { App } from "./App";
import { initTheme } from "./theme";

initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
