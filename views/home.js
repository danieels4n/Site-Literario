import { html } from '../lib/html.js';
import { livros, trilhas, conceitos, autores, livroPorSlug, autorPorSlug, conceitoPorSlug, fotos, NIVEIS } from '../content/catalog.js';
import { capa, foto, nomesAutores } from './parts.js';

const NA_MESA = ['vidas-secas', 'quarto-de-despejo', 'os-sertoes', 'pedagogia-do-oprimido', 'ursula', 'triste-fim-de-policarpo-quaresma', 'esau-e-jaco'];
const CONCEITOS_CAPA = ['homem-cordial', 'escrevivencia', 'educacao-bancaria', 'mito-da-democracia-racial', 'subdesenvolvimento', 'patrimonialismo', 'literatura-de-testemunho', 'luta-de-classes'];

export function home({ inspira = '' } = {}) {
  const veias = livroPorSlug.get('as-veias-abertas-da-america-latina');
  const graciliano = autorPorSlug.get('graciliano-ramos');

  return html`
<section class="capa-home" aria-labelledby="manchete">
  <div class="capa-home__foto">
    ${foto(fotos.carolinaAssinando, { carregar: 'eager', prioridade: true, classe: 'foto--intervencao' })}
  </div>
  <div class="capa-home__texto">
    <h1 id="manchete" class="manchete">
      <span class="linha"><span>Ler à margem,</span></span>
      <span class="linha"><span>pensar o Brasil</span></span>
    </h1>
    <p class="capa-home__proposta">Uma biblioteca de formação crítica: livros, trilhas, autores e conceitos para entender o país com o lápis na mão.</p>
    <div class="acoes">
      <a class="botao" href="/trilhas">Começar uma trilha</a>
      <a class="link-forte" href="/biblioteca">Explorar a biblioteca</a>
    </div>
    <ul class="numeros" aria-label="O que há na Marginália">
      <li><a href="/biblioteca"><strong>${livros.length}</strong> livros com ficha, contexto e temas</a></li>
      <li><a href="/trilhas"><strong>${trilhas.length}</strong> trilhas guiadas por uma pergunta</a></li>
      <li><a href="/conceitos"><strong>${conceitos.length}</strong> conceitos explicados sem jargão</a></li>
    </ul>
  </div>
</section>

<section class="comeco" aria-labelledby="comeco-titulo">
  <div class="comeco__intro" data-reveal>
    <h2 id="comeco-titulo">Por onde começar?</h2>
    <p>Escolha uma pergunta. Cada trilha responde com livros em sequência, do mais acessível ao mais denso.</p>
  </div>
  <div class="comeco__perguntas">
    ${trilhas.map((t, i) => html`
    <details class="pergunta" name="comeco" data-cor="${t.cor}"${i === 0 ? ' open' : ''}>
      <summary><span class="pergunta__texto">${t.pergunta}</span><span class="pergunta__sinal" aria-hidden="true"></span></summary>
      <div class="pergunta__corpo">
        <p class="pergunta__objetivo">${t.objetivo}</p>
        <ol class="pergunta__etapas">
          ${t.etapas.map((e) => {
            const l = livroPorSlug.get(e.livro);
            return html`<li><a href="/livros/${l.slug}">${capa(l, { classe: 'capa--mini' })}<span>${l.titulo}</span></a></li>`;
          })}
        </ol>
        <a class="botao botao--claro" href="/trilhas/${t.slug}">Seguir a trilha “${t.titulo}”</a>
      </div>
    </details>`)}
  </div>
</section>

${inspira}

<section class="mesa" aria-labelledby="mesa-titulo">
  <div class="mesa__cabeca" data-reveal>
    <h2 id="mesa-titulo">${livros.length} livros, nenhum por acaso</h2>
    <p>Clássicos e obras esquecidas, lado a lado. Quando a primeira edição está em domínio público, você vê a capa original; nas outras, uma capa tipográfica nossa.</p>
  </div>
  <ul class="mesa__capas">
    ${NA_MESA.map((slug) => {
      const l = livroPorSlug.get(slug);
      return html`<li data-reveal><a href="/livros/${l.slug}">${capa(l)}<span class="mesa__titulo">${l.titulo}</span><span class="mesa__autor">${nomesAutores(l)}, ${l.ano}</span></a></li>`;
    })}
  </ul>
  <p class="mesa__mais"><a class="link-forte" href="/biblioteca">Ver a biblioteca inteira</a></p>
</section>

<section class="trecho" aria-labelledby="trecho-titulo">
  <div class="trecho__margem" data-reveal>
    <h2 id="trecho-titulo">Um trecho sublinhado</h2>
    <p class="nota">Da introdução de ${veias.titulo}, de Eduardo Galeano, publicado em ${veias.ano} e proibido pelas ditaduras do Uruguai, do Chile e da Argentina. Citação curta, com fonte, em tradução para o português.</p>
  </div>
  <blockquote class="trecho__citacao" data-reveal>
    <p class="trecho__brado">“A perpetuação da atual ordem de coisas é <mark class="sublinhado">a perpetuação do crime.</mark>”</p>
    <footer>Eduardo Galeano, ${veias.titulo} (${veias.ano}) · <a href="/livros/${veias.slug}">ler a ficha do livro</a></footer>
  </blockquote>
</section>

<section class="indice" aria-labelledby="indice-titulo">
  <h2 id="indice-titulo" data-reveal>Palavras para ler o país, sem jargão</h2>
  <div class="indice__corpo">
    <p class="indice__rotulo">Conceitos</p>
    <ul class="indice__lista">
      ${CONCEITOS_CAPA.map((s) => {
        const c = conceitoPorSlug.get(s);
        return html`<li data-reveal><a href="/conceitos/${c.slug}"><span class="indice__termo">${c.termo}</span><span class="indice__origem">${c.origem}</span><span class="indice__seta" aria-hidden="true">→</span></a></li>`;
      })}
    </ul>
    ${foto(fotos.gabinete, { classe: 'indice__foto' })}
  </div>
</section>

<section class="autor-destaque" aria-labelledby="autor-titulo">
  <dl class="autor-destaque__fatos" data-reveal>
    <div><dt>Nasceu</dt><dd>Quebrangulo, Alagoas, 1892</dd></div>
    <div><dt>Na biblioteca</dt><dd><a href="/livros/vidas-secas">Vidas Secas</a></dd></div>
    <div><dt>Trilha</dt><dd><a href="/trilhas/ler-o-mundo">Ler o mundo</a></dd></div>
  </dl>
  <div class="autor-destaque__texto" data-reveal>
    <img class="capitular" src="${graciliano.retrato.img}" width="${graciliano.retrato.w}" height="${graciliano.retrato.h}" alt="${graciliano.retrato.alt}" loading="lazy" decoding="async">
    <h2 id="autor-titulo" class="autor-destaque__nome"><a href="/autores/${graciliano.slug}">Graciliano Ramos</a></h2>
    <p class="autor-destaque__bio">foi prefeito no sertão de Alagoas, ficou quase um ano preso sem acusação pelo governo Vargas e escreveu, com a prosa mais seca da língua, a história de uma família de retirantes a quem faltam palavras para nomear a injustiça.</p>
    <p class="autor-destaque__mais">Na Marginália há ${autores.length} autores com biografia, contexto histórico e ligações para os livros e conceitos. <a href="/autores">Conheça todos</a>.</p>
  </div>
</section>

<section class="chamada" aria-labelledby="chamada-titulo">
  <div class="chamada__fotos">
    ${foto(fotos.favela, { legenda: false })}
    ${foto(fotos.passeata, { legenda: false })}
    ${foto(fotos.freire, { legenda: false, classe: 'foto--topo' })}
  </div>
  <div class="chamada__campo">
    <h2 id="chamada-titulo">Monte a sua estante</h2>
    <p class="chamada__texto">Marque livros com um <span class="ast">*</span>, registre até onde leu e acompanhe cada trilha. <a class="sublinhado-link" href="/cadastro">Criar conta grátis</a>.</p>
    <p class="chamada__nota">Só pedimos nome, e-mail e senha. Fotos acima: Favela do Castelo, 1961; protesto estudantil, 1968; Paulo Freire, 1963 — fundo Correio da Manhã, Arquivo Nacional.</p>
  </div>
</section>`;
}
