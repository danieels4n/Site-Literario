// Banco de dados em arquivo JSON, com gravação atômica e fila de escrita.
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { writeFile, rename } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

const VAZIO = () => ({ usuarios: [], sessoes: {}, estantes: {}, personalidades: null, percursos: {}, editorial: { temas: {}, acessos: {} } });

export function abrirBanco(caminho, { sementePersonalidades = [] } = {}) {
  let dados = VAZIO();
  if (existsSync(caminho)) {
    try {
      dados = { ...VAZIO(), ...JSON.parse(readFileSync(caminho, 'utf8')) };
      dados.editorial = { temas: {}, acessos: {}, ...dados.editorial };
    } catch (erro) {
      throw new Error(`Não foi possível ler o banco em ${caminho}: ${erro.message}`);
    }
  } else {
    mkdirSync(dirname(caminho), { recursive: true });
  }

  // Semeia as personalidades só na primeira vez; depois, o banco é a fonte (editado no /admin).
  if (!Array.isArray(dados.personalidades)) dados.personalidades = structuredClone(sementePersonalidades);

  // Retratos trocados depois da semente: atualiza só onde ainda está a foto antiga (edições do admin ficam).
  const RETRATOS_SUBSTITUIDOS = { '/img/jones-manoel-2022.jpg': 'jones-manoel', '/img/jones-manoel-2023.jpg': 'jones-manoel' };
  let migrou = false;
  for (const p of dados.personalidades) {
    const slug = RETRATOS_SUBSTITUIDOS[p.retrato?.img];
    const novo = slug === p.slug && sementePersonalidades.find((s) => s.slug === slug)?.retrato;
    if (novo && novo.img !== p.retrato.img) { p.retrato = structuredClone(novo); migrou = true; }
  }

  let fila = Promise.resolve();
  function salvar() {
    const copia = JSON.stringify(dados, null, 2);
    fila = fila.then(async () => {
      const tmp = `${caminho}.${process.pid}.tmp`;
      await writeFile(tmp, copia, 'utf8');
      await rename(tmp, caminho);
    });
    return fila;
  }

  if (migrou && existsSync(caminho)) salvar();

  return {
    salvar,
    // Usuários
    usuarioPorEmail(email) {
      const alvo = email.trim().toLowerCase();
      return dados.usuarios.find((u) => u.email === alvo) || null;
    },
    usuarioPorId(id) {
      return dados.usuarios.find((u) => u.id === id) || null;
    },
    async criarUsuario({ nome, email, senhaHash }) {
      const usuario = { id: randomUUID(), nome: nome.trim(), email: email.trim().toLowerCase(), senhaHash, criadoEm: new Date().toISOString() };
      dados.usuarios.push(usuario);
      await salvar();
      return usuario;
    },
    // Sessões (guardamos só o hash do token)
    async criarSessao(tokenHash, usuarioId, expiraEm) {
      dados.sessoes[tokenHash] = { usuarioId, expiraEm };
      await salvar();
    },
    sessao(tokenHash) {
      const s = dados.sessoes[tokenHash];
      if (!s) return null;
      if (s.expiraEm < Date.now()) {
        delete dados.sessoes[tokenHash];
        salvar();
        return null;
      }
      return s;
    },
    async apagarSessao(tokenHash) {
      delete dados.sessoes[tokenHash];
      await salvar();
    },
    // Estante: { [slug]: { asterisco, status, progresso, atualizadoEm } }
    estante(usuarioId) {
      return dados.estantes[usuarioId] || {};
    },
    async atualizarLivro(usuarioId, slug, mudancas) {
      const estante = (dados.estantes[usuarioId] ||= {});
      const atual = estante[slug] || { asterisco: false, status: null, progresso: 0 };
      const novo = { ...atual, ...mudancas, atualizadoEm: new Date().toISOString() };
      if (!novo.asterisco && !novo.status) delete estante[slug];
      else estante[slug] = novo;
      await salvar();
      return estante[slug] || { asterisco: false, status: null, progresso: 0 };
    },
    // Percursos salvos ("Por onde começar?"): só a consulta, o percurso é refeito a partir da curadoria.
    percursosSalvos(usuarioId) {
      return dados.percursos[usuarioId] || [];
    },
    async salvarPercurso(usuarioId, { consulta, titulo }) {
      const lista = (dados.percursos[usuarioId] ||= []);
      const existente = lista.find((p) => p.consulta === consulta);
      if (existente) return existente;
      const novo = { id: randomUUID(), consulta, titulo, criadoEm: new Date().toISOString() };
      lista.unshift(novo);
      lista.splice(20);
      await salvar();
      return novo;
    },
    async removerPercurso(usuarioId, id) {
      const lista = dados.percursos[usuarioId] || [];
      const i = lista.findIndex((p) => p.id === id);
      if (i < 0) return false;
      lista.splice(i, 1);
      await salvar();
      return true;
    },
    // Curadoria dos percursos e revisão dos links de leitura grátis (só admin altera).
    editorialTemas() {
      return dados.editorial.temas;
    },
    async atualizarTemaEditorial(tema, mudancas) {
      dados.editorial.temas[tema] = { ...dados.editorial.temas[tema], ...mudancas, atualizadoEm: new Date().toISOString() };
      await salvar();
      return dados.editorial.temas[tema];
    },
    acessos() {
      return dados.editorial.acessos;
    },
    async revisarAcesso(slug, situacao) {
      dados.editorial.acessos[slug] = { situacao, verificadoEm: new Date().toISOString().slice(0, 10) };
      await salvar();
      return dados.editorial.acessos[slug];
    },
    // Personalidades ("Quem inspira, o que lê")
    personalidades() {
      return dados.personalidades;
    },
    personalidade(slug) {
      return dados.personalidades.find((p) => p.slug === slug) || null;
    },
    async criarPersonalidade(p) {
      dados.personalidades.push({ eixos: [], referencias: [], ligacoes: [], retrato: null, ...p });
      await salvar();
    },
    async atualizarPersonalidade(slug, mudancas) {
      const p = this.personalidade(slug);
      if (!p) return null;
      Object.assign(p, mudancas, { atualizadoEm: new Date().toISOString() });
      await salvar();
      return p;
    },
    async adicionarReferencia(slug, ref) {
      const p = this.personalidade(slug);
      if (!p) return null;
      const nova = { id: randomUUID(), criadoEm: new Date().toISOString(), ...ref };
      p.referencias.push(nova);
      await salvar();
      return nova;
    },
    async alterarReferencia(slug, id, mudancas) {
      const p = this.personalidade(slug);
      const r = p?.referencias.find((x) => x.id === id);
      if (!r) return null;
      if (mudancas === null) p.referencias = p.referencias.filter((x) => x.id !== id);
      else Object.assign(r, mudancas);
      await salvar();
      return r;
    },
  };
}
