import { html } from '../lib/html.js';
import { trilhas, livroPorSlug, conceitoPorSlug, NIVEIS, faixaNivel } from '../content/catalog.js';
import { capa, nomesAutores, barraProgresso, STATUS } from './parts.js';

export function progressoTrilha(trilha, estante = {}) {
  const lidos = trilha.etapas.filter((e) => estante[e.livro]?.status === 'lido').length;
  const iniciados = trilha.etapas.filter((e) => estante[e.livro]?.status === 'lendo').length;
  return { lidos, iniciados, total: trilha.etapas.length, pct: Math.round((lidos / trilha.etapas.length) * 100) };
}

export function trilhasIndice({ usuario, estante = {} }) {
  return html`
<section class="cabeca-pagina cabeca-pagina--trilhas" aria-labelledby="titulo-trilhas">
  <p class="cabeca-pagina__margem">Cada trilha começa com uma pergunta e propõe livros em sequência, com um objetivo e uma pergunta para discutir em cada etapa.</p>
  <h1 id="titulo-trilhas" class="titulo-pagina">Trilhas de leitura</h1>
</section>

<ol class="trilhas">
  ${trilhas.map((t, i) => {
    const p = progressoTrilha(t, estante);
    return html`<li class="trilha-faixa" data-cor="${t.cor}" data-lado="${i % 2 ? 'direita' : 'esquerda'}" data-reveal>
      <div class="trilha-faixa__texto">
        <h2 class="trilha-faixa__pergunta"><a href="/trilhas/${t.slug}">${t.pergunta}</a></h2>
        <p class="trilha-faixa__objetivo">${t.objetivo}</p>
        <p class="trilha-faixa__meta"><span>${t.etapas.length} etapas</span> <span>${faixaNivel(t)}</span>${usuario ? html` <span>${p.lidos} de ${p.total} lidos</span>` : ''}</p>
        ${usuario ? barraProgresso(p.pct, `Progresso na trilha ${t.titulo}`) : ''}
      </div>
      <ul class="trilha-faixa__capas" aria-label="Livros da trilha">
        ${t.etapas.map((e) => {
          const l = livroPorSlug.get(e.livro);
          return html`<li><div data-reveal>${capa(l, { classe: 'capa--mini' })}</div></li>`;
        })}
      </ul>
    </li>`;
  })}
</ol>`;
}

export function trilhaPagina({ trilha, usuario, estante = {} }) {
  const p = progressoTrilha(trilha, estante);
  const conceitosTrilha = [...new Set(trilha.etapas.flatMap((e) => livroPorSlug.get(e.livro).conceitos))].map((s) => conceitoPorSlug.get(s)).filter(Boolean);
  const outras = trilhas.filter((t) => t.slug !== trilha.slug);
  const proxima = trilha.etapas.find((e) => estante[e.livro]?.status !== 'lido');

  return html`
<header class="trilha-cabeca" data-cor="${trilha.cor}">
  <p class="trilha-cabeca__nome">${trilha.titulo} · ${faixaNivel(trilha)} · ${trilha.etapas.length} etapas</p>
  <h1 class="trilha-cabeca__pergunta">${trilha.pergunta}</h1>
  <p class="trilha-cabeca__objetivo">${trilha.objetivo}</p>
  <ul class="trilha-cabeca__capas trilha-faixa__capas" aria-hidden="true">
    ${trilha.etapas.map((e) => html`<li>${capa(livroPorSlug.get(e.livro), { classe: 'capa--mini', carregar: 'eager' })}</li>`)}
  </ul>
  ${usuario
    ? html`<div class="trilha-cabeca__progresso">
        <p>${p.lidos === p.total ? 'Trilha concluída. ' : ''}${p.lidos} de ${p.total} livros lidos${p.iniciados ? `, ${p.iniciados} em leitura` : ''}.</p>
        ${barraProgresso(p.pct, 'Progresso nesta trilha')}
        ${proxima && p.lidos < p.total ? html`<p><a class="link-claro" href="/livros/${proxima.livro}">Continuar por ${livroPorSlug.get(proxima.livro).titulo}</a></p>` : ''}
      </div>`
    : html`<p class="trilha-cabeca__convite"><a class="link-claro" href="/entrar?volta=/trilhas/${trilha.slug}">Entre</a> para acompanhar seu progresso nesta trilha.</p>`}
</header>

<section class="percurso" aria-labelledby="percurso-titulo">
  <h2 id="percurso-titulo" class="sr">Etapas da trilha</h2>
  <ol class="percurso__etapas">
    ${trilha.etapas.map((e, i) => {
      const l = livroPorSlug.get(e.livro);
      const st = estante[l.slug]?.status;
      return html`<li class="etapa${st === 'lido' ? ' etapa--lida' : ''}" data-reveal>
        <span class="etapa__numero" aria-hidden="true">${i + 1}</span>
        <a class="etapa__capa" href="/livros/${l.slug}" tabindex="-1" aria-hidden="true">${capa(l, { classe: 'capa--media' })}</a>
        <div class="etapa__texto">
          <h3 class="etapa__titulo"><span class="sr">Etapa ${i + 1}: </span><a href="/livros/${l.slug}">${l.titulo}</a></h3>
          <p class="etapa__autor">${nomesAutores(l)} · ${l.ano} · <span class="etapa__nivel" data-nivel="${l.nivel}">${NIVEIS[l.nivel]}</span></p>
          <p class="etapa__objetivo">${e.objetivo}</p>
          <p class="etapa__pergunta"><span class="ast" aria-hidden="true">*</span> <strong>Para discutir:</strong> ${e.pergunta}</p>
          ${st ? html`<p class="etapa__status">${STATUS[st]}${st === 'lendo' ? ` · ${estante[l.slug].progresso}%` : ''}</p>` : ''}
        </div>
      </li>`;
    })}
  </ol>
</section>

<section class="trilha-ligacoes" aria-labelledby="ligacoes-titulo">
  <div class="trilha-ligacoes__conceitos">
    <h2 id="ligacoes-titulo">Conceitos que atravessam a trilha</h2>
    <ul class="etiquetas">
      ${conceitosTrilha.map((c) => html`<li><a class="etiqueta" href="/conceitos/${c.slug}">${c.termo}</a></li>`)}
    </ul>
  </div>
  <div class="trilha-ligacoes__outras">
    <h2>Outras perguntas</h2>
    <ul class="lista-perguntas">
      ${outras.map((t) => html`<li data-cor="${t.cor}" data-reveal><a href="/trilhas/${t.slug}">${t.pergunta}</a></li>`)}
    </ul>
  </div>
</section>`;
}
