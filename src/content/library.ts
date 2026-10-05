import type { RegionId, SafetyFlag, ToolId } from './types'

/**
 * Os 15 exercícios essenciais do FaceZen (+ 3 opcionais com a escova facial) (fonte única: app + arquivo do NotebookLM).
 * Texto próprio e simples: 3 passos e um jeito de conferir. Os desenhos ficam em `art.ts`.
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
  | 'mandibula'
  | 'pescoco'
  | 'relaxamento'
  | 'escova'

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
  { id: 'mandibula', title: 'Mandíbula, queixo e papada', intro: 'Contorno do queixo, papada e a tensão de quem aperta os dentes.', region: 'papada' },
  { id: 'pescoco', title: 'Pescoço e colo', intro: 'Postura e tônus do pescoço. No pescoço, a massagem vai sempre de cima para baixo.', region: 'pescoco' },
  { id: 'relaxamento', title: 'Relaxamento final', intro: 'Um minuto para soltar o rosto e terminar a sessão.' },
  { id: 'escova', title: 'Escova facial (opcional)', intro: 'Para quem tem a escova de cerdas macias: pescoço primeiro, depois rosto e testa, sempre de leve.' },
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
  /** No máximo 3 passos, com comparações do dia a dia. */
  steps: string[]
  /** Como conferir no espelho se está certo. */
  check: string
  /** Quando pular (texto para a pessoa). */
  skip?: string
  /** Fica fora do plano de quem marcou estas situações. */
  avoidIf: SafetyFlag[]
  /** Pode ser feito, com este ajuste. */
  adapt?: Partial<Record<SafetyFlag, string>>
  /** Pode ser feito sem as mãos, em qualquer lugar. */
  anywhere?: boolean
  /** Precisa deste acessório. */
  tool?: ToolId
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
    id: 'A3', group: 'aquecimento', region: 'pescoco', title: 'Meia-lua do pescoço', forWhat: 'Soltar o pescoço antes de começar.',
    ...fixed('5 de cada lado', 40), sided: true,
    steps: ['Desça o queixo em direção ao peito, devagar.', 'Role a cabeça até a orelha chegar perto do ombro direito.', 'Volte pelo meio e vá para o lado esquerdo.'],
    check: 'Só a metade da frente: a cabeça nunca vai para trás.', skip: 'Dor no pescoço ou tontura.', avoidIf: ['cervical'],
  },
  {
    id: 'A5', group: 'aquecimento', region: 'bochechas', title: 'Balão', forWhat: 'Aquecer bochechas e boca.',
    ...fixed('5 voltas', 40), anywhere: true,
    steps: ['Encha as bochechas de ar, com a boca fechada.', 'Passe o ar de uma bochecha para a outra, contando 3 em cada.', 'Leve o ar para cima e para baixo dos lábios, e solte.'],
    check: 'Sem estufar ao máximo e sem prender a respiração.', skip: 'Dor na mandíbula ou no ouvido.', avoidIf: ['atm'],
  },
  {
    id: 'A6', group: 'aquecimento', region: 'papada', title: 'Língua em ponte', forWhat: 'Acordar a região embaixo do queixo.',
    ...fixed('5 repetições', 30),
    steps: ['Abra um pouco a boca e encoste a ponta da língua atrás dos dentes de baixo.', 'Empurre o meio da língua para fora, como uma ponte.', 'Segure 3 segundos e relaxe.'],
    check: 'Você sente o trabalho embaixo do queixo.', avoidIf: [],
  },

  // ——— Testa
  {
    id: 'T1', group: 'testa', region: 'testa', title: 'Testa lisa', forWhat: 'Treinar a testa a não enrugar.',
    ...reps(10, 15, 15),
    steps: ['Apoie as mãos na testa, como quem afasta a franja, e segure a pele firme.', 'Feche os olhos e tente descer as sobrancelhas, como quando bate o sono.', 'As mãos não deixam descer: sinta a força e solte.'],
    check: 'A testa não enruga e nada de franzir entre as sobrancelhas.', avoidIf: [],
  },
  {
    id: 'T6', group: 'testa', region: 'testa', title: 'Alisar a testa', forWhat: 'Relaxar a testa.',
    ...fixed('30 segundos', 30),
    steps: ['Coloque as pontas dos dedos no meio da testa.', 'Deslize devagar até as têmporas, como quem alisa um lençol.', 'Aperte de leve as têmporas por 2 segundos e recomece do meio.'],
    check: 'Pele com um pouco de creme, para deslizar sem repuxar.', avoidIf: [],
  },

  // ——— Olhos
  {
    id: 'O4', group: 'olhos', region: 'olhos', title: 'Toque de pena', forWhat: 'Relaxar em volta dos olhos. Ótimo de manhã.',
    ...fixed('30 segundos', 30),
    steps: ['Use o dedo anelar, que é o mais leve.', 'Dê batidinhas em volta do olho, sobre o osso: embaixo da sobrancelha e em cima da maçã do rosto.', 'Como gotas de chuva, sem nunca tocar no olho.'],
    check: 'O toque é tão leve que a pele nem se mexe.', avoidIf: [],
  },
  {
    id: 'O5', group: 'olhos', region: 'olhos', title: 'Olhar em cruz', forWhat: 'Descansar os olhos.',
    ...fixed('2 voltas', 30), anywhere: true,
    steps: ['Com a cabeça parada, olhe para a direita e depois para a esquerda.', 'Olhe para cima e depois para baixo.', 'Feche os olhos por 5 segundos.'],
    check: 'Só os olhos se mexem; a cabeça fica parada.', skip: 'Tontura ou visão dupla.', avoidIf: [],
  },

  // ——— Bochechas
  {
    id: 'B1', group: 'bochechas', region: 'bochechas', title: 'Do “O” ao sorriso', forWhat: 'Trabalhar as maçãs do rosto.',
    ...reps(10, 15, 15),
    steps: ['Faça um “O” com a boca, como quem diz “Oh!”.', 'Abra um sorriso bem grande, subindo as bochechas.', 'Volte devagar para o “O” e repita.'],
    check: 'Sorria sem apertar os olhos.', avoidIf: [],
  },
  {
    id: 'B3', group: 'bochechas', region: 'bochechas', title: 'Peixinho', forWhat: 'Bochechas e cantos da boca.',
    ...reps(10, 15, 15), anywhere: true,
    steps: ['Chupe as bochechas para dentro, fazendo boca de peixe.', 'Nessa posição, tente sorrir.', 'Segure 3 segundos e solte.'],
    check: 'Você sente as bochechas trabalhando, sem dor.', avoidIf: ['atm'],
  },

  // ——— Bigode chinês e boca
  {
    id: 'N1', group: 'bigode', region: 'bigode', title: 'Sorriso escondido', forWhat: 'Bochechas e a linha entre o nariz e a boca.',
    dose: { ini: '1 × 20 s', int: '2 × 30 s', ava: '3 × 30 s' }, seconds: { ini: 20, int: 65, ava: 100 },
    steps: ['Cubra as orelhas com as mãos e puxe a pele de leve para trás.', 'Esconda os lábios para dentro, cobrindo os dentes.', 'Sorria o máximo que conseguir e segure.'],
    check: 'Trabalho nas bochechas e ao lado da boca, testa parada.', avoidIf: [],
  },
  {
    id: 'L1', group: 'labios', region: 'bigode', title: '“O” e “A”', forWhat: 'Contorno da boca.',
    ...reps(10, 15, 15),
    steps: ['Faça um biquinho em “O”, com os lábios bem para frente.', 'Abra a boca dizendo “A”, bem exagerado.', 'Volte ao “O” e repita.'],
    check: 'A boca se mexe bastante e a testa fica parada.', avoidIf: [], adapt: { atm: 'Abra pouco a boca no “A”.' },
  },

  // ——— Mandíbula e pescoço
  {
    id: 'M1', group: 'mandibula', region: 'papada', title: 'Lábio para cima', forWhat: 'Queixo e frente do pescoço.',
    ...reps(10, 15, 15),
    steps: ['Olhe para o teto e empurre o queixo um pouco para frente.', 'Suba o lábio de baixo por cima do de cima.', 'Desça e suba o lábio, devagar.'],
    check: 'Você sente a frente do pescoço trabalhando.', avoidIf: [], adapt: { cervical: 'Faça olhando para frente, com a cabeça reta.' },
  },
  {
    id: 'M4', group: 'mandibula', region: 'mandibula', title: 'Soltar o masseter', forWhat: 'Aliviar quem aperta os dentes.',
    ...fixed('30 segundos', 30),
    steps: ['Deixe os dentes separados, com a boca levemente aberta.', 'Coloque dois dedos na bochecha, onde a mandíbula faz força ao morder.', 'Faça círculos lentos, com pressão média.'],
    check: 'Nunca em cima da articulação, na frente da orelha.', skip: 'Estalo com dor ou travamento.', avoidIf: [], adapt: { atm: 'Toque bem leve; pare ao primeiro estalo.' },
  },
  {
    id: 'P2', group: 'pescoco', region: 'pescoco', title: 'Pescoço para baixo', forWhat: 'Relaxar o pescoço.',
    ...fixed('30 segundos', 30),
    steps: ['Espalhe um pouco de creme no pescoço.', 'Deslize as mãos do alto do pescoço até a clavícula.', 'Sempre de cima para baixo, devagar.'],
    check: 'Sem apertar a garganta.', avoidIf: [],
  },

  // ——— Relaxamento
  {
    id: 'R3', group: 'relaxamento', region: 'mandibula', title: 'Mandíbula solta', forWhat: 'Terminar soltando os dentes apertados.',
    ...fixed('3 respirações', 20), anywhere: true,
    steps: ['Feche os lábios, mas deixe os dentes separados.', 'Deixe a língua descansar no céu da boca.', 'Fique assim por 3 respirações, com a mandíbula pesada.'],
    check: 'Vale fazer também durante o dia, sempre que lembrar.', avoidIf: [],
  },
]

// ——— Escova facial (opcional; só entra nas sessões de quem marcou que tem)
const BRUSH_SKIP = 'Espinha inflamada, ferida, rosácea ou pele irritada.'

EXERCISES.push(
  {
    id: 'E1', group: 'escova', region: 'pescoco', title: 'Escova no pescoço', forWhat: 'Começar a massagem com a escova pelo pescoço.',
    ...fixed('5 passadas de cada lado', 40), sided: true, tool: 'escova',
    steps: ['Encoste as cerdas de leve atrás da orelha.', 'Desça pela lateral do pescoço até a clavícula, devagar.', 'Faça 5 passadas de cada lado, sempre de cima para baixo.'],
    check: 'As cerdas só deslizam: a pele não fica vermelha nem repuxa.', skip: BRUSH_SKIP, avoidIf: ['peleCrise'],
  },
  {
    id: 'E2', group: 'escova', region: 'bochechas', title: 'Escova no rosto', forWhat: 'Massagem do centro do rosto para as orelhas.',
    ...fixed('5 passadas por linha', 60), sided: true, tool: 'escova',
    steps: ['Comece no queixo e deslize pela linha da mandíbula até a orelha.', 'Depois, do lado do nariz até a orelha, passando pela bochecha.', 'Termine descendo da orelha até o pescoço.'],
    check: 'Sempre para fora, sem esfregar e longe dos olhos.', skip: BRUSH_SKIP, avoidIf: ['peleCrise'],
  },
  {
    id: 'E3', group: 'escova', region: 'testa', title: 'Escova na testa', forWhat: 'Relaxar a testa com a escova.',
    ...fixed('5 passadas de cada lado', 30), sided: true, tool: 'escova',
    steps: ['Encoste a escova no meio da testa.', 'Deslize até a têmpora, como quem penteia a testa para o lado.', 'Termine descendo da têmpora até a orelha.'],
    check: 'Leve e lento. Não passe sobre as sobrancelhas nem perto dos olhos.', skip: BRUSH_SKIP, avoidIf: ['peleCrise'],
  },
)

/** Bloco da escova: o rosto todo com 10 ou 15 minutos; só o rosto com 5. */
export const BRUSH_BLOCK: Record<5 | 10 | 15, string[]> = { 5: ['E2'], 10: ['E1', 'E2', 'E3'], 15: ['E1', 'E2', 'E3'] }

export const exerciseById = (id: string) => EXERCISES.find((e) => e.id === id)

/** Duas séries de rosto inteiro, que se alternam. */
export const SERIES: Record<'A' | 'B', string[]> = {
  A: ['A3', 'A5', 'T1', 'O4', 'B1', 'L1', 'M1', 'R3'],
  B: ['A6', 'T6', 'O5', 'B3', 'N1', 'M4', 'P2', 'R3'],
}

/** Módulos de foco por objetivo (só com os essenciais). */
export type FocusId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

export const FOCUS: Record<FocusId, { title: string; ids: string[] }> = {
  A: { title: 'Bigode chinês', ids: ['N1', 'B1'] },
  B: { title: 'Papada e pescoço', ids: ['A6', 'M1', 'P2'] },
  C: { title: 'Testa', ids: ['T1', 'T6'] },
  D: { title: 'Olhos', ids: ['O4', 'O5'] },
  E: { title: 'Lábios', ids: ['L1', 'N1'] },
  F: { title: 'Bochechas e contorno', ids: ['B1', 'B3', 'M4'] },
  G: { title: 'Tensão', ids: ['M4', 'T6', 'R3'] },
}
