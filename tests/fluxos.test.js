// Testes de ponta a ponta dos fluxos do servidor, com banco temporário.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const pasta = mkdtempSync(join(tmpdir(), 'marginalia-'));
process.env.MARGINALIA_DB = join(pasta, 'db.json');
process.env.MARGINALIA_ADMINS = 'editora@teste.test';
const { servidor } = await import('../server.js');

let base;
before(async () => {
  await new Promise((ok) => servidor.listen(0, ok));
  base = `http://localhost:${servidor.address().port}`;
});
after(() => {
  servidor.close();
  rmSync(pasta, { recursive: true, force: true });
});

const form = (dados) => new URLSearchParams(dados).toString();
async function post(caminho, dados, { cookie, json = false, origem } = {}) {
  return fetch(base + caminho, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: origem || base,
      ...(cookie ? { Cookie: cookie } : {}),
      ...(json ? { Accept: 'application/json' } : {}),
    },
    body: form(dados),
  });
}
const get = (caminho, cookie) => fetch(base + caminho, { redirect: 'manual', headers: cookie ? { Cookie: cookie } : {} });
const cookieDe = (res) => (res.headers.get('set-cookie') || '').split(';')[0];

test('páginas públicas respondem 200 e 404 para o que não existe', async () => {
  for (const c of ['/', '/biblioteca', '/livros/vidas-secas', '/trilhas', '/trilhas/ler-o-mundo', '/autores', '/autores/paulo-freire', '/conceitos', '/conceitos/escrevivencia', '/entrar', '/cadastro', '/creditos']) {
    const r = await get(c);
    assert.equal(r.status, 200, c);
    const html = await r.text();
    assert.match(html, /<h1[\s>]/, `h1 em ${c}`);
    assert.match(html, /lang="pt-BR"/);
  }
  assert.equal((await get('/livros/nao-existe')).status, 404);
  assert.equal((await get('/css/../server.js')).status, 404);
});

test('busca e filtros da biblioteca', async () => {
  const semAcento = await (await get('/biblioteca?q=sertoes')).text();
  assert.match(semAcento, /1 livro</);
  assert.match(semAcento, /Os Sertões/);
  const filtro = await (await get('/biblioteca?tema=educacao')).text();
  assert.match(filtro, /Pedagogia do Oprimido/);
  assert.doesNotMatch(filtro, /item__titulo">Vidas Secas/);
  const vazio = await (await get('/biblioteca?q=zzzzzz')).text();
  assert.match(vazio, /Nenhum livro com essa combinação/);
  const invalido = await get('/biblioteca?tema=<script>');
  assert.equal(invalido.status, 200);
  assert.doesNotMatch(await invalido.text(), /<script>alert/);
});

test('cadastro valida campos e não aceita e-mail repetido', async () => {
  const r = await post('/cadastro', { nome: '', email: 'invalido', senha: '123' });
  assert.equal(r.status, 400);
  const html = await r.text();
  assert.match(html, /Diga como quer ser chamado/);
  assert.match(html, /não parece válido/);
  assert.match(html, /pelo menos 8 caracteres/);
  assert.match(html, /aria-invalid="true"/);

  const ok = await post('/cadastro', { nome: 'Leitora Teste', email: 'leitora@teste.test', senha: 'senha-de-teste-1' });
  assert.equal(ok.status, 303);
  assert.equal(ok.headers.get('location'), '/estante?bemvindo=1');
  assert.match(ok.headers.get('set-cookie'), /HttpOnly; SameSite=Lax/);

  const repetido = await post('/cadastro', { nome: 'Outra', email: 'LEITORA@teste.test', senha: 'senha-de-teste-2' });
  assert.equal(repetido.status, 400);
  assert.match(await repetido.text(), /Já existe uma conta/);
});

test('login, estante, asterisco, progresso e logout', async () => {
  const errado = await post('/entrar', { email: 'leitora@teste.test', senha: 'errada' });
  assert.equal(errado.status, 400);
  assert.match(await errado.text(), /E-mail ou senha não conferem/);

  const login = await post('/entrar', { email: 'leitora@teste.test', senha: 'senha-de-teste-1', volta: '/livros/ursula' });
  assert.equal(login.status, 303);
  assert.equal(login.headers.get('location'), '/livros/ursula');
  const cookie = cookieDe(login);

  // Volta não pode apontar para outro site
  const externo = await post('/entrar', { email: 'leitora@teste.test', senha: 'senha-de-teste-1', volta: '//malicioso.example' });
  assert.equal(externo.headers.get('location'), '/estante');

  const ast = await post('/livros/ursula/asterisco', { valor: '1' }, { cookie, json: true });
  assert.equal(ast.status, 200);
  assert.equal((await ast.json()).estado.asterisco, true);

  const lendo = await post('/livros/ursula/leitura', { status: 'lendo', progresso: '45' }, { cookie, json: true });
  const estadoLendo = (await lendo.json()).estado;
  assert.equal(estadoLendo.asterisco, true);
  assert.equal(estadoLendo.status, 'lendo');
  assert.equal(estadoLendo.progresso, 45);

  const fora = await post('/livros/ursula/leitura', { status: 'lendo', progresso: '999' }, { cookie, json: true });
  assert.equal((await fora.json()).estado.progresso, 100);
  const invalido = await post('/livros/ursula/leitura', { status: 'roubado' }, { cookie, json: true });
  assert.equal(invalido.status, 400);

  const lido = await post('/livros/vidas-secas/leitura', { status: 'lido' }, { cookie });
  assert.equal(lido.status, 303);

  const estante = await (await get('/estante', cookie)).text();
  assert.match(estante, /Minha estante/);
  assert.match(estante, /Lendo agora/);
  assert.match(estante, /Úrsula/);
  assert.match(estante, /Vidas Secas/);

  const trilha = await (await get('/trilhas/ler-o-mundo', cookie)).text();
  assert.match(trilha, /1 de 5 livros lidos/);

  const pagina = await (await get('/livros/ursula', cookie)).text();
  assert.match(pagina, /aria-pressed="true"/);
  assert.match(pagina, /value="lendo" checked/);

  const sair = await post('/sair', {}, { cookie });
  assert.equal(sair.status, 303);
  assert.match(sair.headers.get('set-cookie'), /Max-Age=0/);
  const depois = await get('/estante', cookie);
  assert.equal(depois.status, 303);
  assert.match(depois.headers.get('location'), /^\/entrar/);
});

test('ações exigem login e mesma origem', async () => {
  const anonimo = await post('/livros/ursula/asterisco', { valor: '1' }, { json: true });
  assert.equal(anonimo.status, 401);
  const anonimoHtml = await post('/livros/ursula/asterisco', { valor: '1' });
  assert.equal(anonimoHtml.headers.get('location'), '/entrar?volta=%2Flivros%2Fursula');
  const outraOrigem = await post('/entrar', { email: 'x@y.z', senha: 'abcdefgh' }, { origem: 'https://malicioso.example' });
  assert.equal(outraOrigem.status, 403);
});

test('conteúdo enviado pelo usuário é escapado', async () => {
  const r = await post('/cadastro', { nome: '<img src=x onerror=alert(1)>', email: 'xss@teste.test', senha: 'senha-de-teste-3' });
  const cookie = cookieDe(r);
  const estante = await (await get('/estante?bemvindo=1', cookie)).text();
  assert.doesNotMatch(estante, /<img src=x/);
  assert.match(estante, /&lt;img src=x/);
});

test('personalidades: catálogo, perfil, filtros e perfil não confirmado escondido', async () => {
  const home = await (await get('/')).text();
  assert.match(home, /Quem inspira, o que lê/);
  for (const nome of ['Mano Brown', 'Emicida', 'Erika Hilton', 'Jones Manoel', 'Djonga', 'Don L']) assert.match(home, new RegExp(nome));
  assert.doesNotMatch(home, /Ana Elisa/);

  const cat = await (await get('/personalidades')).text();
  assert.match(cat, /6 perfis/);
  const genero = await (await get('/personalidades?eixo=genero')).text();
  assert.match(genero, /1 perfil com o eixo Gênero e sexualidade/);

  const erika = await (await get('/personalidades/erika-hilton')).text();
  assert.match(erika, /Indicado por Erika Hilton/);
  assert.match(erika, /Quem não leu, precisa ler/);
  assert.match(erika, /camara\.leg\.br/);
  assert.match(erika, /Mencionado em entrevista/);
  const creditosPg = await (await get('/creditos')).text();
  assert.match(creditosPg, /Retrato de Jones Manoel/);
  assert.match(creditosPg, /Retrato de Erika Hilton/);
  const rap = await (await get('/personalidades?eixo=marxismo')).text();
  assert.match(rap, /1 perfil com o eixo Marxismo/);
  assert.match(rap, /Jones Manoel/);
  assert.equal((await get('/personalidades/ana-elisa')).status, 404);

  const brown = await (await get('/personalidades/mano-brown')).text();
  assert.match(brown, /Citado no lançamento de Mano a Mano/);
  assert.match(brown, /Autobiografia de Malcolm X/);
  assert.match(brown, /gr6\.com\.br/);
  assert.match(brown, /Na curadoria da Marginália/);
  assert.match(brown, /Não são indicações de Mano Brown/);

  const emicida = await (await get('/personalidades/emicida')).text();
  assert.match(emicida, /Indicado por Emicida/);
  assert.match(emicida, /Fonte secundária/);

  const filtro = await (await get('/biblioteca?pessoa=emicida')).text();
  assert.match(filtro, /O Povo Brasileiro/);
  assert.match(filtro, /Sobrevivendo no Inferno/);
  assert.doesNotMatch(filtro, /item__titulo">Vidas Secas/);

  const livro = await (await get('/livros/o-povo-brasileiro')).text();
  assert.match(livro, /Indicado por Emicida/);
});

test('admin: exige login e permissão', async () => {
  const anon = await get('/admin/personalidades');
  assert.equal(anon.status, 303);
  assert.match(anon.headers.get('location'), /^\/entrar/);

  const comum = cookieDe(await post('/cadastro', { nome: 'Comum', email: 'comum@teste.test', senha: 'senha-de-teste-4' }));
  assert.equal((await get('/admin/personalidades', comum)).status, 403);
  const tentativa = await post('/admin/personalidades/emicida/referencias', { tipo: 'curadoria' }, { cookie: comum });
  assert.equal(tentativa.status, 403);
});

test('admin: cria referência em rascunho, valida fonte e publica', async () => {
  const cookie = cookieDe(await post('/cadastro', { nome: 'Editora', email: 'editora@teste.test', senha: 'senha-de-teste-5' }));
  const lista = await (await get('/admin/personalidades', cookie)).text();
  assert.match(lista, /Ana Elisa/);
  assert.match(lista, /Confirmar identidade antes de publicar/);

  // Indicação sem fonte é recusada
  const semFonte = await post('/admin/personalidades/djonga/referencias', { tipo: 'indicado', livro: 'vidas-secas', contexto: 'Contexto suficiente para o teste aqui.', verificacao: 'direta' }, { cookie });
  assert.equal(semFonte.status, 400);
  assert.match(await semFonte.text(), /Informe o link da fonte/);

  const ok = await post('/admin/personalidades/djonga/referencias', {
    tipo: 'mencionado-entrevista', livro: 'vidas-secas', contexto: 'Referência de teste criada pelo teste automatizado.',
    fonteTitulo: 'Fonte de teste', fonteVeiculo: 'Veículo de teste', fonteData: '2026-01-02', fonteUrl: 'https://exemplo.test/entrevista', verificacao: 'direta',
  }, { cookie });
  assert.equal(ok.status, 303);

  // Rascunho não aparece no site
  assert.doesNotMatch(await (await get('/personalidades/djonga')).text(), /Referência de teste criada/);

  const edicao = await (await get('/admin/personalidades/djonga', cookie)).text();
  const id = /referencias\/([a-f0-9-]{36})"/.exec(edicao)[1];
  await post(`/admin/personalidades/djonga/referencias/${id}`, { acao: 'publicar' }, { cookie });
  const publico = await (await get('/personalidades/djonga')).text();
  assert.match(publico, /Mencionado em entrevista/);
  assert.match(publico, /Referência de teste criada/);

  // Ana Elisa não pode ser publicada sem perfil completo
  const anaErro = await post('/admin/personalidades/ana-elisa', { nome: 'Ana Elisa', status: 'publicado' }, { cookie });
  assert.equal(anaErro.status, 400);
  assert.equal((await get('/personalidades/ana-elisa')).status, 404);
});

test('home: personalidades acima da citação; citação do Manifesto', async () => {
  const home = await (await get('/')).text();
  const iInspira = home.indexOf('id="inspira-titulo"');
  const iMesa = home.indexOf('id="mesa-titulo"');
  const iTrecho = home.indexOf('id="trecho-titulo"');
  assert.ok(iInspira > 0 && iInspira < iMesa && iMesa < iTrecho, 'ordem: inspira, mesa, trecho');
  assert.match(home, /A perpetuação da atual ordem de coisas é/);
  assert.match(home, /\/livros\/as-veias-abertas-da-america-latina/);
  assert.doesNotMatch(home, /Têm um mundo a ganhar/);
  assert.doesNotMatch(home, /Ao verme que primeiro roeu/);
});

test('acesso aos livros: grátis em domínio público e busca nas lojas', async () => {
  const ursula = await (await get('/livros/ursula')).text();
  assert.match(ursula, /Ler grátis no Wikisource/);
  assert.match(ursula, /pt\.wikisource\.org\/wiki\/%C3%9Arsula/);
  assert.match(ursula, /estantevirtual\.com\.br\/busca\?q=/);
  assert.match(ursula, /buscape\.com\.br\/search\?q=/);
  const quarto = await (await get('/livros/quarto-de-despejo')).text();
  assert.doesNotMatch(quarto, /Ler grátis/);
  assert.match(quarto, /Onde encontrar/);
});

test('novas referências: publicadas aparecem, rascunhos não', async () => {
  const djonga = await (await get('/personalidades/djonga')).text();
  assert.match(djonga, /Indicado por Djonga/);
  assert.match(djonga, /Dom Quixote/);
  assert.match(djonga, /Ouro Preto/);
  const donl = await (await get('/personalidades/don-l')).text();
  assert.match(donl, /Presente de Don L no Tiny Desk Brasil/);
  assert.match(donl, /As Veias Abertas da América Latina/);
  const jones = await (await get('/personalidades/jones-manoel')).text();
  assert.match(jones, /Indicado por Jones Manoel/);
  assert.match(jones, /A negação do Brasil negro/);
  assert.doesNotMatch(jones, /Colonialismo e luta anticolonial/);
  assert.doesNotMatch(jones, /Velhos demais para morrer/);
  const erika = await (await get('/personalidades/erika-hilton')).text();
  assert.match(erika, /Políticas do encanto/);
  assert.match(erika, /mais votada da história da Câmara/);
  assert.match(erika, /camara\.leg\.br\/noticias\/1309197/);
  assert.match(donl, /\/livros\/as-veias-abertas-da-america-latina/);
  assert.doesNotMatch(erika, /O que te faz lutar/);
});

test('trilha "Quem escreveu da margem?" com as quatro autoras', async () => {
  const trilha = await (await get('/trilhas/vozes-da-margem')).text();
  const ordem = ['Sobrevivendo no Inferno', 'Becos da Memória', 'Úrsula', 'Mulher Nua', 'Um Defeito de Cor'].map((t) => trilha.indexOf(`>${t}</a></h3>`));
  assert.ok(ordem.every((i) => i > 0), 'as cinco etapas aparecem');
  assert.deepEqual([...ordem].sort((a, b) => a - b), ordem, 'do introdutório ao aprofundado');
  assert.doesNotMatch(trilha, /A Hora da Estrela<\/a><\/h3>/);
  for (const c of ['/livros/um-defeito-de-cor', '/livros/mulher-nua', '/autores/ana-maria-goncalves', '/autores/gilka-machado']) {
    assert.equal((await get(c)).status, 200, c);
  }
  const ana = await (await get('/autores/ana-maria-goncalves')).text();
  assert.match(ana, /CC BY 3\.0/);
  const tudo = trilha + ana + (await (await get('/livros/mulher-nua')).text());
  assert.doesNotMatch(tudo, /Visão dos Afogados|Proibição do Corpo/i);
});

test('indicações de Jones Manoel para 2026, com link no minuto do vídeo', async () => {
  const jones = await (await get('/personalidades/jones-manoel')).text();
  for (const titulo of ['A ordem do capital', 'O Brasil como problema', 'Lugar de negro', 'Aspectos políticos do pleno emprego', 'Dependência e revolução na América Latina', 'Rebeliões da senzala', 'Dialética radical do Brasil negro', 'A questão da universidade', 'Lugar periférico, ideias modernas', 'Camisas de força jurídicas']) {
    assert.ok(jones.includes(titulo), titulo);
  }
  assert.match(jones, /youtube\.com\/watch\?v=-_aE30_05K4&amp;t=794s/);
  assert.doesNotMatch(jones, /Kaleck[^i]|Marine|Legalização da Austeridade/);
});

test('menu: ordem nova, Sobre nós no lugar de Conceitos e Admin escondido', async () => {
  const home = await (await get('/')).text();
  const menu = /<ul class="topo__links">([\s\S]*?)<\/ul>/.exec(home)[1];
  const itens = [...menu.matchAll(/>([^<]+)<\/a>/g)].map((m) => m[1]);
  assert.deepEqual(itens, ['Biblioteca', 'Trilhas', 'Autores', 'Quem lê', 'Sobre nós']);
  assert.match(home, /class="rodape__links"[\s\S]*href="\/conceitos"/);
  assert.doesNotMatch(home, /Área administrativa/);

  const sobrePg = await get('/sobre');
  assert.equal(sobrePg.status, 200);
  const s = await sobrePg.text();
  assert.match(s, /<h1[^>]*>Sobre nós<\/h1>/);
  assert.match(s, /Na curadoria da Marginália/);

  const admin = cookieDe(await post('/entrar', { email: 'editora@teste.test', senha: 'senha-de-teste-5' }));
  const comoAdmin = await (await get('/', admin)).text();
  const topo = /<header class="topo">([\s\S]*?)<\/header>/.exec(comoAdmin)[1];
  assert.doesNotMatch(topo, /href="\/admin"/);
  assert.match(comoAdmin, /class="rodape__admin" href="\/admin"/);
});

test('toda trilha começa no introdutório e nunca volta de nível', async () => {
  const { trilhas, livroPorSlug } = await import('../content/catalog.js');
  const ordem = { introdutorio: 0, intermediario: 1, aprofundado: 2 };
  for (const t of trilhas) {
    const niveis = t.etapas.map((e) => ordem[livroPorSlug.get(e.livro).nivel]);
    assert.equal(niveis[0], 0, `${t.slug} começa no introdutório`);
    assert.deepEqual([...niveis].sort((a, b) => a - b), niveis, `${t.slug} em ordem crescente`);
    const pagina = await (await get(`/trilhas/${t.slug}`)).text();
    assert.match(pagina, /Introdutório →|Introdutório ·/);
  }
  assert.match(await (await get('/livros/recordacoes-do-escrivao-isaias-caminha')).text(), /Ler grátis no Wikisource/);
});
