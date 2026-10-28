import { html, raw } from '../lib/html.js';
import { livros } from '../content/catalog.js';
import { EIXOS, TIPOS_REFERENCIA, STATUS_PERSONALIDADE } from '../content/personalidades.js';
import { resolverReferencia, dataLegivel } from '../lib/personalidades.js';
import { avisoErros } from './parts.js';
import { navAdmin } from './adminPercursos.js';

const sel = (cond) => (cond ? raw(' selected') : '');
const marc = (cond) => (cond ? raw(' checked') : '');

function campoTexto({ nome, rotulo, valor = '', erro, dica, tipo = 'text', obrigatorio = false, area = false }) {
  const ids = [dica ? `dica-${nome}` : '', erro ? `erro-${nome}` : ''].filter(Boolean).join(' ');
  const attrs = raw(`${obrigatorio ? ' required' : ''}${erro ? ' aria-invalid="true"' : ''}${ids ? ` aria-describedby="${ids}"` : ''}`);
  return html`<div class="campo${erro ? ' campo--erro' : ''}">
    <label for="campo-${nome}">${rotulo}</label>
    ${dica ? html`<p class="campo__dica" id="dica-${nome}">${dica}</p>` : ''}
    ${area
      ? html`<textarea id="campo-${nome}" name="${nome}" rows="4"${attrs}>${valor}</textarea>`
      : html`<input id="campo-${nome}" name="${nome}" type="${tipo}" value="${valor}"${attrs}>`}
    ${erro ? html`<p class="campo__erro" id="erro-${nome}">${erro}</p>` : ''}
  </div>`;
}

function campoSelect({ nome, rotulo, opcoes, valor, erro, dica }) {
  return html`<div class="campo${erro ? ' campo--erro' : ''}">
    <label for="campo-${nome}">${rotulo}</label>
    ${dica ? html`<p class="campo__dica" id="dica-${nome}">${dica}</p>` : ''}
    <select id="campo-${nome}" name="${nome}"${erro ? raw(' aria-invalid="true"') : ''}${erro || dica ? html` aria-describedby="${[dica ? `dica-${nome}` : '', erro ? `erro-${nome}` : ''].filter(Boolean).join(' ')}"` : ''}>
      ${opcoes.map(([v, r]) => html`<option value="${v}"${sel(valor === v)}>${r}</option>`)}
    </select>
    ${erro ? html`<p class="campo__erro" id="erro-${nome}">${erro}</p>` : ''}
  </div>`;
}

export function adminLista({ pessoas, erros = {}, valores = {} }) {
  return html`
<section class="cabeca-pagina" aria-labelledby="titulo-admin">
  <p class="cabeca-pagina__margem">Área administrativa. Perfis em “confirmar identidade” ou rascunho não aparecem no site.</p>
  <h1 id="titulo-admin" class="titulo-pagina titulo-pagina--medio">Personalidades</h1>
</section>
<div class="admin">
  ${navAdmin('pessoas')}
  <table class="admin__tabela">
    <caption class="sr">Personalidades cadastradas</caption>
    <thead><tr><th scope="col">Nome</th><th scope="col">Situação</th><th scope="col">Referências publicadas</th><th scope="col">Em rascunho</th><th scope="col">Eixos</th><th scope="col"><span class="sr">Ações</span></th></tr></thead>
    <tbody>
      ${pessoas.map((p) => html`<tr>
        <th scope="row">${p.nome}</th>
        <td><span class="situacao situacao--${p.status}">${STATUS_PERSONALIDADE[p.status]}</span></td>
        <td>${p.referencias.filter((r) => r.status === 'publicado').length}</td>
        <td>${p.referencias.filter((r) => r.status !== 'publicado').length}</td>
        <td>${p.eixos.map((e) => EIXOS[e]).join(', ') || '—'}</td>
        <td><a href="/admin/personalidades/${p.slug}">Editar<span class="sr"> ${p.nome}</span></a></td>
      </tr>`)}
    </tbody>
  </table>

  <form class="admin__nova" method="post" action="/admin/personalidades" novalidate>
    <h2>Nova personalidade</h2>
    <p>Entra como rascunho. Complete o perfil e as fontes antes de publicar.</p>
    ${avisoErros(erros)}
    ${campoTexto({ nome: 'nome', rotulo: 'Nome', valor: valores.nome, erro: erros.nome, obrigatorio: true })}
    <button class="botao" type="submit">Criar rascunho</button>
  </form>
</div>`;
}

export function adminEditar({ pessoa, errosPerfil = {}, errosRef = {}, valoresRef = {}, aviso = '' }) {
  const refs = pessoa.referencias.map((r) => resolverReferencia(r, pessoa));
  const ordenados = [...livros].sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
  return html`
<section class="cabeca-pagina" aria-labelledby="titulo-editar">
  <p class="cabeca-pagina__margem"><a href="/admin/personalidades">← Todas as personalidades</a>${pessoa.status === 'publicado' ? html` · <a href="/personalidades/${pessoa.slug}">Ver no site</a>` : ''}</p>
  <h1 id="titulo-editar" class="titulo-pagina titulo-pagina--medio">${pessoa.nome}</h1>
</section>
${aviso ? html`<p class="aviso" role="status">${aviso}</p>` : ''}
${pessoa.notaInterna ? html`<p class="admin__nota"><strong>Nota interna:</strong> ${pessoa.notaInterna}</p>` : ''}
<div class="admin admin--editar">
  <form class="admin__perfil" method="post" action="/admin/personalidades/${pessoa.slug}" novalidate>
    <h2>Perfil</h2>
    ${avisoErros(errosPerfil)}
    ${campoTexto({ nome: 'nome', rotulo: 'Nome', valor: pessoa.nome, erro: errosPerfil.nome, obrigatorio: true })}
    ${campoTexto({ nome: 'papel', rotulo: 'Papel', valor: pessoa.papel, erro: errosPerfil.papel, dica: 'Curto: “Rapper e compositor”.' })}
    ${campoTexto({ nome: 'descricao', rotulo: 'Descrição', valor: pessoa.descricao, erro: errosPerfil.descricao, area: true, dica: 'Só fatos verificáveis. Nada de recomendações aqui: elas entram como referências, com fonte.' })}
    <fieldset class="campo${errosPerfil.eixos ? ' campo--erro' : ''}">
      <legend>Eixos editoriais</legend>
      <p class="campo__dica">Temas para organizar a descoberta, não afirmações sobre o que a pessoa recomendou.</p>
      <div class="admin__eixos">
        ${Object.entries(EIXOS).map(([k, v]) => html`<label class="etiqueta-opcao"><input type="checkbox" name="eixos" value="${k}"${marc(pessoa.eixos.includes(k))}><span>${v}</span></label>`)}
      </div>
      ${errosPerfil.eixos ? html`<p class="campo__erro">${errosPerfil.eixos}</p>` : ''}
    </fieldset>
    ${campoSelect({ nome: 'status', rotulo: 'Situação', opcoes: Object.entries(STATUS_PERSONALIDADE), valor: pessoa.status, erro: errosPerfil.status, dica: 'Só “Publicado” aparece no site.' })}
    <button class="botao" type="submit">Salvar perfil</button>
  </form>

  <section class="admin__refs" aria-labelledby="refs-titulo">
    <h2 id="refs-titulo">Referências</h2>
    ${refs.length
      ? html`<ul class="admin__lista-refs">
          ${refs.map((r) => html`<li>
            <p class="carimbo${r.tipo === 'curadoria' ? ' carimbo--curadoria' : ''}">${r.rotuloTexto}</p>
            <p><strong>${r.livroObj ? r.livroObj.titulo : r.obra?.titulo}</strong>${r.livroObj ? '' : html` — ${r.obra?.autor}`}</p>
            <p class="admin__ref-ctx">${r.contexto}</p>
            <p class="admin__ref-fonte">${r.fonte ? html`${r.fonte.veiculo}${r.fonte.data ? ` · ${dataLegivel(r.fonte.data)}` : ''} · <a href="${r.fonte.url}" rel="noopener">${r.fonte.titulo}</a>` : 'Sem fonte externa (curadoria).'}${r.verificacao === 'secundaria' ? ' · fonte secundária' : ''}</p>
            <p class="admin__ref-status">Situação: <strong>${r.status === 'publicado' ? 'publicada' : 'rascunho'}</strong></p>
            <form method="post" action="/admin/personalidades/${pessoa.slug}/referencias/${r.id}" class="admin__ref-acoes">
              ${r.status === 'publicado'
                ? html`<button class="botao botao--pequeno botao--contorno" name="acao" value="despublicar">Tirar do site</button>`
                : html`<button class="botao botao--pequeno" name="acao" value="publicar">Publicar</button>`}
              <button class="link" name="acao" value="remover">Remover<span class="sr"> referência ${r.livroObj ? r.livroObj.titulo : r.obra?.titulo}</span></button>
            </form>
          </li>`)}
        </ul>`
      : html`<p>Nenhuma referência ainda.</p>`}

    <form class="admin__nova-ref" method="post" action="/admin/personalidades/${pessoa.slug}/referencias" novalidate id="nova-referencia">
      <h3>Nova referência</h3>
      <p class="campo__dica">Entra como rascunho. Não registre letras de música nem interpretações de fãs como recomendação literária.</p>
      ${avisoErros(errosRef)}
      ${campoSelect({ nome: 'tipo', rotulo: 'Tipo de associação', opcoes: [['', 'Escolha…'], ...Object.entries(TIPOS_REFERENCIA)], valor: valoresRef.tipo || '', erro: errosRef.tipo, dica: 'Use “Indicação explícita” só quando a pessoa recomendou o livro com essas palavras.' })}
      ${campoTexto({ nome: 'rotulo', rotulo: 'Rótulo contextual', valor: valoresRef.rotulo, erro: errosRef.rotulo, dica: 'Só para o tipo contextual. Ex.: “Mencionado em podcast”.' })}
      ${campoSelect({ nome: 'livro', rotulo: 'Livro do catálogo', opcoes: [['', 'Fora do catálogo (preencher abaixo)'], ...ordenados.map((l) => [l.slug, l.titulo])], valor: valoresRef.livro || '', erro: errosRef.livro })}
      <div class="admin__duplo">
        ${campoTexto({ nome: 'obraTitulo', rotulo: 'Título (obra fora do catálogo)', valor: valoresRef.obraTitulo })}
        ${campoTexto({ nome: 'obraAutor', rotulo: 'Autor (obra fora do catálogo)', valor: valoresRef.obraAutor, erro: errosRef.obraAutor })}
      </div>
      ${campoTexto({ nome: 'contexto', rotulo: 'Contexto', valor: valoresRef.contexto, erro: errosRef.contexto, area: true, dica: 'Por que este livro está ligado à pessoa? O que exatamente foi dito, onde e quando.' })}
      <div class="admin__duplo">
        ${campoTexto({ nome: 'fonteVeiculo', rotulo: 'Veículo ou canal da fonte', valor: valoresRef.fonteVeiculo, erro: errosRef.fonteVeiculo })}
        ${campoTexto({ nome: 'fonteData', rotulo: 'Data da fonte', valor: valoresRef.fonteData, erro: errosRef.fonteData, dica: 'AAAA-MM-DD' })}
      </div>
      ${campoTexto({ nome: 'fonteTitulo', rotulo: 'Título da fonte', valor: valoresRef.fonteTitulo, erro: errosRef.fonteTitulo })}
      ${campoTexto({ nome: 'fonteUrl', rotulo: 'Link da fonte', tipo: 'url', valor: valoresRef.fonteUrl, erro: errosRef.fonteUrl, dica: 'Obrigatório, exceto em curadoria.' })}
      ${campoSelect({ nome: 'verificacao', rotulo: 'Verificação', opcoes: [['direta', 'Conferida na fonte original'], ['secundaria', 'Fonte secundária (reproduz outra)']], valor: valoresRef.verificacao || 'direta', erro: errosRef.verificacao })}
      ${campoTexto({ nome: 'notaVerificacao', rotulo: 'Nota de verificação (opcional)', valor: valoresRef.notaVerificacao, dica: 'Aparece no site junto da fonte quando ela é secundária.' })}
      <button class="botao" type="submit">Adicionar como rascunho</button>
    </form>
  </section>
</div>`;
}
