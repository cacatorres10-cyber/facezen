export type RegionId = 'testa' | 'olhos' | 'bochechas' | 'bigode' | 'mandibula' | 'papada' | 'pescoco'

/** Situações de saúde que mudam o que o app sugere. */
export type SafetyFlag =
  | 'cervical' // histórico de dor cervical
  | 'atm' // disfunção ou dor na articulação da mandíbula
  | 'olhos' // sintomas oculares
  | 'procedimento' // procedimento estético recente sem liberação
  | 'gestante' // gravidez ou amamentação
  | 'peleCrise' // rosácea, eczema, acne inflamada, feridas

export type SkinBase = 'seca' | 'oleosa' | 'mista' | 'normal'

export type IntentionId = 'relaxar' | 'tensao' | 'ritual' | 'aparencia' | 'skincare'

export type Experience = 'nunca' | 'algumas' | 'pratico'

export interface Exercise {
  id: string
  /** Número da ficha no ebook (ex.: "3.1"). */
  number: string
  region: RegionId
  title: string
  optional?: boolean
  goal: string
  position: string
  execution: string
  breathing: string
  reps: string
  frequency: string
  sensation: string
  stopSigns: string
  /** Texto complementar (ex.: "Por que isso não trata olheiras?"). */
  note?: { title: string; text: string }
  /** Duração sugerida para praticar sozinho, em segundos. */
  practiceSec: number
  /** Se o exercício é feito um lado de cada vez. */
  sided?: boolean
  /** Dicas curtas usadas no modo guiado. */
  cues: string[]
  /** Semana do programa a partir da qual o exercício é recomendado. */
  minWeek: number
  /** Situações em que o app não sugere o exercício sem liberação profissional. */
  avoidIf: SafetyFlag[]
  /** Situações que pedem cuidado extra. */
  cautionIf: SafetyFlag[]
  sources: number[]
}

export interface RegionInfo {
  id: RegionId
  label: string
  short: string
  concern: string
}
