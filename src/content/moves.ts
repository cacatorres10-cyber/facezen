import type { RegionId, RegionInfo, SafetyFlag } from './types'

export const REGIONS: RegionInfo[] = [
  { id: 'testa', label: 'Testa', short: 'Testa', concern: 'Linhas de expressão' },
  { id: 'olhos', label: 'Olhos', short: 'Olhos', concern: 'Olheiras e inchaço' },
  { id: 'bochechas', label: 'Bochechas', short: 'Bochechas', concern: 'Viço e firmeza' },
  { id: 'bigode', label: 'Bigode chinês', short: 'Bigode chinês', concern: 'Entre o nariz e a boca' },
  { id: 'mandibula', label: 'Mandíbula', short: 'Mandíbula', concern: 'Contorno e tensão' },
  { id: 'papada', label: 'Papada', short: 'Papada', concern: 'Abaixo do queixo' },
  { id: 'pescoco', label: 'Pescoço', short: 'Pescoço', concern: 'Pescoço e colo' },
]

export const regionById = (id: RegionId) => REGIONS.find((r) => r.id === id)!

/** Um movimento das aulas, cronometrado no app. */
export interface Move {
  id: string
  title: string
  region?: RegionId
  durationSec: number
  /** Divide o tempo ao meio e avisa a troca de lado. */
  sided?: boolean
  /** Como fazer, em passos curtos. */
  steps: string[]
  /** Pare se... (curto). */
  stop: string
  /** Aula onde o movimento aparece. */
  aula: string
  /** Não entra no plano de quem marcou uma destas situações. */
  avoidIf: SafetyFlag[]
  /** Semana do plano em que o movimento entra. */
  week: number
}

const GUIADA = 'MPckU0F4Gig'

/**
 * Os 12 movimentos da aula guiada (Longevidade Yoga), na ordem do vídeo,
 * no resumo editorial do ebook e sempre com toque leve.
 */
export const MOVES: Move[] = [
  {
    id: 'pescoco',
    title: 'Pescoço',
    region: 'pescoco',
    durationSec: 45,
    steps: ['Deslize as mãos nas laterais do pescoço, alternando os lados', 'Depois, de baixo para cima no centro', 'Nunca pressione a garganta'],
    stop: 'Pare se sentir tontura ou pressão na garganta.',
    aula: GUIADA,
    avoidIf: [],
    week: 1,
  },
  {
    id: 'papada',
    title: 'Papada e mandíbula',
    region: 'papada',
    durationSec: 45,
    steps: ['Dedos no centro do queixo', 'Deslize até as orelhas', 'Contato leve, sem empurrar a pele'],
    stop: 'Pare se doer ou marcar a pele.',
    aula: GUIADA,
    avoidIf: [],
    week: 1,
  },
  {
    id: 'masseter',
    title: 'Masseter',
    region: 'mandibula',
    durationSec: 45,
    steps: ['Boca levemente aberta', 'Círculos na lateral da mandíbula', 'Pressão leve, sem apertar a articulação'],
    stop: 'Pule se houver estalo, dor ou travamento.',
    aula: GUIADA,
    avoidIf: ['atm'],
    week: 3,
  },
  {
    id: 'contorno',
    title: 'Contorno do rosto',
    region: 'mandibula',
    durationSec: 50,
    sided: true,
    steps: ['Faça uma pinça suave com os dedos', 'Siga a linha do osso até a orelha', 'Um lado de cada vez'],
    stop: 'Pare se doer na frente da orelha.',
    aula: GUIADA,
    avoidIf: ['atm'],
    week: 3,
  },
  {
    id: 'sulco',
    title: 'Bigode chinês e maçãs',
    region: 'bigode',
    durationSec: 50,
    sided: true,
    steps: ['Uma mão apoia a têmpora', 'A outra desliza da lateral do nariz para fora', 'Sem esticar a pele'],
    stop: 'Pare se a pele repuxar ou avermelhar.',
    aula: GUIADA,
    avoidIf: [],
    week: 2,
  },
  {
    id: 'olhos',
    title: 'Olhos e sobrancelhas',
    region: 'olhos',
    durationSec: 30,
    steps: ['Dedo anelar no canto de fora dos olhos', 'Deslize para cima e para fora', 'Nunca toque no olho'],
    stop: 'Pare se arder, lacrimejar ou a visão mudar.',
    aula: GUIADA,
    avoidIf: ['olhos'],
    week: 1,
  },
  {
    id: 'testa',
    title: 'Testa',
    region: 'testa',
    durationSec: 45,
    steps: ['Deslizes verticais, de baixo para cima', 'Depois horizontais, do centro para fora', 'Termine com vibrações leves'],
    stop: 'Não franza a testa durante o movimento.',
    aula: GUIADA,
    avoidIf: [],
    week: 1,
  },
  {
    id: 'camadas',
    title: 'Três alturas do rosto',
    region: 'bochechas',
    durationSec: 45,
    steps: ['Deslize para fora abaixo dos olhos (bem leve)', 'Depois no meio das bochechas', 'Por fim na linha da mandíbula'],
    stop: 'Abaixo dos olhos, pressão mínima.',
    aula: GUIADA,
    avoidIf: [],
    week: 2,
  },
  {
    id: 'labios',
    title: 'Lábios',
    region: 'bigode',
    durationSec: 30,
    steps: ['Forme um “U” com a boca', 'Toque os lábios com delicadeza', 'Sem forçar a abertura'],
    stop: 'Pare se os lábios racharem ou arderem.',
    aula: GUIADA,
    avoidIf: [],
    week: 4,
  },
  {
    id: 'bochechas',
    title: 'Bochechas com ar',
    region: 'bochechas',
    durationSec: 30,
    steps: ['Encha as bochechas de ar', 'Segure um pouco e solte', 'Sem estufar ao máximo'],
    stop: 'Pare se doer a mandíbula ou der tontura.',
    aula: GUIADA,
    avoidIf: ['atm'],
    week: 2,
  },
  {
    id: 'pincamento',
    title: 'Pinçamento leve',
    region: 'bochechas',
    durationSec: 30,
    steps: ['Pequenos beliscões bem leves pelo rosto', 'Rápidos e suaves', 'Pele sensível: só encoste as mãos'],
    stop: 'Pule com acne, rosácea ou pele irritada.',
    aula: GUIADA,
    avoidIf: ['peleCrise'],
    week: 4,
  },
  {
    id: 'finalizar',
    title: 'Finalizar',
    durationSec: 40,
    steps: ['Deslizes amplos e leves no rosto todo', 'Círculos ao redor dos olhos, sem tocar neles', 'Aplique seu hidratante'],
    stop: 'O rosto deve ficar confortável, nunca ardendo.',
    aula: GUIADA,
    avoidIf: [],
    week: 1,
  },
]

export const moveById = (id: string) => MOVES.find((m) => m.id === id)

/** Aulas da playlist que aprofundam cada região. */
export const RELATED_AULAS: Partial<Record<RegionId, string[]>> = {
  pescoco: ['aXVPeshsAiM'],
  papada: ['L-WHHoCj0wA'],
  bigode: ['LllZdN0yAvA'],
  testa: ['YR6HcSLL6HI'],
  bochechas: ['uSBkenIngBo', 'NY01wWioTrU'],
  mandibula: ['D9ULUd0tLYY'],
}
