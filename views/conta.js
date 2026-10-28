import { html } from '../lib/html.js';
import { livros, trilhas, livroPorSlug, fotos } from '../content/catalog.js';
import { avisoErros, campo, foto, itemLivro, barraProgresso } from './parts.js';
import { progressoTrilha } from './trilhas.js';

function moldura(conteudo, figura) {
  return html`<div class="ficha-leitor">
    <div class="ficha-leitor__foto" data-reveal>${figura}</div>
    <div class="ficha-leitor__form">${conteudo}</div>
  </div>`;
}

export function entrar({ valores = {}, erros = {}, volta = '' }) {
  return moldura(
    html`<h1 class="ficha-leitor__titulo">Entrar</h1>
    <p class="ficha-leitor__intro">Volte para a sua estante: livros marcados, leituras em andamento e trilhas.</p>
    ${avisoErros(erros)}
    <form method="post" action="/entrar" novalidate data-form-conta>
      <input type="hidden" name="volta" value="${volta}">
      ${campo({ nome: 'email', rotulo: 'E-mail', tipo: 'email', valor: valores.email || '', erro: erros.email, autocomplete: 'email' })}
      ${campo({ nome: 'senha', rotulo: 'Senha', tipo: 'password', erro: erros.senha, autocomplete: 'current-password' })}
      <button class="botao" type="submit">Entrar</button>
    </form>
    <p class="ficha-leitor__troca">Ainda não tem conta? <a href="/cadastro${volta ? `?volta=${encodeURIComponent(volta)}` : ''}">Criar conta</a></p>`,
    foto(fotos.gabinete, { carregar: 'eager' })
  );
}

export function cadastro({ valores = {}, erros = {}, volta = '' }) {
  return moldura(
    html`<h1 class="ficha-leitor__titulo">Criar conta</h1>
    <p class="ficha-leitor__intro">A ficha de leitor é grátis. Com ela você marca livros com asterisco, registra o que leu e acompanha as trilhas.</p>
    ${avisoErros(erros)}
    <form method="post" action="/cadastro" novalidate data-form-conta>
      <input type="hidden" name="volta" value="${volta}">
      ${campo({ nome: 'nome', rotulo: 'Como quer ser chamado', valor: valores.nome || '', erro: erros.nome, autocomplete: 'name', extra: ' maxlength="60"' })}
      ${campo({ nome: 'email', rotulo: 'E-mail', tipo: 'email', valor: valores.email || '', erro: erros.email, autocomplete: 'email' })}
      ${campo({ nome: 'senha', rotulo: 'Senha', tipo: 'password', erro: erros.senha, autocomplete: 'new-password', dica: 'Pelo menos 8 caracteres.', extra: ' minlength="8"' })}
      <button class="botao" type="submit">Criar conta</button>
    </form>
    <p class="ficha-leitor__troca">Já tem conta? <a href="/entrar${volta ? `?volta=${encodeURIComponent(volta)}` : ''}">Entrar</a></p>`,
    foto(fotos.carolinaAssinando, { carregar: 'eager' })
  );
}

export function estantePagina({ usuario, estante, percursos = '' }) {
  const itens = Object.entries(estante)
    .map(([slug, e]) => ({ livro: livroPorSlug.get(slug), e }))
    .filter((x) => x.livro)
    .sort((a, b) => String(b.e.atualizadoEm).localeCompare(String(a.e.atualizadoEm)));
  const lendo = itens.filter((x) => x.e.status === 'lendo');
  const quero = itens.filter((x) => x.e.status === 'quero-ler');
  const lidos = itens.filter((x) => x.e.status === 'lido');
  const asteriscos = itens.filter((x) => x.e.asterisco);
  const trilhasAtivas = trilhas.map((t) => ({ t, p: progressoTrilha(t, estante) })).filter((x) => x.p.lidos || x.p.iniciados);

  const grupo = (id, titulo, lista, vazio) => html`<section class="estante__grupo" aria-labelledby="${id}">
    <h2 id="${id}">${titulo} <span class="estante__conta">${lista.length}</span></h2>
    ${lista.length
      ? html`<div class="estante__lista">${lista.map((x) => itemLivro(x.livro, { estado: x.e, nivelTitulo: 'h3' }))}</div>`
      : html`<p class="estante__vazio">${vazio}</p>`}
  </section>`;

  return html`
<section class="cabeca-pagina cabeca-pagina--estante" aria-labelledby="titulo-estante">
  <p class="cabeca-pagina__margem">Ficha de ${usuario.nome}. ${lidos.length} ${lidos.length === 1 ? 'livro lido' : 'livros lidos'}, ${lendo.length} em leitura, ${asteriscos.length} com asterisco.</p>
  <h1 id="titulo-estante" class="titulo-pagina">Minha estante</h1>
</section>
${percursos}

${!itens.length
  ? html`<div class="vazio vazio--grande">
      <p class="vazio__titulo">Sua estante ainda está vazia.</p>
      <p>Abra a página de um livro e marque com <span class="ast">*</span> ou registre sua leitura. Se não sabe por onde começar, monte um percurso de leitura ou escolha uma pergunta nas trilhas.</p>
      <p class="acoes"><a class="botao" href="/comecar">Por onde começar?</a> <a class="link-forte" href="/trilhas">Ver as trilhas</a> <a class="link-forte" href="/biblioteca">Explorar a biblioteca</a></p>
    </div>`
  : html`
    ${lendo.length
      ? html`<section class="estante__lendo" aria-labelledby="lendo">
          <h2 id="lendo">Lendo agora</h2>
          <ul>
            ${lendo.map((x) => html`<li>
              <a href="/livros/${x.livro.slug}" class="estante__lendo-titulo">${x.livro.titulo}</a>
              <span class="estante__lendo-pct">${x.e.progresso}%</span>
              ${barraProgresso(x.e.progresso, `Progresso em ${x.livro.titulo}`)}
            </li>`)}
          </ul>
        </section>`
      : ''}
    ${trilhasAtivas.length
      ? html`<section class="estante__trilhas" aria-labelledby="em-trilhas">
          <h2 id="em-trilhas">Suas trilhas</h2>
          <ul class="lista-perguntas">
            ${trilhasAtivas.map(({ t, p }) => html`<li data-cor="${t.cor}"><a href="/trilhas/${t.slug}">${t.pergunta}</a> <span>${p.lidos} de ${p.total} lidos</span></li>`)}
          </ul>
        </section>`
      : ''}
    ${grupo('asteriscos', 'Com asterisco', asteriscos.map((x) => x), 'Nenhum livro marcado com asterisco ainda.')}
    ${grupo('quero', 'Quero ler', quero, 'Nada na fila. Marque “Quero ler” na página de um livro.')}
    ${grupo('lidos', 'Lidos', lidos, 'Quando terminar um livro, marque “Lido” para ele aparecer aqui.')}
  `}
<p class="estante__total">A biblioteca tem ${livros.length} livros. <a href="/biblioteca">Procurar o próximo</a>.</p>`;
}
