// Regras de "Quem inspira, o que lê": o que é público, rótulos, filtros e validação do admin.
import { livroPorSlug } from '../content/catalog.js';
import { EIXOS, TIPOS_REFERENCIA, STATUS_PERSONALIDADE, rotuloReferencia } from '../content/personalidades.js';

export const publicada = (p) => p.status === 'publicado';

// Referência pronta para exibir: rótulo, livro do catálogo (se houver) ou obra externa.
export function resolverReferencia(ref, pessoa) {
  return {
    ...ref,
    rotuloTexto: rotuloReferencia(ref, pessoa.nomeCurto || pessoa.nome),
    livroObj: ref.livro ? livroPorSlug.get(ref.livro) || null : null,
  };
}

export function referenciasPublicas(pessoa) {
  if (!publicada(pessoa)) return [];
  return pessoa.referencias.filter((r) => r.status === 'publicado').map((r) => resolverReferencia(r, pessoa));
}

export function personalidadesPublicas(db, { eixo } = {}) {
  return db.personalidades().filter((p) => publicada(p) && (!eixo || p.eixos.includes(eixo)));
}

// Livros do catálogo ligados a uma personalidade por referência publicada.
export function livrosDaPersonalidade(db, slug) {
  const p = db.personalidade(slug);
  if (!p) return new Set();
  return new Set(referenciasPublicas(p).filter((r) => r.livroObj).map((r) => r.livro));
}

// Para a página do livro: quem está associado a ele, e como.
export function referenciasDoLivro(db, livroSlug) {
  return personalidadesPublicas(db).flatMap((p) =>
    referenciasPublicas(p)
      .filter((r) => r.livro === livroSlug)
      .map((r) => ({ ...r, pessoa: p }))
  );
}

// Eixos que de fato aparecem em perfis publicados (para os filtros não mostrarem opções vazias).
export function eixosEmUso(db) {
  const usados = new Set(personalidadesPublicas(db).flatMap((p) => p.eixos));
  return Object.fromEntries(Object.entries(EIXOS).filter(([k]) => usados.has(k)));
}

// ---------- validação dos formulários do admin ----------
const URL_OK = (u) => {
  try {
    const x = new URL(u);
    return x.protocol === 'https:' || x.protocol === 'http:';
  } catch {
    return false;
  }
};
const DATA_OK = (d) => !d || /^\d{4}(-\d{2}(-\d{2})?)?$/.test(d);

export function validarPerfil(dados) {
  const erros = {};
  if (!dados.nome) erros.nome = 'Informe o nome.';
  if (!STATUS_PERSONALIDADE[dados.status]) erros.status = 'Escolha uma situação válida.';
  if (dados.eixos.some((e) => !EIXOS[e])) erros.eixos = 'Há um eixo desconhecido.';
  if (dados.status === 'publicado') {
    if (!dados.papel) erros.papel = 'Para publicar, descreva o papel (ex.: rapper e compositor).';
    if (!dados.descricao || dados.descricao.length < 40) erros.descricao = 'Para publicar, escreva uma descrição de pelo menos 40 caracteres.';
    if (!dados.eixos.length) erros.eixos = 'Para publicar, marque pelo menos um eixo.';
  }
  return erros;
}

export function validarReferencia(dados) {
  const erros = {};
  if (!TIPOS_REFERENCIA[dados.tipo]) erros.tipo = 'Escolha o tipo de associação.';
  if (dados.livro && !livroPorSlug.get(dados.livro)) erros.livro = 'Livro não encontrado no catálogo.';
  if (!dados.livro && !dados.obraTitulo) erros.livro = 'Escolha um livro do catálogo ou informe o título da obra.';
  if (!dados.livro && dados.obraTitulo && !dados.obraAutor) erros.obraAutor = 'Informe o autor da obra.';
  if (dados.tipo === 'contexto' && !dados.rotulo) erros.rotulo = 'O rótulo contextual é obrigatório para este tipo (ex.: “Mencionado em podcast”).';
  if (!dados.contexto || dados.contexto.length < 20) erros.contexto = 'Explique em pelo menos 20 caracteres por que o livro está associado à pessoa.';
  // Toda associação que não é escolha editorial precisa de fonte verificável.
  if (dados.tipo !== 'curadoria') {
    if (!dados.fonteUrl || !URL_OK(dados.fonteUrl)) erros.fonteUrl = 'Informe o link da fonte (começando com https://).';
    if (!dados.fonteTitulo) erros.fonteTitulo = 'Informe o título da fonte.';
    if (!dados.fonteVeiculo) erros.fonteVeiculo = 'Informe o veículo ou canal.';
  } else if (dados.fonteUrl && !URL_OK(dados.fonteUrl)) {
    erros.fonteUrl = 'O link precisa começar com https://.';
  }
  if (!DATA_OK(dados.fonteData)) erros.fonteData = 'Use o formato AAAA-MM-DD (ou só AAAA-MM, ou AAAA).';
  if (!['direta', 'secundaria'].includes(dados.verificacao)) erros.verificacao = 'Indique como a fonte foi verificada.';
  return erros;
}

export function referenciaDoFormulario(d) {
  return {
    livro: d.livro || null,
    obra: d.livro ? null : { titulo: d.obraTitulo, autor: d.obraAutor },
    tipo: d.tipo,
    rotulo: d.tipo === 'contexto' ? d.rotulo : '',
    contexto: d.contexto,
    fonte: d.fonteUrl ? { titulo: d.fonteTitulo, veiculo: d.fonteVeiculo, data: d.fonteData, url: d.fonteUrl } : null,
    verificacao: d.verificacao,
    notaVerificacao: d.notaVerificacao || '',
    status: 'rascunho',
  };
}

export const slugificar = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

export function dataLegivel(iso) {
  if (!iso) return '';
  const meses = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
  const [a, m, d] = iso.split('-').map(Number);
  if (d) return `${d} ${meses[m - 1]} ${a}`;
  if (m) return `${meses[m - 1]} ${a}`;
  return String(a);
}
