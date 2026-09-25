import { weekInfo, type ProgramWeek } from '../content/program'
import { MOVES, type Move } from '../content/moves'
import type { RegionId, SafetyFlag } from '../content/types'
import { addDays, dayKey } from './dates'
import type { Profile, SessionLog } from './store'

/** Segundos de preparação antes de cada movimento. */
export const PREP_SEC = 5

export type VariantId = 'essencial' | 'completa' | 'curta' | 'suave' | 'pausa' | 'avulso'

export interface SessionStep extends Move {
  key: string
  focus?: boolean
}

export interface SessionPlan {
  variant: VariantId
  title: string
  subtitle: string
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
}

type ProfileLike = Pick<Profile, 'focus' | 'minutes' | 'safety' | 'sensitive'>

const byId = (id: string) => MOVES.find((m) => m.id === id)!

/** Monta a sessão do dia: os movimentos da aula guiada liberados até a semana atual. */
export function buildSession(profile: ProfileLike, ctx: PlanContext): SessionPlan {
  const flags = profile.safety

  if (flags.includes('procedimento')) {
    return finish('pausa', 'Sessões em pausa', 'Até a liberação do seu procedimento', [], profile, [
      'Depois de um procedimento, espere a liberação de quem o realizou. Quando for liberado, desmarque em Perfil.',
    ])
  }
  if (flags.includes('peleCrise') || ctx.skinIrritatedToday) {
    return finish('suave', 'Sessão suave', 'Só pescoço e finalização', [byId('pescoco'), byId('finalizar')], profile, [
      'Com a pele irritada, nada de massagem no rosto hoje.',
    ])
  }

  const week = Math.max(1, ctx.week)
  let moves = MOVES.filter((m) => m.week <= week && !m.avoidIf.some((f) => flags.includes(f)))
  if (profile.sensitive) moves = moves.filter((m) => m.id !== 'pincamento')

  const adaptations: string[] = []
  if (flags.includes('atm')) adaptations.push('Sem movimentos de mandíbula, por causa da ATM.')
  if (flags.includes('olhos')) adaptations.push('Sem movimentos nos olhos, por causa dos sintomas que você marcou.')
  if (flags.includes('cervical')) adaptations.push('Pescoço sempre neutro, sem inclinar a cabeça para trás.')
  if (profile.sensitive) adaptations.push('Pele sensível: toque mínimo e um pouco mais de hidratante.')

  const complete = moves.length === MOVES.filter((m) => !m.avoidIf.some((f) => flags.includes(f))).length
  if (profile.minutes === 5 && week >= 2) {
    const focus = new Set<RegionId>(profile.focus)
    const picked = moves.filter((m) => m.id === 'finalizar' || (m.region && focus.has(m.region)))
    const chosen = picked.length >= 3 ? fitTo(picked, 5 * 60) : fitTo(moves, 5 * 60)
    return finish('curta', 'Sessão de 5 minutos', 'Com os movimentos dos seus objetivos', chosen, profile, adaptations)
  }
  if (complete && week >= 4) return finish('completa', 'Aula guiada completa', 'Os 12 movimentos, do pescoço à testa', moves, profile, adaptations)
  return finish('essencial', week === 1 ? 'Primeiros movimentos' : 'Sessão do dia', `${moves.length} movimentos da aula guiada`, moves, profile, adaptations)
}

/** Mantém a ordem da aula, cortando até caber no tempo (sempre termina com "Finalizar"). */
function fitTo(moves: Move[], seconds: number): Move[] {
  const end = moves.find((m) => m.id === 'finalizar')
  const out: Move[] = []
  let total = end ? end.durationSec + PREP_SEC : 0
  for (const m of moves) {
    if (m.id === 'finalizar') continue
    if (total + m.durationSec + PREP_SEC > seconds) break
    out.push(m)
    total += m.durationSec + PREP_SEC
  }
  return end ? [...out, end] : out
}

function finish(variant: VariantId, title: string, subtitle: string, moves: Move[], profile: ProfileLike, adaptations: string[]): SessionPlan {
  const steps: SessionStep[] = moves.map((m, i) => ({ ...m, key: `${m.id}-${i}`, focus: !!m.region && profile.focus.includes(m.region) }))
  return { variant, title, subtitle, steps, totalSec: totalOf(steps), adaptations }
}

export function totalOf(steps: Pick<Move, 'durationSec'>[]): number {
  return steps.reduce((sum, s) => sum + s.durationSec + PREP_SEC, 0)
}

/** Motivo pelo qual um movimento fica fora do plano desta pessoa (ou nada). */
export function moveBlockedBy(m: Move, profile: Pick<Profile, 'safety'>): SafetyFlag[] {
  return m.avoidIf.filter((f) => profile.safety.includes(f))
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
