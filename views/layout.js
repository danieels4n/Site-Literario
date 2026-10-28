import { html, raw } from '../lib/html.js';
import { livros, trilhas, conceitos } from '../content/catalog.js';

const NAV = [
  ['/biblioteca', 'Biblioteca'],
  ['/trilhas', 'Trilhas'],
  ['/autores', 'Autores'],
  ['/personalidades', 'Quem lê'],
  ['/sobre', 'Sobre nós'],
];

// Ícones funcionais da navegação no celular (traço simples, cor do texto).
const svg = (d) => `<svg class="icone" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">${d}</svg>`;
const ICONES = {
  busca: svg('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/>'),
  menu: svg('<path d="M3 6h18M3 12h18M3 18h18"/>'),
  inicio: svg('<path d="M3 11 12 4l9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>'),
  livros: svg('<path d="M4 4h6v16H4zM14 4h6v16h-6z"/><path d="M6.5 8h1M16.5 8h1"/>'),
  trilhas: svg('<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H14a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h5.5"/>'),
  autores: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'),
  pessoas: svg('<circle cx="8.5" cy="9" r="3"/><circle cx="16.5" cy="9" r="3"/><path d="M2.5 20c0-3.5 2.7-6 6-6s6 2.5 6 6M14.5 14.2c3.3-.5 7 1.6 7 5.8"/>'),
};
const BARRA = [
  ['/', 'Início', 'inicio'],
  ['/biblioteca', 'Biblioteca', 'livros'],
  ['/trilhas', 'Trilhas', 'trilhas'],
  ['/autores', 'Autores', 'autores'],
  ['/personalidades', 'Quem lê', 'pessoas'],
];

const FAVICON = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#F2EBDD"/><g stroke="#A52A2A" stroke-width="5" stroke-linecap="butt"><path d="M16 4v24M5.6 10l20.8 12M5.6 22l20.8-12"/></g></svg>'
)}`;

export function marca(tag = 'span', cls = 'marca') {
  return html`<${raw(tag)} class="${cls}">Marginália<span class="ast" aria-hidden="true">*</span></${raw(tag)}>`;
}

export function layout({ titulo, descricao, corpo, usuario, admin = false, caminho = '/', classe = '', flash = '' }) {
  const ativo = (href) => (caminho === href || caminho.startsWith(href + '/') ? raw(' aria-current="page"') : '');
  const tituloPagina = titulo ? `${titulo} · Marginália` : 'Marginália — leitura e formação crítica';
  return html`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${tituloPagina}</title>
<meta name="description" content="${descricao || 'Biblioteca de formação crítica: livros, trilhas de leitura, autores e conceitos para entender o Brasil lendo.'}">
<meta name="theme-color" content="#F2EBDD">
<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/css/marginalia.css">
<script>document.documentElement.classList.add('js')</script>
<script src="/js/app.js" defer></script>
</head>
<body class="${classe}">
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo">
  <a class="topo__marca" href="/" aria-label="Marginália, página inicial">${marca()}</a>
  <a class="topo__buscar" href="/biblioteca#q" aria-label="Buscar na biblioteca">${raw(ICONES.busca)}</a>
  <button class="topo__menu" type="button" aria-expanded="false" aria-controls="menu-principal">${raw(ICONES.menu)}<span class="sr">Menu</span></button>
  <nav class="topo__nav" id="menu-principal" aria-label="Principal">
    <div class="topo__nav-topo">
      ${marca()}
      <button class="topo__fechar" type="button" data-fechar-menu aria-label="Fechar menu"><span aria-hidden="true">×</span></button>
    </div>
    <ul class="topo__links">
      <li class="so-celular"><a href="/"${caminho === '/' ? raw(' aria-current="page"') : ''}>Início</a></li>
      ${NAV.map(([href, rotulo]) => html`<li><a href="${href}"${ativo(href)}>${rotulo}</a></li>`)}
      <li class="so-celular"><a href="/conceitos"${ativo('/conceitos')}>Conceitos</a></li>
    </ul>
    <div class="topo__conta">
      ${usuario
        ? html`<a href="/estante"${ativo('/estante')}>Minha estante</a>
          <form method="post" action="/sair" class="topo__sair"><button type="submit" class="link">Sair</button></form>`
        : html`<a href="/entrar"${ativo('/entrar')}>Entrar</a>
          <a class="botao botao--pequeno" href="/cadastro">Criar conta</a>`}
    </div>
    <p class="topo__lema so-celular">Marginália<span class="ast" aria-hidden="true">*</span> Toda leitura deixa marcas.</p>
  </nav>
</header>
${flash ? html`<p class="aviso" role="status">${flash}</p>` : ''}
<main id="conteudo" tabindex="-1">
${corpo}
</main>
<footer class="rodape">
  <div class="rodape__topo">
    <p>Uma biblioteca de formação crítica: ${livros.length} livros, ${trilhas.length} trilhas e ${conceitos.length} conceitos para ler o Brasil.</p>
    <ul class="rodape__links">
      <li><a href="/biblioteca">Biblioteca</a></li>
      <li><a href="/trilhas">Trilhas</a></li>
      <li><a href="/conceitos">Conceitos</a></li>
      <li><a href="/sobre">Sobre nós</a></li>
      <li><a href="/creditos">Créditos das imagens</a></li>
    </ul>
    <a class="rodape__subir" href="#conteudo">Voltar ao topo</a>
  </div>
  <p class="rodape__nome" aria-hidden="true">Marginália<span class="ast">*</span></p>
  <p class="rodape__meta">Fotografias históricas em domínio público, do fundo Correio da Manhã (Arquivo Nacional) e do Wikimedia Commons. Capas tipográficas criadas pela Marginália.${admin ? html` <a class="rodape__admin" href="/admin">Área administrativa</a>` : ''}</p>
</footer>
<nav class="barra" aria-label="Atalhos">
  ${BARRA.map(([href, rotulo, icone]) => html`<a class="barra__item" href="${href}"${href === '/' ? (caminho === '/' ? raw(' aria-current="page"') : '') : ativo(href)}>${raw(ICONES[icone])}<span>${rotulo}</span></a>`)}
</nav>
<div class="anuncio" role="status" aria-live="polite" data-anuncio></div>
</body>
</html>`;
}
