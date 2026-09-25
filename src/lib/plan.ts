import { exerciseById } from '../content/exercises'
import { weekInfo, type ProgramWeek } from '../content/program'
import { STEPS, type StepDef } from '../content/routine'
import type { Exercise, RegionId, SafetyFlag } from '../content/types'
import { addDays, dayKey } from './dates'
import type { Profile, SessionLog } from './store'

/** Segundos de preparação antes de cada passo com movimento. */
export const PREP_SEC = 5

export type VariantId =
  | 'essencial'
  | 'semana2'
  | 'semana3'
  | 'completa'
  | 'foco-testa'
  | 'foco-bochechas'
  | 'foco-pescoco'
  | 'curta'
  | 'suave'
  | 'pausa'

export interface SessionStep extends StepDef {
  key: string
  focus?: boolean
}

export interface SessionPlan {
  variant: VariantId
  title: string
  subtitle: string
  steps: SessionStep[]
  totalSec: number
  /** O ajuste principal feito para esta pessoa, em uma frase (ou vazio). */
  adaptations: string[]
}

export interface PlanContext {
  week: number
  /** Quantas sessões completas já foram feitas nesta semana do programa. */
  sessionIndex: number
  /** A pessoa disse que a pele não está bem hoje. */
  skinIrritatedToday?: boolean
}

type ProfileLike = Pick<Profile, 'focus' | 'minutes' | 'safety' | 'sensitive' | 'mature' | 'skinBase'>

const REGION_STEPS: Record<RegionId, string> = {
  testa: 'testa',
  olhos: 'olhosCirculos',
  bochechas: 'bochechasAr',
  bigode: 'bigode',
  mandibula: 'mandibula',
  papada: 'queixo',
  pescoco: 'pescoco',
}

const REGION_ORDER: RegionId[] = ['testa', 'olhos', 'bochechas', 'bigode', 'mandibula', 'papada', 'pescoco']

function step(id: string, overrides: Partial<StepDef> = {}): StepDef {
  const def = STEPS[id]
  if (!def) throw new Error(`Passo desconhecido: ${id}`)
  return { ...def, ...overrides }
}

const has = (flags: SafetyFlag[], f: SafetyFlag) => flags.includes(f)

const ids = (list: string[]) => list.map((id) => step(id))

/** Ordena de cima para baixo do rosto, com aquecimento no início e o final no fim. */
function inFaceOrder(list: string[]): string[] {
  const unique = [...new Set(list)]
  const rank = (id: string) => {
    const r = STEPS[id]?.region
    return r ? REGION_ORDER.indexOf(r) : 99
  }
  return unique.sort((a, b) => rank(a) - rank(b))
}

const ESSENTIAL = ['aquecimento', 'testa', 'olhosCirculos', 'mandibula', 'pescoco', 'encerramento']
const COMPLETE = ['aquecimento', 'testa', 'testaSobrancelhas', 'olhosCirculos', 'olhosRastreamento', 'bochechasAr', 'bigode', 'mandibula', 'queixo', 'pescoco', 'encerramento']

function shortSession(profile: ProfileLike, sessionIndex: number): StepDef[] {
  const focus = REGION_ORDER.filter((r) => profile.focus.includes(r))
  if (focus.length === 0) return ids(ESSENTIAL)
  // Até três regiões de foco por sessão, em rodízio.
  const picks = focus.length <= 3 ? focus : [0, 1, 2].map((i) => focus[(sessionIndex * 3 + i) % focus.length])
  const middle = inFaceOrder([...picks.map((r) => REGION_STEPS[r]), 'pescoco'])
  return ids(['aquecimento', ...middle, 'encerramento'])
}

const FOCUS = {
  testa: ['aquecimento', 'testa', 'testaSobrancelhas', 'olhosCirculos', 'mandibula', 'encerramento'],
  bochechas: ['aquecimento', 'bochechasAr', 'sorriso', 'bigode', 'encerramento'],
  pescoco: ['aquecimento', 'queixo', 'projecao', 'pescoco', 'encerramento'],
}

interface Base {
  variant: VariantId
  title: string
  subtitle: string
  steps: StepDef[]
}

function baseFor(profile: ProfileLike, ctx: PlanContext): Base {
  const { week, sessionIndex } = ctx
  const five = profile.minutes === 5

  if (week <= 1) {
    return { variant: 'essencial', title: 'Sessão essencial', subtitle: 'Testa, olhos, mandíbula e pescoço', steps: ids(ESSENTIAL) }
  }
  if (week === 2) {
    const list = [...ESSENTIAL]
    // Bochechas em apenas duas sessões da semana (1ª e 3ª).
    if (sessionIndex === 0 || sessionIndex === 2) list.splice(3, 0, 'bochechasAr')
    return { variant: 'semana2', title: 'Sessão essencial', subtitle: 'Com calma, uma região por vez', steps: ids(list) }
  }
  if (week === 3) {
    const mouth = sessionIndex % 2 === 0 ? 'sorriso' : 'bigode'
    const list = ['aquecimento', 'testa', 'olhosCirculos', mouth, 'mandibula', ...(five ? [] : ['queixo']), 'pescoco', 'encerramento']
    return { variant: 'semana3', title: 'Sessão curta', subtitle: mouth === 'sorriso' ? 'Hoje com sorriso protegido' : 'Hoje com bigode chinês', steps: ids(list) }
  }
  if (week === 5) {
    const kind = sessionIndex <= 1 ? 'testa' : sessionIndex <= 3 ? 'bochechas' : 'pescoco'
    const titles = {
      testa: ['Foco: testa e mandíbula', 'Para soltar a tensão'],
      bochechas: ['Foco: bochechas e bigode chinês', 'Consciência do sorriso'],
      pescoco: ['Foco: pescoço e papada', 'Leve, sem forçar a nuca'],
    } as const
    return { variant: `foco-${kind}` as VariantId, title: titles[kind][0], subtitle: titles[kind][1], steps: ids(FOCUS[kind]) }
  }
  if (week === 6 && sessionIndex >= 5) {
    return { variant: 'curta', title: 'Sessão extra, curta', subtitle: 'Só se não houve nenhum incômodo', steps: shortSession(profile, sessionIndex) }
  }
  if (five) {
    return { variant: 'curta', title: 'Sessão de 5 minutos', subtitle: 'Com as regiões dos seus objetivos', steps: shortSession(profile, sessionIndex) }
  }
  return { variant: 'completa', title: 'Rotina completa', subtitle: 'O rosto inteiro, de cima para baixo', steps: ids(COMPLETE) }
}

const EYE_STEPS = new Set(['olhosCirculos', 'olhosRastreamento'])
const JAW_STEPS = new Set(['mandibula', 'bochechasAr', 'projecao'])

/** Monta a sessão do dia a partir do perfil, da semana e de como a pele está hoje. */
export function buildSession(profile: ProfileLike, ctx: PlanContext): SessionPlan {
  const flags = profile.safety

  if (has(flags, 'procedimento')) {
    return finish(
      { variant: 'pausa', title: 'Sessões em pausa', subtitle: 'Até a liberação do seu procedimento', steps: [] },
      profile,
      ['Depois de um procedimento, espere a liberação de quem o realizou. Quando for liberado, desmarque em Perfil.'],
    )
  }

  if (has(flags, 'peleCrise') || ctx.skinIrritatedToday) {
    return finish(
      { variant: 'suave', title: 'Sessão suave', subtitle: 'Só toques leves no pescoço', steps: ids(['toquesPescoco', 'encerramento']) },
      profile,
      ['Com a pele irritada, nada de massagem no rosto hoje.'],
    )
  }

  const base = baseFor(profile, ctx)
  let steps = base.steps
  const adaptations: string[] = []

  if (has(flags, 'olhos')) {
    steps = steps.filter((s) => !EYE_STEPS.has(s.id))
    adaptations.push('Sem exercícios nos olhos, por causa dos sintomas que você marcou.')
  }
  if (has(flags, 'atm')) {
    steps = steps.filter((s) => !JAW_STEPS.has(s.id))
    adaptations.push('Sem exercícios de mandíbula, por causa da ATM.')
  }
  if (has(flags, 'cervical')) {
    steps = steps.filter((s) => s.id !== 'projecao')
    adaptations.push('Pescoço sempre neutro, sem inclinar a cabeça para trás.')
  }
  if (profile.sensitive) adaptations.push('Pele sensível: toque mínimo e um pouco mais de hidratante para deslizar.')

  return finish(base, profile, adaptations, steps)
}

function finish(base: Base, profile: ProfileLike, adaptations: string[], steps: StepDef[] = base.steps): SessionPlan {
  const withKeys: SessionStep[] = steps.map((s, i) => ({
    ...s,
    key: `${s.id}-${i}`,
    focus: !!s.region && profile.focus.includes(s.region),
  }))
  return { variant: base.variant, title: base.title, subtitle: base.subtitle, steps: withKeys, totalSec: totalOf(withKeys), adaptations }
}

export function totalOf(steps: Pick<StepDef, 'durationSec' | 'kind'>[]): number {
  return steps.reduce((sum, s) => sum + s.durationSec + (s.kind === 'move' ? PREP_SEC : 0), 0)
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

/** Exercícios que o app não sugere para esta pessoa e por quê. */
export function exerciseStatus(ex: Exercise, profile: Pick<Profile, 'safety'>, currentWeek: number) {
  const blocked = ex.avoidIf.filter((f) => profile.safety.includes(f))
  const caution = ex.cautionIf.filter((f) => profile.safety.includes(f))
  return {
    blocked: blocked.length > 0,
    blockedBy: blocked,
    caution,
    early: currentWeek < ex.minWeek,
  }
}

export const FLAG_REASON: Record<SafetyFlag, string> = {
  cervical: 'histórico cervical',
  atm: 'ATM / mandíbula',
  olhos: 'sintomas nos olhos',
  procedimento: 'procedimento recente',
  gestante: 'gravidez ou amamentação',
  peleCrise: 'pele em crise',
}

/** Sessão mais recente que ainda pede o registro de "uma hora depois". */
export function pendingHourCheck(sessions: SessionLog[], now = new Date()): SessionLog | undefined {
  const latest = [...sessions].sort((a, b) => a.startedAt.localeCompare(b.startedAt)).at(-1)
  if (!latest || latest.hourLater) return undefined
  const elapsed = now.getTime() - new Date(latest.startedAt).getTime()
  if (elapsed < 50 * 60_000 || elapsed > 24 * 60 * 60_000) return undefined
  return latest
}

export { exerciseById }
