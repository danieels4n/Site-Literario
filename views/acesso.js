// Acesso aos livros: ler grátis (domínio público) e encontrar para comprar, novo ou usado.
// Não mostramos preços: eles mudam todo dia e exigiriam integração com as lojas.
// Os links abrem buscas nas lojas; a Marginália não recebe comissão.
import { html } from '../lib/html.js';
import { dominioPublico, nomesAutores } from './parts.js';

export function linksBusca(titulo, autor) {
  const q = encodeURIComponent(`${titulo} ${autor}`.trim());
  return [
    { rotulo: 'Usados em sebos', detalhe: 'Estante Virtual', url: `https://www.estantevirtual.com.br/busca?q=${q}` },
    { rotulo: 'Comparar preços', detalhe: 'Buscapé', url: `https://www.buscape.com.br/search?q=${q}%20livro` },
    { rotulo: 'Novo', detalhe: 'Amazon', url: `https://www.amazon.com.br/s?k=${q}&i=stripbooks` },
  ];
}

// Bloco completo na página do livro.
export function acessoLivro(livro) {
  const dp = dominioPublico(livro);
  const busca = linksBusca(livro.titulo, nomesAutores(livro));
  return html`<section class="acesso" aria-labelledby="acesso-titulo" data-reveal>
    <h2 id="acesso-titulo" class="subtitulo">Ler e conseguir este livro</h2>
    ${livro.gratis
      ? html`<div class="acesso__gratis">
          <p class="acesso__selo">Grátis e legal</p>
          <p>Em domínio público no Brasil. O texto integral está no ${livro.gratis.fonte}, a biblioteca livre da Wikimedia, onde você pode ler online ou baixar o livro digital (PDF ou EPUB).</p>
          <p><a class="botao" href="${livro.gratis.url}" rel="noopener">Ler grátis no ${livro.gratis.fonte}</a></p>
        </div>`
      : dp
        ? html`<p class="acesso__nota">Esta obra está em domínio público no Brasil, mas ainda não indicamos uma edição digital gratuita conferida. Procure em bibliotecas públicas e acervos digitais.</p>`
        : ''}
    <div class="acesso__compra">
      <p class="acesso__rotulo">${livro.gratis ? 'Prefere em papel?' : 'Onde encontrar'}</p>
      <ul class="acesso__links">
        ${busca.map((b) => html`<li><a href="${b.url}" rel="noopener nofollow"><strong>${b.rotulo}</strong> <span>${b.detalhe}</span></a></li>`)}
      </ul>
      <p class="acesso__nota">Os links abrem buscas nas lojas; os preços mudam todo dia e a Marginália não recebe comissão. Bibliotecas públicas e escolares emprestam de graça: vale perguntar pelo título.</p>
    </div>
  </section>`;
}

// Versão compacta para obras fora do acervo, nas referências das personalidades.
export function acessoCompacto(titulo, autor) {
  return html`<p class="recorte__acesso">Encontrar: ${linksBusca(titulo, autor).map((b, i) => html`${i ? ' · ' : ''}<a href="${b.url}" rel="noopener nofollow">${b.rotulo.toLowerCase()}<span class="sr"> de ${titulo}</span></a>`)}</p>`;
}
