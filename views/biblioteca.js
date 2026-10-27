import { html } from '../lib/html.js';
import { livros, TEMAS, NIVEIS, PERIODOS, autorPorSlug } from '../content/catalog.js';
import { itemLivro } from './parts.js';

const normalizar = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function lerFiltros(params, pessoas = {}) {
  const f = {
    q: (params.get('q') || '').slice(0, 80),
    tema: params.get('tema') || '',
    nivel: params.get('nivel') || '',
    periodo: params.get('periodo') || '',
    pessoa: params.get('pessoa') || '',
  };
  if (!pessoas[f.pessoa]) f.pessoa = '';
  if (!TEMAS[f.tema]) f.tema = '';
  if (!NIVEIS[f.nivel]) f.nivel = '';
  if (!PERIODOS[f.periodo]) f.periodo = '';
  return f;
}

export function filtrar(f, permitidos = null) {
  const termos = normalizar(f.q).split(/\s+/).filter(Boolean);
  return livros.filter((l) => {
    if (f.tema && !l.temas.includes(f.tema)) return false;
    if (f.nivel && l.nivel !== f.nivel) return false;
    if (f.periodo && l.periodo !== f.periodo) return false;
    if (permitidos && !permitidos.has(l.slug)) return false;
    if (!termos.length) return true;
    const alvo = normalizar([
      l.titulo, l.subtitulo, l.genero, l.linha, l.ano,
      ...l.autores.map((s) => autorPorSlug.get(s)?.nome),
      ...l.temas.map((t) => TEMAS[t]),
    ].join(' '));
    return termos.every((t) => alvo.includes(t));
  });
}

function url(f, mudanca) {
  const p = new URLSearchParams();
  const n = { ...f, ...mudanca };
  for (const k of ['q', 'tema', 'nivel', 'periodo', 'pessoa']) if (n[k]) p.set(k, n[k]);
  const s = p.toString();
  return '/biblioteca' + (s ? '?' + s : '');
}

function grupo(nome, legenda, opcoes, atual) {
  return html`<fieldset class="filtro">
    <legend>${legenda}</legend>
    <div class="filtro__opcoes">
      <label class="etiqueta-opcao"><input type="radio" name="${nome}" value=""${!atual ? ' checked' : ''}><span>Todos</span></label>
      ${Object.entries(opcoes).map(([v, r]) => html`<label class="etiqueta-opcao"><input type="radio" name="${nome}" value="${v}"${atual === v ? ' checked' : ''}><span>${r}</span></label>`)}
    </div>
  </fieldset>`;
}

export function biblioteca({ filtros, estante = {}, pessoas = {}, permitidos = null }) {
  const resultado = filtrar(filtros, permitidos);
  const ativos = [
    filtros.q && { rotulo: `“${filtros.q}”`, remover: url(filtros, { q: '' }) },
    filtros.tema && { rotulo: TEMAS[filtros.tema], remover: url(filtros, { tema: '' }) },
    filtros.nivel && { rotulo: NIVEIS[filtros.nivel], remover: url(filtros, { nivel: '' }) },
    filtros.periodo && { rotulo: PERIODOS[filtros.periodo], remover: url(filtros, { periodo: '' }) },
    filtros.pessoa && { rotulo: `Ligados a ${pessoas[filtros.pessoa]}`, remover: url(filtros, { pessoa: '' }) },
  ].filter(Boolean);
  const contagem = resultado.length === 1 ? '1 livro' : `${resultado.length} livros`;

  return html`
<section class="cabeca-pagina cabeca-pagina--biblioteca" aria-labelledby="titulo-biblioteca">
  <p class="cabeca-pagina__margem">Literatura, história e pensamento político. Busque por título, autor ou tema, ou filtre pelas etiquetas.</p>
  <h1 id="titulo-biblioteca" class="titulo-pagina">Biblioteca</h1>
</section>

<form class="busca" method="get" action="/biblioteca" role="search" data-busca>
  <div class="busca__campo">
    <label for="q">Buscar na biblioteca</label>
    <div class="busca__linha">
      <input id="q" name="q" type="search" value="${filtros.q}" placeholder="Ex.: Carolina, favela, Freire" autocomplete="off" maxlength="80">
      <button class="botao" type="submit">Buscar</button>
    </div>
  </div>
  <div class="busca__filtros">
    ${grupo('tema', 'Tema', TEMAS, filtros.tema)}
    ${grupo('nivel', 'Nível', NIVEIS, filtros.nivel)}
    ${grupo('periodo', 'Período', PERIODOS, filtros.periodo)}
    ${Object.keys(pessoas).length ? grupo('pessoa', 'Quem inspira, o que lê', pessoas, filtros.pessoa) : ''}
  </div>
</form>

<section class="resultados" id="resultados" aria-labelledby="contagem" data-resultados>
  <div class="resultados__cabeca">
    <h2 id="contagem" class="resultados__contagem" data-contagem>${contagem}</h2>
    ${ativos.length
      ? html`<ul class="filtros-ativos" aria-label="Filtros aplicados">
          ${ativos.map((a) => html`<li><a class="etiqueta etiqueta--ativa" href="${a.remover}" aria-label="Remover filtro ${a.rotulo}">${a.rotulo} <span aria-hidden="true">×</span></a></li>`)}
          <li><a class="link" href="/biblioteca">Limpar tudo</a></li>
        </ul>`
      : ''}
  </div>
  ${resultado.length
    ? html`<div class="grade-livros">
        ${resultado.map((l, i) => itemLivro(l, { estado: estante[l.slug], destaque: i === 0 && !ativos.length, nivelTitulo: 'h3', carregar: i < 6 ? 'eager' : 'lazy' }))}
      </div>`
    : html`<div class="vazio">
        <p class="vazio__titulo">Nenhum livro com essa combinação.</p>
        <p>Tente outra palavra ou remova um filtro. Buscas funcionam com título, autor, tema ou gênero — com ou sem acento.</p>
        <p><a class="botao botao--contorno" href="/biblioteca">Ver todos os livros</a></p>
      </div>`}
</section>`;
}
