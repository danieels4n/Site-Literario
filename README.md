# Marginália

Plataforma web de leitura e formação crítica: biblioteca, página do livro, trilhas de leitura,
autores, conceitos, cadastro/login, favoritos (asterisco) e progresso de leitura.

Identidade, direção de arte e decisões: veja [PRODUCT.md](PRODUCT.md).

## Rodar

Requer Node.js 22 ou mais novo. Não há dependências para instalar.

```bash
npm start
```

Abra http://localhost:3000. Variáveis opcionais: `PORT`, `MARGINALIA_DB` (caminho do banco JSON,
padrão `data/db.json`) e `COOKIE_SECURE=1` quando servir por HTTPS.

## Testes

```bash
npm test
```

Cobrem: todas as páginas públicas, 404 e path traversal; busca sem acento e filtros; validação do
cadastro e e-mail repetido; login, volta segura, asterisco, progresso (limites e valores inválidos),
estante, progresso da trilha e logout; exigência de login e de mesma origem nos POSTs; escape de HTML.

## Contas de teste

Os testes automatizados criam contas temporárias e apagam o banco ao final. Contas criadas no navegador ficam só no `data/db.json` local, fora do git. Para zerar o ambiente local, apague `data/db.json`.

## Quem inspira, o que lê (personalidades)

- Conteúdo inicial em `content/personalidades.js`. Na primeira execução ele é copiado para o banco;
  depois disso, é editado em `/admin/personalidades`.
- Administradores: e-mails na variável `MARGINALIA_ADMINS` (separados por vírgula) ou, sem ela, no
  arquivo `data/admins.txt` (um por linha, fora do git). A pessoa precisa ter conta criada.
- Referências novas entram como rascunho; só as publicadas aparecem no site. Toda referência que não
  é de curadoria exige fonte com link. Perfis em "confirmar identidade" ou rascunho ficam fora do site.
- Para recarregar a semente no banco (apaga edições do admin): pare o servidor e rode

```bash
node scripts/ressemear-personalidades.js --sim
```

## Publicar (Render)

O arquivo `render.yaml` descreve o serviço. Passo a passo:

1. Crie uma conta em render.com entrando com o GitHub.
2. Em **New → Blueprint**, escolha o repositório `marginalia`. O Render lê o `render.yaml`.
3. Quando pedir, preencha `MARGINALIA_ADMINS` com o e-mail do administrador.
4. Confirme o plano **Starter** (o disco persistente, onde fica o banco, exige plano pago).
5. Depois do deploy, abra o endereço `.onrender.com`, crie a conta com o e-mail de administrador e
   acesse `/admin` (link discreto no rodapé).
6. Domínio próprio: em **Settings → Custom Domains** do serviço, e aponte o DNS como o Render indicar.

Cada `git push` na branch `main` publica de novo automaticamente. O banco fica em `/var/data/db.json`;
faça backup baixando esse arquivo pelo **Shell** do Render de tempos em tempos.

## Estrutura

```
server.js            rotas, validação, sessões, estáticos
lib/                 db (JSON atômico), auth (scrypt, cookies), html (escape)
content/catalog.js   livros, autores, conceitos, trilhas, fotos
views/               templates por superfície
public/css, js, img  estilo, melhorias progressivas, imagens otimizadas
assets/              originais das imagens + credits.json (fonte e licença)
```

## Imagens

Todas de domínio público (fundo Correio da Manhã/Arquivo Nacional e primeiras edições), via
Wikimedia Commons. Lista com links em `/creditos` e em `assets/credits.json`.
