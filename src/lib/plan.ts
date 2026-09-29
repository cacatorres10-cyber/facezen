import { exerciseById, FOCUS, LEVEL_LABEL, SERIES, type Exercise, type FocusId, type Level } from '../content/library'
import { GOALS } from '../content/profileOptions'
import { weekInfo, type ProgramWeek } from '../content/program'
import type { RegionId, SafetyFlag } from '../content/types'
import { addDays, dayKey } from './dates'
import type { Profile, SessionLog } from './store'

/** Segundos de preparação antes de cada exercício. */
export const PREP_SEC = 5

export type VariantId = 'serie-a' | 'serie-b' | 'suave' | 'pausa' | 'avulso'

export interface SessionStep {
  key: string
  id: string
  title: string
  region?: RegionId
  durationSec: number
  sided?: boolean
  steps: string[]
  /** Dose no nível da sessão (ex.: "2 × 15"). */
  dose: string
  /** Quando pular. */
  stop?: string
  /** Ajuste para esta pessoa (ex.: "Faça com a cabeça reta."). */
  note?: string
  /** Faz parte do módulo do objetivo. */
  focus?: boolean
}

export interface SessionPlan {
  variant: VariantId
  title: string
  subtitle: string
  level?: Level
  steps: SessionStep[]
  totalSec: number
  /** O ajuste feito para esta pessoa, em uma frase (ou vazio). */
  adaptations: string[]
}

export interface PlanContext {
  week: number
  sessionIndex: number
  /** A pessoa disse que a pele não está bem hoje. */
  skinIrritatedToday?: boolean
  /** Houve incômodo numa sessão recente: não sobe para o avançado. */
  recentDiscomfort?: boolean
}

type ProfileLike = Pick<Profile, 'goals' | 'minutes' | 'safety' | 'sensitive'>

/** Tempo máximo de cada sessão, em segundos, pelo tempo escolhido. */
export const BUDGET: Record<Profile['minutes'], number> = { 5: 7 * 60, 10: 12 * 60, 15: 16 * 60 }

/** Fase do programa (Parte 6 do guia). */
export function phaseOf(week: number): 1 | 2 | 3 | 4 {
  if (week <= 2) return 1
  if (week <= 5) return 2
  if (week <= 8) return 3
  return 4
}

export const PHASE_LABEL = { 1: 'Adaptação', 2: 'Construção', 3: 'Intensificação', 4: 'Manutenção' } as const

/** Nível das doses nesta semana. */
export function levelFor(week: number, recentDiscomfort = false): Level {
  const phase = phaseOf(week)
  if (phase === 1) return 'ini'
  if (phase === 3 && !recentDiscomfort) return 'ava'
  return 'int'
}

/** Série do dia: A nas semanas 1–2; depois alterna, começando pela B (fase 2) ou pela A (fase 3). */
export function seriesFor(week: number, sessionIndex: number): 'A' | 'B' {
  const phase = phaseOf(week)
  if (phase === 1) return 'A'
  const first = phase === 2 ? 'B' : 'A'
  const other = first === 'A' ? 'B' : 'A'
  return sessionIndex % 2 === 0 ? first : other
}

/** Módulo de foco do dia: o objetivo principal, alternando com o secundário. */
export function focusFor(goals: Profile['goals'], sessionIndex: number): FocusId | undefined {
  const modules = [...new Set(goals.map((g) => GOALS.find((x) => x.id === g)?.focus).filter((f): f is FocusId => !!f))]
  if (modules.length === 0) return undefined
  return modules[modules.length > 1 && sessionIndex % 2 === 1 ? 1 : 0]
}

/** Exercícios sem toque no rosto, para dias de pele irritada. */
const SUAVE = ['A6', 'O5', 'B1', 'B3', 'L1', 'R3']

export function isAllowed(ex: Exercise, profile: Pick<Profile, 'safety'>): boolean {
  return !ex.avoidIf.some((f) => profile.safety.includes(f))
}

/** Um exercício pronto para o cronômetro, no nível pedido. */
export function stepFrom(ex: Exercise, level: Level, profile: Pick<Profile, 'safety'>, key = ex.id, focus = false): SessionStep {
  const note = profile.safety.map((f) => ex.adapt?.[f]).find(Boolean)
  return {
    key,
    id: ex.id,
    title: ex.title,
    region: ex.region,
    durationSec: ex.seconds[level],
    sided: ex.sided,
    steps: ex.steps,
    dose: ex.dose[level],
    stop: ex.skip,
    note,
    focus,
  }
}

/** Monta a sessão do dia: série A ou B + módulo do objetivo, no nível da fase. */
export function buildSession(profile: ProfileLike, ctx: PlanContext): SessionPlan {
  const flags = profile.safety

  if (flags.includes('procedimento')) {
    return plan('pausa', 'Sessões em pausa', 'Até a liberação do seu procedimento', undefined, [], [
      'Depois de um procedimento, espere a liberação de quem o realizou. Quando for liberado, desmarque em Perfil.',
    ])
  }

  const adaptations: string[] = []
  if (flags.includes('atm')) adaptations.push('Sem Balão e Peixinho, por causa da mandíbula. Abra pouco a boca.')
  if (flags.includes('cervical')) adaptations.push('Pescoço sempre neutro: sem a meia-lua e com a cabeça reta.')
  if (flags.includes('olhos')) adaptations.push('Olhos só com toque leve, por causa dos sintomas que você marcou.')
  if (profile.sensitive) adaptations.push('Pele sensível: pressão mínima e mais produto para deslizar.')

  if (flags.includes('peleCrise') || ctx.skinIrritatedToday) {
    const steps = SUAVE.map((id) => exerciseById(id)!)
      .filter((e) => isAllowed(e, profile))
      .map((e) => stepFrom(e, 'ini', profile))
    return plan('suave', 'Sessão suave', 'Sem tocar o rosto hoje', 'ini', steps, ['Com a pele irritada, só exercícios sem as mãos no rosto.', ...adaptations])
  }

  const week = Math.max(1, ctx.week)
  const series = seriesFor(week, ctx.sessionIndex)
  const focusId = phaseOf(week) >= 2 ? focusFor(profile.goals, ctx.sessionIndex) : undefined
  const budget = BUDGET[profile.minutes] ?? BUDGET[10]

  const pick = (ids: string[]) => ids.map((id) => exerciseById(id)!).filter((e) => isAllowed(e, profile))
  const base = pick(SERIES[series])
  const focus = focusId ? pick(FOCUS[focusId].ids) : []
  // O relaxamento fecha a sessão, depois do foco.
  const relax = base.filter((e) => e.group === 'relaxamento')
  const body = base.filter((e) => e.group !== 'relaxamento')
  const items = [...body.map((e) => ({ e, focus: false })), ...focus.map((e) => ({ e, focus: true })), ...relax.map((e) => ({ e, focus: false }))]

  const levels: Level[] = ['ava', 'int', 'ini']
  const start = levels.indexOf(levelFor(week, ctx.recentDiscomfort))
  let chosen: { steps: SessionStep[]; level: Level } | undefined
  for (const level of levels.slice(start)) {
    const steps = items.map(({ e, focus }, i) => stepFrom(e, level, profile, `${e.id}-${i}`, focus))
    const trimmed = fitTo(steps, budget)
    // Rosto inteiro: se precisar cortar mais de 3 exercícios, desce um nível.
    if (totalOf(trimmed) <= budget && steps.length - trimmed.length <= 3) {
      chosen = { steps: trimmed, level }
      break
    }
  }
  if (!chosen) {
    const steps = items.map(({ e, focus }, i) => stepFrom(e, 'ini', profile, `${e.id}-${i}`, focus))
    chosen = { steps: fitTo(steps, budget, 0), level: 'ini' }
  }

  const title = focusId ? `Série ${series} + ${FOCUS[focusId].title}` : `Série ${series}`
  const subtitle = `${chosen.steps.length} exercícios · ${LEVEL_LABEL[chosen.level].toLowerCase()}`
  return plan(series === 'A' ? 'serie-a' : 'serie-b', title, subtitle, chosen.level, chosen.steps, adaptations)
}

/**
 * Corta até caber no tempo: primeiro os exercícios da série (de trás para frente),
 * mantendo o primeiro, o último e o foco; só depois o foco. Nunca fica abaixo de `minKeep`.
 */
export function fitTo(steps: SessionStep[], seconds: number, minKeep = 0): SessionStep[] {
  const out = [...steps]
  const removable = (focus: boolean) => {
    for (let i = out.length - 2; i >= 1; i--) if (!!out[i].focus === focus) return i
    return -1
  }
  while (totalOf(out) > seconds && out.length > Math.max(minKeep, 2)) {
    let i = removable(false)
    if (i < 0) i = removable(true)
    if (i < 0) break
    out.splice(i, 1)
  }
  return out
}

function plan(variant: VariantId, title: string, subtitle: string, level: Level | undefined, steps: SessionStep[], adaptations: string[]): SessionPlan {
  return { variant, title, subtitle, level, steps, totalSec: totalOf(steps), adaptations }
}

export function totalOf(steps: Pick<SessionStep, 'durationSec'>[]): number {
  return steps.reduce((sum, s) => sum + s.durationSec + PREP_SEC, 0)
}

/** Motivo pelo qual um exercício fica fora do plano desta pessoa (ou nada). */
export function exerciseBlockedBy(ex: Exercise, profile: Pick<Profile, 'safety'>): SafetyFlag[] {
  return ex.avoidIf.filter((f) => profile.safety.includes(f))
}

/** Houve incômodo ou dor nos últimos 7 dias? */
export function hadRecentDiscomfort(sessions: SessionLog[], now = new Date()): boolean {
  const since = addDays(dayKey(now), -7)
  return sessions.some((s) => s.date >= since && s.flagged)
}

// ————— Semana e hoje —————

export function weekTarget(week: ProgramWeek, profile: Pick<Profile, 'days'>): { target: number; max: number } {
  const planned = Math.max(3, profile.days.length)
  const target = Math.min(week.sessions.min, planned)
  return { target, max: Math.max(target, week.sessions.max) }
}

export function sessionsThisWeek(sessions: SessionLog[], weekStartedAt: string): SessionLog[] {
  return sessions.filter((s) => s.completed && s.startedAt >= weekStartedAt)
}

/**
 * Início da semana que vale para a contagem. Nas semanas 1–8 é quando a pessoa entrou na semana;
 * na manutenção, a semana do calendário (a partir de segunda-feira).
 */
export function weekStart(program: { week: number; weekStartedAt: string }, now = new Date()): string {
  if (program.week <= 8) return program.weekStartedAt
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  const iso = monday.toISOString()
  return iso > program.weekStartedAt ? iso : program.weekStartedAt
}

export type TodayState = 'praticar' | 'feita' | 'descanso' | 'meta' | 'livre'

export interface TodayInfo {
  state: TodayState
  message: string
  done: number
  target: number
  max: number
  weekComplete: boolean
  flaggedThisWeek: boolean
  week: ProgramWeek
}

export function todayInfo(args: {
  sessions: SessionLog[]
  week: number
  weekStartedAt: string
  profile: Pick<Profile, 'days'>
  now?: Date
}): TodayInfo {
  const now = args.now ?? new Date()
  const today = dayKey(now)
  const week = weekInfo(args.week)
  const thisWeek = sessionsThisWeek(args.sessions, args.weekStartedAt)
  const { target, max } = weekTarget(week, args.profile)
  const done = thisWeek.length
  const flaggedThisWeek = args.sessions.some((s) => s.startedAt >= args.weekStartedAt && s.flagged)
  const base = { done, target, max, weekComplete: done >= target, flaggedThisWeek, week }

  const lastCompleted = [...args.sessions].filter((s) => s.completed).sort((a, b) => a.startedAt.localeCompare(b.startedAt)).at(-1)

  if (args.sessions.some((s) => s.date === today && s.completed)) {
    return { ...base, state: 'feita', message: 'Uma rotina completa por dia é o suficiente. Agora é com o skincare.' }
  }
  if (done >= max) {
    return { ...base, state: 'meta', message: 'Você já fez todas as sessões desta semana. Descansar agora faz parte da prática.' }
  }
  if (week.spacing && lastCompleted && lastCompleted.date === addDays(today, -1)) {
    return {
      ...base,
      state: 'descanso',
      message: `Na semana ${week.week}, as sessões são em dias não consecutivos. Hoje é dia de descanso para a pele e os músculos.`,
    }
  }
  if (!args.profile.days.includes(now.getDay())) {
    return { ...base, state: 'livre', message: 'Hoje não está no seu plano. Pode descansar ou, se quiser, praticar.' }
  }
  return { ...base, state: 'praticar', message: 'Hoje é dia de prática.' }
}

export const FLAG_REASON: Record<SafetyFlag, string> = {
  cervical: 'histórico cervical',
  atm: 'ATM / mandíbula',
  olhos: 'sintomas nos olhos',
  procedimento: 'procedimento recente',
  gestante: 'gravidez ou amamentação',
  peleCrise: 'pele em crise',
}
