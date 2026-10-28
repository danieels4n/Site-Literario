// "Por onde começar?": monta um percurso de leitura a partir da curadoria existente.
// Nada aqui inventa conteúdo: livros, conceitos, autores e trilhas vêm de content/catalog.js;
// a equipe editorial pode, no /admin/percursos, mudar a etapa de um livro, tirá-lo do percurso,
// escrever o motivo da recomendação e marcar um link de leitura grátis como indisponível.
import { livros, TEMAS, NIVEIS, livroPorSlug, autorPorSlug, conceitoPorSlug, trilhas } from '../content/catalog.js';
import { TEMAS_COMECAR, NAO_SEI, PONTOS, TEMPOS } from '../content/comecar.js';

export const ETAPAS = {
  comece: {
    titulo: 'Comece por aqui',
    objetivo: 'Apresentar o tema e o vocabulário essencial, com leituras de entrada.',
  },
  fundamentos: {
    titulo: 'Entenda as ideias fundamentais',
    objetivo: 'Ligar as ideias e acompanhar os argumentos centrais.',
  },
  autores: {
    titulo: 'Conheça os autores e os debates',
    objetivo: 'Saber quem escreveu, de onde e em que época: cada livro responde a um tempo e a outros livros.',
  },
  aprofundar: {
    titulo: 'Aprofunde a leitura',
    objetivo: 'Avançar para obras mais densas, agora com uma base mais sólida.',
  },
  realidade: {
    titulo: 'Conecte com a realidade',
    objetivo: 'Levar as ideias para perguntas concretas sobre o Brasil.',
  },
};

// Etapas onde um livro pode ser colocado pela curadoria.
export const ETAPAS_DE_LIVRO = ['comece', 'fundamentos', 'aprofundar'];
const ETAPA_PADRAO = { introdutorio: 'comece', intermediario: 'fundamentos', aprofundado: 'aprofundar' };

// Por que esta etapa vem antes da próxima (texto editorial, igual para todos os temas).
const PONTES = {
  comece: 'Antes de entrar nos textos mais densos, vale conhecer as palavras que organizam o debate. Assim você acompanha melhor os argumentos e formula suas próprias perguntas.',
  fundamentos: 'Com o vocabulário em mãos, estas leituras desenvolvem as ideias e mostram como elas se ligam. Elas preparam o terreno para as obras de fôlego.',
  autores: 'Livros não caem do céu: cada autor escreveu de um lugar e respondendo a outros livros. Conhecer essas pessoas ajuda a ler com mais desconfiança e mais prazer.',
  aprofundar: 'Estas obras pedem mais tempo e mais atenção. Elas aparecem por último porque ficam muito mais claras depois das etapas anteriores.',
  realidade: 'Ler é também olhar em volta. As trilhas abaixo partem de perguntas sobre o país e voltam a vários livros deste percurso.',
};

const MOTIVO_ETAPA = {
  comece: 'Uma leitura de entrada: apresenta o tema sem exigir que você conheça outros livros antes.',
  fundamentos: 'Desenvolve as ideias apresentadas na primeira etapa e ajuda a juntar as peças.',
  aprofundar: 'Uma obra mais densa, que rende mais depois que a base está montada.',
};

const lista = (v) => [...new Set((Array.isArray(v) ? v : [v]).filter(Boolean))];

// Lê as escolhas da URL. Valores desconhecidos são descartados.
export function lerEscolhas(params) {
  const temas = lista(params.getAll('tema')).filter((t) => t === NAO_SEI || TEMAS[t]);
  const nivel = PONTOS[params.get('nivel')] ? params.get('nivel') : '';
  const tempo = TEMPOS[params.get('tempo')] ? params.get('tempo') : '';
  const fora = lista((params.get('fora') || '').split(',')).filter((s) => livroPorSlug.has(s));
  const modo = params.get('modo') === 'gratis' ? 'gratis' : '';
  const outra = Math.max(0, Math.min(20, Number.parseInt(params.get('outra'), 10) || 0));
  return { temas, nivel, tempo, fora, modo, outra };
}

// Monta a query string a partir das escolhas (com mudanças).
export function consulta(e, mudanca = {}) {
  const n = { ...e, ...mudanca };
  const p = new URLSearchParams();
  for (const t of n.temas || []) p.append('tema', t);
  if (n.nivel) p.set('nivel', n.nivel);
  if (n.tempo) p.set('tempo', n.tempo);
  if (n.fora?.length) p.set('fora', n.fora.join(','));
  if (n.modo) p.set('modo', n.modo);
  if (n.outra) p.set('outra', String(n.outra));
  if (n.passo) p.set('passo', n.passo);
  return p.toString();
}

// Temas oferecidos no questionário: só os publicados pela curadoria, com a contagem real do acervo.
export function temasDisponiveis(editorial = {}) {
  return Object.keys(TEMAS)
    .filter((t) => editorial[t]?.publicado !== false)
    .map((t) => {
      const doTema = livros.filter((l) => l.temas.includes(t));
      return {
        chave: t,
        nome: TEMAS[t],
        descricao: editorial[t]?.descricao || TEMAS_COMECAR[t]?.descricao || '',
        total: doTema.length,
        introdutorios: doTema.filter((l) => l.nivel === 'introdutorio').length,
      };
    });
}

// Situação de acesso de um livro, considerando a revisão editorial dos links.
export function acessoDoLivro(livro, acessos = {}) {
  const revisao = acessos[livro.slug];
  if (livro.gratis && revisao?.situacao !== 'indisponivel') {
    return { tipo: 'gratis', rotulo: 'Grátis · domínio público', fonte: livro.gratis.fonte, url: livro.gratis.url, verificadoEm: revisao?.verificadoEm || '' };
  }
  if (livro.gratis) return { tipo: 'revisao', rotulo: 'Link grátis em revisão', fonte: '', url: '' };
  return { tipo: 'compra', rotulo: 'Sebo, biblioteca ou compra', fonte: '', url: '' };
}

export function montarPercurso(e, { editorial = {}, acessos = {} } = {}) {
  const naoSei = e.temas.includes(NAO_SEI);
  const publicados = new Set(temasDisponiveis(editorial).map((t) => t.chave));
  const temas = naoSei ? [...publicados] : e.temas.filter((t) => publicados.has(t));
  const ponto = PONTOS[e.nivel] || PONTOS.basico;
  const porEtapa = (TEMPOS[e.tempo] || TEMPOS.ritmo).porEtapa;
  const fora = new Set(e.fora);
  const avisos = [];

  // Ajuste editorial de um livro: vale o do primeiro tema escolhido que tiver ajuste.
  const ajuste = (l) => {
    for (const t of temas) {
      const a = editorial[t]?.livros?.[l.slug];
      if (a && (a.etapa || a.motivo || a.ordem)) return a;
    }
    return {};
  };

  let candidatos = livros
    .filter((l) => l.temas.some((t) => temas.includes(t)))
    .filter((l) => ajuste(l).etapa !== 'fora')
    .map((l, ordem) => ({ l, ordem, posicao: Number(ajuste(l).ordem) || 999, afinidade: l.temas.filter((t) => temas.includes(t)).length }));
  // "Ainda não sei": só leituras de entrada e intermediárias, de temas variados.
  if (naoSei) candidatos = candidatos.filter((c) => c.l.nivel !== 'aprofundado');

  const totalGratis = candidatos.filter((c) => acessoDoLivro(c.l, acessos).tipo === 'gratis').length;
  if (e.modo === 'gratis') candidatos = candidatos.filter((c) => acessoDoLivro(c.l, acessos).tipo === 'gratis');
  const removidos = candidatos.filter((c) => fora.has(c.l.slug)).map((c) => c.l);
  candidatos = candidatos.filter((c) => !fora.has(c.l.slug));
  // Ordem: a posição definida pela curadoria, depois os livros que tocam mais temas escolhidos.
  candidatos.sort((a, b) => a.posicao - b.posicao || b.afinidade - a.afinidade || a.ordem - b.ordem);

  // Distribui por etapa; o que passar da quantidade vai para "outras leituras".
  const grupos = { comece: [], fundamentos: [], aprofundar: [] };
  for (const c of candidatos) grupos[ajuste(c.l).etapa || ETAPA_PADRAO[c.l.nivel]].push(c.l);
  const escolhidos = {};
  const alternativas = [];
  for (const [etapa, todos] of Object.entries(grupos)) {
    const limite = ponto.limites[etapa] === undefined ? porEtapa : Math.min(porEtapa, ponto.limites[etapa]);
    // "Outra combinação": gira a lista para trazer outras obras da mesma etapa.
    const giro = todos.length > limite && limite > 0 ? (e.outra * limite) % todos.length : 0;
    const ordem = [...todos.slice(giro), ...todos.slice(0, giro)];
    escolhidos[etapa] = ordem.slice(0, limite);
    alternativas.push(...ordem.slice(limite));
  }

  const item = (l, etapa) => {
    const a = ajuste(l);
    return {
      livro: l,
      motivoEtapa: MOTIVO_ETAPA[etapa],
      motivo: a.motivo || l.porque,
      motivoEditorial: Boolean(a.motivo),
      acesso: acessoDoLivro(l, acessos),
      conceitos: l.conceitos.map((s) => conceitoPorSlug.get(s)).filter(Boolean),
    };
  };

  const noPercurso = ETAPAS_DE_LIVRO.flatMap((k) => escolhidos[k]);
  const jaExplicados = new Set();
  const conceitosDe = (ls, max) => {
    const out = [];
    for (const l of ls) for (const s of l.conceitos) {
      const c = conceitoPorSlug.get(s);
      if (c && !jaExplicados.has(s) && out.length < max) { out.push(c); jaExplicados.add(s); }
    }
    return out;
  };

  const etapas = [];
  // 1. Comece por aqui: palavras-chave + leituras de entrada.
  const vocabulario = conceitosDe([...escolhidos.comece, ...escolhidos.fundamentos], ponto.conceitosIniciais);
  if (escolhidos.comece.length || vocabulario.length) {
    etapas.push({ chave: 'comece', livros: escolhidos.comece.map((l) => item(l, 'comece')), conceitos: vocabulario, revisao: ponto.revisao });
  }
  // 2. Ideias fundamentais
  if (escolhidos.fundamentos.length) {
    etapas.push({ chave: 'fundamentos', antes: conceitosDe(escolhidos.fundamentos, 3), livros: escolhidos.fundamentos.map((l) => item(l, 'fundamentos')) });
  }
  // 3. Autores (só os dos livros escolhidos; os debates ficam no contexto de cada um)
  const autores = [...new Set(noPercurso.flatMap((l) => l.autores))].map((s) => autorPorSlug.get(s)).filter(Boolean).slice(0, 4);
  if (autores.length >= 2) etapas.push({ chave: 'autores', autores });
  // 4. Aprofundar
  if (escolhidos.aprofundar.length) {
    etapas.push({ chave: 'aprofundar', antes: conceitosDe(escolhidos.aprofundar, 3), livros: escolhidos.aprofundar.map((l) => item(l, 'aprofundar')) });
  }
  // 5. Realidade: trilhas que passam pelos livros do percurso
  const slugs = new Set(noPercurso.map((l) => l.slug));
  const ligadas = trilhas.filter((t) => t.etapas.some((x) => slugs.has(x.livro))).slice(0, 2);
  if (ligadas.length) etapas.push({ chave: 'realidade', trilhas: ligadas.map((t) => ({ trilha: t, emComum: t.etapas.filter((x) => slugs.has(x.livro)).length })) });

  etapas.forEach((et, i) => { et.numero = i + 1; et.titulo = ETAPAS[et.chave].titulo; et.objetivo = ETAPAS[et.chave].objetivo; et.ponte = PONTES[et.chave]; });

  const etapasDeLivro = etapas.filter((et) => et.livros?.length).length;
  const incompleto = noPercurso.length > 0 && etapasDeLivro < 2;
  if (incompleto && !e.modo) avisos.push('Ainda não temos materiais suficientes para montar uma trilha completa sobre este tema. Mostramos o que já existe no acervo; a curadoria segue sendo ampliada.');

  return {
    temas,
    naoSei,
    ponto,
    etapas,
    livros: noPercurso,
    alternativas,
    removidos,
    totalGratis,
    vazio: noPercurso.length === 0,
    incompleto,
    avisos,
  };
}

export { NIVEIS };
