import { html, raw } from '../lib/html.js';
import { EIXOS } from '../content/personalidades.js';
import { referenciasPublicas, dataLegivel } from '../lib/personalidades.js';
import { capa, nomesAutores } from './parts.js';
import { acessoCompacto } from './acesso.js';

const iniciais = (nome) => nome.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();

export function retrato(p, { classe = '', carregar = 'lazy', credito = false } = {}) {
  if (!p.retrato) {
    return html`<figure class="retrato retrato--tipo ${classe}">
      <span class="retrato__iniciais" aria-hidden="true">${iniciais(p.nome)}</span>
      <figcaption class="retrato__credito">Retrato pendente: ainda sem foto com licença aberta e identificação segura.</figcaption>
    </figure>`;
  }
  const r = p.retrato;
  return html`<figure class="retrato ${classe}">
    <img src="${r.img}" width="${r.w}" height="${r.h}" alt="${r.alt}" loading="${carregar}" decoding="async" style="object-position:${r.pos || '50% 30%'}">
    ${credito ? html`<figcaption class="retrato__credito">Foto: ${r.credito}, ${r.url ? html`<a href="${r.url}" rel="noopener">${r.licenca}</a>` : r.licenca}, via ${r.via || 'Wikimedia Commons'}.</figcaption>` : ''}
  </figure>`;
}

function contagem(p) {
  const refs = referenciasPublicas(p);
  const comFonte = refs.filter((r) => r.tipo !== 'curadoria').length;
  const curadoria = refs.length - comFonte;
  const partes = [];
  if (comFonte) partes.push(`${comFonte} ${comFonte === 1 ? 'referência com fonte' : 'referências com fonte'}`);
  if (curadoria) partes.push(`${curadoria} na curadoria da Marginália`);
  return partes.join(' · ') || 'Referências em preparação';
}

const eixosLista = (p, { links = true, max = 99 } = {}) =>
  html`<ul class="eixos" aria-label="Eixos editoriais">
    ${p.eixos.slice(0, max).map((e) => html`<li>${links ? html`<a class="eixo" href="/personalidades?eixo=${e}">${EIXOS[e]}</a>` : html`<span class="eixo">${EIXOS[e]}</span>`}</li>`)}
  </ul>`;

// ---------- Home ----------
export function secaoHome(pessoas) {
  if (!pessoas.length) return '';
  return html`<section class="inspira" aria-labelledby="inspira-titulo">
    <div class="inspira__cabeca">
      <h2 id="inspira-titulo">Quem inspira, o que lê</h2>
      <p>Artistas e pensadores e os livros ligados a eles. Cada ligação diz de onde vem: uma indicação, uma entrevista ou uma escolha nossa.</p>
    </div>
    <ul class="inspira__mosaico">
      ${pessoas.map((p, i) => html`<li class="inspira__pessoa" data-pos="${i + 1}" data-reveal>
        <a href="/personalidades/${p.slug}">
          ${retrato(p)}
          <span class="inspira__nome">${p.nome}</span>
          <span class="inspira__papel">${p.papel}</span>
        </a>
        ${eixosLista(p, { links: false, max: 3 })}
      </li>`)}
      <li class="inspira__todos" data-reveal><a href="/personalidades">Ver todos os perfis <span aria-hidden="true">→</span></a></li>
    </ul>
  </section>`;
}

// ---------- Catálogo ----------
export function catalogo({ pessoas, eixos, eixoAtual }) {
  return html`
<section class="cabeca-pagina" aria-labelledby="titulo-pessoas">
  <p class="cabeca-pagina__margem">Os eixos organizam a descoberta. Eles não querem dizer que cada pessoa recomendou livros sobre todos esses temas: cada referência traz sua própria fonte.</p>
  <h1 id="titulo-pessoas" class="titulo-pagina titulo-pagina--medio">Quem inspira, o que lê</h1>
</section>
<nav class="filtro-eixos" aria-label="Filtrar por eixo">
  <details class="filtro-eixos__caixa" open data-abrir-desktop>
  <summary class="filtro-eixos__rotulo">Filtrar por eixo${eixoAtual ? `: ${EIXOS[eixoAtual]}` : ''}</summary>
  <ul>
    <li><a class="etiqueta${!eixoAtual ? ' etiqueta--ativa' : ''}" href="/personalidades"${!eixoAtual ? raw(' aria-current="true"') : ''}>Todos</a></li>
    ${Object.entries(eixos).map(([k, v]) => html`<li><a class="etiqueta${eixoAtual === k ? ' etiqueta--ativa' : ''}" href="/personalidades?eixo=${k}"${eixoAtual === k ? raw(' aria-current="true"') : ''}>${v}</a></li>`)}
  </ul>
  </details>
</nav>
<p class="filtro-eixos__contagem" role="status">${pessoas.length === 1 ? '1 perfil' : `${pessoas.length} perfis`}${eixoAtual ? ` com o eixo ${EIXOS[eixoAtual]}` : ''}</p>
${pessoas.length
  ? html`<ol class="perfis">
      ${pessoas.map((p, i) => html`<li class="perfil-faixa" data-fundo="${i % 2 ? 'creme' : 'preto'}" data-lado="${i % 2 ? 'direita' : 'esquerda'}">
        <div class="perfil-faixa__foto" data-reveal>${retrato(p, { carregar: i < 2 ? 'eager' : 'lazy' })}</div>
        <div class="perfil-faixa__texto" data-reveal>
          <h2 class="perfil-faixa__nome"><a href="/personalidades/${p.slug}">${p.nome}</a></h2>
          <p class="perfil-faixa__papel">${p.papel}</p>
          <p class="perfil-faixa__descricao">${p.descricao}</p>
          ${eixosLista(p)}
          <p class="perfil-faixa__contagem">${contagem(p)}</p>
          <a class="perfil-faixa__link" href="/personalidades/${p.slug}">Ver o perfil e as leituras<span class="sr"> de ${p.nome}</span></a>
        </div>
      </li>`)}
    </ol>`
  : html`<div class="vazio"><p class="vazio__titulo">Nenhum perfil com esse eixo.</p><p><a class="botao botao--contorno" href="/personalidades">Ver todos os perfis</a></p></div>`}`;
}

// ---------- Uma referência ----------
function obraDaReferencia(r) {
  if (r.livroObj) {
    return html`<a class="recorte__capa" href="/livros/${r.livroObj.slug}" tabindex="-1" aria-hidden="true">${capa(r.livroObj, { classe: 'capa--mini' })}</a>
      <h3 class="recorte__titulo"><a href="/livros/${r.livroObj.slug}">${r.livroObj.titulo}</a></h3>
      <p class="recorte__autor">${nomesAutores(r.livroObj)} · ${r.livroObj.ano}</p>`;
  }
  return html`<div class="recorte__capa recorte__capa--fora" aria-hidden="true"><span>${r.obra?.titulo}</span></div>
    <h3 class="recorte__titulo">${r.obra?.titulo}</h3>
    <p class="recorte__autor">${r.obra?.autor} · fora do acervo da Marginália</p>
    ${r.obra?.titulo ? acessoCompacto(r.obra.titulo, r.obra.autor || '') : ''}`;
}

export function fonteLinha(f) {
  if (!f) return html`<p class="recorte__fonte">Associação editorial da Marginália, sem fonte externa.</p>`;
  return html`<p class="recorte__fonte">Fonte: ${f.veiculo}${f.data ? ` · ${dataLegivel(f.data)}` : ''} · <a href="${f.url}" rel="noopener">${f.titulo}</a></p>`;
}

function recorte(r) {
  return html`<li class="recorte${r.tipo === 'curadoria' ? ' recorte--curadoria' : ''}" data-reveal>
    <p class="carimbo${r.tipo === 'curadoria' ? ' carimbo--curadoria' : ''}">${r.rotuloTexto}</p>
    ${obraDaReferencia(r)}
    <p class="recorte__contexto">${r.contexto}</p>
    ${fonteLinha(r.fonte)}
    ${r.verificacao === 'secundaria' ? html`<p class="recorte__nota"><span class="ast" aria-hidden="true">*</span> ${r.notaVerificacao || 'Fonte secundária.'}</p>` : ''}
  </li>`;
}

// ---------- Página individual ----------
export function pagina({ pessoa, indice, ligadas }) {
  const refs = referenciasPublicas(pessoa);
  const comFonte = refs.filter((r) => r.tipo !== 'curadoria');
  const curadoria = refs.filter((r) => r.tipo === 'curadoria');
  return html`
<article class="pessoa">
  <header class="pessoa__cabeca" data-fundo="${indice % 2 ? 'creme' : 'preto'}">
    <div class="pessoa__foto" data-reveal>${retrato(pessoa, { carregar: 'eager', credito: true })}</div>
    <div class="pessoa__texto">
      <h1 class="pessoa__nome">${pessoa.nome}</h1>
      <p class="pessoa__papel">${pessoa.papel}</p>
      <p class="pessoa__descricao">${pessoa.descricao}</p>
      ${pessoa.fontePerfil ? html`<div class="pessoa__fonte">${fonteLinha(pessoa.fontePerfil)}</div>` : ''}
      ${eixosLista(pessoa)}
      <p class="pessoa__aviso">Os eixos organizam a descoberta na Marginália. Não significam que ${pessoa.nomeCurto || pessoa.nome} tenha recomendado livros sobre cada um desses temas.</p>
    </div>
  </header>

  ${comFonte.length
    ? html`<section class="leituras" aria-labelledby="com-fonte">
        <div class="leituras__cabeca">
          <h2 id="com-fonte">O que leu, citou ou indicou</h2>
          <p>Cada item diz de onde vem a ligação e traz a fonte para conferir.</p>
        </div>
        <ul class="recortes">${comFonte.map(recorte)}</ul>
      </section>`
    : ''}

  ${curadoria.length
    ? html`<section class="leituras leituras--curadoria" aria-labelledby="curadoria">
        <div class="leituras__cabeca">
          <h2 id="curadoria">Para ler junto</h2>
          <p>Escolhas da equipe da Marginália a partir dos eixos do perfil. Não são indicações de ${pessoa.nomeCurto || pessoa.nome}.</p>
        </div>
        <ul class="recortes">${curadoria.map(recorte)}</ul>
      </section>`
    : ''}

  ${ligadas.length
    ? html`<section class="conversas" aria-labelledby="conversas">
        <h2 id="conversas">Conversas</h2>
        <ul>
          ${ligadas.map((l) => html`<li><a href="/personalidades/${l.pessoa.slug}">${l.pessoa.nome}</a> <span>${l.texto}</span> ${fonteLinha(l.fonte)}</li>`)}
        </ul>
      </section>`
    : ''}
</article>`;
}

// ---------- Bloco na página do livro ----------
export function blocoLivro(refs) {
  if (!refs.length) return '';
  return html`<section class="quem-le" aria-labelledby="quem-le">
    <h2 id="quem-le" class="subtitulo">Quem inspira, o que lê</h2>
    <ul>
      ${refs.map((r) => html`<li>
        <p class="carimbo${r.tipo === 'curadoria' ? ' carimbo--curadoria' : ''}">${r.rotuloTexto}</p>
        <p><a href="/personalidades/${r.pessoa.slug}"><strong>${r.pessoa.nome}</strong></a>. ${r.contexto}</p>
        ${fonteLinha(r.fonte)}
      </li>`)}
    </ul>
  </section>`;
}
