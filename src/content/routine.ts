import type { RegionId } from './types'

export type StepKind = 'move' | 'rest'

/** Um passo da sessão guiada. */
export interface StepDef {
  id: string
  title: string
  kind: StepKind
  region?: RegionId
  exerciseId?: string
  durationSec: number
  /** Texto principal (curto), lido pela voz guiada. */
  instruction: string
  /** Divide o tempo ao meio e avisa a troca de lado. */
  sided?: boolean
  /** Pode ser pulado sem culpa. */
  optional?: boolean
  /** Aviso personalizado mostrado no passo. */
  note?: string
}

/** A rotina de 10 minutos do ebook, em passos curtos e cronometrados. */
export const STEPS: Record<string, StepDef> = {
  aquecimento: {
    id: 'aquecimento',
    title: 'Aquecimento',
    kind: 'move',
    region: 'pescoco',
    durationSec: 45,
    instruction: 'Toques leves nas clavículas, ombros e laterais do pescoço. Depois, na linha do cabelo e acima das sobrancelhas.',
  },
  testa: {
    id: 'testa',
    title: 'Testa',
    kind: 'move',
    region: 'testa',
    exerciseId: 'testa-alisamento',
    durationSec: 30,
    instruction: 'Dedos no centro da testa. Deslize devagar até as têmporas, com contato mínimo. Levante e repita.',
  },
  testaSobrancelhas: {
    id: 'testaSobrancelhas',
    title: 'Entre as sobrancelhas',
    kind: 'move',
    region: 'testa',
    exerciseId: 'testa-sobrancelhas',
    durationSec: 30,
    optional: true,
    instruction: 'Polegar entre as sobrancelhas: uma passagem para cima e uma curta para fora. Cinco vezes.',
  },
  olhosCirculos: {
    id: 'olhosCirculos',
    title: 'Olhos',
    kind: 'move',
    region: 'olhos',
    exerciseId: 'olhos-pena',
    durationSec: 30,
    instruction: 'Com o dedo anelar, toque de pena ao redor do osso dos olhos. Nunca no globo ocular.',
  },
  olhosRastreamento: {
    id: 'olhosRastreamento',
    title: 'Olhar em cruz',
    kind: 'move',
    region: 'olhos',
    exerciseId: 'olhos-rastreamento',
    durationSec: 30,
    instruction: 'Sem mover a cabeça: olhe para a direita, esquerda, teto e chão, voltando sempre ao centro.',
  },
  bochechasAr: {
    id: 'bochechasAr',
    title: 'Bochechas',
    kind: 'move',
    region: 'bochechas',
    exerciseId: 'bochechas-ar',
    durationSec: 30,
    instruction: 'Encha as bochechas de ar e passe de um lado para o outro, sem estufar ao máximo.',
  },
  sorriso: {
    id: 'sorriso',
    title: 'Sorriso protegido',
    kind: 'move',
    region: 'bochechas',
    exerciseId: 'bochechas-sorriso',
    durationSec: 45,
    instruction: 'Lábios cobrindo os dentes, forme um “O” pequeno e abra o sorriso. Seis vezes.',
  },
  bigode: {
    id: 'bigode',
    title: 'Bigode chinês',
    kind: 'move',
    region: 'bigode',
    exerciseId: 'bigode-resistencia',
    durationSec: 60,
    instruction: 'Dedos sobre a dobra entre nariz e boca. Sorria contra uma resistência mínima, sem puxar. Dez vezes, devagar.',
  },
  mandibula: {
    id: 'mandibula',
    title: 'Mandíbula',
    kind: 'move',
    region: 'mandibula',
    exerciseId: 'mandibula-deslizamento',
    durationSec: 60,
    sided: true,
    instruction: 'Dentes sem se tocar. Círculos pequenos do queixo até a frente da orelha, sem apertar.',
  },
  queixo: {
    id: 'queixo',
    title: 'Papada',
    kind: 'move',
    region: 'papada',
    exerciseId: 'papada-apoio',
    durationSec: 30,
    instruction: 'Apoie o queixo de leve nas pontas dos dedos por alguns segundos. Depois, batidinhas suaves sob o queixo.',
  },
  projecao: {
    id: 'projecao',
    title: 'Papada: projeção',
    kind: 'move',
    region: 'papada',
    exerciseId: 'papada-projecao',
    durationSec: 60,
    optional: true,
    instruction: 'Olhe para o teto sem forçar a nuca e leve o queixo para a frente. Segure contando até dez. Até cinco vezes.',
  },
  pescoco: {
    id: 'pescoco',
    title: 'Pescoço',
    kind: 'move',
    region: 'pescoco',
    exerciseId: 'pescoco-deslizamento',
    durationSec: 30,
    instruction: 'Deslize as mãos do alto do pescoço até as clavículas, com pressão suave.',
  },
  toquesPescoco: {
    id: 'toquesPescoco',
    title: 'Toques no pescoço',
    kind: 'move',
    region: 'pescoco',
    durationSec: 45,
    instruction: 'Cinco toques leves descendo do pescoço às clavículas. Nada de massagem em área vermelha.',
  },
  encerramento: {
    id: 'encerramento',
    title: 'Finalize',
    kind: 'rest',
    durationSec: 30,
    instruction: 'Aplique hidratante e, de manhã, protetor solar. O rosto deve estar confortável, nunca ardendo.',
  },
}
