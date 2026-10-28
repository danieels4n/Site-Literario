import { readFileSync, readdirSync } from 'node:fs';
import { html } from '../lib/html.js';

export function naoEncontrado() {
  return html`<section class="erro-pagina" aria-labelledby="erro-titulo">
    <p class="erro-pagina__codigo" aria-hidden="true">404</p>
    <h1 id="erro-titulo">Esta página foi arrancada do caderno</h1>
    <p>O endereço pode estar errado ou o conteúdo mudou de lugar.</p>
    <p class="acoes"><a class="botao" href="/biblioteca">Ir para a biblioteca</a> <a class="link-forte" href="/">Voltar à capa</a></p>
  </section>`;
}

export function erroServidor() {
  return html`<section class="erro-pagina" aria-labelledby="erro-titulo">
    <p class="erro-pagina__codigo" aria-hidden="true">500</p>
    <h1 id="erro-titulo">Algo deu errado do nosso lado</h1>
    <p>Tente de novo em instantes. Se continuar, avise quem cuida da Marginália.</p>
    <p class="acoes"><a class="botao" href="/">Voltar à capa</a></p>
  </section>`;
}

export function creditos(caminhoCreditos, retratos = []) {
  let lista = [];
  try {
    const dados = JSON.parse(readFileSync(caminhoCreditos, 'utf8'));
    const usados = new Set(readdirSync(new URL('../public/img/', import.meta.url)));
    lista = (Array.isArray(dados) ? dados : []).filter((c) => usados.has(String(c.file).split('/').pop()));
  } catch {
    lista = [];
  }
  return html`<section class="cabeca-pagina" aria-labelledby="titulo-creditos">
    <p class="cabeca-pagina__margem">Fotografias e capas históricas vêm de acervos abertos; retratos de personalidades, do Wikimedia Commons, com a licença indicada. As capas tipográficas são criações da Marginália e não reproduzem edições comerciais.</p>
    <h1 id="titulo-creditos" class="titulo-pagina titulo-pagina--medio">Créditos das imagens</h1>
  </section>
  <section class="creditos" aria-label="Lista de créditos">
    <ol>
      ${lista.map((c) => html`<li>
        <span class="creditos__titulo">${c.title}${c.date ? `, ${String(c.date).slice(0, 4)}` : ''}</span>
        <span class="creditos__licenca">${c.licenseCode === 'pd' ? 'Domínio público' : c.license} · via ${c.via || 'Wikimedia Commons'}</span>
        ${c.page ? html`<a href="${c.page}" rel="noopener">Ver na fonte<span class="sr"> (${c.title})</span></a>` : ''}
      </li>`)}
      ${retratos.map((p) => html`<li>
        <span class="creditos__titulo">Retrato de ${p.nome}, por ${p.retrato.credito}</span>
        <span class="creditos__licenca">${p.retrato.licenca} · via ${p.retrato.via || 'Wikimedia Commons'}</span>
        ${p.retrato.url ? html`<a href="${p.retrato.url}" rel="noopener">Ver na fonte<span class="sr"> (retrato de ${p.nome})</span></a>` : ''}
      </li>`)}
    </ol>
  </section>`;
}
