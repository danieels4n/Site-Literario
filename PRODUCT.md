# Marginália — documento de produto e identidade

Este arquivo é a memória do projeto: quem somos, para quem, como a interface fala e por quê.
Leia antes de mudar qualquer tela. Decisões novas entram aqui.

## O que é

Marginália é uma plataforma web de leitura e formação crítica. Reúne uma biblioteca de livros
(literatura brasileira, história, pensamento político e pedagógico), trilhas de leitura com etapas,
páginas de autores e de conceitos, e uma estante pessoal: o leitor cria conta, marca livros com
asterisco (favoritos) e registra o progresso de leitura.

O nome vem das anotações feitas na margem dos livros. A marca inteira parte disso: **ler é escrever
de volta no livro**. Daí o asterisco vermelho, os sublinhados feitos à mão e as notas laterais.

## Para quem

- Estudantes de ensino médio, cursinhos populares e graduação que querem entender o Brasil lendo.
- Leitores adultos sem formação acadêmica na área, que precisam de um ponto de partida claro.
- Educadores que procuram roteiros prontos (trilhas) para grupos de leitura.

O que eles precisam: saber **por onde começar**, entender **por que** um livro importa e
**acompanhar** o próprio percurso. Nada de jargão sem explicação.

## Tom de voz

- Direto, em português brasileiro, frases curtas. Convida, não doutrina.
- Explica termos difíceis na primeira vez em que aparecem (ou linka para o conceito).
- Nunca inventa números, citações, depoimentos ou fontes. Toda citação literal é de obra em
  domínio público e tem a referência ao lado. Sinopses e definições são texto editorial próprio.

## Direção de arte

**Uma publicação cultural independente que ganhou vida na web.** Três linguagens:

1. **Editorial independente** — revista literária, capas, cadernos anotados, manchetes.
2. **Cultura urbana brasileira** — lambe-lambe, fotocópia, zine, cartaz, colagem, foto documental.
3. **Formação crítica** — democratização do conhecimento, leitura acessível.

Direção de composição (sorteada pela skill design-taste-frontend, seed 1027096607):
**"The printed annual"** — eixo vertical fixo a ~42% da largura; títulos começam no eixo; à
esquerda dele ficam notas de margem, figuras e metadados (a marginália literal). Páginas de texto
se alternam com páginas de cor chapada, como numa impressão em duas cores.

### Paleta (proporções importam)

| Papel | Cor | Uso |
| --- | --- | --- |
| Creme papel | `#F2EBDD` | Fundo base de quase todas as telas |
| Preto contraste | `#171717` | Texto corrido, títulos, capas escuras |
| Vermelho resistência | `#A52A2A` | Asterisco, ação principal, intervenções. **Pouco e sempre com função** |
| Verde esperança | `#35483A` | Páginas de cor chapada (trilhas, chamadas), capas |
| Terracota | `#B64A32` | Apoio raro: marca-texto, capas. Não usar em texto pequeno (contraste 4,4:1) |
| Branco quente | `#FAF8F2` | Campos de formulário, texto sobre verde/preto |

Contrastes verificados: vermelho sobre creme 6,0:1; creme sobre verde 8,3:1; preto sobre creme 15:1.

### Tipografia

- **Display:** Archivo em largura condensada (wdth 62–75) e peso 800–900 — o cartaz de lambe-lambe.
- **Texto e interface:** Archivo em largura normal, 18–19px, entrelinha 1,55, medida ≤ 68 caracteres.
- **Metadados:** IBM Plex Mono, só para ano, editora, nível, categoria — a ficha catalográfica.

(A skill de direção pede no máximo duas famílias e nenhum mono; o briefing da marca pede mono para
metadados. A marca prevalece; o mono fica restrito a metadados curtos.)

### Elementos recorrentes

- **Asterisco vermelho** — marca do nome, favorito ("marcar com asterisco"), nota de margem.
- **Sublinhado manual** (SVG de traço irregular) — em links de destaque e trechos citados.
- **Notas de margem** — na coluna à esquerda do eixo: contexto, datas, fontes.
- **Fotocópia** — fotos documentais em P&B com contraste alto e textura discreta de papel.
- **Capas como objetos** — primeiras edições reais (domínio público) quando existem; quando não,
  capas tipográficas criadas pela Marginália, identificadas como tal no texto alternativo.
- **Etiquetas** — temas e níveis como etiquetas retangulares, sem cantos arredondados.

### Evitar

Hero centralizado com gradiente; grades de cartões brancos arredondados idênticos; sombras e vidro
sem função; ícones decorativos; seções repetidas com a mesma estrutura; parallax, flutuações,
animação exibicionista; texturas e fotos aleatórias; números, citações ou fontes inventadas.

### Movimento

Curto (120–300ms em controles, até 900ms na manchete), curva `cubic-bezier(.2,.8,.2,1)`, só
`transform` e `opacity`. Feedback imediato em botões, filtros e menus. Entradas discretas apenas
quando orientam a leitura. `prefers-reduced-motion` remove deslocamentos e mantém o conteúdo.

## Superfícies

| Tela | Função | Composição |
| --- | --- | --- |
| Home | Capa da publicação | Manchete no eixo + foto documental; "Por onde começar" (escolha interativa de trilha); capas na mesa; frase sublinhada; índice de conceitos; chamada para criar estante |
| Biblioteca | Descoberta | Busca no eixo, filtros como etiquetas, capas com presença e densidade que varia com a tela |
| Livro | Página editorial | Capa grande à esquerda do eixo, ficha em mono, sinopse em medida de leitura, contexto como nota de margem, conceitos, trilhas, relacionados |
| Trilhas | Progressão | Cada trilha é uma pergunta; etapas em sequência com objetivo e pergunta-guia; progresso do leitor |
| Autores | Texto biográfico | Retrato como capitular, anos e lugares em mono, contexto histórico, obras |
| Conceitos | Verbete | Termo enorme, definição como enunciado, "em outras palavras", ligações e referências |
| Entrar / Cadastro | Ficha de leitor | Formulário como ficha de biblioteca, erros junto ao campo |
| Estante | Percurso pessoal | Lendo (com progresso), quero ler, lidos, asteriscos |

Mobile: recompor, não encolher. O eixo colapsa na margem esquerda; notas de margem entram no fluxo
acima do parágrafo a que se referem; navegação em menu simples.

## Quem inspira, o que lê

Seção de personalidades (home, `/personalidades`, perfil individual, filtro na biblioteca, bloco
na página do livro, área administrativa). Curadoria inicial: Mano Brown, Emicida, Erika Hilton, Jones Manoel,
Djonga, Don L e Ana Elisa (esta fica fora do site até a identidade ser confirmada).

Regras editoriais, obrigatórias:

- **Eixos** organizam a descoberta. Não afirmam que a pessoa recomendou livros sobre esses temas,
  e a interface diz isso nos perfis e no catálogo.
- **Rótulos** (no carimbo vermelho): "Indicado por X" só para recomendação explícita;
  "Mencionado em entrevista" quando a obra só aparece numa conversa; rótulo contextual quando a
  ligação é outra (ex.: "Citado no lançamento de Mano a Mano", "Obra dos Racionais MC's",
  "Na caixa Leitura Emancipa da turnê"); "Na curadoria da Marginália" para escolhas nossas,
  sempre separadas das referências com fonte.
- **Fonte** com veículo, data e link em toda referência que não é de curadoria. Fonte que só
  reproduz outra é marcada como secundária, com nota visível.
- Nunca: recomendações, citações, datas ou links inventados; letras de música ou interpretação de
  fãs apresentadas como recomendação literária.
- **Retratos** sempre com crédito e licença visíveis no perfil e em `/creditos`. Preferência por licença
  aberta; o retrato de Jones Manoel é do PCB, liberado para reprodução com citação da fonte. Sem foto
  identificada com segurança, usa-se o bloco vermelho com iniciais e o aviso "retrato pendente".

Composição: na home, mosaico assimétrico em página preta; no catálogo, faixas alternadas preto/creme
com o retrato trocando de lado; no perfil, cada referência é um recorte de jornal com carimbo.

## Acesso aos livros (democratização)

- **Domínio público:** quando há texto integral conferido, a página do livro mostra "Ler grátis no
  Wikisource" logo abaixo da ficha e num bloco verde. No Wikisource o leitor baixa PDF ou EPUB. Não
  hospedamos PDFs nem geramos links de exportação que não pudemos conferir.
- **Comprar ou emprestar:** links de busca para usados (Estante Virtual), comparador (Buscapé) e
  novos (Amazon), mais o lembrete das bibliotecas públicas. Sem preços na página: mudam todo dia.
  Sem comissão.
- **Comparação real de preços** (mostrar o menor preço dentro do site) exige integração com APIs de
  lojas ou programas de afiliados (ex.: Amazon Associates, Buscapé/Zoom), com chaves e termos de uso.
  Fica como decisão futura; se houver comissão, ela precisa ser declarada na página.

## Arquitetura (decisão registrada)

- Node.js ≥ 22, **sem dependências externas**: `node:http`, `node:crypto` (scrypt), arquivo JSON
  como banco (`data/db.json`, gravação atômica). Renderização no servidor (HTML completo, funciona
  sem JavaScript); `public/js/app.js` melhora a experiência (filtro ao vivo, favoritos sem recarregar).
- Conteúdo editorial em `content/catalog.js` (livros, autores, conceitos, trilhas).
- Sessões por cookie HttpOnly + SameSite=Lax; POST exige mesma origem.
- Imagens em `assets/` com créditos em `assets/credits.json`, exibidos no rodapé.

## Pendências conhecidas

- Fotos de autores sem retrato em domínio público verificado usam composição tipográfica.
- Conteúdo editorial (sinopses, definições, trilhas) deve ser revisado por quem cuida do acervo.
- Não há recuperação de senha nem e-mail transacional.
