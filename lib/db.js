// Banco de dados em arquivo JSON, com gravação atômica e fila de escrita.
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { writeFile, rename } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

const VAZIO = () => ({ usuarios: [], sessoes: {}, estantes: {}, personalidades: null });

export function abrirBanco(caminho, { sementePersonalidades = [] } = {}) {
  let dados = VAZIO();
  if (existsSync(caminho)) {
    try {
      dados = { ...VAZIO(), ...JSON.parse(readFileSync(caminho, 'utf8')) };
    } catch (erro) {
      throw new Error(`Não foi possível ler o banco em ${caminho}: ${erro.message}`);
    }
  } else {
    mkdirSync(dirname(caminho), { recursive: true });
  }

  // Semeia as personalidades só na primeira vez; depois, o banco é a fonte (editado no /admin).
  if (!Array.isArray(dados.personalidades)) dados.personalidades = structuredClone(sementePersonalidades);

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
