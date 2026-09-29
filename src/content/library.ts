import type { RegionId, SafetyFlag } from './types'

/**
 * Biblioteca de exercícios do FaceZen (fonte única: app + arquivo do NotebookLM).
 * Texto próprio, escrito a partir do Guia Prático (docs/guia).
 */

export type Level = 'ini' | 'int' | 'ava'

export const LEVEL_LABEL: Record<Level, string> = { ini: 'Iniciante', int: 'Intermediário', ava: 'Avançado' }

export type GroupId =
  | 'aquecimento'
  | 'testa'
  | 'olhos'
  | 'bochechas'
  | 'bigode'
  | 'labios'
  | 'nariz'
  | 'mandibula'
  | 'pescoco'
  | 'massagem'
  | 'relaxamento'

export interface Group {
  id: GroupId
  title: string
  intro: string
  region?: RegionId
}

export const GROUPS: Group[] = [
  { id: 'aquecimento', title: 'Aquecimento', intro: 'Um a dois minutos que preparam pescoço e rosto, como o alongamento de um atleta antes do jogo.', region: 'pescoco' },
  { id: 'testa', title: 'Testa e entre as sobrancelhas', intro: 'Fortalecer a testa e ensinar o rosto a não franzir sem necessidade.', region: 'testa' },
  { id: 'olhos', title: 'Olhos e pálpebras', intro: 'A região mais delicada: dedos anelares, toque leve e nunca no globo ocular.', region: 'olhos' },
  { id: 'bochechas', title: 'Bochechas e maçãs do rosto', intro: 'Os músculos que levantam o sorriso e dão contorno ao terço médio do rosto.', region: 'bochechas' },
  { id: 'bigode', title: 'Bigode chinês', intro: 'Elevar bochechas e cantos da boca para suavizar a linha entre o nariz e a boca.', region: 'bigode' },
  { id: 'labios', title: 'Lábios e “código de barras”', intro: 'O contorno da boca e as linhas acima do lábio. Sempre com a pele lubrificada.', region: 'bigode' },
  { id: 'nariz', title: 'Nariz', intro: 'Um pequeno músculo que também participa da expressão.', region: 'bigode' },
  { id: 'mandibula', title: 'Mandíbula, queixo e papada', intro: 'Contorno do queixo, papada e a tensão de quem aperta os dentes.', region: 'papada' },
  { id: 'pescoco', title: 'Pescoço e colo', intro: 'Postura e tônus do pescoço. No pescoço, a massagem vai sempre de cima para baixo.', region: 'pescoco' },
  { id: 'massagem', title: 'Massagem e ferramentas', intro: 'Movimentos lentos, com a pele lubrificada, do centro para fora e de baixo para cima.' },
  { id: 'relaxamento', title: 'Relaxamento final', intro: 'Um minuto para soltar o rosto e terminar a sessão.' },
]

export const groupById = (id: GroupId) => GROUPS.find((g) => g.id === id)!

export interface Exercise {
  /** Código curto (ex.: "T1"), igual ao do Guia Prático. */
  id: string
  group: GroupId
  region?: RegionId
  title: string
  forWhat: string
  /** Dose por nível, como aparece para a pessoa (ex.: "2 × 15"). */
  dose: Record<Level, string>
  /** Tempo do cronômetro por nível, em segundos. */
  seconds: Record<Level, number>
  sided?: boolean
  steps: string[]
  feel?: string
  mistakes?: string[]
  /** Quando pular (texto para a pessoa). */
  skip?: string
  /** Fica fora do plano de quem marcou estas situações. */
  avoidIf: SafetyFlag[]
  /** Pode ser feito, com este ajuste. */
  adapt?: Partial<Record<SafetyFlag, string>>
  /** Pode ser feito sem as mãos, em qualquer lugar. */
  anywhere?: boolean
  tool?: boolean
}

const reps = (ini: number, int: number, ava: number): Pick<Exercise, 'dose' | 'seconds'> => ({
  dose: { ini: `1 × ${ini}`, int: `2 × ${int}`, ava: `3 × ${ava}` },
  // ~2 s por repetição + 5 s de pausa entre as séries
  seconds: { ini: ini * 2 + 5, int: int * 2 * 2 + 5, ava: ava * 3 * 2 + 10 },
})
const fixed = (dose: string, seconds: number): Pick<Exercise, 'dose' | 'seconds'> => ({
  dose: { ini: dose, int: dose, ava: dose },
  seconds: { ini: seconds, int: seconds, ava: seconds },
})

export const EXERCISES: Exercise[] = [
  // ——— Aquecimento
  {
    id: 'A1', group: 'aquecimento', title: 'Oito no ar', forWhat: 'Soltar ombros, costas e pescoço antes do rosto.',
    ...fixed('5 repetições', 30),
    steps: ['Em pé, junte as palmas na frente do peito', 'Imagine um lápis na ponta dos dedos', 'Desenhe no ar um “8” deitado, movendo o tronco junto', 'Relaxe pescoço, ombros e quadril', 'Faça 5 vezes, devagar'],
    feel: 'O tronco e os ombros soltando.', skip: 'Tontura ou dor lombar.', avoidIf: ['cervical'],
  },
  {
    id: 'A2', group: 'aquecimento', region: 'pescoco', title: 'Barco', forWhat: 'Soltar a nuca.',
    ...fixed('5 repetições', 30),
    steps: ['Leve o queixo em direção ao peito', 'Inspire', 'Balance a cabeça devagar para a direita', 'Passe pelo centro e vá para a esquerda', 'Repita 5 vezes, sem pressa'],
    feel: 'Alongamento suave atrás do pescoço.', mistakes: ['Fazer rápido', 'Levar a cabeça para trás'], skip: 'Dor cervical, hérnia ou tontura.', avoidIf: ['cervical'],
  },
  {
    id: 'A3', group: 'aquecimento', region: 'pescoco', title: 'Meia-lua do pescoço', forWhat: 'Mobilidade do pescoço com a respiração.',
    ...fixed('5 de cada lado', 40), sided: true,
    steps: ['Inspire e desça o queixo em direção ao peito', 'Solte o ar girando a cabeça para a direita, orelha em direção ao ombro', 'Inspire e volte pelo centro', 'Solte o ar e gire para a esquerda', 'Só a metade da frente: nunca o círculo completo para trás'],
    skip: 'Dor cervical ou tontura.', avoidIf: ['cervical'],
  },
  {
    id: 'A4', group: 'aquecimento', region: 'pescoco', title: 'Alongamento lateral', forWhat: 'Alongar as laterais do pescoço.',
    ...fixed('3 de cada lado', 40), sided: true,
    steps: ['Apoie a mão direita na lateral esquerda da cabeça', 'Incline a cabeça para a direita, orelha em direção ao ombro', 'Estenda o braço esquerdo para baixo, a uns 45°', 'Deixe o peso da mão alongar, sem puxar', 'Segure 3 respirações e troque de lado'],
    feel: 'Alongamento da lateral do pescoço até o ombro.', skip: 'Formigamento no braço ou dor cervical.', avoidIf: ['cervical'],
  },
  {
    id: 'A5', group: 'aquecimento', region: 'bochechas', title: 'Balão', forWhat: 'Aquecer bochechas e boca.',
    ...fixed('5 voltas', 40), anywhere: true,
    steps: ['Encha as bochechas de ar, lábios fechados', 'Leve o ar para a bochecha direita e conte 3', 'Leve para a esquerda e conte 3', 'Leve para cima do lábio superior e conte 3', 'Leve para baixo do lábio inferior, conte 3 e solte'],
    mistakes: ['Estufar ao máximo', 'Prender a respiração até faltar ar'], skip: 'Dor na mandíbula ou no ouvido.', avoidIf: ['atm'],
  },
  {
    id: 'A6', group: 'aquecimento', region: 'papada', title: 'Língua em arco', forWhat: 'Ativar a musculatura abaixo do queixo.',
    ...fixed('5 repetições', 30),
    steps: ['Boca levemente aberta', 'Ponta da língua atrás dos dentes de baixo', 'Empurre o meio da língua para fora, formando um arco', 'Segure 3 segundos', 'Relaxe'],
    feel: 'Trabalho embaixo do queixo.', avoidIf: [],
  },
  {
    id: 'A7', group: 'aquecimento', title: '“UUU” de olhos abertos', forWhat: 'Soltar a tensão do rosto inteiro.',
    ...fixed('5 repetições', 30),
    steps: ['Alongue o rosto como quem se espanta', 'Projete a boca em “U”', 'Abra bem os olhos, sem franzir a testa', 'Diga “UUU” com exagero', 'Relaxe e repita'],
    mistakes: ['Subir a testa junto (se acontecer, apoie os dedos na testa)'], avoidIf: [],
  },

  // ——— Testa
  {
    id: 'T1', group: 'testa', region: 'testa', title: 'Testa lisa', forWhat: 'Fortalecer a testa e treiná-la a não enrugar.',
    ...reps(10, 15, 15),
    steps: ['Pontas dos dedos na linha do cabelo, palmas nas laterais da testa', '“Segure” a testa com leve pressão para cima', 'Feche os olhos', 'Tente descer as sobrancelhas, reto, contra os dedos', 'Movimentos curtos, com os dedos segurando'],
    feel: 'Esforço na testa, sem dor.', mistakes: ['Franzir entre as sobrancelhas', 'Puxar a pele com força'], avoidIf: [],
  },
  {
    id: 'T2', group: 'testa', region: 'testa', title: 'Testa lateral', forWhat: 'Evitar que a testa se junte no centro.',
    ...reps(10, 15, 15),
    steps: ['Dedos nas laterais da testa, mínimo na têmpora', 'Leve pressão dos dedos para fora', 'Tente franzir, juntando a testa no centro', 'Os dedos não deixam a testa se juntar', 'Solte e repita'],
    avoidIf: [],
  },
  {
    id: 'T3', group: 'testa', region: 'testa', title: 'Borracha', forWhat: 'Soltar a tensão das linhas horizontais.',
    ...fixed('5 repetições', 30),
    steps: ['Indicadores um de frente para o outro, na linha do cabelo', 'Dedos firmes', 'Deslize devagar até as sobrancelhas', 'Volte até a linha do cabelo', 'Pressão confortável, pele lubrificada'],
    avoidIf: ['peleCrise'],
  },
  {
    id: 'T4', group: 'testa', region: 'testa', title: 'Yin-Yang', forWhat: 'Fortalecer e soltar a região da “ruga do leão”.',
    dose: { ini: '1 × 10 em cada ponto', int: '2 × 15 em cada ponto', ava: '3 × 15 em cada ponto' }, seconds: { ini: 60, int: 120, ava: 180 },
    steps: ['Pegue o início da sobrancelha com indicador e polegar', 'Puxe levemente para fora e tente franzir contra os dedos', 'Repita no meio da sobrancelha', 'Repita no final, só com o indicador'],
    mistakes: ['Beliscar forte', 'Puxar a pele'], avoidIf: [],
  },
  {
    id: 'T5', group: 'testa', region: 'olhos', title: 'Binóculo', forWhat: 'Treinar os olhos a trabalhar sem mexer a testa.',
    ...fixed('1 série', 40),
    steps: ['Polegares ao lado do nariz, indicadores sobre as sobrancelhas', 'Abra o peito e desça os ombros', 'Olhe para longe e contraia os olhos por 10 segundos, sem franzir', 'Feche e relaxe por 3 segundos', 'Abra bem os olhos por 10 segundos, sobrancelhas paradas', 'Feche e relaxe por 3 segundos'],
    skip: 'Olhos irritados ou lentes incomodando.', avoidIf: ['olhos'],
  },
  {
    id: 'T6', group: 'testa', region: 'testa', title: 'Alisamento para as têmporas', forWhat: 'Relaxar a testa e finalizar a região.',
    ...fixed('30 segundos', 30),
    steps: ['Pontas dos dedos no centro da testa', 'Deslize devagar até as têmporas', 'Pressione as têmporas por 2 segundos', 'Levante os dedos e recomece do centro'],
    avoidIf: [],
  },

  // ——— Olhos
  {
    id: 'O1', group: 'olhos', region: 'olhos', title: 'Pálpebra inferior firme', forWhat: 'Tonificar a pálpebra de baixo.',
    dose: { ini: '1 × 5', int: '2 × 10', ava: '3 × 10' }, seconds: { ini: 25, int: 65, ava: 100 },
    steps: ['Indicadores no canto externo dos olhos', 'Estique a pele muito de leve para fora', 'Sem piscar, suba só a pálpebra de baixo', 'Não feche o olho por completo', 'No fim, feche 3 segundos e abra bem, sem franzir'],
    skip: 'Olho seco, irritação ou conjuntivite.', avoidIf: ['olhos'],
  },
  {
    id: 'O2', group: 'olhos', region: 'olhos', title: 'V nos olhos', forWhat: 'Fortalecer a pálpebra de cima.',
    ...reps(10, 15, 15),
    steps: ['Faça um “V” com indicador e médio', 'Posicione logo abaixo das pontas das sobrancelhas', 'Feche os olhos', 'Pressione levemente para baixo', 'Tente subir as sobrancelhas contra os dedos, devagar'],
    avoidIf: ['olhos'],
  },
  {
    id: 'O3', group: 'olhos', region: 'olhos', title: 'Olhos perfeitos', forWhat: 'Relaxar e alongar o contorno dos olhos.',
    dose: { ini: '1 × 5', int: '2 × 5', ava: '3 × 5' }, seconds: { ini: 20, int: 40, ava: 60 },
    steps: ['Junte indicador e médio', 'Apoie as pontas no canto externo do olho', 'Deslize subindo em direção à testa', 'Abra os dedos em “V” até a raiz do cabelo'],
    avoidIf: [],
  },
  {
    id: 'O4', group: 'olhos', region: 'olhos', title: 'Toque de pena', forWhat: 'Desinchar e relaxar; ótimo de manhã.',
    ...fixed('30 segundos', 30),
    steps: ['Use os dedos anelares', 'Batidinhas leves sob a sobrancelha, do canto interno para fora', 'Desça pelo osso da maçã do rosto', 'Volte ao canto interno', 'Termine pressionando as têmporas'],
    avoidIf: [],
  },
  {
    id: 'O5', group: 'olhos', region: 'olhos', title: 'Olhar em cruz', forWhat: 'Mobilidade e descanso dos olhos.',
    ...fixed('2 voltas', 30), anywhere: true,
    steps: ['Cabeça parada', 'Olhe para a direita e volte ao centro', 'Olhe para a esquerda e volte', 'Olhe para cima e volte', 'Olhe para baixo e volte', 'Feche os olhos por 5 segundos'],
    skip: 'Tontura ou visão dupla.', avoidIf: [],
  },

  // ——— Bochechas
  {
    id: 'B1', group: 'bochechas', region: 'bochechas', title: 'Zigomático', forWhat: 'Trabalhar os músculos que levantam as maçãs do rosto.',
    ...reps(10, 15, 15),
    steps: ['Faça um “O” alongado com a boca', 'Sorria bem aberto, subindo as maçãs do rosto', 'Desça devagar', 'Volte ao “O” e repita'],
    mistakes: ['Apertar os olhos no sorriso'], avoidIf: [],
  },
  {
    id: 'B2', group: 'bochechas', region: 'bochechas', title: 'Palito', forWhat: 'Fortalecer o terço médio do rosto.',
    ...reps(10, 15, 15), tool: true,
    steps: ['Segure um palito (hashi) entre os lábios, sem morder forte', 'Inspire pelo nariz', 'Force o sorriso, subindo as maçãs do rosto', 'Relaxe e repita'],
    avoidIf: ['atm'],
  },
  {
    id: 'B3', group: 'bochechas', region: 'bochechas', title: 'Peixinho', forWhat: 'Bochechas e cantos da boca.',
    ...reps(10, 15, 15), anywhere: true,
    steps: ['Sugue as bochechas, como boca de peixe', 'Nessa posição, tente sorrir', 'Segure 3 segundos', 'Solte e repita'],
    avoidIf: ['atm'],
  },
  {
    id: 'B4', group: 'bochechas', region: 'bochechas', title: 'Três alturas', forWhat: 'Massagem para finalizar bochechas e contorno.',
    ...fixed('3 vezes em cada altura', 40),
    steps: ['Mãos espalmadas, pele lubrificada', 'Deslize do nariz às orelhas logo abaixo dos olhos, bem leve', 'Repita no meio das bochechas', 'Repita na linha da mandíbula'],
    avoidIf: ['peleCrise'],
  },

  // ——— Bigode chinês
  {
    id: 'N1', group: 'bigode', region: 'bigode', title: 'Sorriso com mãos nas orelhas', forWhat: 'Elevar bochechas e cantos da boca.',
    dose: { ini: '1 × 30 s', int: '2 × 30 s', ava: '3 × 30 s' }, seconds: { ini: 30, int: 70, ava: 110 },
    steps: ['Palmas sobre as orelhas', 'Leve pressão, puxando a pele suavemente para trás', 'Dobre os lábios sobre os dentes', 'Levante os cantos da boca num sorriso exagerado', 'Segure 30 segundos'],
    feel: 'Trabalho nas bochechas e ao lado da boca.', avoidIf: [],
  },
  {
    id: 'N2', group: 'bigode', region: 'bigode', title: 'V nos lábios', forWhat: 'Suavizar o triângulo entre nariz e boca.',
    ...reps(10, 15, 15),
    steps: ['Dedos em triângulo sobre o sulco', 'Puxe a pele levemente para trás', 'Pronuncie “O”, projetando os lábios', 'Relaxe e repita'],
    avoidIf: [],
  },
  {
    id: 'N3', group: 'bigode', region: 'bigode', title: 'Sopro da vela', forWhat: 'Trabalhar a região ao redor da boca.',
    ...reps(10, 15, 15),
    steps: ['Palmas em “V” perto do queixo', 'Abra e apoie nas laterais do rosto', 'Estique a pele suavemente para trás e para cima', 'Inspire pelo nariz', 'Sopre com força, como quem apaga uma vela'],
    avoidIf: [],
  },
  {
    id: 'N4', group: 'bigode', region: 'bigode', title: 'Deslize do sulco', forWhat: 'Massagem do bigode chinês.',
    ...fixed('5 de cada lado', 40), sided: true,
    steps: ['Uma mão estabiliza a têmpora', 'A outra desliza da lateral do nariz para a orelha', 'Faça com a boca em “O”', 'Não puxe até repuxar', 'Troque de lado'],
    avoidIf: ['peleCrise'],
  },

  // ——— Lábios
  {
    id: 'L1', group: 'labios', region: 'bigode', title: 'AO', forWhat: 'Fortalecer o músculo ao redor da boca.',
    ...reps(10, 15, 15),
    steps: ['Inspire e abra a boca', 'Projete os lábios em “O”, descolando dos dentes', 'Feche, colando os lábios nos dentes', 'Abra dizendo “A” bem exagerado', 'Volte ao “O”'],
    avoidIf: [], adapt: { atm: 'Abra pouco a boca.' },
  },
  {
    id: 'L2', group: 'labios', region: 'bigode', title: 'Labial', forWhat: 'Tonificar a boca e prevenir linhas.',
    ...reps(10, 15, 15),
    steps: ['Segure os cantos da boca com indicador e polegar', 'Puxe suavemente para os lados', 'Tente fechar os lábios no centro, como um beijo', 'No fim da série, segure 5 segundos'],
    avoidIf: [],
  },
  {
    id: 'L3', group: 'labios', region: 'bigode', title: 'Arco do cupido', forWhat: 'Lábio superior e linhas acima dele.',
    ...reps(10, 15, 15),
    steps: ['Polegares sob as pontas do lábio superior, indicadores por cima', 'Puxe suavemente para os lados', 'Tente fechar o lábio no centro', 'No fim da série, segure 5 segundos'],
    avoidIf: [],
  },
  {
    id: 'L4', group: 'labios', region: 'bigode', title: 'Código de barras', forWhat: 'Linhas verticais acima dos lábios.',
    dose: { ini: '10 repetições', int: '20 repetições', ava: '2 × 20' }, seconds: { ini: 30, int: 60, ava: 120 },
    steps: ['Cubra os dentes com os lábios', 'Dedos acima e abaixo da boca', 'Abra e feche a boca devagar', 'Os dedos fazem leve pressão de vai e volta'],
    skip: 'Lábios rachados ou com herpes.', avoidIf: ['peleCrise'],
  },

  // ——— Nariz
  {
    id: 'Z1', group: 'nariz', region: 'bigode', title: 'Nariz firme', forWhat: 'Trabalhar o pequeno músculo do nariz.',
    ...reps(10, 15, 15),
    steps: ['Ponta do indicador na ponta do nariz, empurrando para cima', 'Tente puxar o nariz para baixo', 'Movimentos curtos, com o dedo segurando'],
    avoidIf: [],
  },

  // ——— Mandíbula e papada
  {
    id: 'M1', group: 'mandibula', region: 'papada', title: 'Infralabial', forWhat: 'Pescoço e papada.',
    ...reps(10, 15, 15),
    steps: ['Palmas na base do pescoço, sobre o colo', 'Incline a cabeça levemente para trás e olhe para o alto', 'Projete um pouco o queixo', 'Suba o lábio inferior por cima do superior', 'Desça e suba o lábio'],
    feel: 'Trabalho embaixo do queixo e na frente do pescoço.', avoidIf: [], adapt: { cervical: 'Faça com a cabeça reta.' },
  },
  {
    id: 'M2', group: 'mandibula', region: 'papada', title: 'Beijo ao céu', forWhat: 'Pescoço, queixo e bigode chinês.',
    ...reps(10, 15, 15),
    steps: ['Incline a cabeça levemente para trás', 'Faça biquinho para o teto', 'Mande beijos exagerados para o alto'],
    avoidIf: [], adapt: { cervical: 'Faça com a cabeça reta.' },
  },
  {
    id: 'M3', group: 'mandibula', region: 'mandibula', title: 'Queixo definido', forWhat: 'Contorno do queixo.',
    ...fixed('5 repetições', 30),
    steps: ['Três dedos de cada mão no final da mandíbula', 'Puxe a pele suavemente para trás e para cima', 'Inspire pelo nariz', 'Sopre com força pela boca'],
    avoidIf: [],
  },
  {
    id: 'M4', group: 'mandibula', region: 'mandibula', title: 'Masseter', forWhat: 'Soltar a tensão de quem aperta os dentes.',
    ...fixed('30 segundos', 30),
    steps: ['Boca levemente aberta, dentes sem encostar', 'Dois dedos na lateral da mandíbula', 'Círculos lentos, pressão média', 'Nunca dentro da articulação, na frente da orelha'],
    skip: 'Estalo doloroso ou travamento.', avoidIf: [], adapt: { atm: 'Toque bem leve; pare ao primeiro estalo.' },
  },
  {
    id: 'M5', group: 'mandibula', region: 'mandibula', title: 'Contorno em pinça', forWhat: 'Definir e soltar a linha da mandíbula.',
    ...fixed('3 de cada lado', 40), sided: true,
    steps: ['Pinça suave com polegar e indicador sobre o osso, no queixo', 'Deslize pela linha do osso até a orelha', 'Troque de lado'],
    avoidIf: ['peleCrise'],
  },

  // ——— Pescoço
  {
    id: 'P1', group: 'pescoco', region: 'pescoco', title: 'Língua ao canto', forWhat: 'Pescoço e postura.',
    ...fixed('10 s de cada lado', 30), sided: true,
    steps: ['Mãos cruzadas no peito, logo abaixo do pescoço', 'Vire a cabeça para a direita', 'Estique a língua para o canto de cima', 'Segure 10 segundos', 'Repita para a esquerda'],
    skip: 'Dor cervical ou tontura.', avoidIf: ['cervical'],
  },
  {
    id: 'P2', group: 'pescoco', region: 'pescoco', title: 'Deslizamento até a clavícula', forWhat: 'Relaxar e aplicar o creme do pescoço.',
    ...fixed('30 segundos', 30),
    steps: ['Mãos espalmadas, bastante produto', 'Deslize do alto do pescoço até as clavículas', 'Leve pressão na clavícula no fim', 'Sempre de cima para baixo'],
    avoidIf: [],
  },
  {
    id: 'P3', group: 'pescoco', region: 'pescoco', title: 'Alisamento do colo', forWhat: 'Pescoço e colo.',
    ...fixed('5 repetições', 30),
    steps: ['Mais produto nas mãos', 'Deslize as palmas do centro do colo para os ombros', 'Repita com os punhos fechados, bem suave'],
    avoidIf: [],
  },

  // ——— Massagem
  {
    id: 'MF1', group: 'massagem', title: 'Alongamento com o braço', forWhat: 'Alongar rosto, pescoço e ombro de uma vez.',
    ...fixed('3 de cada lado', 60), sided: true,
    steps: ['Levante o braço esquerdo e apoie a mão na têmpora direita', 'Com a mão direita, indicador acima do olho e médio abaixo, no osso', 'Estique os dedos suavemente para cima', 'Incline a cabeça para a esquerda', 'Solte o ar com força, língua para o lado inclinado', 'Relaxe e troque de lado'],
    avoidIf: ['cervical'],
  },
  {
    id: 'MF2', group: 'massagem', title: 'Ciclo com as mãos', forWhat: 'Massagem completa, só com as mãos.',
    ...fixed('2 minutos', 120),
    steps: ['Aqueça óleo ou creme nas palmas', 'Pressione as palmas no rosto, sem esfregar', 'Cubra os olhos e respire 3 vezes', 'Batidinhas de baixo para cima: queixo, bochechas, têmporas', 'Alise a testa do centro às têmporas', 'Dedos em “V”: alise entre as sobrancelhas até o cabelo', 'Palmas sobre o nariz: abra subindo até as têmporas'],
    avoidIf: [],
  },
  {
    id: 'MF3', group: 'massagem', title: 'Gua sha', forWhat: 'Massagem com a pedra.',
    ...fixed('5 vezes por área', 120), tool: true,
    steps: ['Pele bem lubrificada', 'Pedra quase deitada, a 45°', 'Pressão leve', 'Do centro para fora; no pescoço, de cima para baixo', 'No sulco, boca em “O”'],
    skip: 'Acne inflamada, rosácea ou procedimento recente.', avoidIf: ['peleCrise'],
  },
  {
    id: 'MF4', group: 'massagem', title: 'Rolo ou colher gelada', forWhat: 'Desinchar, principalmente de manhã.',
    ...fixed('1 minuto', 60), tool: true,
    steps: ['Rolo ou colher guardados na geladeira', 'Role ou deslize do centro para fora', 'Sem pressionar', 'Nos olhos, só sobre o osso'],
    avoidIf: ['peleCrise'],
  },

  // ——— Relaxamento
  {
    id: 'R1', group: 'relaxamento', region: 'olhos', title: 'Palmas nos olhos', forWhat: 'Descansar os olhos e o rosto.',
    ...fixed('3 a 5 respirações', 30),
    steps: ['Esfregue as mãos para aquecer', 'Cubra os olhos fechados, sem pressionar', 'Respire devagar'],
    avoidIf: [],
  },
  {
    id: 'R2', group: 'relaxamento', title: 'Pontos de pressão', forWhat: 'Relaxar com acupressão básica.',
    ...fixed('1 volta', 40),
    steps: ['Entre as sobrancelhas', 'Início das sobrancelhas', 'Têmporas', 'Abaixo do centro dos olhos, no osso', 'Ao lado das narinas', 'Centro do queixo: 5 pequenos círculos em cada ponto'],
    avoidIf: [],
  },
  {
    id: 'R3', group: 'relaxamento', region: 'mandibula', title: 'Soltar a mandíbula', forWhat: 'Tirar a tensão dos dentes apertados.',
    ...fixed('3 respirações', 20), anywhere: true,
    steps: ['Lábios fechados, dentes separados', 'Língua repousando no céu da boca', 'Respire 3 vezes e perceba a mandíbula pesada'],
    avoidIf: [],
  },
]

export const exerciseById = (id: string) => EXERCISES.find((e) => e.id === id)

/** Séries de rosto inteiro (Parte 6 do guia). */
export const SERIES: Record<'A' | 'B', string[]> = {
  A: ['A3', 'A5', 'T1', 'O1', 'O4', 'B1', 'L1', 'M1', 'R1', 'R3'],
  B: ['A2', 'A6', 'T2', 'T4', 'O2', 'B3', 'L2', 'M2', 'R2'],
}

/** Módulos de foco por objetivo. */
export type FocusId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

export const FOCUS: Record<FocusId, { title: string; ids: string[] }> = {
  A: { title: 'Bigode chinês', ids: ['N1', 'N2', 'N4'] },
  B: { title: 'Papada e pescoço', ids: ['P1', 'M3', 'M1', 'P2'] },
  C: { title: 'Testa', ids: ['T4', 'T5', 'T6'] },
  D: { title: 'Olhos', ids: ['O2', 'O3', 'O5', 'O4'] },
  E: { title: 'Lábios', ids: ['L3', 'L4', 'L2'] },
  F: { title: 'Bochechas e contorno', ids: ['B2', 'B1', 'M5', 'B4'] },
  G: { title: 'Tensão', ids: ['M4', 'A4', 'MF2', 'R3'] },
}
