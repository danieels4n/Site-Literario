// Senhas (scrypt) e sessões por cookie.
import { scrypt, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const COOKIE = 'mg_sessao';
const DURACAO = 1000 * 60 * 60 * 24 * 30; // 30 dias

export async function gerarHash(senha) {
  const sal = randomBytes(16);
  const chave = await scryptAsync(senha.normalize('NFKC'), sal, 64);
  return `scrypt$${sal.toString('base64')}$${chave.toString('base64')}`;
}

export async function conferirSenha(senha, hash) {
  const [alg, salB64, chaveB64] = String(hash).split('$');
  if (alg !== 'scrypt' || !salB64 || !chaveB64) return false;
  const esperada = Buffer.from(chaveB64, 'base64');
  const chave = await scryptAsync(senha.normalize('NFKC'), Buffer.from(salB64, 'base64'), esperada.length);
  return timingSafeEqual(chave, esperada);
}

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

export function lerCookies(cabecalho = '') {
  const cookies = {};
  for (const parte of cabecalho.split(';')) {
    const i = parte.indexOf('=');
    if (i < 0) continue;
    const nome = parte.slice(0, i).trim();
    try {
      cookies[nome] = decodeURIComponent(parte.slice(i + 1).trim());
    } catch {
      /* cookie malformado: ignorar */
    }
  }
  return cookies;
}

export async function iniciarSessao(db, usuarioId, seguro) {
  const token = randomBytes(32).toString('base64url');
  await db.criarSessao(hashToken(token), usuarioId, Date.now() + DURACAO);
  return cookieSessao(token, DURACAO / 1000, seguro);
}

export function usuarioDaRequisicao(db, req) {
  const token = lerCookies(req.headers.cookie)[COOKIE];
  if (!token) return null;
  const sessao = db.sessao(hashToken(token));
  if (!sessao) return null;
  return db.usuarioPorId(sessao.usuarioId);
}

export async function encerrarSessao(db, req, seguro) {
  const token = lerCookies(req.headers.cookie)[COOKIE];
  if (token) await db.apagarSessao(hashToken(token));
  return cookieSessao('', 0, seguro);
}

function cookieSessao(valor, maxAge, seguro) {
  return `${COOKIE}=${valor}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${seguro ? '; Secure' : ''}`;
}

// Limite simples de tentativas de login (em memória).
const tentativas = new Map();
export function tentativasEsgotadas(chave) {
  const agora = Date.now();
  const lista = (tentativas.get(chave) || []).filter((t) => agora - t < 15 * 60 * 1000);
  tentativas.set(chave, lista);
  return lista.length >= 8;
}
export function registrarFalha(chave) {
  const lista = tentativas.get(chave) || [];
  lista.push(Date.now());
  tentativas.set(chave, lista);
}
export function limparFalhas(chave) {
  tentativas.delete(chave);
}
