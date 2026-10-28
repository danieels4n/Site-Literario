// Personalidades da seção "Quem inspira, o que lê".
// Este arquivo é a SEMENTE: na primeira execução o conteúdo é copiado para o banco e,
// a partir daí, é editado pela área administrativa (/admin).
//
// Regras editoriais (ver PRODUCT.md):
// - Eixos são temas para organizar a descoberta, NÃO afirmações de que a pessoa recomendou livros sobre eles.
// - Toda referência tem fonte verificável e contexto. Nada de recomendação, citação, data ou link inventados.
// - Letras de música, interpretação de fãs e referências culturais NÃO são recomendações literárias.

export const EIXOS = {
  historia: 'História',
  marxismo: 'Marxismo',
  politica: 'Política',
  'formacao-teorica': 'Formação teórica',
  rap: 'Rap',
  desigualdade: 'Desigualdade',
  identidade: 'Identidade',
  raca: 'Raça e consciência racial',
  sociedade: 'Sociedade',
  cultura: 'Cultura brasileira',
  'critica-social': 'Crítica social',
  linguagem: 'Linguagem',
  experimentacao: 'Experimentação artística',
  periferia: 'Periferia',
  literatura: 'Literatura',
  educacao: 'Educação',
  memoria: 'Memória',
  transformacao: 'Transformação social',
  genero: 'Gênero e sexualidade',
};

// tipo → rótulo exibido. 'contexto' usa o campo rotulo da própria referência.
export const TIPOS_REFERENCIA = {
  indicado: 'Indicação explícita (INDICADO POR …)',
  'mencionado-entrevista': 'Mencionado em entrevista',
  contexto: 'Rótulo contextual (escrever abaixo)',
  curadoria: 'Escolha editorial (NA CURADORIA DA MARGINÁLIA)',
};

export const STATUS_PERSONALIDADE = {
  publicado: 'Publicado',
  rascunho: 'Rascunho',
  'confirmar-identidade': 'Confirmar identidade antes de publicar',
};

export function rotuloReferencia(ref, nomeCurto) {
  if (ref.tipo === 'indicado') return `Indicado por ${nomeCurto}`;
  if (ref.tipo === 'mencionado-entrevista') return 'Mencionado em entrevista';
  if (ref.tipo === 'curadoria') return 'Na curadoria da Marginália';
  return ref.rotulo || 'Referência';
}

const FONTE_45 = {
  titulo: 'A voz das ruas, tá ligado? (trechos de Mano a Mano)',
  veiculo: 'Quatro Cinco Um',
  data: '2025-10-27',
  url: 'https://quatrocincoum.com.br/trechos/trechos/a-voz-das-ruas-ta-ligado/',
};

export const personalidadesSemente = [
  {
    slug: 'mano-brown',
    nome: 'Mano Brown',
    nomeCurto: 'Mano Brown',
    status: 'publicado',
    papel: 'Rapper, compositor e apresentador',
    descricao:
      'Pedro Paulo Soares Pereira, o Mano Brown, cresceu no Capão Redondo, zona sul de São Paulo, e é uma das vozes dos Racionais MC’s, grupo que mudou a forma de contar a periferia no Brasil. Desde 2021 conduz o podcast Mano a Mano, de conversas longas com convidados de várias áreas, que virou livro em 2025.',
    eixos: ['rap', 'periferia', 'desigualdade', 'raca', 'politica'],
    retrato: {
      img: '/img/mano-brown-2013.jpg', w: 800, h: 1200, pos: '50% 30%',
      alt: 'Mano Brown no palco, de boné e jaqueta jeans, com os braços erguidos, em 2013',
      credito: 'Fernando Eduardo', licenca: 'CC BY 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:Racionais_MC%27s_(12197897183).jpg',
    },
    ligacoes: [
      { pessoa: 'emicida', texto: 'Esteve entre os convidados do podcast Mano a Mano, cujas entrevistas foram reunidas em livro em 2025.', fonte: FONTE_45 },
    ],
    referencias: [
      {
        id: 'mb-malcolm',
        livro: 'autobiografia-de-malcolm-x',
        tipo: 'contexto',
        rotulo: 'Citado no lançamento de Mano a Mano',
        contexto:
          'No lançamento do livro Mano a Mano, Brown disse não se considerar um grande leitor e que deveria ter lido muito mais. Segundo a reportagem, citou a autobiografia de Malcolm X como “o livro da sua vida”.',
        fonte: {
          titulo: 'Mano Brown lança “Mano a Mano” em livro e reforça diálogo como instrumento de transformação',
          veiculo: 'GR6',
          data: '',
          url: 'https://www.gr6.com.br/mano-brown-lanca-mano-a-mano-em-livro-e-reforca-dialogo-como-instrumento-de-transformacao/',
        },
        verificacao: 'secundaria',
        notaVerificacao: 'Relato da reportagem, sem gravação ou transcrição da fala. A matéria não traz o ano no texto.',
        status: 'publicado',
      },
      {
        id: 'mb-sobrevivendo',
        livro: 'sobrevivendo-no-inferno',
        tipo: 'contexto',
        rotulo: 'Obra dos Racionais MC’s',
        contexto:
          'As letras do álbum de 1997 dos Racionais MC’s, grupo de Mano Brown, foram publicadas em livro pela Companhia das Letras, com apresentação de Acauam Silvério de Oliveira. A obra entrou na lista de leitura obrigatória do vestibular da Unicamp.',
        fonte: {
          titulo: 'As letras de “Sobrevivendo no inferno”, de Racionais MC’s',
          veiculo: 'Blog da Companhia das Letras',
          data: '2019-01-11',
          url: 'https://blog.companhiadasletras.com.br/as-letras-de-sobrevivendo-no-inferno-de-racionais-mcs/',
        },
        verificacao: 'direta',
        status: 'publicado',
      },
      {
        id: 'mb-conceicao',
        livro: 'becos-da-memoria',
        tipo: 'contexto',
        rotulo: 'Autora entrevistada no Mano a Mano',
        contexto:
          'Conceição Evaristo está entre as pessoas entrevistadas por Mano Brown no podcast Mano a Mano e reunidas no livro de 2025. A ligação é com a autora, não uma indicação deste livro específico.',
        fonte: FONTE_45,
        verificacao: 'direta',
        status: 'publicado',
      },
      {
        id: 'mb-cur-quarto',
        livro: 'quarto-de-despejo',
        tipo: 'curadoria',
        contexto: 'Escolha da Marginália para o eixo periferia e desigualdade: a cidade de São Paulo vista de dentro da favela, décadas antes do rap.',
        fonte: null,
        status: 'publicado',
      },
    ],
  },
  {
    slug: 'emicida',
    nome: 'Emicida',
    nomeCurto: 'Emicida',
    status: 'publicado',
    papel: 'Rapper, compositor e escritor',
    descricao:
      'Leandro Roque de Oliveira, o Emicida, é rapper e compositor de São Paulo e um dos fundadores da Laboratório Fantasma. Também escreve para crianças: Amoras, publicado em 2018, foi o primeiro de seus livros infantis.',
    eixos: ['literatura', 'educacao', 'cultura', 'memoria', 'identidade', 'desigualdade', 'transformacao'],
    retrato: {
      img: '/img/emicida-2020.jpg', w: 863, h: 1300, pos: '50% 25%',
      alt: 'Emicida no palco, de óculos, com a mão junto ao ouvido, em 2020',
      credito: 'Bruno Figueiredo / Festival Sensacional', licenca: 'CC BY-SA 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:Emicida_Festival_Sensacional_2020.jpg',
    },
    ligacoes: [
      { pessoa: 'mano-brown', texto: 'Entrevistou Emicida no podcast Mano a Mano, cujas entrevistas foram reunidas em livro em 2025.', fonte: FONTE_45 },
    ],
    referencias: (() => {
      const fonte2014 = {
        titulo: 'Emicida recomenda 4 livros de sua vasta coleção literária',
        veiculo: 'Vai Ser Rimando',
        data: '2014-10-06',
        url: 'https://vaiserrimando.com.br/emicida-recomenda-4-livros/',
      };
      const nota2014 = 'Fonte secundária: a página reproduz uma lista publicada pelo Estadão, cujo texto original não conseguimos consultar.';
      const fonteCaixa = {
        titulo: 'Emicida espalha livros pelo Brasil em ação que antecede turnê',
        veiculo: 'Aurora Cultural',
        data: '2026-04-15',
        url: 'https://auroracultural.com/noticias/cultura/emicida-espalha-livros-pelo-brasil-em-acao-que-antecede-turne/',
      };
      const ctxCaixa = 'Livro de uma das caixas da ação Leitura Emancipa, instaladas antes dos shows da turnê Emicida Racional. A matéria diz que os títulos foram “selecionados por refletirem o universo criativo do artista”, mas não afirma que ele mesmo os escolheu.';
      return [
        { id: 'em-povo', livro: 'o-povo-brasileiro', tipo: 'indicado', contexto: 'Um dos quatro livros de sua biblioteca que Emicida indicou em 2014, numa lista publicada originalmente pelo Estadão.', fonte: fonte2014, verificacao: 'secundaria', notaVerificacao: nota2014, status: 'publicado' },
        { id: 'em-beah', obra: { titulo: 'Muito longe de casa', autor: 'Ishmael Beah' }, tipo: 'indicado', contexto: 'Também na lista de quatro livros indicados por Emicida em 2014.', fonte: fonte2014, verificacao: 'secundaria', notaVerificacao: nota2014, status: 'publicado' },
        { id: 'em-alem', obra: { titulo: 'Escravos', autor: 'Kangni Alem' }, tipo: 'indicado', contexto: 'Também na lista de quatro livros indicados por Emicida em 2014.', fonte: fonte2014, verificacao: 'secundaria', notaVerificacao: nota2014, status: 'publicado' },
        { id: 'em-gbowee', obra: { titulo: 'Guerreiras da paz', autor: 'Leymah Gbowee' }, tipo: 'indicado', contexto: 'Também na lista de quatro livros indicados por Emicida em 2014.', fonte: fonte2014, verificacao: 'secundaria', notaVerificacao: nota2014, status: 'publicado' },
        { id: 'em-cx-sobrevivendo', livro: 'sobrevivendo-no-inferno', tipo: 'contexto', rotulo: 'Na caixa Leitura Emancipa da turnê', contexto: ctxCaixa, fonte: fonteCaixa, verificacao: 'direta', status: 'publicado' },
        { id: 'em-cx-krenak', obra: { titulo: 'A vida não é útil', autor: 'Ailton Krenak' }, tipo: 'contexto', rotulo: 'Na caixa Leitura Emancipa da turnê', contexto: ctxCaixa, fonte: fonteCaixa, verificacao: 'direta', status: 'publicado' },
        { id: 'em-cx-bagno', obra: { titulo: 'Preconceito linguístico', autor: 'Marcos Bagno' }, tipo: 'contexto', rotulo: 'Na caixa Leitura Emancipa da turnê', contexto: ctxCaixa, fonte: fonteCaixa, verificacao: 'direta', status: 'publicado' },
        { id: 'em-cx-cidinha', obra: { titulo: 'Só bato em cachorro grande, do meu tamanho ou maior', autor: 'Cidinha da Silva' }, tipo: 'contexto', rotulo: 'Na caixa Leitura Emancipa da turnê', contexto: ctxCaixa, fonte: fonteCaixa, verificacao: 'direta', status: 'publicado' },
        { id: 'em-cur-pedagogia', livro: 'pedagogia-do-oprimido', tipo: 'curadoria', contexto: 'Escolha da Marginália para o eixo educação e transformação social.', fonte: null, status: 'publicado' },
      ];
    })(),
  },
  {
    slug: 'erika-hilton',
    nome: 'Erika Hilton',
    nomeCurto: 'Erika Hilton',
    status: 'publicado',
    papel: 'Deputada federal',
    fontePerfil: { titulo: 'Erika Hilton é a campeã de votos da bancada feminina', veiculo: 'Agência Câmara de Notícias', data: '2026-10-05', url: 'https://www.camara.leg.br/noticias/1309197-erika-hilton-e-a-campea-de-votos-da-bancada-feminina' },
    descricao:
      'Erika Santos Silva, a Erika Hilton, nasceu em Franco da Rocha (SP). Em 2020 tornou-se a primeira mulher trans eleita para a Câmara Municipal de São Paulo e, em 2022, uma das duas primeiras pessoas trans eleitas para o Congresso Nacional. Deputada federal pelo PSOL de São Paulo desde 2023, foi reeleita em 2026 com mais de 1,5 milhão de votos: a deputada mais votada da história da Câmara dos Deputados.',
    eixos: ['politica', 'raca', 'genero', 'identidade', 'desigualdade'],
    retrato: {
      img: '/img/erika-hilton-2024.jpg', w: 945, h: 1300, pos: '50% 22%',
      alt: 'Erika Hilton fala ao microfone na tribuna da Câmara dos Deputados, em abril de 2024',
      credito: 'Zeca Ribeiro / Câmara dos Deputados', licenca: 'CC BY 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Erika_Hilton_em_sess%C3%A3o_em_abril_de_2024_(cropped).jpg',
    },
    ligacoes: [],
    referencias: [
      {
        id: 'eh-quarto',
        livro: 'quarto-de-despejo',
        tipo: 'indicado',
        contexto:
          'Ao indicar uma série, um disco e um livro ao Estadão, Erika Hilton escolheu Quarto de Despejo, que chamou de livro de cabeceira e diz ler “como se fosse um evangelho”. Sobre a obra, afirmou: “Quem não leu, precisa ler.”',
        fonte: {
          titulo: 'Erika Hilton dá dicas culturais: produção de KondZilla, álbum de Beyoncé e Carolina Maria de Jesus',
          veiculo: 'Estadão, republicado no Terra',
          data: '2023-09-29',
          url: 'https://www.terra.com.br/noticias/brasil/politica/erika-hilton-da-dicas-culturais-producao-de-kondzilla-album-de-beyonce-e-carolina-maria-de-jesus,444bd4c14f8709077cf343b008470086td90ahb6.html',
        },
        verificacao: 'direta',
        status: 'publicado',
      },
      {
        id: 'eh-pl-carolina',
        livro: 'quarto-de-despejo',
        tipo: 'contexto',
        rotulo: 'Autora de projeto de lei sobre Carolina',
        contexto:
          'Erika Hilton é autora do PL 773/24, que propõe incluir Carolina Maria de Jesus no Livro dos Heróis e Heroínas da Pátria. Em novembro de 2024 a Câmara aprovou a urgência do projeto.',
        fonte: {
          titulo: 'Aprovada urgência para inclusão do nome da escritora Carolina Maria de Jesus no Livro dos Heróis e Heroínas da Pátria',
          veiculo: 'Agência Câmara de Notícias',
          data: '2024-11-05',
          url: 'https://www.camara.leg.br/noticias/1108867-aprovada-urgencia-para-inclusao-do-nome-da-escritora-carolina-maria-de-jesus-no-livro-dos-herois-e-heroinas-da-patria',
        },
        verificacao: 'direta',
        status: 'publicado',
      },
      {
        id: 'eh-bispo',
        obra: { titulo: 'O Bispo', autor: 'Ana Cristina Vargas' },
        tipo: 'mencionado-entrevista',
        contexto:
          'Em entrevista a Tati Bernardi no Canal UOL, contou que leu o romance espírita aos 11 ou 12 anos e que hoje o relê como “livro de conforto”, sem aderir à religião. Brincou que não é uma leitura indicada para essa idade.',
        fonte: {
          titulo: 'Erika Hilton compara romances espíritas ao K-Pop e opina sobre “O Bispo”',
          veiculo: 'Tenho Mais Discos Que Amigos!',
          data: '2026-04-14',
          url: 'https://www.tenhomaisdiscosqueamigos.com/2026/04/14/erika-hilton-compara-espiritas-k-pop-o-bispo',
        },
        verificacao: 'secundaria',
        notaVerificacao: 'Reportagem sobre a entrevista; não assistimos à gravação original.',
        status: 'publicado',
      },
      {
        id: 'eh-encanto',
        obra: { titulo: 'Políticas do encanto', autor: 'Paolo Demuru' },
        tipo: 'indicado',
        contexto: 'Na conversa com Tati Bernardi no programa Na Pilha, do UOL, Erika Hilton recomendou o livro, que discute como a política progressista pode recuperar o encanto e o desejo.',
        fonte: { titulo: 'A deputada Erika Hilton recomenda “Políticas do encanto”', veiculo: 'Instagram da Editora Elefante', data: '2026-04-17', url: 'https://www.instagram.com/reel/DXPKK7Ijd9M/' },
        verificacao: 'secundaria',
        notaVerificacao: 'Post da editora do livro com trecho da entrevista; não assistimos ao programa completo.',
        status: 'publicado',
      },
      {
        id: 'eh-tem-saida',
        obra: { titulo: 'Tem saída? Perspectivas LGBTI+ sobre o Brasil', autor: 'Winnie Bueno (org.)' },
        tipo: 'indicado',
        contexto: 'Em publicação de junho de 2021 nas redes, Erika Hilton recomendou a coletânea, da Editora Zouk, para a qual contribuiu com um texto.',
        fonte: { titulo: 'Erika Hilton indica 5 livros que todo mundo deveria ler', veiculo: 'Jornal Nota', data: '2025-06-26', url: 'https://jornalnota.com.br/2025/06/26/erika-hilton-indica-5-livros-que-todo-mundo-deveria-ler/' },
        verificacao: 'secundaria',
        notaVerificacao: 'A matéria reproduz a publicação original de Erika Hilton (14 jun. 2021).',
        status: 'publicado',
      },
      {
        id: 'eh-o-que-te-faz-lutar',
        obra: { titulo: 'O que te faz lutar?', autor: 'Erika Hilton e Henrique Vieira' },
        tipo: 'contexto',
        rotulo: 'Obra de Erika Hilton',
        contexto: 'Livro escrito com o pastor e deputado Henrique Vieira, sobre a convivência entre os dois e temas como direitos humanos e diálogo inter-religioso.',
        fonte: { titulo: 'Erika Hilton lança livro: diálogo entre um pastor e uma travesti', veiculo: 'Portal de Prefeitura', data: '2025-11-29', url: 'https://portaldeprefeitura.com.br/curiosidades/erika-hilton-lanca-livro-dialogo-entre-um-pastor-e-uma-travesti/609682/' },
        verificacao: 'secundaria',
        notaVerificacao: 'Só encontramos um agregador de notícias; confirmar editora e data em fonte melhor antes de publicar.',
        status: 'rascunho',
      },
      { id: 'eh-cur-fanon', livro: 'pele-negra-mascaras-brancas', tipo: 'curadoria', contexto: 'Escolha da Marginália para os eixos raça e identidade.', fonte: null, status: 'publicado' },
    ],
  },
  {
    slug: 'jones-manoel',
    nome: 'Jones Manoel',
    nomeCurto: 'Jones Manoel',
    status: 'publicado',
    papel: 'Historiador, comunicador e deputado federal eleito',
    descricao:
      'Historiador nascido em Recife, ficou conhecido por vídeos, textos e cursos de formação política com base no marxismo. Escreveu e organizou livros sobre marxismo, colonialismo e questão racial. Em 2026 foi eleito deputado federal por Pernambuco, pelo PSOL.',
    eixos: ['historia', 'marxismo', 'politica', 'formacao-teorica'],
    retrato: {
      img: '/img/jones-manoel-livros.webp', w: 1400, h: 1050, pos: '36% 30%',
      alt: 'Jones Manoel, de óculos e camiseta preta, apoia a cabeça na mão ao lado de uma pilha de livros, entre eles A negação do negro no Brasil, Malcolm X fala e Por uma revolução africana',
      // Foto enviada pela equipe; autoria ainda não identificada (completar quando souber).
      credito: 'autoria a confirmar', licenca: 'imagem fornecida à Marginália', via: 'acervo da Marginália', url: '',
    },
    ligacoes: [],
    referencias: [
      {
        id: 'jm-marx-politicos',
        obra: { titulo: 'Textos políticos de Karl Marx (sequência de três livros)', autor: 'Karl Marx' },
        tipo: 'indicado',
        contexto:
          'Em vídeo no seu perfil, Jones Manoel escreveu que, para quem quer saber mais sobre comunismo, sempre recomenda a leitura dos textos políticos de Marx, numa sequência de três livros. A legenda não traz os títulos nem as edições; no vídeo e no seu canal ele detalha outras indicações.',
        fonte: { titulo: 'Reel sobre leituras de Marx', veiculo: 'Instagram de Jones Manoel', data: '2025-08-11', url: 'https://www.instagram.com/reel/DNOJldftlT3/' },
        verificacao: 'direta',
        status: 'publicado',
      },
      // "Os livros que você precisa ler em 2026", canal de Jones Manoel no YouTube (29 dez. 2025).
      // Conferido na transcrição do vídeo; cada link abre no minuto da indicação.
      ...[
        ['mattei', 142, 'A ordem do capital: como economistas inventaram a austeridade e abriram caminho para o fascismo', 'Clara E. Mattei', 'Primeira indicação da lista. Para ele, mostra a austeridade como arma da classe dominante em momentos de crise e como ela abriu caminho para a extrema direita; diz que é longo, mas tranquilo de ler mesmo para quem não é economista.'],
        ['darcy', 338, 'O Brasil como problema', 'Darcy Ribeiro', 'Reunião de ensaios e discursos de Darcy Ribeiro sobre a construção do Brasil como nação e as consequências da era neoliberal. Destaca os textos sobre o povo latino-americano e “Universidade para quê?”.'],
        ['lelia', 437, 'Lugar de negro', 'Lélia Gonzalez e Carlos Hasenbalg', 'Indicado para pensar a questão racial e a de gênero na dominação burguesa e no capitalismo dependente brasileiro. Ele chama Lélia Gonzalez de grande intérprete do Brasil.'],
        ['kalecki', 524, 'Aspectos políticos do pleno emprego (texto)', 'Michał Kalecki', 'Texto clássico indicado na edição publicada pela Jacobin Brasil. O ensaio, de 1943, discute por que os empresários resistem a políticas de pleno emprego.'],
        ['marini', 618, 'Dependência e revolução na América Latina: textos selecionados', 'Ruy Mauro Marini (org. Rodrigo Castelo e Fernando Correa Prado)', 'Antologia dos principais textos de Marini, lançada pela Expressão Popular em parceria. Ele brinca que o volume “parece uma Bíblia”.'],
        ['rebelioes', 794, 'Rebeliões da senzala: quilombos, insurreições, guerrilhas', 'Clóvis Moura', 'Ele diz que é o livro que mudou sua vida e que o fez tomar o Brasil como tema central de estudo. Edição da Anita Garibaldi.'],
        ['dialetica', 902, 'Dialética radical do Brasil negro', 'Clóvis Moura', 'Segunda indicação de Clóvis Moura, também da Anita Garibaldi, para voltar ao debate clássico sobre a questão racial no Brasil. Ele o considera o melhor livro já escrito sobre o tema.'],
        ['vieira-pinto', 996, 'A questão da universidade', 'Álvaro Vieira Pinto', 'Clássico em nova edição (IELA e Editora Insular), indicado especialmente a quem participa do movimento estudantil.'],
        ['mascaro', 1081, 'Lugar periférico, ideias modernas', 'Fabio Mascaro Querido', 'Última indicação de livro da lista: para ele, a melhor análise que conhece sobre a chamada sociologia paulista.'],
        ['livio', 1232, 'Camisas de força jurídicas e o mito da dívida pública (texto)', 'Gustavo Lívio', 'Texto publicado no GGN, indicado para entender a crítica à austeridade, à dívida pública, às metas de inflação e ao superávit primário.'],
      ].map(([id, t, titulo, autor, contexto]) => ({
        id: `jm-2026-${id}`,
        obra: { titulo, autor },
        tipo: 'indicado',
        contexto,
        fonte: {
          titulo: `Os livros que você precisa ler em 2026 (aos ${Math.floor(t / 60)}min${String(t % 60).padStart(2, '0')})`,
          veiculo: 'Canal de Jones Manoel no YouTube',
          data: '2025-12-29',
          url: `https://www.youtube.com/watch?v=-_aE30_05K4&t=${t}s`,
        },
        verificacao: 'direta',
        status: 'publicado',
      })),
      ...[
        ['revolucao-africana', 'Revolução africana: uma antologia do pensamento marxista', 'Jones Manoel e Gabriel Fazzio (orgs.)'],
        ['raca-classe', 'Raça, classe e revolução: a luta pelo poder popular nos Estados Unidos', 'Jones Manoel e Gabriel Landi (orgs.)'],
        ['patria', 'Pátria socialista ou morte: marxismo latino-americano e caribenho', 'Jones Manoel e Gabriel Landi (orgs.)'],
        ['batalha', 'A batalha pela memória', 'Jones Manoel'],
        ['negacao', 'A negação do Brasil negro', 'Jones Manoel'],
      ].map(([id, titulo, autor]) => ({
        id: `jm-obra-${id}`,
        obra: { titulo, autor },
        tipo: 'contexto',
        rotulo: 'Obra de Jones Manoel',
        contexto: 'Livro escrito ou organizado por Jones Manoel, listado no seu site oficial.',
        fonte: { titulo: 'Livros', veiculo: 'Site de Jones Manoel', data: '', url: 'https://jonesmanoel.com.br/livros' },
        verificacao: 'direta',
        status: 'publicado',
      })),
      {
        id: 'jm-losurdo',
        obra: { titulo: 'Colonialismo e luta anticolonial', autor: 'Domenico Losurdo' },
        tipo: 'indicado',
        contexto: 'Em vídeo de 3 mar. 2026, Jones Manoel pede que o público leia dois livros sobre geopolítica. A legenda não traz os títulos: segundo pesquisa a conferir, seriam este e “Liberalismo: entre a civilização e a barbárie”, de Losurdo.',
        fonte: { titulo: 'Reel sobre dois livros de geopolítica', veiculo: 'Instagram de Jones Manoel', data: '2026-03-03', url: 'https://www.instagram.com/reel/DVb3akaj4H8/' },
        verificacao: 'secundaria',
        notaVerificacao: 'Assistir ao vídeo e confirmar os títulos antes de publicar.',
        status: 'rascunho',
      },
      {
        id: 'jm-velhos',
        obra: { titulo: 'Velhos demais para morrer', autor: '(confirmar autor)' },
        tipo: 'indicado',
        contexto: 'Indicação citada em pesquisa enviada à equipe, sem confirmação: os posts de origem não puderam ser lidos.',
        fonte: { titulo: 'Reel de indicações', veiculo: 'Instagram', data: '', url: 'https://www.instagram.com/reel/DNN78KfNJ1V/' },
        verificacao: 'secundaria',
        notaVerificacao: 'Não verificado: confirmar título, autor e se a indicação é de Jones Manoel.',
        status: 'rascunho',
      },
      { id: 'jm-cur-manifesto', livro: 'manifesto-do-partido-comunista', tipo: 'curadoria', contexto: 'Escolha da Marginália para o eixo marxismo e formação teórica: o texto de partida da tradição.', fonte: null, status: 'publicado' },
      { id: 'jm-cur-furtado', livro: 'formacao-economica-do-brasil', tipo: 'curadoria', contexto: 'Escolha da Marginália para o eixo história: a formação da economia brasileira como processo histórico.', fonte: null, status: 'publicado' },
      { id: 'jm-cur-fanon', livro: 'pele-negra-mascaras-brancas', tipo: 'curadoria', contexto: 'Escolha da Marginália para o eixo política: colonialismo e racismo como estrutura.', fonte: null, status: 'publicado' },
    ],
  },
  {
    slug: 'ana-elisa',
    nome: 'Ana Elisa',
    nomeCurto: 'Ana Elisa',
    status: 'confirmar-identidade',
    papel: '',
    descricao: '',
    eixos: [],
    retrato: null,
    notaInterna: 'Confirmar a identidade exata antes de publicar o perfil ou associar referências.',
    ligacoes: [],
    referencias: [],
  },
  {
    slug: 'djonga',
    nome: 'Djonga',
    nomeCurto: 'Djonga',
    status: 'publicado',
    papel: 'Rapper e compositor',
    descricao:
      'Gustavo Pereira Marques, o Djonga, é rapper de Belo Horizonte. Cursou sete períodos de História na Universidade Federal de Ouro Preto — “lá eu aprendi a ler o mundo”, disse no Fliaraxá. Desde o álbum Heresia, de 2017, suas letras tratam de raça, classe e da vida nas quebradas da capital mineira.',
    eixos: ['rap', 'desigualdade', 'identidade', 'raca', 'sociedade', 'cultura'],
    retrato: {
      img: '/img/djonga-2022.jpg', w: 896, h: 1300, pos: '50% 20%',
      alt: 'Djonga de boné e suéter, diante de um muro grafitado, em São Paulo, em 2022',
      credito: 'Fora do Eixo', licenca: 'CC BY-SA 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:Djonga_visita_a_NAVE_e_lan%C3%A7a_seu_sexto_%C3%A1lbum_%E2%80%9CO_Dono_do_Lugar%E2%80%9D_%C2%B7_11_10_2022_%C2%B7_S%C3%A3o_Paulo_(SP)_(52442211582)_(cropped).jpg',
    },
    ligacoes: [],
    referencias: [
      {
        id: 'dj-fanon',
        livro: 'pele-negra-mascaras-brancas',
        tipo: 'indicado',
        contexto:
          'Segundo a legenda de um vídeo publicado pelo pesquisador Deivison Nkosi, com trecho da participação de Djonga no podcast Podpah, o rapper indicou a leitura do livro de Fanon. A obra dialoga com o álbum Ladrão (2019) e o clipe de “Hat-Trick”, em que a pintura branca no rosto é lida como alusão ao título.',
        fonte: {
          titulo: 'Djonga recomenda Frantz Fanon (vídeo com trecho do Podpah)',
          veiculo: 'Instagram de Deivison Nkosi',
          data: '2023-03-27',
          url: 'https://www.instagram.com/reel/CqTujlwLkRR/',
        },
        verificacao: 'secundaria',
        notaVerificacao: 'Conferimos a legenda do post, que reproduz o trecho do Podpah; não localizamos o episódio completo.',
        status: 'publicado',
      },
      {
        id: 'dj-quixote',
        obra: { titulo: 'Dom Quixote', autor: 'Miguel de Cervantes' },
        tipo: 'contexto',
        rotulo: 'Inspiração do álbum O dono do lugar',
        contexto:
          'A capa do sexto álbum de Djonga recria o cavaleiro de Cervantes diante dos moinhos de vento de Consuegra, na Espanha. Ele descreveu o disco como “uma experiência musical sobre minha luta contra os moinhos de vento”.',
        fonte: {
          titulo: 'Djonga se inspira em “Dom Quixote” ao criar capa e narrativa do álbum “O dono do lugar”',
          veiculo: 'g1, blog de Mauro Ferreira',
          data: '2022-10-10',
          url: 'https://g1.globo.com/pop-arte/musica/blog/mauro-ferreira/post/2022/10/10/djonga-se-inspira-em-dom-quixote-ao-criar-capa-e-narrativa-do-album-o-dono-do-lugar.ghtml',
        },
        verificacao: 'direta',
        status: 'publicado',
      },
      { id: 'dj-cur-becos', livro: 'becos-da-memoria', tipo: 'curadoria', contexto: 'Escolha da Marginália para o eixo desigualdade: a cidade lembrada por quem foi removido dela.', fonte: null, status: 'publicado' },
    ],
  },
  {
    slug: 'don-l',
    nome: 'Don L',
    nomeCurto: 'Don L',
    status: 'publicado',
    papel: 'Rapper e compositor',
    descricao:
      'Gabriel Linhares da Rocha, o Don L, é rapper e construiu a carreira em Fortaleza, onde ajudou a criar o grupo Costa a Costa. Seus discos solo, como Roteiro pra Aïnouz, Vol. 3, de 2017, misturam crítica política e experimentação de linguagem.',
    eixos: ['rap', 'critica-social', 'politica', 'linguagem', 'experimentacao'],
    retrato: {
      img: '/img/don-l-2022.jpg', w: 963, h: 1300, pos: '50% 20%',
      alt: 'Don L cantando ao microfone, de gorro claro, em 2022',
      credito: 'Victor Schwaner / Festival Sensacional', licenca: 'CC BY-SA 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:SENSACIONAL_-_Show_Don_L_(52189882930)_(cropped).jpg',
    },
    ligacoes: [],
    referencias: [
      {
        id: 'dl-veias',
        livro: 'as-veias-abertas-da-america-latina',
        tipo: 'contexto',
        rotulo: 'Presente de Don L no Tiny Desk Brasil',
        contexto: 'Seguindo a tradição do programa, Don L deixou um presente para a equipe na gravação do Tiny Desk Brasil: o livro de Galeano, sobre a história política e econômica do continente. O episódio estreou em 20 de outubro de 2026.',
        fonte: { titulo: 'Don L traz alguns dos seus maiores clássicos em novo episódio do Tiny Desk Brasil', veiculo: 'Rap Dab', data: '2026-10-20', url: 'https://www.rapdab.com.br/2026/10/20/don-l-tiny-desk-brasil/' },
        verificacao: 'direta',
        status: 'publicado',
      },
      { id: 'dl-cur-hora', livro: 'a-hora-da-estrela', tipo: 'curadoria', contexto: 'Escolha da Marginália para o eixo linguagem e experimentação: uma narrativa que expõe o próprio ato de narrar.', fonte: null, status: 'publicado' },
      { id: 'dl-cur-gonzaga', livro: 'vida-e-morte-de-m-j-gonzaga-de-sa', tipo: 'curadoria', contexto: 'Escolha da Marginália para o eixo crítica social: a cidade que se moderniza expulsando os pobres.', fonte: null, status: 'publicado' },
    ],
  },
];
