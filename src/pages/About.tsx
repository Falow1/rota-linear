import { useState } from "react";
import { CREDITS, creditDetails } from "../credits";
import { resetProgress } from "../learn/progress";
import { Icon } from "../ui/icons";

export function About() {
  const [confirm, setConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);
  return (
    <div className="page narrow">
      <h1>Sobre o Rota Linear</h1>
      <p className="muted lead">
        Um caminho de estudo para {CREDITS.disciplina}: lições curtas com gráficos que você mexe, perguntas de “preveja antes de ver” e exercícios
        novos a cada prática, corrigidos na hora.
      </p>

      <section className="card mt-16">
        <h2>Como funciona</h2>
        <ol className="about-steps">
          <li>
            <b>Faça a lição.</b> Cada cartão traz uma ideia só. Nos de tarefa, você arrasta o gráfico até cumprir a meta; nos de previsão, chuta antes
            de ver a resposta.
          </li>
          <li>
            <b>Pratique.</b> Seis exercícios com números sorteados. Errou? Vem uma dica. Errou de novo? Vem a solução passo a passo.
          </li>
          <li>
            <b>Domine.</b> Acertando 5 de 6 na prática, a lição ganha a estrela.
          </li>
          <li>
            <b>Revise.</b> A revisão misturada puxa exercícios das lições concluídas, com mais peso no que você errou.
          </li>
        </ol>
      </section>

      <section className="card mt-16">
        <h2>Quer mexer à vontade?</h2>
        <p className="muted">
          O <b>Equação Viva</b> é o laboratório irmão deste site: os mesmos 29 temas, com o gráfico e a equação ligados nos dois sentidos e sem roteiro.
          Toda lição tem um atalho para o módulo correspondente.
        </p>
        <a href="https://falow1.github.io/equacao-viva/" target="_blank" rel="noreferrer" className="btn soft mt-8">
          Abrir o Equação Viva <Icon name="external" size={16} />
        </a>
      </section>

      <section className="card mt-16">
        <h2>Seu progresso</h2>
        <p className="muted">Fica salvo só neste navegador, sem conta e sem enviar nada para lugar nenhum. Em outro aparelho, você começa do zero.</p>
        {cleared ? (
          <p className="ok-text">
            <Icon name="check" size={18} /> Progresso apagado.
          </p>
        ) : confirm ? (
          <div className="row wrap">
            <span className="small-text">Apagar lições, estrelas e revisão? Não dá para desfazer.</span>
            <button
              type="button"
              className="btn bad small"
              onClick={() => {
                resetProgress();
                setConfirm(false);
                setCleared(true);
              }}
            >
              Apagar tudo
            </button>
            <button type="button" className="btn ghost small" onClick={() => setConfirm(false)}>
              Cancelar
            </button>
          </div>
        ) : (
          <button type="button" className="btn small" onClick={() => setConfirm(true)}>
            <Icon name="trash" size={16} /> Apagar meu progresso
          </button>
        )}
      </section>

      <section className="card mt-16">
        <h2>Créditos</h2>
        <p>
          Trabalho de {CREDITS.disciplina}
          {CREDITS.instituicao && ` · ${CREDITS.instituicao}`}.
        </p>
        {creditDetails().map((d) => (
          <p key={d} className="muted">
            {d}
          </p>
        ))}
        <p className="faint small-text">Feito com React, Mafs (gráficos 2D), Three.js (3D) e KaTeX (fórmulas). Fonte Nunito.</p>
      </section>
    </div>
  );
}
