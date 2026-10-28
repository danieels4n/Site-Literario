import { html, raw } from '../lib/html.js';
import { livros, trilhas, conceitos, autores, livroPorSlug, autorPorSlug, conceitoPorSlug, trilhaPorSlug, fotos, NIVEIS, faixaNivel } from '../content/catalog.js';
import { capa, foto, nomesAutores } from './parts.js';
import { retrato } from './personalidades.js';

const NA_MESA = ['vidas-secas', 'quarto-de-despejo', 'os-sertoes', 'pedagogia-do-oprimido', 'ursula', 'triste-fim-de-policarpo-quaresma', 'esau-e-jaco'];
const CONCEITOS_CAPA = ['homem-cordial', 'escrevivencia', 'educacao-bancaria', 'mito-da-democracia-racial', 'subdesenvolvimento', 'patrimonialismo', 'literatura-de-testemunho', 'luta-de-classes'];

// Carrossel editorial (só no celular; no desktop fica oculto e as imagens das lâminas 2–5 não carregam).
function carrossel(pessoas) {
  const trilha = trilhaPorSlug.get('vozes-da-margem');
  // Na lâmina, só quem tem retrato licenciado, na ordem escolhida pela curadoria.
  const comFoto = ['emicida', 'jones-manoel', 'erika-hilton'].map((s) => pessoas.find((p) => p.slug === s)).filter((p) => p?.retrato);
  const capasOriginais = livros.filter((l) => l.capa?.img).slice(0, 4);
  const gratis = livros.filter((l) => l.gratis);
  const laminas = [
    {
      nome: 'Apresentação', classe: 'lamina--foto',
      corpo: html`<img class="lamina__fundo" src="${fotos.carolinaAssinando.img}" width="${fotos.carolinaAssinando.w}" height="${fotos.carolinaAssinando.h}" alt="${fotos.carolinaAssinando.alt}" decoding="async">
        <p class="lamina__legenda">${fotos.carolinaAssinando.legenda}</p>
        <div class="lamina__texto">
          <p class="lamina__chapeu">Biblioteca de formação crítica</p>
          <h1 class="lamina__titulo lamina__titulo--grande">Toda leitura deixa marcas<span class="ast">.</span></h1>
          <p class="lamina__resumo">Literatura revolucionária, pensamento crítico e cultura para transformar realidades.</p>
          <a class="botao" href="/biblioteca">Explorar a biblioteca</a>
        </div>`,
    },
    comFoto.length && {
      nome: 'Quem lê', classe: 'lamina--pessoas',
      corpo: html`<ul class="lamina__pessoas">${comFoto.map((p) => html`<li>${retrato(p)}<span>${p.nome}</span></li>`)}</ul>
        <div class="lamina__texto">
          <p class="lamina__chapeu">Quem inspira, o que lê</p>
          <h2 class="lamina__titulo">Os livros por trás de quem faz cultura e política</h2>
          <p class="lamina__resumo">Cada ligação diz de onde vem: uma indicação, uma entrevista ou uma escolha nossa.</p>
          <a class="botao botao--claro" href="/personalidades">Ver quem lê</a>
        </div>`,
    },
    {
      nome: 'Trilhas', classe: 'lamina--trilha', cor: trilha.cor,
      corpo: html`<ul class="lamina__capas" aria-hidden="true">${trilha.etapas.slice(0, 4).map((e) => html`<li>${capa(livroPorSlug.get(e.livro), { classe: 'capa--mini' })}</li>`)}</ul>
        <div class="lamina__texto">
          <p class="lamina__chapeu">Trilha · ${trilha.etapas.length} etapas · ${faixaNivel(trilha)}</p>
          <h2 class="lamina__titulo">${trilha.pergunta}</h2>
          <p class="lamina__resumo">${trilha.objetivo}</p>
          <a class="botao botao--claro" href="/trilhas/${trilha.slug}">Seguir esta trilha</a>
        </div>`,
    },
    {
      nome: 'Biblioteca', classe: 'lamina--livros',
      corpo: html`<ul class="lamina__capas lamina__capas--grandes" aria-hidden="true">${capasOriginais.map((l) => html`<li>${capa(l)}</li>`)}</ul>
        <div class="lamina__texto">
          <p class="lamina__chapeu">Biblioteca · ${livros.length} livros</p>
          <h2 class="lamina__titulo">Primeiras edições, clássicos e obras esquecidas</h2>
          <p class="lamina__resumo">Quando a primeira edição está em domínio público, você vê a capa original.</p>
          <a class="botao" href="/biblioteca">Ver todos os livros</a>
        </div>`,
    },
    {
      nome: 'Acesso gratuito', classe: 'lamina--foto lamina--gratis',
      corpo: html`<img class="lamina__fundo" src="${fotos.gabinete.img}" width="${fotos.gabinete.w}" height="${fotos.gabinete.h}" alt="${fotos.gabinete.alt}" loading="lazy" decoding="async">
        <p class="lamina__legenda">${fotos.gabinete.legenda}</p>
        <div class="lamina__texto">
          <p class="lamina__chapeu">Acesso gratuito e sebos</p>
          <h2 class="lamina__titulo">${gratis.length} livros para ler de graça, e legalmente</h2>
          <p class="lamina__resumo">Obras em domínio público com texto integral no Wikisource. Para as outras, cada ficha leva a buscas em sebos.</p>
          <a class="botao" href="/biblioteca?gratis=1">Ler de graça</a>
        </div>`,
    },
  ].filter(Boolean);
  return html`<section class="carrossel" aria-roledescription="carrossel" aria-label="Destaques da Marginália" data-carrossel>
  <div class="carrossel__trilho" data-trilho aria-live="polite">
    ${laminas.map((l, i) => html`<div class="lamina ${l.classe}" role="group" aria-roledescription="lâmina" aria-label="${i + 1} de ${laminas.length}: ${l.nome}"${l.cor ? html` data-cor="${l.cor}"` : ''} data-lamina>${l.corpo}</div>`)}
  </div>
  <div class="carrossel__controles">
    <div class="carrossel__pontos">
      ${laminas.map((l, i) => html`<button type="button" class="carrossel__ponto" data-ir="${i}" aria-label="Mostrar ${i + 1} de ${laminas.length}: ${l.nome}"${i === 0 ? raw(' aria-current="true"') : ''}><span></span></button>`)}
    </div>
    <button type="button" class="carrossel__pausa" data-pausa aria-label="Pausar a passagem automática" hidden>
      <svg class="icone icone--pausa" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor"/></svg>
      <svg class="icone icone--tocar" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
    </button>
  </div>
</section>

<form class="busca-rapida" method="get" action="/biblioteca" role="search">
  <label class="sr" for="q-home">Buscar na biblioteca</label>
  <input id="q-home" name="q" type="search" placeholder="Buscar livro, autor ou tema" autocomplete="off" maxlength="80" enterkeyhint="search">
  <button class="botao" type="submit">Buscar</button>
</form>`;
}

// Leitura gratuita (só no celular).
function leiaDeGraca() {
  const gratis = livros.filter((l) => l.gratis);
  return html`<section class="gratis-home" aria-labelledby="gratis-titulo">
  <h2 id="gratis-titulo">Leia de graça</h2>
  <p>${gratis.length} livros em domínio público, com texto integral no Wikisource. Para os outros, cada ficha mostra onde achar usado em sebos.</p>
  <ul class="gratis-home__lista">
    ${gratis.slice(0, 4).map((l) => html`<li><a href="/livros/${l.slug}">${capa(l, { classe: 'capa--mini' })}<span class="gratis-home__titulo">${l.titulo}</span><span class="gratis-home__autor">${nomesAutores(l)}, ${l.ano}</span></a></li>`)}
  </ul>
  <a class="botao botao--contorno" href="/biblioteca?gratis=1">Ver os ${gratis.length} livros grátis</a>
</section>`;
}

export function home({ inspira = '', pessoas = [] } = {}) {
  const veias = livroPorSlug.get('as-veias-abertas-da-america-latina');
  const graciliano = autorPorSlug.get('graciliano-ramos');

  return html`
${carrossel(pessoas)}
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
    <p>Você não precisa conhecer tudo para começar a aprender. Escolha um assunto e descubra um caminho de leitura feito para o seu momento.</p>
    <p class="comeco__acoes"><a class="botao botao--claro" href="/comecar">Encontrar meu caminho</a></p>
    <p>Ou escolha uma pergunta: cada trilha responde com livros em sequência, do mais acessível ao mais denso.</p>
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
            return html`<li><a href="/livros/${l.slug}">${capa(l, { classe: 'capa--mini' })}<span class="pergunta__livro">${l.titulo}</span></a></li>`;
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

${leiaDeGraca()}

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
