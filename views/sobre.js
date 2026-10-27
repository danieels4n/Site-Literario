import { html } from '../lib/html.js';
import { livros, trilhas, autores, conceitos, fotos } from '../content/catalog.js';
import { foto } from './parts.js';

export function sobre({ pessoas = 0, gratis = 0 }) {
  const numeros = [
    [livros.length, 'livros com ficha, contexto e temas', '/biblioteca'],
    [trilhas.length, 'trilhas guiadas por uma pergunta', '/trilhas'],
    [autores.length, 'autores com biografia e contexto', '/autores'],
    [conceitos.length, 'conceitos explicados sem jargão', '/conceitos'],
    [pessoas, 'perfis em Quem lê', '/personalidades'],
    [gratis, 'livros para ler de graça, em domínio público', '/biblioteca'],
  ];
  return html`
<section class="sobre-cabeca" aria-labelledby="titulo-sobre">
  <p class="sobre-cabeca__margem">Publicação independente de leitura e formação crítica.</p>
  <h1 id="titulo-sobre" class="titulo-pagina">Sobre nós</h1>
  <p class="sobre-cabeca__manifesto">Ler é escrever de volta no livro. A Marginália existe para que mais gente leia o Brasil com o lápis na mão, e para trazer ao centro quem a história deixou na margem.</p>
</section>

<section class="sobre-nome" aria-labelledby="sobre-nome-titulo">
  <div class="sobre-nome__texto" data-reveal>
    <h2 id="sobre-nome-titulo">O nome</h2>
    <p><strong>Marginália</strong> é o nome que se dá às anotações feitas na margem dos livros: o sublinhado, o ponto de interrogação, o asterisco ao lado de uma frase que mudou alguma coisa. É a marca de quem leu de verdade.</p>
    <p>A margem é também o lugar de quem ficou de fora: escritoras negras esquecidas por um século, a favela que escreveu o próprio diário, o sertão que a República massacrou. O nosso asterisco vermelho aponta para essas duas margens ao mesmo tempo.</p>
  </div>
  <div class="sobre-nome__foto" data-reveal>${foto(fotos.passeata)}</div>
</section>

<section class="sobre-numeros" aria-labelledby="sobre-numeros-titulo">
  <h2 id="sobre-numeros-titulo" data-reveal>O que você encontra aqui</h2>
  <ul>
    ${numeros.map(([n, rotulo, href]) => html`<li data-reveal><a href="${href}"><strong>${n}</strong><span>${rotulo}</span></a></li>`)}
  </ul>
</section>

<section class="sobre-metodo" aria-labelledby="sobre-metodo-titulo">
  <div class="sobre-metodo__intro" data-reveal>
    <h2 id="sobre-metodo-titulo">Como escolhemos e citamos</h2>
    <p>Toda ligação entre uma pessoa e um livro diz de onde vem. Nada de recomendação, citação, data ou link inventados. Letras de música e interpretações de fãs não viram “indicação”.</p>
  </div>
  <dl class="sobre-metodo__selos">
    <div data-reveal><dt><span class="carimbo">Indicado por…</span></dt><dd>A pessoa recomendou o livro com essas palavras, numa entrevista, vídeo ou publicação. Sempre com o link da fonte.</dd></div>
    <div data-reveal><dt><span class="carimbo">Mencionado em entrevista</span></dt><dd>O livro apareceu numa conversa, sem ser uma recomendação explícita.</dd></div>
    <div data-reveal><dt><span class="carimbo">Rótulo contextual</span></dt><dd>Outros vínculos verificáveis: uma obra escrita pela pessoa, um presente, a inspiração de um álbum, um projeto de lei.</dd></div>
    <div data-reveal><dt><span class="carimbo carimbo--curadoria">Na curadoria da Marginália</span></dt><dd>Escolha editorial da Marginália, separada das referências com fonte. Não é indicação da pessoa.</dd></div>
  </dl>
  <p class="sobre-metodo__nota" data-reveal><span class="ast" aria-hidden="true">*</span> Quando a fonte que encontramos só reproduz outra, avisamos que ela é secundária. Os eixos de cada perfil organizam a descoberta e não significam que a pessoa recomendou livros sobre esses temas.</p>
</section>

<section class="sobre-acesso" aria-labelledby="sobre-acesso-titulo">
  <h2 id="sobre-acesso-titulo" data-reveal>Ler não deveria depender de dinheiro</h2>
  <div class="sobre-acesso__colunas">
    <p data-reveal><strong>Grátis e legal.</strong> Quando uma obra está em domínio público, indicamos onde ler o texto integral de graça, com opção de baixar em PDF ou EPUB.</p>
    <p data-reveal><strong>Sem comissão.</strong> Os links para comprar abrem buscas em sebos, num comparador de preços e em livrarias. A Marginália não ganha nada com isso e não mostra preços que mudam todo dia.</p>
    <p data-reveal><strong>Biblioteca é de graça.</strong> Bibliotecas públicas e escolares emprestam livros sem custo. Vale perguntar pelo título antes de comprar.</p>
  </div>
</section>

<section class="sobre-fim" aria-labelledby="sobre-fim-titulo">
  <h2 id="sobre-fim-titulo" data-reveal>Por onde seguir</h2>
  <p class="acoes" data-reveal><a class="botao" href="/trilhas">Começar uma trilha</a> <a class="link-forte" href="/creditos">Ver os créditos das imagens</a></p>
</section>`;
}
