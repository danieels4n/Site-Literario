import { html, raw } from '../lib/html.js';
import { autorPorSlug, NIVEIS, TEMAS, PERIODOS } from '../content/catalog.js';

export const STATUS = {
  'quero-ler': 'Quero ler',
  lendo: 'Lendo',
  lido: 'Lido',
};

export function nomesAutores(livro) {
  return livro.autores.map((s) => autorPorSlug.get(s)?.nome || s).join(' e ');
}

export function linksAutores(livro) {
  const partes = livro.autores.map((s) => {
    const a = autorPorSlug.get(s);
    return a ? html`<a href="/autores/${a.slug}">${a.nome}</a>` : s;
  });
  return partes.length === 2 ? html`${partes[0]} e ${partes[1]}` : partes;
}

// Morreu há mais de 70 anos (regra brasileira, Lei 9.610/98, art. 41): obra em domínio público.
export function dominioPublico(livro, ano = new Date().getFullYear()) {
  return livro.autores.every((s) => {
    const m = /–(\d{4})/.exec(autorPorSlug.get(s)?.anos || '');
    return m && Number(m[1]) + 70 < ano;
  });
}

// Formas desenhadas das capas tipográficas (viewBox 200×300).
const FORMAS = {
  faixa: '<rect x="0" y="176" width="200" height="44"/>',
  asterisco: '<g stroke-width="22" stroke="currentColor"><path d="M150 168v124M96 199l108 62M96 261l108-62"/></g>',
  carimbo: '<circle cx="148" cy="232" r="54"/>',
  janelas: '<g>' + [0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<rect x="${92 + c * 36}" y="${170 + r * 30}" width="24" height="18"/>`).join('')).join('') + '</g>',
  raiz: '<g stroke="currentColor" stroke-width="7" fill="none"><path d="M120 300V210l-18-24M120 236l26-30M150 300v-60l22-28M150 262l-20-16M178 300v-44l14-14"/></g>',
  grafico: '<path d="M0 300V262h40v-18h40v-26h40v-30h40v-36h40V300z"/>',
};

export function capa(livro, { classe = '', carregar = 'lazy' } = {}) {
  const c = livro.capa;
  if (c.img) {
    return html`<figure class="capa capa--foto ${classe}">
      <img src="${c.img}" width="${c.w}" height="${c.h}" alt="${c.alt}" loading="${carregar}" decoding="async">
    </figure>`;
  }
  return html`<div class="capa capa--tipo ${classe}" data-cor="${c.cor}" role="img" aria-label="Capa tipográfica criada pela Marginália para ${livro.titulo}, de ${nomesAutores(livro)}">
    <svg class="capa__forma" viewBox="0 0 200 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">${raw(FORMAS[c.forma] || FORMAS.faixa)}</svg>
    <span class="capa__miolo">
      <span class="capa__autor">${nomesAutores(livro)}</span>
      <span class="capa__titulo">${livro.titulo}</span>
      <span class="capa__selo">Marginália<span class="ast">*</span> ${livro.ano}</span>
    </span>
  </div>`;
}

export function foto(f, { classe = '', carregar = 'lazy', legenda = true, prioridade = false } = {}) {
  return html`<figure class="foto ${classe}">
    <img src="${f.img}" width="${f.w}" height="${f.h}" alt="${f.alt}" loading="${carregar}" decoding="async"${prioridade ? raw(' fetchpriority="high"') : ''}>
    ${legenda ? html`<figcaption>${f.legenda}</figcaption>` : ''}
  </figure>`;
}

export function etiquetas(livro) {
  return html`<ul class="etiquetas" aria-label="Temas">
    ${livro.temas.map((t) => html`<li><a class="etiqueta" href="/biblioteca?tema=${t}">${TEMAS[t]}</a></li>`)}
  </ul>`;
}

export function ficha(livro) {
  return html`<dl class="ficha">
    <div><dt>Ano</dt><dd>${livro.ano}${livro.anoNota ? html` <span class="ficha__nota">(${livro.anoNota})</span>` : ''}</dd></div>
    <div><dt>Gênero</dt><dd>${livro.genero}</dd></div>
    <div><dt>Nível</dt><dd><a href="/biblioteca?nivel=${livro.nivel}">${NIVEIS[livro.nivel]}</a></dd></div>
    <div><dt>Período</dt><dd><a href="/biblioteca?periodo=${livro.periodo}">${PERIODOS[livro.periodo]}</a></dd></div>
  </dl>`;
}

// Item de capa com legenda, usado na biblioteca, relacionados e estante.
export function itemLivro(livro, { estado, destaque = false, nivelTitulo = 'h3', carregar = 'lazy' } = {}) {
  const H = raw(nivelTitulo);
  return html`<article class="item${destaque ? ' item--destaque' : ''}" data-reveal>
    <a class="item__link" href="/livros/${livro.slug}">
      ${capa(livro, { carregar })}
      <${H} class="item__titulo">${livro.titulo}</${H}>
    </a>
    <p class="item__autor">${nomesAutores(livro)}</p>
    <p class="item__meta"><span>${livro.ano}</span> <span>${NIVEIS[livro.nivel]}</span></p>
    ${destaque ? html`<p class="item__linha">${livro.linha}</p>` : ''}
    ${estado?.asterisco ? html`<span class="item__ast" title="Marcado com asterisco"><span class="ast" aria-hidden="true">*</span><span class="sr">Marcado com asterisco</span></span>` : ''}
    ${estado?.status ? html`<p class="item__status">${STATUS[estado.status]}${estado.status === 'lendo' ? html` · ${estado.progresso}%` : ''}</p>` : ''}
  </article>`;
}

export function barraProgresso(valor, rotulo) {
  const v = Math.max(0, Math.min(100, Number(valor) || 0));
  return html`<div class="progresso" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}" aria-label="${rotulo}">
    <span class="progresso__barra" style="--v:${v}%"></span>
  </div>`;
}

export function avisoErros(erros) {
  const lista = Object.entries(erros || {});
  if (!lista.length) return '';
  return html`<div class="erros" role="alert" tabindex="-1" data-erros>
    <p><strong>Confira ${lista.length === 1 ? 'o campo' : 'os campos'} abaixo:</strong></p>
    <ul>${lista.map(([campo, msg]) => html`<li><a href="#campo-${campo}">${msg}</a></li>`)}</ul>
  </div>`;
}

export function campo({ nome, rotulo, tipo = 'text', valor = '', erro, dica, autocomplete, obrigatorio = true, extra = '' }) {
  const ids = [dica ? `dica-${nome}` : '', erro ? `erro-${nome}` : ''].filter(Boolean).join(' ');
  return html`<div class="campo${erro ? ' campo--erro' : ''}">
    <label for="campo-${nome}">${rotulo}</label>
    ${dica ? html`<p class="campo__dica" id="dica-${nome}">${dica}</p>` : ''}
    <input id="campo-${nome}" name="${nome}" type="${tipo}" value="${valor}"${autocomplete ? html` autocomplete="${autocomplete}"` : ''}${obrigatorio ? raw(' required') : ''}${ids ? html` aria-describedby="${ids}"` : ''}${erro ? raw(' aria-invalid="true"') : ''}${raw(extra)}>
    ${erro ? html`<p class="campo__erro" id="erro-${nome}">${erro}</p>` : ''}
  </div>`;
}
