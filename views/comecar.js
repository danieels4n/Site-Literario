// "Por onde começar?": questionário em três passos e página do percurso.
// Funciona sem JavaScript e sem conta: as escolhas viajam na URL.
import { html, raw } from '../lib/html.js';
import { TEMAS, NIVEIS } from '../content/catalog.js';
import { NAO_SEI, NAO_SEI_TEXTO, PONTOS, TEMPOS } from '../content/comecar.js';
import { consulta } from '../lib/percurso.js';
import { capa, nomesAutores, STATUS } from './parts.js';

const PASSOS = [
  ['temas', 'Temas'],
  ['nivel', 'Ponto de partida'],
  ['tempo', 'Ritmo'],
];
const marc = (c) => (c ? raw(' checked') : '');
const dataBr = (iso) => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : '');

export function nomeDosTemas(temas) {
  if (temas.includes(NAO_SEI)) return 'leituras de entrada';
  const nomes = temas.map((t) => TEMAS[t]).filter(Boolean);
  return nomes.length > 1 ? `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}` : nomes[0] || '';
}

// Campos escondidos que carregam as respostas dos outros passos.
function ocultos(e, exceto) {
  return html`${exceto !== 'temas' ? e.temas.map((t) => html`<input type="hidden" name="tema" value="${t}">`) : ''}
    ${exceto !== 'nivel' && e.nivel ? html`<input type="hidden" name="nivel" value="${e.nivel}">` : ''}
    ${exceto !== 'tempo' && e.tempo ? html`<input type="hidden" name="tempo" value="${e.tempo}">` : ''}`;
}

function progresso(atual) {
  const i = PASSOS.findIndex(([k]) => k === atual);
  return html`<ol class="comecar__passos" aria-label="Passo ${i + 1} de ${PASSOS.length}">
    ${PASSOS.map(([k, r], j) => html`<li class="${j < i ? 'feito' : ''}"${j === i ? raw(' aria-current="step"') : ''}><span aria-hidden="true">${j + 1}</span> ${r}</li>`)}
  </ol>`;
}

// ---------- Abertura ----------
export function comecarAbertura() {
  return html`
<section class="comecar comecar--abertura" aria-labelledby="comecar-titulo">
  <p class="comecar__chapeu">Toda leitura deixa marcas<span class="ast" aria-hidden="true">*</span></p>
  <h1 id="comecar-titulo" class="comecar__titulo">Por onde começar?</h1>
  <p class="comecar__texto">Você não precisa conhecer tudo para começar a aprender. Escolha um assunto que desperta sua curiosidade e descubra um caminho de leitura feito para o seu momento.</p>
  <div class="acoes">
    <a class="botao" href="/comecar?passo=temas">Encontrar meu caminho</a>
    <a class="link-forte" href="/biblioteca">Explorar todos os temas</a>
  </div>
  <ul class="comecar__como" aria-label="Como funciona">
    <li><strong>Três perguntas rápidas.</strong> Tema, ponto de partida e ritmo. Dá para pular as duas últimas.</li>
    <li><strong>Um caminho em etapas.</strong> Das leituras de entrada às mais densas, explicando por que cada uma vem antes da outra.</li>
    <li><strong>Sem cadastro.</strong> O percurso aparece na hora. A conta só serve se você quiser salvar o progresso.</li>
  </ul>
</section>`;
}

// ---------- Passo 1: temas ----------
export function passoTemas({ e, temas, erro = '' }) {
  return html`
<section class="comecar" aria-labelledby="passo-titulo">
  ${progresso('temas')}
  <form class="comecar__form" method="get" action="/comecar" novalidate>
    <input type="hidden" name="passo" value="nivel">
    ${ocultos(e, 'temas')}
    <fieldset class="comecar__pergunta"${erro ? raw(' aria-describedby="passo-erro"') : ''}>
      <legend><span id="passo-titulo" class="comecar__titulo comecar__titulo--passo">O que você quer entender?</span></legend>
      <p class="comecar__texto">Escolha um ou mais assuntos. Não precisa acertar: dá para trocar depois.</p>
      ${erro ? html`<p class="comecar__erro" id="passo-erro" role="alert">${erro}</p>` : ''}
      <div class="escolhas">
        ${temas.map((t) => html`<label class="escolha">
          <input type="checkbox" name="tema" value="${t.chave}"${marc(e.temas.includes(t.chave))}>
          <span class="escolha__corpo">
            <span class="escolha__nome">${t.nome}</span>
            <span class="escolha__descricao">${t.descricao}</span>
            <span class="escolha__meta">${t.total === 1 ? '1 livro no acervo' : `${t.total} livros no acervo`}${t.total < 3 ? ' · em ampliação' : ''}</span>
          </span>
        </label>`)}
        <label class="escolha escolha--aberta">
          <input type="checkbox" name="tema" value="${NAO_SEI}"${marc(e.temas.includes(NAO_SEI))}>
          <span class="escolha__corpo">
            <span class="escolha__nome">${NAO_SEI_TEXTO.nome}</span>
            <span class="escolha__descricao">${NAO_SEI_TEXTO.descricao}</span>
          </span>
        </label>
      </div>
    </fieldset>
    <div class="comecar__acoes">
      <button class="botao" type="submit">Continuar</button>
      <a class="link-forte" href="/comecar">Voltar ao início</a>
    </div>
  </form>
</section>`;
}

// ---------- Passo 2: ponto de partida ----------
export function passoNivel({ e }) {
  return html`
<section class="comecar" aria-labelledby="passo-titulo">
  ${progresso('nivel')}
  <form class="comecar__form" method="get" action="/comecar">
    <input type="hidden" name="passo" value="tempo">
    ${ocultos(e, 'nivel')}
    <fieldset class="comecar__pergunta">
      <legend><span id="passo-titulo" class="comecar__titulo comecar__titulo--passo">Como você se sente diante de ${nomeDosTemas(e.temas)}?</span></legend>
      <p class="comecar__texto">Isto não é uma prova. A resposta só ajusta a profundidade e a ordem das leituras, e você pode mudar a qualquer momento.</p>
      <div class="escolhas escolhas--lista">
        ${Object.entries(PONTOS).map(([k, p]) => html`<label class="escolha">
          <input type="radio" name="nivel" value="${k}"${marc(e.nivel === k)}>
          <span class="escolha__corpo"><span class="escolha__nome">${p.rotulo}</span><span class="escolha__descricao">“${p.descricao}”</span></span>
        </label>`)}
      </div>
    </fieldset>
    <div class="comecar__acoes">
      <button class="botao" type="submit">Continuar</button>
      <button class="botao botao--contorno" type="submit" name="pular" value="nivel">Pular esta pergunta</button>
      <a class="link-forte" href="/comecar?${consulta(e, { passo: 'temas' })}">Voltar</a>
    </div>
  </form>
</section>`;
}

// ---------- Passo 3: ritmo (opcional) ----------
export function passoTempo({ e }) {
  return html`
<section class="comecar" aria-labelledby="passo-titulo">
  ${progresso('tempo')}
  <form class="comecar__form" method="get" action="/comecar/percurso">
    ${ocultos(e, 'tempo')}
    <fieldset class="comecar__pergunta">
      <legend><span id="passo-titulo" class="comecar__titulo comecar__titulo--passo">Quanto tempo você quer dedicar à leitura?</span></legend>
      <p class="comecar__texto">Opcional. Muda quantas leituras aparecem em cada etapa. Não calculamos prazos, porque cada pessoa lê de um jeito.</p>
      <div class="escolhas escolhas--lista">
        ${Object.entries(TEMPOS).map(([k, t]) => html`<label class="escolha">
          <input type="radio" name="tempo" value="${k}"${marc(e.tempo === k)}>
          <span class="escolha__corpo"><span class="escolha__nome">${t.rotulo}</span><span class="escolha__descricao">${t.descricao}</span></span>
        </label>`)}
      </div>
    </fieldset>
    <div class="comecar__acoes">
      <button class="botao" type="submit">Ver meu percurso</button>
      <button class="botao botao--contorno" type="submit" name="pular" value="tempo">Pular e ver o percurso</button>
      <a class="link-forte" href="/comecar?${consulta(e, { passo: 'nivel' })}">Voltar</a>
    </div>
  </form>
</section>`;
}

// ---------- Percurso ----------
function cartaoLivro(it, { e, usuario, estante, refs, volta }) {
  const l = it.livro;
  const st = estante[l.slug]?.status;
  const a = it.acesso;
  return html`<li class="reco" id="livro-${l.slug}">
    <a class="reco__capa" href="/livros/${l.slug}" tabindex="-1" aria-hidden="true">${capa(l, { classe: 'capa--mini' })}</a>
    <div class="reco__corpo">
      <p class="reco__meta">${l.genero} · ${NIVEIS[l.nivel]} · ${l.ano}</p>
      <h4 class="reco__titulo"><a href="/livros/${l.slug}">${l.titulo}</a></h4>
      <p class="reco__autor">${nomesAutores(l)}</p>
      <p class="reco__linha">${l.linha}</p>
      <div class="reco__porque">
        <p><strong>Por que nesta etapa:</strong> ${it.motivoEtapa}</p>
        <p>${it.motivoEditorial ? html`<span class="reco__selo">Nota da curadoria</span> ` : ''}${it.motivo}</p>
      </div>
      ${refs.length
        ? html`<ul class="reco__ligacoes">${refs.slice(0, 2).map((r) => html`<li>${r.rotuloTexto}: <a href="/personalidades/${r.pessoa.slug}">${r.pessoa.nome}</a></li>`)}</ul>`
        : ''}
      <p class="reco__acesso" data-tipo="${a.tipo}">${a.rotulo}${a.fonte ? ` · ${a.fonte}` : ''}${a.verificadoEm ? ` · link conferido em ${dataBr(a.verificadoEm)}` : ''}</p>
      <div class="reco__acoes">
        ${a.url
          ? html`<a class="botao botao--pequeno" href="${a.url}" rel="noopener">Ler grátis no ${a.fonte}</a>`
          : html`<a class="botao botao--pequeno botao--contorno" href="/livros/${l.slug}#acesso-titulo">Onde encontrar</a>`}
        <a class="link-forte" href="/livros/${l.slug}">Ver detalhes<span class="sr"> de ${l.titulo}</span></a>
      </div>
      ${usuario
        ? html`<form class="reco__leitura" method="post" action="/livros/${l.slug}/leitura">
            <input type="hidden" name="volta" value="${volta}#livro-${l.slug}">
            ${st ? html`<p class="reco__status">Na sua estante: <strong>${STATUS[st]}</strong></p>` : ''}
            ${st !== 'lendo' && st !== 'lido' ? html`<button class="link" type="submit" name="status" value="lendo">Comecei a ler<span class="sr"> ${l.titulo}</span></button>` : ''}
            ${st !== 'lido' ? html`<button class="link" type="submit" name="status" value="lido">Marcar como lido<span class="sr"> ${l.titulo}</span></button>` : ''}
          </form>`
        : ''}
      <a class="reco__tirar" href="/comecar/percurso?${consulta(e, { fora: [...e.fora, l.slug], outra: 0 })}">Tirar do percurso<span class="sr"> ${l.titulo}</span></a>
    </div>
  </li>`;
}

function antesDeContinuar(conceitos) {
  if (!conceitos?.length) return '';
  return html`<aside class="antes" aria-label="Antes de continuar">
    <p class="antes__titulo"><span class="ast" aria-hidden="true">*</span> Antes de continuar</p>
    <dl>
      ${conceitos.map((c) => html`<div><dt><a href="/conceitos/${c.slug}">${c.termo}</a></dt><dd>${c.definicao}</dd></div>`)}
    </dl>
  </aside>`;
}

export function percursoPagina({ e, p, usuario, estante = {}, refs = {}, salvo = null, temasPublicados = [] }) {
  const q = consulta(e);
  const volta = `/comecar/percurso?${q}`;
  const titulo = nomeDosTemas(p.naoSei ? [NAO_SEI] : p.temas);
  const unico = !p.naoSei && p.temas.length === 1 ? p.temas[0] : '';
  const nivelAtual = e.nivel || 'basico';

  return html`
<header class="percurso-cabeca" aria-labelledby="percurso-titulo">
  <p class="comecar__chapeu">Seu percurso</p>
  <h1 id="percurso-titulo" class="comecar__titulo">Por onde começar: <span class="sublinhado">${titulo}</span></h1>
  <p class="comecar__texto">Uma orientação editorial, não uma regra. Pule etapas, volte, troque de leitura: o caminho é seu.</p>

  <dl class="percurso-escolhas">
    <div><dt>Tema</dt><dd>${titulo} <a href="/comecar?${consulta(e, { passo: 'temas', fora: [], outra: 0 })}">Trocar tema</a></dd></div>
    <div><dt>Ponto de partida</dt><dd>${PONTOS[e.nivel]?.rotulo || 'Não informado (começamos pelo básico)'}</dd></div>
    <div><dt>Ritmo</dt><dd>${TEMPOS[e.tempo]?.rotulo || 'Não informado'} <a href="/comecar?${consulta(e, { passo: 'tempo' })}">Alterar</a></dd></div>
  </dl>

  <nav class="percurso-opcoes" aria-label="Mudar o nível">
    <p class="percurso-opcoes__rotulo">Mudar o nível</p>
    <ul class="etiquetas">
      ${Object.entries(PONTOS).map(([k, pt]) => html`<li><a class="etiqueta${nivelAtual === k ? ' etiqueta--ativa' : ''}" href="/comecar/percurso?${consulta(e, { nivel: k, outra: 0 })}"${nivelAtual === k ? raw(' aria-current="true"') : ''}>${pt.curto}</a></li>`)}
    </ul>
  </nav>
  ${p.totalGratis
    ? html`<nav class="percurso-opcoes" aria-label="Filtrar por acesso">
        <p class="percurso-opcoes__rotulo">Mostrar</p>
        <ul class="etiquetas">
          <li><a class="etiqueta${!e.modo ? ' etiqueta--ativa' : ''}" href="/comecar/percurso?${consulta(e, { modo: '' })}"${!e.modo ? raw(' aria-current="true"') : ''}>Percurso recomendado</a></li>
          <li><a class="etiqueta${e.modo ? ' etiqueta--ativa' : ''}" href="/comecar/percurso?${consulta(e, { modo: 'gratis', outra: 0 })}"${e.modo ? raw(' aria-current="true"') : ''}>Só leitura grátis (${p.totalGratis})</a></li>
        </ul>
      </nav>`
    : ''}

  <div class="percurso-acoes">
    ${usuario
      ? salvo
        ? html`<p class="percurso-salvo">Percurso salvo na <a href="/estante#percursos">sua estante</a>.</p>`
        : html`<form method="post" action="/comecar/salvar"><input type="hidden" name="consulta" value="${q}"><button class="botao" type="submit">Salvar este percurso</button></form>`
      : html`<p class="percurso-salvo">Quer guardar o percurso e marcar o que já leu? <a href="/entrar?volta=${encodeURIComponent(volta)}">Entre</a> ou <a href="/cadastro">crie uma conta grátis</a>. Não é obrigatório.</p>`}
    ${p.alternativas.length ? html`<a class="link-forte" href="/comecar/percurso?${consulta(e, { outra: e.outra + 1 })}">Ver outra combinação</a>` : ''}
    <a class="link-forte" href="/comecar">Recomeçar</a>
  </div>
</header>

${p.avisos.map((a) => html`<p class="percurso-aviso" role="status">${a}</p>`)}

${p.vazio
  ? html`<div class="vazio vazio--grande">
      <p class="vazio__titulo">${e.modo ? 'Nenhuma leitura grátis para essa combinação.' : 'Ainda não temos materiais para este percurso.'}</p>
      <p>${e.modo ? 'As obras deste tema ainda não estão em domínio público, ou o link gratuito está em revisão. O percurso completo mostra onde achar cada uma em sebos e bibliotecas.' : 'A curadoria deste tema está em ampliação. Enquanto isso, explore o que já existe no acervo ou escolha outro tema.'}</p>
      <p class="acoes">
        ${e.modo ? html`<a class="botao" href="/comecar/percurso?${consulta(e, { modo: '' })}">Ver o percurso completo</a>` : html`<a class="botao" href="/comecar?${consulta(e, { passo: 'temas' })}">Escolher outro tema</a>`}
        <a class="link-forte" href="/biblioteca${unico ? `?tema=${unico}` : ''}">Explorar a biblioteca</a>
      </p>
    </div>`
  : html`<ol class="percurso-etapas">
      ${p.etapas.map((et) => html`<li class="etapa-p" data-etapa="${et.chave}">
        <div class="etapa-p__cabeca">
          <span class="etapa-p__numero" aria-hidden="true">${et.numero}</span>
          <h2 class="etapa-p__titulo"><span class="sr">Etapa ${et.numero}: </span>${et.chave === 'comece' && et.revisao ? 'Para relembrar' : et.titulo}</h2>
          <p class="etapa-p__objetivo">${et.chave === 'comece' && et.revisao ? 'Você disse que já tem base. Antes das leituras densas, as palavras-chave do caminho, para conferir se estão claras.' : et.objetivo}</p>
          <p class="etapa-p__ponte">${et.ponte}</p>
        </div>
        ${antesDeContinuar(et.antes)}
        ${et.conceitos?.length
          ? html`<div class="vocabulario">
              <h3 class="vocabulario__titulo">Palavras para começar</h3>
              <ul>
                ${et.conceitos.map((c) => html`<li><a class="vocabulario__termo" href="/conceitos/${c.slug}">${c.termo}</a><p>${c.definicao}</p></li>`)}
              </ul>
            </div>`
          : ''}
        ${et.livros?.length
          ? html`<h3 class="sr">Leituras da etapa ${et.numero}</h3><ul class="recos">${et.livros.map((it) => cartaoLivro(it, { e, usuario, estante, refs: refs[it.livro.slug] || [], volta }))}</ul>`
          : ''}
        ${et.autores
          ? html`<ul class="autores-p">
              ${et.autores.map((a) => html`<li><a class="autores-p__nome" href="/autores/${a.slug}">${a.nome}</a><span class="autores-p__datas">${a.anos} · ${a.lugar}</span><p>${a.bio[0]}</p></li>`)}
            </ul>`
          : ''}
        ${et.trilhas
          ? html`<ul class="lista-perguntas">
              ${et.trilhas.map(({ trilha, emComum }) => html`<li data-cor="${trilha.cor}"><a href="/trilhas/${trilha.slug}">${trilha.pergunta}</a> <span>${emComum === 1 ? '1 livro deste percurso' : `${emComum} livros deste percurso`}</span></li>`)}
            </ul>`
          : ''}
      </li>`)}
    </ol>`}

${p.removidos.length
  ? html`<p class="percurso-removidos">Você tirou ${p.removidos.length === 1 ? '1 leitura' : `${p.removidos.length} leituras`} do percurso (${p.removidos.map((l) => l.titulo).join(', ')}). <a href="/comecar/percurso?${consulta(e, { fora: [] })}">Trazer de volta</a>.</p>`
  : ''}

${p.alternativas.length
  ? html`<section class="alternativas" aria-labelledby="alt-titulo">
      <h2 id="alt-titulo">Outras leituras sobre o tema</h2>
      <p>Também fazem parte deste assunto no acervo. Troque à vontade.</p>
      <ul>
        ${p.alternativas.slice(0, 8).map((l) => html`<li><a href="/livros/${l.slug}">${l.titulo}</a> <span>${nomesAutores(l)} · ${NIVEIS[l.nivel]}</span></li>`)}
      </ul>
      <p><a class="link-forte" href="/biblioteca${unico ? `?tema=${unico}` : ''}">Ver todos os materiais${unico ? ` de ${TEMAS[unico]}` : ''}</a></p>
    </section>`
  : ''}`;
}

// Bloco da estante: percursos salvos.
export function percursosSalvos(lista) {
  if (!lista.length) return '';
  return html`<section class="estante__percursos" id="percursos" aria-labelledby="percursos-titulo">
    <h2 id="percursos-titulo">Seus percursos</h2>
    <ul>
      ${lista.map((s) => html`<li>
        <a class="estante__percurso-titulo" href="${s.href}">${s.titulo}</a>
        <span>${s.lidos} de ${s.total} leituras lidas · salvo em ${dataBr(s.criadoEm)}</span>
        <form method="post" action="/comecar/percursos/${s.id}/remover"><button class="link" type="submit">Remover<span class="sr"> o percurso ${s.titulo}</span></button></form>
      </li>`)}
    </ul>
  </section>`;
}
