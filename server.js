// Marginália — servidor HTTP sem dependências externas.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { join, normalize, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { abrirBanco } from './lib/db.js';
import { gerarHash, conferirSenha, iniciarSessao, usuarioDaRequisicao, encerrarSessao, tentativasEsgotadas, registrarFalha, limparFalhas } from './lib/auth.js';
import { livroPorSlug, autorPorSlug, conceitoPorSlug, trilhaPorSlug } from './content/catalog.js';
import { layout } from './views/layout.js';
import { home } from './views/home.js';
import { biblioteca, lerFiltros } from './views/biblioteca.js';
import { livroPagina } from './views/livro.js';
import { trilhasIndice, trilhaPagina } from './views/trilhas.js';
import { autoresIndice, autorPagina, conceitosIndice, conceitoPagina } from './views/verbetes.js';
import { entrar, cadastro, estantePagina } from './views/conta.js';
import { naoEncontrado, erroServidor, creditos } from './views/outros.js';
import { personalidadesSemente } from './content/personalidades.js';
import {
  personalidadesPublicas, referenciasDoLivro, livrosDaPersonalidade, eixosEmUso,
  validarPerfil, validarReferencia, referenciaDoFormulario, slugificar, publicada,
} from './lib/personalidades.js';
import { secaoHome, catalogo, pagina as paginaPessoa, blocoLivro } from './views/personalidades.js';
import { adminLista, adminEditar } from './views/admin.js';
import { sobre } from './views/sobre.js';
import { livros as todosLivros, TEMAS } from './content/catalog.js';
import { lerEscolhas, consulta, montarPercurso, temasDisponiveis } from './lib/percurso.js';
import { comecarAbertura, passoTemas, passoNivel, passoTempo, percursoPagina, percursosSalvos, nomeDosTemas } from './views/comecar.js';
import { adminPercursos, adminPercursoTema } from './views/adminPercursos.js';

const RAIZ = fileURLToPath(new URL('.', import.meta.url));
const PUBLICO = join(RAIZ, 'public');
const PORTA = Number(process.env.PORT) || 3000;
const SEGURO = process.env.COOKIE_SECURE === '1';
const db = abrirBanco(process.env.MARGINALIA_DB || join(RAIZ, 'data', 'db.json'), { sementePersonalidades: personalidadesSemente });
// Administradores: e-mails na variável MARGINALIA_ADMINS (separados por vírgula)
// ou, se ela não existir, no arquivo data/admins.txt (um por linha; fora do git).
function lerAdmins() {
  let fonte = process.env.MARGINALIA_ADMINS;
  if (fonte === undefined) {
    try {
      fonte = readFileSync(join(RAIZ, 'data', 'admins.txt'), 'utf8');
    } catch {
      fonte = '';
    }
  }
  const linhas = fonte.split(/\r?\n/).filter((l) => !l.trim().startsWith('#'));
  return new Set(linhas.join(',').split(',').map((s) => s.trim().toLowerCase()).filter((s) => s.includes('@')));
}
const ADMINS = lerAdmins();
const ehAdmin = (usuario) => Boolean(usuario && ADMINS.has(usuario.email));

const TIPOS = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

const CABECALHOS_SEGURANCA = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; form-action 'self'; base-uri 'self'; frame-ancestors 'none'",
};

// ---------- utilidades ----------
function enviar(res, status, corpo, cabecalhos = {}) {
  res.writeHead(status, { ...CABECALHOS_SEGURANCA, ...cabecalhos });
  res.end(corpo);
}

function pagina(res, req, ctx, { titulo, descricao, corpo, status = 200, classe = '', flash = '' }) {
  const doc = layout({ titulo, descricao, corpo, usuario: ctx.usuario, admin: ehAdmin(ctx.usuario), caminho: ctx.url.pathname, classe, flash: flash || ctx.flash });
  enviar(res, status, String(doc), { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
}

function redirecionar(res, destino, cabecalhos = {}) {
  enviar(res, 303, '', { Location: destino, ...cabecalhos });
}

function json(res, status, dados) {
  enviar(res, status, JSON.stringify(dados), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
}

const querJson = (req) => (req.headers.accept || '').includes('application/json');

function voltaSegura(v) {
  return typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') && !v.includes('\\') ? v : '';
}

async function lerCorpo(req, limite = 16 * 1024) {
  let tamanho = 0;
  const partes = [];
  for await (const parte of req) {
    tamanho += parte.length;
    if (tamanho > limite) throw Object.assign(new Error('Corpo grande demais'), { status: 413 });
    partes.push(parte);
  }
  return new URLSearchParams(Buffer.concat(partes).toString('utf8'));
}

// POST só da mesma origem (proteção contra CSRF, junto com SameSite=Lax).
function mesmaOrigem(req) {
  const origem = req.headers.origin || req.headers.referer;
  if (!origem) return true;
  try {
    return new URL(origem).host === req.headers.host;
  } catch {
    return false;
  }
}

async function servirEstatico(req, res, caminho) {
  const alvo = normalize(join(PUBLICO, decodeURIComponent(caminho)));
  if (!alvo.startsWith(PUBLICO + sep)) return false;
  try {
    const info = await stat(alvo);
    if (!info.isFile()) return false;
    const corpo = await readFile(alvo);
    const imutavel = caminho.startsWith('/img/');
    enviar(res, 200, req.method === 'HEAD' ? '' : corpo, {
      'Content-Type': TIPOS[extname(alvo)] || 'application/octet-stream',
      'Cache-Control': imutavel ? 'public, max-age=604800' : 'no-cache',
      'Content-Length': corpo.length,
    });
    return true;
  } catch {
    return false;
  }
}

// ---------- validação ----------
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarCadastro({ nome, email, senha }) {
  const erros = {};
  if (!nome) erros.nome = 'Diga como quer ser chamado.';
  else if (nome.length > 60) erros.nome = 'Use no máximo 60 caracteres no nome.';
  if (!email) erros.email = 'Informe seu e-mail.';
  else if (!EMAIL.test(email) || email.length > 120) erros.email = 'Esse e-mail não parece válido. Confira se tem @ e domínio, como nome@exemplo.com.';
  else if (db.usuarioPorEmail(email)) erros.email = 'Já existe uma conta com esse e-mail. Tente entrar.';
  if (!senha) erros.senha = 'Crie uma senha.';
  else if (senha.length < 8) erros.senha = 'A senha precisa ter pelo menos 8 caracteres.';
  else if (senha.length > 200) erros.senha = 'A senha pode ter no máximo 200 caracteres.';
  return erros;
}

// ---------- rotas ----------
const rotas = [];
const rota = (metodo, padrao, fn) => rotas.push({ metodo, padrao, fn });

rota('GET', /^\/$/, (req, res, ctx) =>
  pagina(res, req, ctx, { corpo: home({ inspira: secaoHome(personalidadesPublicas(db)), pessoas: personalidadesPublicas(db) }), classe: 'pagina-home' })
);

// Personalidades com ao menos um livro do catálogo ligado por referência publicada (para o filtro).
function opcoesPersonalidade() {
  return Object.fromEntries(
    personalidadesPublicas(db).filter((p) => livrosDaPersonalidade(db, p.slug).size).map((p) => [p.slug, p.nome])
  );
}

rota('GET', /^\/biblioteca$/, (req, res, ctx) => {
  const pessoas = opcoesPersonalidade();
  const filtros = lerFiltros(ctx.url.searchParams, pessoas);
  const estante = ctx.usuario ? db.estante(ctx.usuario.id) : {};
  const permitidos = filtros.pessoa ? livrosDaPersonalidade(db, filtros.pessoa) : null;
  pagina(res, req, ctx, {
    titulo: 'Biblioteca',
    descricao: 'Busque livros de literatura, história e pensamento político por título, autor, tema, nível, período ou personalidade.',
    corpo: biblioteca({ filtros, estante, pessoas, permitidos, indisponiveis: indisponiveis() }),
    classe: 'pagina-biblioteca',
  });
});

rota('GET', /^\/personalidades$/, (req, res, ctx) => {
  const eixos = eixosEmUso(db);
  const eixo = eixos[ctx.url.searchParams.get('eixo')] ? ctx.url.searchParams.get('eixo') : '';
  pagina(res, req, ctx, {
    titulo: 'Quem inspira, o que lê',
    descricao: 'Artistas e pensadores e os livros ligados a eles, com a fonte de cada ligação.',
    corpo: catalogo({ pessoas: personalidadesPublicas(db, { eixo }), eixos, eixoAtual: eixo }),
    classe: 'pagina-pessoas',
  });
});

rota('GET', /^\/personalidades\/([a-z0-9-]+)$/, (req, res, ctx, [slug]) => {
  const pessoa = db.personalidade(slug);
  if (!pessoa || !publicada(pessoa)) return naoAchou(req, res, ctx);
  const publicas = personalidadesPublicas(db);
  const ligadas = (pessoa.ligacoes || [])
    .map((l) => ({ ...l, pessoa: publicas.find((p) => p.slug === l.pessoa) }))
    .filter((l) => l.pessoa);
  pagina(res, req, ctx, {
    titulo: pessoa.nome,
    descricao: pessoa.descricao,
    corpo: paginaPessoa({ pessoa, indice: publicas.indexOf(pessoa), ligadas }),
    classe: 'pagina-pessoa',
  });
});

rota('GET', /^\/livros\/([a-z0-9-]+)$/, (req, res, ctx, [slug]) => {
  const original = livroPorSlug.get(slug);
  if (!original) return naoAchou(req, res, ctx);
  const livro = comAcesso(original);
  const estado = ctx.usuario ? db.estante(ctx.usuario.id)[slug] : null;
  const quemLe = blocoLivro(referenciasDoLivro(db, slug));
  pagina(res, req, ctx, { titulo: livro.titulo, descricao: livro.linha, corpo: livroPagina({ livro, usuario: ctx.usuario, estado, quemLe }), classe: 'pagina-livro' });
});

// Link grátis marcado como indisponível pela curadoria: some do site até ser revisto.
const indisponiveis = () => new Set(Object.entries(db.acessos()).filter(([, a]) => a.situacao === 'indisponivel').map(([s]) => s));
function comAcesso(livro) {
  return livro.gratis && indisponiveis().has(livro.slug) ? { ...livro, gratis: undefined } : livro;
}

// ---------- Por onde começar? ----------
const editorialAtual = () => ({ editorial: db.editorialTemas(), acessos: db.acessos() });

rota('GET', /^\/comecar$/, (req, res, ctx) => {
  const params = ctx.url.searchParams;
  const e = lerEscolhas(params);
  const pular = params.get('pular');
  if (pular === 'nivel') e.nivel = '';
  if (pular === 'tempo') return redirecionar(res, `/comecar/percurso?${consulta({ ...e, tempo: '' })}`);
  let passo = params.get('passo') || '';
  let erro = '';
  if ((passo === 'nivel' || passo === 'tempo') && !e.temas.length) {
    passo = 'temas';
    erro = 'Escolha pelo menos um assunto, ou a opção “Ainda não sei exatamente o que procuro”.';
  }
  const temas = temasDisponiveis(db.editorialTemas());
  const corpo = passo === 'temas' ? passoTemas({ e, temas, erro })
    : passo === 'nivel' ? passoNivel({ e })
    : passo === 'tempo' ? passoTempo({ e })
    : comecarAbertura();
  pagina(res, req, ctx, { titulo: 'Por onde começar?', descricao: 'Escolha um assunto e descubra um caminho de leitura feito para o seu momento.', corpo, classe: 'pagina-comecar', status: erro ? 400 : 200 });
});

rota('GET', /^\/comecar\/percurso$/, (req, res, ctx) => {
  const e = lerEscolhas(ctx.url.searchParams);
  if (!e.temas.length) return redirecionar(res, '/comecar?passo=temas');
  // "Pular" no passo do ritmo descarta uma opção já marcada e limpa a URL.
  if (ctx.url.searchParams.get('pular') === 'tempo') return redirecionar(res, `/comecar/percurso?${consulta({ ...e, tempo: '' })}`);
  const p = montarPercurso(e, editorialAtual());
  const refs = Object.fromEntries(p.livros.map((l) => [l.slug, referenciasDoLivro(db, l.slug)]));
  const salvo = ctx.usuario ? db.percursosSalvos(ctx.usuario.id).find((s) => s.consulta === consulta({ ...e, outra: 0 })) : null;
  const flash = ctx.url.searchParams.get('salvo') ? 'Percurso salvo. Ele fica na sua estante.' : '';
  pagina(res, req, ctx, {
    titulo: `Percurso: ${nomeDosTemas(p.naoSei ? ['nao-sei'] : p.temas)}`,
    corpo: percursoPagina({ e, p, usuario: ctx.usuario, estante: ctx.usuario ? db.estante(ctx.usuario.id) : {}, refs, salvo }),
    classe: 'pagina-comecar pagina-percurso',
    flash,
  });
});

rota('POST', /^\/comecar\/salvar$/, async (req, res, ctx) => {
  if (!ctx.usuario) return redirecionar(res, '/entrar?volta=/comecar');
  const corpo = await lerCorpo(req);
  // A consulta é relida e normalizada: só temas, nível, ritmo, filtros e removidos válidos.
  const e = lerEscolhas(new URLSearchParams(corpo.get('consulta') || ''));
  if (!e.temas.length) return redirecionar(res, '/comecar?passo=temas');
  const q = consulta({ ...e, outra: 0 });
  const p = montarPercurso(e, editorialAtual());
  await db.salvarPercurso(ctx.usuario.id, { consulta: q, titulo: `Por onde começar: ${nomeDosTemas(p.naoSei ? ['nao-sei'] : p.temas)}` });
  redirecionar(res, `/comecar/percurso?${q}&salvo=1`);
});

rota('POST', /^\/comecar\/percursos\/([a-zA-Z0-9-]+)\/remover$/, async (req, res, ctx, [id]) => {
  if (!ctx.usuario) return redirecionar(res, '/entrar?volta=/estante');
  await db.removerPercurso(ctx.usuario.id, id);
  redirecionar(res, '/estante#percursos');
});

function exigirLogin(req, res, ctx) {
  if (ctx.usuario) return true;
  if (querJson(req)) json(res, 401, { erro: 'Entre na sua conta para continuar.', entrar: '/entrar' });
  else redirecionar(res, `/entrar?volta=${encodeURIComponent(ctx.url.pathname.replace(/\/(asterisco|leitura)$/, ''))}`);
  return false;
}

rota('POST', /^\/livros\/([a-z0-9-]+)\/asterisco$/, async (req, res, ctx, [slug]) => {
  if (!livroPorSlug.get(slug)) return naoAchou(req, res, ctx);
  if (!exigirLogin(req, res, ctx)) return;
  const corpo = await lerCorpo(req);
  const estado = await db.atualizarLivro(ctx.usuario.id, slug, { asterisco: corpo.get('valor') === '1' });
  if (querJson(req)) return json(res, 200, { ok: true, estado });
  redirecionar(res, `/livros/${slug}`);
});

rota('POST', /^\/livros\/([a-z0-9-]+)\/leitura$/, async (req, res, ctx, [slug]) => {
  if (!livroPorSlug.get(slug)) return naoAchou(req, res, ctx);
  if (!exigirLogin(req, res, ctx)) return;
  const corpo = await lerCorpo(req);
  const status = corpo.get('status') || null;
  if (status && !['quero-ler', 'lendo', 'lido'].includes(status)) {
    return querJson(req) ? json(res, 400, { erro: 'Situação de leitura inválida.' }) : redirecionar(res, `/livros/${slug}`);
  }
  let progresso = Math.round(Number(corpo.get('progresso')));
  if (!Number.isFinite(progresso)) progresso = 0;
  progresso = Math.max(0, Math.min(100, progresso));
  if (status === 'lido') progresso = 100;
  if (status !== 'lendo' && status !== 'lido') progresso = 0;
  const estado = await db.atualizarLivro(ctx.usuario.id, slug, { status, progresso });
  if (querJson(req)) return json(res, 200, { ok: true, estado });
  redirecionar(res, voltaSegura(corpo.get('volta')) || `/livros/${slug}`);
});

rota('GET', /^\/trilhas$/, (req, res, ctx) => {
  const estante = ctx.usuario ? db.estante(ctx.usuario.id) : {};
  pagina(res, req, ctx, { titulo: 'Trilhas de leitura', corpo: trilhasIndice({ usuario: ctx.usuario, estante }), classe: 'pagina-trilhas' });
});

rota('GET', /^\/trilhas\/([a-z0-9-]+)$/, (req, res, ctx, [slug]) => {
  const trilha = trilhaPorSlug.get(slug);
  if (!trilha) return naoAchou(req, res, ctx);
  const estante = ctx.usuario ? db.estante(ctx.usuario.id) : {};
  pagina(res, req, ctx, { titulo: trilha.titulo, descricao: trilha.objetivo, corpo: trilhaPagina({ trilha, usuario: ctx.usuario, estante }), classe: 'pagina-trilha' });
});

rota('GET', /^\/autores$/, (req, res, ctx) => pagina(res, req, ctx, { titulo: 'Autores', corpo: autoresIndice(), classe: 'pagina-autores' }));
rota('GET', /^\/autores\/([a-z0-9-]+)$/, (req, res, ctx, [slug]) => {
  const autor = autorPorSlug.get(slug);
  if (!autor) return naoAchou(req, res, ctx);
  pagina(res, req, ctx, { titulo: autor.nome, descricao: autor.bio[0], corpo: autorPagina({ autor }), classe: 'pagina-autor' });
});

rota('GET', /^\/conceitos$/, (req, res, ctx) => pagina(res, req, ctx, { titulo: 'Conceitos', corpo: conceitosIndice(), classe: 'pagina-conceitos' }));
rota('GET', /^\/conceitos\/([a-z0-9-]+)$/, (req, res, ctx, [slug]) => {
  const conceito = conceitoPorSlug.get(slug);
  if (!conceito) return naoAchou(req, res, ctx);
  pagina(res, req, ctx, { titulo: conceito.termo, descricao: conceito.definicao, corpo: conceitoPagina({ conceito }), classe: 'pagina-conceito' });
});

rota('GET', /^\/sobre$/, (req, res, ctx) =>
  pagina(res, req, ctx, {
    titulo: 'Sobre nós',
    descricao: 'O que é a Marginália, como escolhemos e citamos os livros e por que o acesso à leitura deve ser livre.',
    corpo: sobre({ pessoas: personalidadesPublicas(db).length, gratis: todosLivros.filter((l) => l.gratis).length }),
    classe: 'pagina-sobre',
  })
);

rota('GET', /^\/creditos$/, (req, res, ctx) =>
  pagina(res, req, ctx, { titulo: 'Créditos das imagens', corpo: creditos(join(RAIZ, 'assets', 'credits.json'), personalidadesPublicas(db).filter((p) => p.retrato)) })
);

rota('GET', /^\/entrar$/, (req, res, ctx) => {
  if (ctx.usuario) return redirecionar(res, '/estante');
  pagina(res, req, ctx, { titulo: 'Entrar', corpo: entrar({ volta: voltaSegura(ctx.url.searchParams.get('volta')) }), classe: 'pagina-conta' });
});

rota('POST', /^\/entrar$/, async (req, res, ctx) => {
  const corpo = await lerCorpo(req);
  const email = (corpo.get('email') || '').trim().toLowerCase();
  const senha = corpo.get('senha') || '';
  const volta = voltaSegura(corpo.get('volta'));
  const chave = `${req.socket.remoteAddress}|${email}`;
  const erros = {};
  if (!email) erros.email = 'Informe seu e-mail.';
  if (!senha) erros.senha = 'Informe sua senha.';
  if (!Object.keys(erros).length) {
    if (tentativasEsgotadas(chave)) {
      erros.senha = 'Muitas tentativas seguidas. Espere 15 minutos e tente de novo.';
    } else {
      const usuario = db.usuarioPorEmail(email);
      const ok = usuario ? await conferirSenha(senha, usuario.senhaHash) : (await gerarHash(senha), false);
      if (!ok) {
        registrarFalha(chave);
        erros.senha = 'E-mail ou senha não conferem.';
      } else {
        limparFalhas(chave);
        const cookie = await iniciarSessao(db, usuario.id, SEGURO);
        return redirecionar(res, volta || '/estante', { 'Set-Cookie': cookie });
      }
    }
  }
  pagina(res, req, ctx, { titulo: 'Entrar', corpo: entrar({ valores: { email }, erros, volta }), status: 400, classe: 'pagina-conta' });
});

rota('GET', /^\/cadastro$/, (req, res, ctx) => {
  if (ctx.usuario) return redirecionar(res, '/estante');
  pagina(res, req, ctx, { titulo: 'Criar conta', corpo: cadastro({ volta: voltaSegura(ctx.url.searchParams.get('volta')) }), classe: 'pagina-conta' });
});

rota('POST', /^\/cadastro$/, async (req, res, ctx) => {
  const corpo = await lerCorpo(req);
  const valores = {
    nome: (corpo.get('nome') || '').trim().replace(/\s+/g, ' '),
    email: (corpo.get('email') || '').trim().toLowerCase(),
    senha: corpo.get('senha') || '',
  };
  const volta = voltaSegura(corpo.get('volta'));
  const erros = validarCadastro(valores);
  if (Object.keys(erros).length) {
    return pagina(res, req, ctx, { titulo: 'Criar conta', corpo: cadastro({ valores, erros, volta }), status: 400, classe: 'pagina-conta' });
  }
  const usuario = await db.criarUsuario({ nome: valores.nome, email: valores.email, senhaHash: await gerarHash(valores.senha) });
  const cookie = await iniciarSessao(db, usuario.id, SEGURO);
  redirecionar(res, volta || '/estante?bemvindo=1', { 'Set-Cookie': cookie });
});

rota('POST', /^\/sair$/, async (req, res) => {
  const cookie = await encerrarSessao(db, req, SEGURO);
  redirecionar(res, '/?saiu=1', { 'Set-Cookie': cookie });
});

rota('GET', /^\/estante$/, (req, res, ctx) => {
  if (!ctx.usuario) return redirecionar(res, '/entrar?volta=/estante');
  const flash = ctx.url.searchParams.get('bemvindo') ? `Conta criada. Boas-vindas, ${ctx.usuario.nome}!` : '';
  const estante = db.estante(ctx.usuario.id);
  const percursos = db.percursosSalvos(ctx.usuario.id).map((s) => {
    const p = montarPercurso(lerEscolhas(new URLSearchParams(s.consulta)), editorialAtual());
    return { ...s, href: `/comecar/percurso?${s.consulta}`, total: p.livros.length, lidos: p.livros.filter((l) => estante[l.slug]?.status === 'lido').length };
  });
  pagina(res, req, ctx, { titulo: 'Minha estante', corpo: estantePagina({ usuario: ctx.usuario, estante, percursos: percursosSalvos(percursos) }), classe: 'pagina-estante', flash });
});

// ---------- Área administrativa ----------
// Sem login: vai para /entrar. Logado sem permissão: 403 (não revela nada além disso).
function exigirAdmin(req, res, ctx) {
  if (!ctx.usuario) {
    redirecionar(res, `/entrar?volta=${encodeURIComponent(ctx.url.pathname)}`);
    return false;
  }
  if (!ehAdmin(ctx.usuario)) {
    pagina(res, req, ctx, { titulo: 'Acesso restrito', corpo: naoEncontrado(), status: 403 });
    return false;
  }
  return true;
}

rota('GET', /^\/admin$/, (req, res, ctx) => {
  if (exigirAdmin(req, res, ctx)) redirecionar(res, '/admin/personalidades');
});

rota('GET', /^\/admin\/personalidades$/, (req, res, ctx) => {
  if (!exigirAdmin(req, res, ctx)) return;
  pagina(res, req, ctx, { titulo: 'Admin · Personalidades', corpo: adminLista({ pessoas: db.personalidades() }), classe: 'pagina-admin' });
});

rota('POST', /^\/admin\/personalidades$/, async (req, res, ctx) => {
  if (!exigirAdmin(req, res, ctx)) return;
  const corpo = await lerCorpo(req);
  const nome = (corpo.get('nome') || '').trim().replace(/\s+/g, ' ').slice(0, 80);
  const slug = slugificar(nome);
  const erros = {};
  if (!nome || !slug) erros.nome = 'Informe o nome.';
  else if (db.personalidade(slug)) erros.nome = 'Já existe uma personalidade com esse nome.';
  if (Object.keys(erros).length) {
    return pagina(res, req, ctx, { titulo: 'Admin · Personalidades', corpo: adminLista({ pessoas: db.personalidades(), erros, valores: { nome } }), status: 400, classe: 'pagina-admin' });
  }
  await db.criarPersonalidade({ slug, nome, nomeCurto: nome, status: 'rascunho', papel: '', descricao: '' });
  redirecionar(res, `/admin/personalidades/${slug}?ok=criada`);
});

const AVISOS = {
  criada: 'Rascunho criado.',
  perfil: 'Perfil salvo.',
  ref: 'Referência adicionada como rascunho. Revise e publique quando a fonte estiver conferida.',
  publicar: 'Referência publicada.',
  despublicar: 'Referência retirada do site.',
  remover: 'Referência removida.',
};

rota('GET', /^\/admin\/personalidades\/([a-z0-9-]+)$/, (req, res, ctx, [slug]) => {
  if (!exigirAdmin(req, res, ctx)) return;
  const pessoa = db.personalidade(slug);
  if (!pessoa) return naoAchou(req, res, ctx);
  pagina(res, req, ctx, { titulo: `Admin · ${pessoa.nome}`, corpo: adminEditar({ pessoa, aviso: AVISOS[ctx.url.searchParams.get('ok')] || '' }), classe: 'pagina-admin' });
});

rota('POST', /^\/admin\/personalidades\/([a-z0-9-]+)$/, async (req, res, ctx, [slug]) => {
  if (!exigirAdmin(req, res, ctx)) return;
  const pessoa = db.personalidade(slug);
  if (!pessoa) return naoAchou(req, res, ctx);
  const corpo = await lerCorpo(req, 64 * 1024);
  const dados = {
    nome: (corpo.get('nome') || '').trim().slice(0, 80),
    papel: (corpo.get('papel') || '').trim().slice(0, 120),
    descricao: (corpo.get('descricao') || '').trim().slice(0, 1200),
    eixos: [...new Set(corpo.getAll('eixos'))],
    status: corpo.get('status') || '',
  };
  const erros = validarPerfil(dados);
  if (Object.keys(erros).length) {
    return pagina(res, req, ctx, { titulo: `Admin · ${pessoa.nome}`, corpo: adminEditar({ pessoa: { ...pessoa, ...dados }, errosPerfil: erros }), status: 400, classe: 'pagina-admin' });
  }
  await db.atualizarPersonalidade(slug, dados);
  redirecionar(res, `/admin/personalidades/${slug}?ok=perfil`);
});

rota('POST', /^\/admin\/personalidades\/([a-z0-9-]+)\/referencias$/, async (req, res, ctx, [slug]) => {
  if (!exigirAdmin(req, res, ctx)) return;
  const pessoa = db.personalidade(slug);
  if (!pessoa) return naoAchou(req, res, ctx);
  const corpo = await lerCorpo(req, 64 * 1024);
  const campo = (n, max = 300) => (corpo.get(n) || '').trim().slice(0, max);
  const dados = {
    tipo: campo('tipo'), rotulo: campo('rotulo', 80), livro: campo('livro'),
    obraTitulo: campo('obraTitulo', 160), obraAutor: campo('obraAutor', 120),
    contexto: campo('contexto', 1200), fonteTitulo: campo('fonteTitulo', 200), fonteVeiculo: campo('fonteVeiculo', 120),
    fonteData: campo('fonteData', 10), fonteUrl: campo('fonteUrl', 500), verificacao: campo('verificacao'),
    notaVerificacao: campo('notaVerificacao', 300),
  };
  const erros = validarReferencia(dados);
  if (Object.keys(erros).length) {
    return pagina(res, req, ctx, { titulo: `Admin · ${pessoa.nome}`, corpo: adminEditar({ pessoa, errosRef: erros, valoresRef: dados }), status: 400, classe: 'pagina-admin' });
  }
  await db.adicionarReferencia(slug, referenciaDoFormulario(dados));
  redirecionar(res, `/admin/personalidades/${slug}?ok=ref#refs-titulo`);
});

rota('POST', /^\/admin\/personalidades\/([a-z0-9-]+)\/referencias\/([a-zA-Z0-9-]+)$/, async (req, res, ctx, [slug, id]) => {
  if (!exigirAdmin(req, res, ctx)) return;
  const corpo = await lerCorpo(req);
  const acao = corpo.get('acao');
  const mudanca = { publicar: { status: 'publicado' }, despublicar: { status: 'rascunho' }, remover: null }[acao];
  if (mudanca === undefined) return enviar(res, 400, 'Ação inválida', { 'Content-Type': 'text/plain; charset=utf-8' });
  const r = await db.alterarReferencia(slug, id, mudanca);
  if (!r) return naoAchou(req, res, ctx);
  redirecionar(res, `/admin/personalidades/${slug}?ok=${acao}#refs-titulo`);
});

// ---------- Admin: percursos e links de acesso ----------
const AVISOS_PERCURSO = { tema: 'Tema salvo. O percurso já usa os ajustes.', acesso: 'Revisão do link registrada.' };

rota('GET', /^\/admin\/percursos$/, (req, res, ctx) => {
  if (!exigirAdmin(req, res, ctx)) return;
  pagina(res, req, ctx, { titulo: 'Admin · Percursos', corpo: adminPercursos({ editorial: db.editorialTemas(), acessos: db.acessos(), aviso: AVISOS_PERCURSO[ctx.url.searchParams.get('ok')] || '' }), classe: 'pagina-admin' });
});

rota('GET', /^\/admin\/percursos\/([a-z0-9-]+)$/, (req, res, ctx, [tema]) => {
  if (!exigirAdmin(req, res, ctx)) return;
  if (!TEMAS[tema]) return naoAchou(req, res, ctx);
  pagina(res, req, ctx, { titulo: `Admin · ${TEMAS[tema]}`, corpo: adminPercursoTema({ tema, editorial: db.editorialTemas(), aviso: AVISOS_PERCURSO[ctx.url.searchParams.get('ok')] || '' }), classe: 'pagina-admin' });
});

rota('POST', /^\/admin\/percursos\/([a-z0-9-]+)$/, async (req, res, ctx, [tema]) => {
  if (!exigirAdmin(req, res, ctx)) return;
  if (!TEMAS[tema]) return naoAchou(req, res, ctx);
  const corpo = await lerCorpo(req, 128 * 1024);
  const livrosDoTema = todosLivros.filter((l) => l.temas.includes(tema));
  const ajustes = {};
  for (const l of livrosDoTema) {
    const etapa = corpo.get(`etapa:${l.slug}`) || '';
    const ordem = Math.max(0, Math.min(99, Number.parseInt(corpo.get(`ordem:${l.slug}`), 10) || 0));
    const motivo = (corpo.get(`motivo:${l.slug}`) || '').trim().replace(/\s+/g, ' ').slice(0, 400);
    if (!['', 'comece', 'fundamentos', 'aprofundar', 'fora'].includes(etapa)) continue;
    if (etapa || ordem || motivo) ajustes[l.slug] = { etapa, ordem, motivo };
  }
  await db.atualizarTemaEditorial(tema, {
    publicado: corpo.get('publicado') === '1',
    descricao: (corpo.get('descricao') || '').trim().replace(/\s+/g, ' ').slice(0, 220),
    livros: ajustes,
  });
  redirecionar(res, `/admin/percursos/${tema}?ok=tema`);
});

rota('POST', /^\/admin\/acessos\/([a-z0-9-]+)$/, async (req, res, ctx, [slug]) => {
  if (!exigirAdmin(req, res, ctx)) return;
  const livro = livroPorSlug.get(slug);
  if (!livro?.gratis) return naoAchou(req, res, ctx);
  const corpo = await lerCorpo(req);
  const situacao = corpo.get('situacao');
  if (!['ok', 'indisponivel'].includes(situacao)) return enviar(res, 400, 'Situação inválida', { 'Content-Type': 'text/plain; charset=utf-8' });
  await db.revisarAcesso(slug, situacao);
  redirecionar(res, '/admin/percursos?ok=acesso#acessos-titulo');
});

function naoAchou(req, res, ctx) {
  if (querJson(req)) return json(res, 404, { erro: 'Não encontrado.' });
  pagina(res, req, ctx, { titulo: 'Página não encontrada', corpo: naoEncontrado(), status: 404 });
}

// ---------- servidor ----------
export const servidor = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const ctx = { url, usuario: null };
  try {
    if ((req.method === 'GET' || req.method === 'HEAD') && /^\/(css|js|img)\//.test(url.pathname)) {
      if (await servirEstatico(req, res, url.pathname)) return;
      return enviar(res, 404, 'Não encontrado', { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    ctx.usuario = usuarioDaRequisicao(db, req);
    if (url.pathname !== '/' && url.pathname.endsWith('/')) return redirecionar(res, url.pathname.slice(0, -1) + url.search);
    if (req.method === 'POST' && !mesmaOrigem(req)) {
      return enviar(res, 403, 'Origem não permitida', { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    if (url.searchParams.get('saiu')) ctx.flash = 'Você saiu da sua conta.';
    for (const r of rotas) {
      if (r.metodo !== req.method && !(r.metodo === 'GET' && req.method === 'HEAD')) continue;
      const m = r.padrao.exec(url.pathname);
      if (m) return await r.fn(req, res, ctx, m.slice(1));
    }
    const existe = rotas.some((r) => r.padrao.test(url.pathname));
    if (existe) return enviar(res, 405, 'Método não permitido', { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, POST' });
    naoAchou(req, res, ctx);
  } catch (erro) {
    if (erro.status === 413) return enviar(res, 413, 'Envio grande demais', { 'Content-Type': 'text/plain; charset=utf-8' });
    console.error(erro);
    if (!res.headersSent) pagina(res, req, ctx, { titulo: 'Erro', corpo: erroServidor(), status: 500 });
  }
});

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  servidor.listen(PORTA, () => console.log(`Marginália em http://localhost:${PORTA}`));
}
