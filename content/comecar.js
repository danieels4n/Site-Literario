// Textos do "Por onde começar?". As descrições dos temas podem ser trocadas no /admin/percursos.
// Regra: descrever só o que o acervo realmente tem.

export const NAO_SEI = 'nao-sei';

export const TEMAS_COMECAR = {
  'literatura-brasileira': { descricao: 'Romances, diários, poemas e letras que contam o Brasil por dentro, de Machado de Assis a Conceição Evaristo.' },
  'formacao-do-brasil': { descricao: 'Colonização, escravidão, economia e as grandes tentativas de explicar como o país se formou.' },
  'raca-e-racismo': { descricao: 'Escravidão, abolição e racismo, contados por quem viveu e por quem pesquisou, no Brasil e fora dele.' },
  'cidade-e-pobreza': { descricao: 'Favela, cortiço e sertão: a desigualdade vista de perto, muitas vezes por quem a viveu.' },
  educacao: { descricao: 'Para que serve aprender, e quem decide o que se ensina.' },
  'pensamento-politico': { descricao: 'Classes sociais, poder, colonialismo e luta política, em textos que circularam pelo mundo.' },
  republica: { descricao: 'Os primeiros anos da República: modernização, exclusão e escritores que desconfiaram dela.' },
  'mulheres-que-escrevem': { descricao: 'Autoras que escreveram contra o silêncio, do século XIX aos dias de hoje.' },
  'rap-e-periferia': { descricao: 'O rap como crônica e pensamento da periferia.' },
};

export const NAO_SEI_TEXTO = {
  nome: 'Ainda não sei exatamente o que procuro',
  descricao: 'Uma seleção de leituras de entrada, de temas diferentes, para você descobrir do que gosta.',
};

// Ponto de partida: ajusta profundidade e sequência, nunca é uma nota sobre a pessoa.
export const PONTOS = {
  basico: {
    rotulo: 'Quero conhecer o básico',
    curto: 'Básico',
    descricao: 'Tenho curiosidade, mas ainda não conheço bem os conceitos e autores.',
    limites: { aprofundar: 1 },
    conceitosIniciais: 3,
    revisao: false,
  },
  algumas: {
    rotulo: 'Já conheço algumas ideias',
    curto: 'Já conheço algumas ideias',
    descricao: 'Já li ou ouvi falar sobre o tema, mas quero organizar melhor o que sei.',
    limites: { comece: 1 },
    conceitosIniciais: 2,
    revisao: false,
  },
  aprofundar: {
    rotulo: 'Quero me aprofundar',
    curto: 'Aprofundar',
    descricao: 'Já tenho alguma base e quero avançar para leituras mais densas.',
    limites: { comece: 0 },
    conceitosIniciais: 3,
    revisao: true,
  },
};

// Tempo: muda quantas leituras aparecem por etapa. Não prometemos duração,
// porque o acervo ainda não registra a extensão das obras.
export const TEMPOS = {
  pouco: { rotulo: 'Pouco tempo por dia', descricao: 'Uma leitura por etapa, para ir com calma.', porEtapa: 1 },
  semana: { rotulo: 'Algumas horas por semana', descricao: 'Até duas leituras por etapa.', porEtapa: 2 },
  ritmo: { rotulo: 'Quero seguir no meu próprio ritmo', descricao: 'Todas as sugestões de cada etapa.', porEtapa: 3 },
};
