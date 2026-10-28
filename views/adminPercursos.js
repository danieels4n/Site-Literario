// Painel editorial do "Por onde começar?". Só administradores chegam aqui.
import { html, raw } from '../lib/html.js';
import { livros, TEMAS, NIVEIS } from '../content/catalog.js';
import { TEMAS_COMECAR } from '../content/comecar.js';
import { ETAPAS, ETAPAS_DE_LIVRO } from '../lib/percurso.js';
import { nomesAutores } from './parts.js';

const sel = (c) => (c ? raw(' selected') : '');
const dataBr = (iso) => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : '');
const ETAPA_PADRAO = { introdutorio: 'comece', intermediario: 'fundamentos', aprofundado: 'aprofundar' };

const navAdmin = (atual) => html`<nav class="admin__nav" aria-label="Seções do admin">
  <a href="/admin/personalidades"${atual === 'pessoas' ? raw(' aria-current="page"') : ''}>Personalidades</a>
  <a href="/admin/percursos"${atual === 'percursos' ? raw(' aria-current="page"') : ''}>Percursos e acesso</a>
</nav>`;

export function adminPercursos({ editorial = {}, acessos = {}, aviso = '' }) {
  const gratis = livros.filter((l) => l.gratis);
  return html`
<section class="cabeca-pagina" aria-labelledby="titulo-admin">
  <p class="cabeca-pagina__margem">Área administrativa. Os percursos são montados a partir do acervo; aqui a curadoria ajusta temas, etapas, ordem e justificativas, e revisa os links de leitura grátis.</p>
  <h1 id="titulo-admin" class="titulo-pagina titulo-pagina--medio">Percursos</h1>
</section>
<div class="admin">
  ${navAdmin('percursos')}
  ${aviso ? html`<p class="admin__aviso" role="status">${aviso}</p>` : ''}
  <section aria-labelledby="temas-titulo">
    <h2 id="temas-titulo" class="subtitulo">Temas do questionário</h2>
    <table class="admin__tabela">
      <thead><tr><th scope="col">Tema</th><th scope="col">Livros</th><th scope="col">Situação</th><th scope="col">Ajustes</th><th scope="col"><span class="sr">Ações</span></th></tr></thead>
      <tbody>
        ${Object.entries(TEMAS).map(([k, nome]) => {
          const ed = editorial[k] || {};
          const n = livros.filter((l) => l.temas.includes(k)).length;
          const ajustes = Object.values(ed.livros || {}).filter((a) => a.etapa || a.motivo || a.ordem).length;
          return html`<tr>
            <th scope="row">${nome}</th>
            <td>${n}</td>
            <td>${ed.publicado === false ? 'Fora do questionário' : 'Publicado'}</td>
            <td>${ajustes ? `${ajustes} livro(s)` : 'Automático'}</td>
            <td><a href="/admin/percursos/${k}">Editar<span class="sr"> ${nome}</span></a></td>
          </tr>`;
        })}
      </tbody>
    </table>
  </section>

  <section aria-labelledby="acessos-titulo">
    <h2 id="acessos-titulo" class="subtitulo">Links de leitura grátis</h2>
    <p class="admin__nota">Só obras em domínio público no Brasil, com texto em fonte legal. Abra o link, confira se a obra e a edição estão lá e registre. Um link marcado como indisponível deixa de ser oferecido no percurso e na página do livro.</p>
    <table class="admin__tabela">
      <thead><tr><th scope="col">Livro</th><th scope="col">Fonte</th><th scope="col">Última revisão</th><th scope="col"><span class="sr">Ações</span></th></tr></thead>
      <tbody>
        ${gratis.map((l) => {
          const r = acessos[l.slug];
          return html`<tr>
            <th scope="row">${l.titulo}</th>
            <td><a href="${l.gratis.url}" rel="noopener">${l.gratis.fonte}</a></td>
            <td>${r ? `${r.situacao === 'indisponivel' ? 'Indisponível' : 'Funcionando'} · ${dataBr(r.verificadoEm)}` : 'Ainda não revisado'}</td>
            <td><form method="post" action="/admin/acessos/${l.slug}" class="admin__ref-acoes">
              <button class="link" type="submit" name="situacao" value="ok">Conferi: funciona<span class="sr"> (${l.titulo})</span></button>
              <button class="link" type="submit" name="situacao" value="indisponivel">Marcar indisponível<span class="sr"> (${l.titulo})</span></button>
            </form></td>
          </tr>`;
        })}
      </tbody>
    </table>
  </section>
</div>`;
}

export function adminPercursoTema({ tema, editorial = {}, aviso = '' }) {
  const ed = editorial[tema] || {};
  const doTema = livros.filter((l) => l.temas.includes(tema));
  return html`
<section class="cabeca-pagina" aria-labelledby="titulo-admin">
  <p class="cabeca-pagina__margem"><a href="/admin/percursos">← Percursos</a>. Deixe “automática” para usar o nível do livro. O motivo aparece no cartão como “Nota da curadoria”; vazio, usamos o texto “Por que ler” da ficha.</p>
  <h1 id="titulo-admin" class="titulo-pagina titulo-pagina--medio">${TEMAS[tema]}</h1>
</section>
<div class="admin">
  ${navAdmin('percursos')}
  ${aviso ? html`<p class="admin__aviso" role="status">${aviso}</p>` : ''}
  <form method="post" action="/admin/percursos/${tema}" class="admin__form">
    <div class="campo campo--caixa">
      <label><input type="checkbox" name="publicado" value="1"${ed.publicado === false ? '' : raw(' checked')}> Mostrar este tema no questionário</label>
    </div>
    <div class="campo">
      <label for="campo-descricao">Descrição no cartão do tema</label>
      <p class="campo__dica" id="dica-descricao">Uma frase simples, sem jargão, fiel ao que o acervo tem. Vazio: “${TEMAS_COMECAR[tema]?.descricao || ''}”</p>
      <textarea id="campo-descricao" name="descricao" rows="2" maxlength="220" aria-describedby="dica-descricao">${ed.descricao || ''}</textarea>
    </div>
    <h2 class="subtitulo">Livros do tema (${doTema.length})</h2>
    ${doTema.map((l) => {
      const a = ed.livros?.[l.slug] || {};
      return html`<fieldset class="admin__livro">
        <legend>${l.titulo} <span>· ${nomesAutores(l)} · ${NIVEIS[l.nivel]}</span></legend>
        <div class="admin__linha">
          <div class="campo">
            <label for="etapa-${l.slug}">Etapa</label>
            <select id="etapa-${l.slug}" name="etapa:${l.slug}">
              <option value=""${sel(!a.etapa)}>Automática (${ETAPAS[ETAPA_PADRAO[l.nivel]].titulo})</option>
              ${ETAPAS_DE_LIVRO.map((k) => html`<option value="${k}"${sel(a.etapa === k)}>${ETAPAS[k].titulo}</option>`)}
              <option value="fora"${sel(a.etapa === 'fora')}>Fora do percurso deste tema</option>
            </select>
          </div>
          <div class="campo">
            <label for="ordem-${l.slug}">Ordem na etapa</label>
            <input id="ordem-${l.slug}" name="ordem:${l.slug}" type="number" min="1" max="99" inputmode="numeric" value="${a.ordem || ''}">
          </div>
        </div>
        <div class="campo">
          <label for="motivo-${l.slug}">Motivo da recomendação</label>
          <textarea id="motivo-${l.slug}" name="motivo:${l.slug}" rows="2" maxlength="400" placeholder="${l.porque}">${a.motivo || ''}</textarea>
        </div>
      </fieldset>`;
    })}
    <p class="acoes"><button class="botao" type="submit">Salvar o tema</button> <a class="link-forte" href="/comecar/percurso?tema=${tema}">Ver o percurso</a></p>
  </form>
</div>`;
}

export { navAdmin };
