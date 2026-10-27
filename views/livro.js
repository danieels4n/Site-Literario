import { html } from '../lib/html.js';
import { livros, trilhas, conceitoPorSlug, NIVEIS } from '../content/catalog.js';
import { capa, ficha, etiquetas, linksAutores, itemLivro, dominioPublico, STATUS, nomesAutores } from './parts.js';
import { acessoLivro } from './acesso.js';

function relacionados(livro) {
  return livros
    .filter((l) => l.slug !== livro.slug)
    .map((l) => ({
      l,
      peso:
        l.temas.filter((t) => livro.temas.includes(t)).length +
        2 * l.conceitos.filter((c) => livro.conceitos.includes(c)).length +
        3 * l.autores.filter((a) => livro.autores.includes(a)).length,
    }))
    .filter((x) => x.peso > 0)
    .sort((a, b) => b.peso - a.peso || a.l.ano - b.l.ano)
    .slice(0, 4)
    .map((x) => x.l);
}

export function acoesLeitura(livro, usuario, estado) {
  if (!usuario) {
    return html`<div class="acoes-livro acoes-livro--anonimo">
      <p>Marque este livro com <span class="ast">*</span> e registre seu progresso.</p>
      <p><a class="botao" href="/entrar?volta=/livros/${livro.slug}">Entrar</a> <a class="link-forte" href="/cadastro?volta=/livros/${livro.slug}">ou criar conta</a></p>
    </div>`;
  }
  const e = estado || { asterisco: false, status: null, progresso: 0 };
  return html`<div class="acoes-livro" data-acoes-livro>
    <form method="post" action="/livros/${livro.slug}/asterisco" data-asterisco>
      <input type="hidden" name="valor" value="${e.asterisco ? '0' : '1'}">
      <button type="submit" class="botao-asterisco" aria-pressed="${e.asterisco ? 'true' : 'false'}">
        <span class="ast" aria-hidden="true">*</span>
        <span data-rotulo>${e.asterisco ? 'Marcado com asterisco' : 'Marcar com asterisco'}</span>
      </button>
    </form>
    <form method="post" action="/livros/${livro.slug}/leitura" class="leitura" data-leitura>
      <fieldset>
        <legend>Sua leitura</legend>
        <div class="leitura__opcoes">
          ${Object.entries(STATUS).map(([v, r]) => html`<label class="etiqueta-opcao"><input type="radio" name="status" value="${v}"${e.status === v ? ' checked' : ''}><span>${r}</span></label>`)}
          <label class="etiqueta-opcao"><input type="radio" name="status" value=""${!e.status ? ' checked' : ''}><span>Sem registro</span></label>
        </div>
      </fieldset>
      <div class="leitura__progresso" data-progresso${e.status === 'lendo' ? '' : ' hidden'}>
        <label for="progresso-${livro.slug}">Quanto já leu</label>
        <div class="leitura__faixa">
          <input id="progresso-${livro.slug}" type="range" name="progresso" min="0" max="100" step="5" value="${e.progresso || 0}">
          <output for="progresso-${livro.slug}" data-saida>${e.progresso || 0}%</output>
        </div>
      </div>
      <button type="submit" class="botao botao--contorno">Salvar leitura</button>
      <p class="leitura__estado" data-estado aria-live="polite"></p>
    </form>
  </div>`;
}

export function livroPagina({ livro, usuario, estado, quemLe = '' }) {
  const rel = relacionados(livro);
  const emTrilhas = trilhas.filter((t) => t.etapas.some((e) => e.livro === livro.slug));
  const conceitosLivro = livro.conceitos.map((s) => conceitoPorSlug.get(s)).filter(Boolean);
  const dp = dominioPublico(livro);

  return html`
<article class="livro">
  <header class="livro__cabeca">
    <div class="livro__capa">${capa(livro, { carregar: 'eager', classe: 'capa--grande' })}</div>
    <div class="livro__info">
      <p class="livro__autor">${linksAutores(livro)}</p>
      <h1 class="livro__titulo">${livro.titulo}</h1>
      ${livro.subtitulo ? html`<p class="livro__subtitulo">${livro.subtitulo}</p>` : ''}
      <p class="livro__linha">${livro.linha}</p>
      ${ficha(livro)}
      ${livro.gratis ? html`<p class="livro__gratis"><span class="ast" aria-hidden="true">*</span> Domínio público: <a href="${livro.gratis.url}" rel="noopener">ler grátis no ${livro.gratis.fonte}</a> ou <a href="#acesso-titulo">ver onde encontrar em papel</a>.</p>` : ''}
      ${acoesLeitura(livro, usuario, estado)}
    </div>
  </header>

  <div class="livro__corpo">
    <aside class="livro__margem" aria-label="Notas de margem">
      <section class="nota-margem" data-reveal>
        <h2>Contexto</h2>
        <p>${livro.contexto}</p>
      </section>
      <section class="nota-margem nota-margem--vermelha" data-reveal>
        <h2>Por que ler</h2>
        <p>${livro.porque}</p>
      </section>
    </aside>

    <div class="livro__texto">
      <section aria-labelledby="sinopse" data-reveal>
        <h2 id="sinopse" class="subtitulo">Sinopse</h2>
        ${livro.sinopse.map((p) => html`<p>${p}</p>`)}
      </section>

      ${acessoLivro(livro)}

      ${livro.citacao
        ? html`<figure class="citacao" data-reveal>
            <blockquote><p>${livro.citacao.texto}</p></blockquote>
            <figcaption>${livro.citacao.fonte}</figcaption>
          </figure>`
        : ''}

      <section aria-labelledby="temas" data-reveal>
        <h2 id="temas" class="subtitulo">Temas</h2>
        ${etiquetas(livro)}
      </section>

      ${conceitosLivro.length
        ? html`<section aria-labelledby="conceitos-livro" data-reveal>
            <h2 id="conceitos-livro" class="subtitulo">Conceitos para ler junto</h2>
            <dl class="verbetes-curtos">
              ${conceitosLivro.map((c) => html`<div><dt><a href="/conceitos/${c.slug}">${c.termo}</a></dt><dd>${c.definicao}</dd></div>`)}
            </dl>
          </section>`
        : ''}

      ${quemLe}

      <section aria-labelledby="referencias" data-reveal>
        <h2 id="referencias" class="subtitulo">Referências</h2>
        <ul class="referencias">
          <li>${nomesAutores(livro)}. <cite>${livro.titulo}</cite>${livro.subtitulo ? `: ${livro.subtitulo}` : ''}. Primeira publicação: ${livro.ano}${livro.anoNota ? ` (${livro.anoNota})` : ''}.</li>
          ${dp
            ? html`<li>Obra em domínio público no Brasil: o texto original (não as traduções recentes) pode ser procurado em acervos digitais gratuitos, como o portal Domínio Público, do Ministério da Educação, e a Biblioteca Brasiliana Guita e José Mindlin, da USP.</li>`
            : html`<li>Obra protegida por direitos autorais: procure em bibliotecas públicas e escolares ou em edições comerciais.</li>`}
          ${livro.capa.img ? html`<li>Imagem da capa: ${livro.capa.alt}, via Wikimedia Commons (domínio público). <a href="/creditos">Créditos</a>.</li>` : ''}
        </ul>
      </section>
    </div>
  </div>

  ${emTrilhas.length
    ? html`<section class="livro__trilhas" aria-labelledby="nas-trilhas">
        <h2 id="nas-trilhas">Este livro está ${emTrilhas.length === 1 ? 'na trilha' : 'nas trilhas'}</h2>
        <ul>
          ${emTrilhas.map((t) => {
            const pos = t.etapas.findIndex((e) => e.livro === livro.slug) + 1;
            return html`<li data-cor="${t.cor}" data-reveal><a href="/trilhas/${t.slug}"><span class="livro__trilha-pergunta">${t.pergunta}</span><span class="livro__trilha-pos">Etapa ${pos} de ${t.etapas.length} · ${NIVEIS[livro.nivel]}</span></a></li>`;
          })}
        </ul>
      </section>`
    : ''}

  ${rel.length
    ? html`<section class="relacionados" aria-labelledby="relacionados">
        <h2 id="relacionados">Leia também</h2>
        <div class="relacionados__lista">${rel.map((l) => itemLivro(l, { nivelTitulo: 'h3' }))}</div>
      </section>`
    : ''}
</article>`;
}
