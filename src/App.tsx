import { Suspense, lazy, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import { About } from "./pages/About";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Review } from "./pages/Review";
import { TrackPage } from "./pages/TrackPage";
import { Tracks } from "./pages/Tracks";
import { Loading } from "./ui/Feedback";
import { KeyBar } from "./ui/KeyBar";
import { Nav } from "./ui/Nav";
import { useViewportVars } from "./ui/viewport";

const LessonPage = lazy(() => import("./player/LessonPage"));
const PracticePage = lazy(() => import("./player/PracticePage"));
const FichaPage = lazy(() => import("./pages/FichaPage"));

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Telas de estudo (lição, prática, desafio, revisão) ocupam a tela toda, sem a navegação. */
const isFocus = (p: string) => p.startsWith("/licao/") || p.startsWith("/desafio/") || p === "/revisao/sessao";

export function App() {
  useViewportVars();
  const { pathname } = useLocation();
  const focus = isFocus(pathname);
  return (
    <>
      <ScrollTop />
      {!focus && (
        <a
          href="#conteudo"
          className="skip-link"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("conteudo")?.focus();
          }}
        >
          Pular para o conteúdo
        </a>
      )}
      {!focus && <Nav />}
      <main id="conteudo" tabIndex={-1} className={focus ? "focus-main" : "app-main"}>
        <Suspense fallback={<Loading />}>
          {/* key: trocar de lição (mesma rota, outro slug) recomeça a tela do zero. */}
          <Routes key={pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/rotas" element={<Tracks />} />
            <Route path="/rota/:trackId" element={<TrackPage />} />
            <Route path="/licao/:slug" element={<LessonPage />} />
            <Route path="/licao/:slug/pratica" element={<PracticePage mode="licao" />} />
            <Route path="/desafio/:trackId" element={<PracticePage mode="desafio" />} />
            <Route path="/revisao" element={<Review />} />
            <Route path="/revisao/sessao" element={<PracticePage mode="revisao" />} />
            <Route path="/ficha/:trackId" element={<FichaPage />} />
            <Route path="/sobre" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <KeyBar />
    </>
  );
}
