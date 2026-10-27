import { html, raw } from '../lib/html.js';
import { livros, trilhas, conceitos } from '../content/catalog.js';

const NAV = [
  ['/biblioteca', 'Biblioteca'],
  ['/trilhas', 'Trilhas'],
  ['/autores', 'Autores'],
  ['/personalidades', 'Quem lê'],
  ['/sobre', 'Sobre nós'],
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
<meta name="viewport" content="width=device-width, initial-scale=1">
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
  <button class="topo__menu" type="button" aria-expanded="false" aria-controls="menu-principal">Menu</button>
  <nav class="topo__nav" id="menu-principal" aria-label="Principal">
    <ul class="topo__links">
      ${NAV.map(([href, rotulo]) => html`<li><a href="${href}"${ativo(href)}>${rotulo}</a></li>`)}
    </ul>
    <div class="topo__conta">
      ${usuario
        ? html`<a href="/estante"${ativo('/estante')}>Minha estante</a>
          <form method="post" action="/sair" class="topo__sair"><button type="submit" class="link">Sair</button></form>`
        : html`<a href="/entrar"${ativo('/entrar')}>Entrar</a>
          <a class="botao botao--pequeno" href="/cadastro">Criar conta</a>`}
    </div>
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
<div class="anuncio" role="status" aria-live="polite" data-anuncio></div>
</body>
</html>`;
}
