import { html } from '../lib/html.js';
import { autores, conceitos, livros, conceitoPorSlug, autorPorSlug } from '../content/catalog.js';
import { itemLivro } from './parts.js';

const normalizar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
// Ordena autores pelo sobrenome, como num índice remissivo.
const sobrenome = (nome) => {
  const partes = nome.split(' ');
  return partes[partes.length - 1];
};

function porLetra(lista, chave) {
  const grupos = new Map();
  for (const item of [...lista].sort((a, b) => normalizar(chave(a)).localeCompare(normalizar(chave(b)), 'pt-BR'))) {
    const letra = normalizar(chave(item))[0].toUpperCase();
    if (!grupos.has(letra)) grupos.set(letra, []);
    grupos.get(letra).push(item);
  }
  return [...grupos.entries()];
}

// Palavras muito longas não cabem no corpo display de celular.
const palavraLonga = (s) => s.split(' ').some((p) => p.length > 13);

function iniciais(nome) {
  const p = nome.split(' ').filter((x) => x.length > 2);
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export function autoresIndice() {
  const grupos = porLetra(autores, (a) => sobrenome(a.nome));
  return html`
<section class="cabeca-pagina cabeca-pagina--autores" aria-labelledby="titulo-autores">
  <p class="cabeca-pagina__margem">Ordenados pelo sobrenome, como no índice de um livro. Cada página traz biografia, contexto histórico, obras e conceitos.</p>
  <h1 id="titulo-autores" class="titulo-pagina">Autores</h1>
</section>
<nav class="letras" aria-label="Letras do índice">
  <ul>${grupos.map(([l]) => html`<li><a href="#letra-${l}">${l}</a></li>`)}</ul>
</nav>
<div class="indice-remissivo">
  ${grupos.map(([letra, lista]) => html`<section class="indice-remissivo__grupo" id="letra-${letra}" aria-labelledby="h-${letra}" data-reveal>
    <h2 id="h-${letra}" class="indice-remissivo__letra">${letra}</h2>
    <ul>
      ${lista.map((a) => {
        const obras = livros.filter((l) => l.autores.includes(a.slug));
        return html`<li><a href="/autores/${a.slug}"><span class="indice-remissivo__nome">${a.nome}</span><span class="indice-remissivo__anos">${a.anos}</span></a><span class="indice-remissivo__obras">${obras.map((o) => o.titulo).join(' · ')}</span></li>`;
      })}
    </ul>
  </section>`)}
</div>`;
}

export function autorPagina({ autor }) {
  const obras = livros.filter((l) => l.autores.includes(autor.slug));
  const conceitosAutor = autor.conceitos.map((s) => conceitoPorSlug.get(s)).filter(Boolean);
  const [primeiro, ...resto] = autor.bio;
  return html`
<article class="autor">
  <header class="autor__cabeca">
    <dl class="autor__fatos">
      <div><dt>Vida</dt><dd>${autor.anos}${autor.anosNota ? html`<span class="ficha__nota"> — ${autor.anosNota}</span>` : ''}</dd></div>
      <div><dt>Lugares</dt><dd>${autor.lugar}</dd></div>
      <div><dt>Na biblioteca</dt><dd>${obras.length === 1 ? '1 livro' : `${obras.length} livros`}</dd></div>
    </dl>
    <h1 class="autor__nome${palavraLonga(autor.nome) ? ' titulo-longo' : ''}">${autor.nome}</h1>
  </header>

  <div class="autor__corpo">
    <aside class="autor__margem" aria-label="Notas de margem">
      ${autor.retrato
        ? html`<figure class="foto autor__retrato" data-reveal>
            <img src="${autor.retrato.img}" width="${autor.retrato.w}" height="${autor.retrato.h}" alt="${autor.retrato.alt}" style="object-position:${autor.retrato.pos}" decoding="async">
            <figcaption>${autor.retrato.alt}. ${autor.retrato.credito || 'Domínio público, via Wikimedia Commons'}.</figcaption>
          </figure>`
        : ''}
      <section class="nota-margem" data-reveal>
        <h2>Contexto histórico</h2>
        <p>${autor.contexto}</p>
      </section>
      ${conceitosAutor.length
        ? html`<section class="nota-margem" data-reveal>
            <h2>Conceitos ligados</h2>
            <ul>${conceitosAutor.map((c) => html`<li><a href="/conceitos/${c.slug}">${c.termo}</a></li>`)}</ul>
          </section>`
        : ''}
    </aside>
    <div class="autor__texto">
      <p class="autor__abertura" data-reveal>
        ${autor.retrato ? '' : html`<span class="capitular capitular--tipo" aria-hidden="true">${iniciais(autor.nome)}</span>`}
        ${primeiro}
      </p>
      ${resto.map((p) => html`<p data-reveal>${p}</p>`)}
      ${conceitosAutor.length
        ? html`<h2 class="subtitulo">Para ler junto</h2>
          <dl class="verbetes-curtos">
            ${conceitosAutor.map((c) => html`<div data-reveal><dt><a href="/conceitos/${c.slug}">${c.termo}</a></dt><dd>${c.definicao}</dd></div>`)}
          </dl>`
        : ''}
    </div>
  </div>

  <section class="autor__obras" aria-labelledby="obras">
    <h2 id="obras">Na biblioteca</h2>
    <div class="autor__obras-lista">${obras.map((l) => itemLivro(l, { destaque: obras.length === 1, nivelTitulo: 'h3' }))}</div>
  </section>
</article>`;
}

export function conceitosIndice() {
  const grupos = porLetra(conceitos, (c) => c.termo);
  return html`
<section class="cabeca-pagina cabeca-pagina--conceitos" aria-labelledby="titulo-conceitos">
  <p class="cabeca-pagina__margem">Um glossário para ler sem travar: cada verbete diz de onde vem a palavra, o que ela quer dizer e em quais livros aparece.</p>
  <h1 id="titulo-conceitos" class="titulo-pagina">Conceitos</h1>
</section>
<div class="glossario">
  ${grupos.map(([letra, lista]) => html`<section class="glossario__grupo" aria-labelledby="g-${letra}" data-reveal>
    <h2 id="g-${letra}" class="glossario__letra">${letra}</h2>
    <dl>
      ${lista.map((c) => html`<div class="glossario__item">
        <dt><a href="/conceitos/${c.slug}">${c.termo}</a> <span class="glossario__classe">${c.classe}</span></dt>
        <dd>${c.definicao}</dd>
      </div>`)}
    </dl>
  </section>`)}
</div>`;
}

export function conceitoPagina({ conceito }) {
  const naBiblioteca = livros.filter((l) => l.conceitos.includes(conceito.slug));
  const autoresLigados = autores.filter((a) => a.conceitos.includes(conceito.slug));
  const ligacoes = conceito.ligacoes.map((s) => conceitoPorSlug.get(s)).filter(Boolean);
  return html`
<article class="verbete">
  <header class="verbete__cabeca">
    <p class="verbete__classe">${conceito.classe}</p>
    <h1 class="verbete__termo${palavraLonga(conceito.termo) ? ' titulo-longo' : ''}">${conceito.termo}</h1>
  </header>
  <div class="verbete__corpo">
    <aside class="verbete__margem" aria-label="Origem">
      <section class="nota-margem" data-reveal>
        <h2>Origem</h2>
        <p>${conceito.origem}</p>
      </section>
      ${autoresLigados.length
        ? html`<section class="nota-margem" data-reveal>
            <h2>Autores</h2>
            <ul>${autoresLigados.map((a) => html`<li><a href="/autores/${a.slug}">${a.nome}</a></li>`)}</ul>
          </section>`
        : ''}
    </aside>
    <div class="verbete__texto">
      <p class="verbete__definicao" data-reveal><mark class="marca-texto">${conceito.definicao}</mark></p>
      <h2 class="subtitulo">Em outras palavras</h2>
      ${conceito.explicacao.map((p) => html`<p data-reveal>${p}</p>`)}
      ${ligacoes.length
        ? html`<h2 class="subtitulo">Ligações</h2>
          <ul class="ligacoes">
            ${ligacoes.map((c) => html`<li data-reveal><a href="/conceitos/${c.slug}"><span>${c.termo}</span></a><span class="ligacoes__def">${c.definicao}</span></li>`)}
          </ul>`
        : ''}
    </div>
  </div>
  ${naBiblioteca.length
    ? html`<section class="verbete__livros" aria-labelledby="onde-aparece">
        <h2 id="onde-aparece">Onde aparece</h2>
        <div class="verbete__livros-lista">${naBiblioteca.map((l) => itemLivro(l, { nivelTitulo: 'h3' }))}</div>
      </section>`
    : ''}
</article>`;
}

export { autorPorSlug };
