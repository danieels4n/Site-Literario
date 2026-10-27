// Substitui as personalidades do banco pelo conteúdo de content/personalidades.js.
// ATENÇÃO: apaga edições feitas na área administrativa. Pare o servidor antes de rodar.
// Uso: node scripts/ressemear-personalidades.js [--sim]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { personalidadesSemente } from '../content/personalidades.js';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const caminho = process.env.MARGINALIA_DB || join(raiz, 'data', 'db.json');

if (!process.argv.includes('--sim')) {
  console.log(`Isto vai sobrescrever as personalidades em ${caminho}, inclusive edições do /admin.`);
  console.log('Rode de novo com --sim para confirmar.');
  process.exit(1);
}
if (!existsSync(caminho)) {
  console.log('Banco ainda não existe; ele será semeado na primeira execução do servidor.');
  process.exit(0);
}
const dados = JSON.parse(readFileSync(caminho, 'utf8'));
dados.personalidades = structuredClone(personalidadesSemente);
writeFileSync(caminho, JSON.stringify(dados, null, 2));
console.log(`Personalidades ressemeadas: ${dados.personalidades.length}.`);
