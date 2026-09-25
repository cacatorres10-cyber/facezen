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
  | 'respiracao'

export interface SessionStep extends StepDef {
  key: string
  focus?: boolean
  note?: string
}

export interface SessionPlan {
  variant: VariantId
  title: string
  subtitle: string
  steps: SessionStep[]
  totalSec: number
  /** O que foi ajustado para esta pessoa, em linguagem simples. */
  adaptations: string[]
}

export interface PlanContext {
  week: number
  /** Quantas sessões completas já foram feitas nesta semana do programa. */
  sessionIndex: number
  /** Resultado do checklist "antes" de hoje. */
  skinIrritatedToday?: boolean
  procedureToday?: boolean
}

type ProfileLike = Pick<Profile, 'focus' | 'minutes' | 'safety' | 'sensitive' | 'mature' | 'skinBase'>

const REGION_STEPS: Record<RegionId, string[]> = {
  testa: ['testa', 'testaSobrancelhas'],
  olhos: ['olhosCirculos'],
  bochechas: ['bochechasAr'],
  bigode: ['bigode'],
  mandibula: ['mandibula'],
  papada: ['queixo'],
  pescoco: ['pescoco', 'pescocoRespiracao'],
}

const REGION_ORDER: RegionId[] = ['testa', 'olhos', 'bochechas', 'bigode', 'mandibula', 'papada', 'pescoco']

function step(id: string, overrides: Partial<StepDef> = {}): StepDef {
  const def = STEPS[id]
  if (!def) throw new Error(`Passo desconhecido: ${id}`)
  return { ...def, ...overrides }
}

const has = (flags: SafetyFlag[], f: SafetyFlag) => flags.includes(f)

function essential(short: boolean): StepDef[] {
  return [
    step('chegada', short ? { durationSec: 45 } : {}),
    step('aquecimento', short ? { durationSec: 45 } : {}),
    step('testa'),
    step('olhosCirculos'),
    step('mandibula'),
    step('pescoco'),
    step('encerramento', short ? { durationSec: 45 } : {}),
  ]
}

function complete(): StepDef[] {
  return [
    step('chegada'),
    step('aquecimento'),
    step('testa'),
    step('olhosCirculos'),
    step('olhosRastreamento'),
    step('bochechasAr'),
    step('bochechasPausa'),
    step('bochechasAr2'),
    step('bigode'),
    step('mandibula'),
    step('queixo'),
    step('pescoco'),
    step('pescocoRespiracao'),
    step('encerramento'),
  ]
}

/** Ordena passos seguindo a sequência de cima para baixo do rosto, mantendo abertura e fechamento. */
function inFaceOrder(ids: string[]): string[] {
  const unique = [...new Set(ids)]
  const rank = (id: string) => {
    const r = STEPS[id]?.region
    return r ? REGION_ORDER.indexOf(r) : 99
  }
  return unique.sort((a, b) => rank(a) - rank(b))
}

function shortSession(profile: ProfileLike, sessionIndex: number): StepDef[] {
  const focus = REGION_ORDER.filter((r) => profile.focus.includes(r))
  if (focus.length === 0) return essential(true)
  // Até duas regiões de foco por sessão, em rodízio.
  const picks = focus.length <= 2 ? focus : [0, 1].map((i) => focus[(sessionIndex * 2 + i) % focus.length])
  const middle = inFaceOrder(picks.flatMap((r) => REGION_STEPS[r].slice(0, 1)).concat(['pescoco']))
  return [step('chegada', { durationSec: 45 }), step('aquecimento', { durationSec: 45 }), ...middle.map((id) => step(id)), step('encerramento', { durationSec: 45 })]
}

function focusSession(kind: 'testa' | 'bochechas' | 'pescoco', minutes: 5 | 10): StepDef[] {
  const intro = [step('chegada', minutes === 5 ? { durationSec: 45 } : {}), step('aquecimento', minutes === 5 ? { durationSec: 45 } : {})]
  const end = [step('encerramento', minutes === 5 ? { durationSec: 45 } : {})]
  if (kind === 'testa') {
    return [...intro, step('testa'), step('testaSobrancelhas'), step('olhosCirculos'), step('mandibula'), step('mandibulaSoltar'), ...end]
  }
  if (kind === 'bochechas') {
    return [...intro, step('bochechasAr'), step('bochechasPausa'), step('sorriso'), step('bigode'), ...end]
  }
  return [...intro, step('queixo'), step('projecao'), step('pescoco'), step('pescocoRespiracao'), ...end]
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
    return { variant: 'essencial', title: 'Sessão essencial', subtitle: 'Respiração, testa, olhos, mandíbula e pescoço', steps: essential(true) }
  }
  if (week === 2) {
    const steps = essential(true)
    // Transferência de ar em apenas duas sessões da semana (1ª e 3ª).
    if (sessionIndex === 0 || sessionIndex === 2) steps.splice(4, 0, step('bochechasAr'))
    return { variant: 'semana2', title: 'Uma região por vez', subtitle: 'A sessão essencial, com calma', steps }
  }
  if (week === 3) {
    const mouth = sessionIndex % 2 === 0 ? step('sorriso') : step('bigode')
    const steps: StepDef[] = [
      step('chegada', five ? { durationSec: 45 } : {}),
      step('aquecimento', { durationSec: 45 }),
      step('testa'),
      step('olhosCirculos'),
      mouth,
      step('mandibula'),
      ...(five ? [] : [step('queixo', { optional: true, options: undefined, instruction: 'Opcional: deixe o queixo repousar levemente sobre as pontas dos dedos por três respirações. Na semana 3, escolha o apoio dos dedos, não a extensão cervical.' })]),
      step('pescoco'),
      step('encerramento', { durationSec: 45 }),
    ]
    return {
      variant: 'semana3',
      title: 'Dose curta e controlada',
      subtitle: sessionIndex % 2 === 0 ? 'Hoje com sorriso protegido' : 'Hoje com bigode chinês',
      steps,
    }
  }
  if (week === 5) {
    const kind = sessionIndex <= 1 ? 'testa' : sessionIndex <= 3 ? 'bochechas' : 'pescoco'
    const titles = {
      testa: ['Foco: testa e mandíbula', 'Relaxamento de testa e mandíbula'],
      bochechas: ['Foco: bochechas e bigode chinês', 'Consciência do sorriso'],
      pescoco: ['Foco: pescoço e papada', 'Leve, sem extensão forçada'],
    } as const
    return { variant: `foco-${kind}` as VariantId, title: titles[kind][0], subtitle: titles[kind][1], steps: focusSession(kind, profile.minutes) }
  }
  if (week === 6 && sessionIndex >= 5) {
    return { variant: 'curta', title: 'Sexta sessão opcional', subtitle: 'Apenas cinco minutos, se não houve reação', steps: shortSession(profile, sessionIndex) }
  }
  if (five) {
    return { variant: 'curta', title: 'Sessão de 5 minutos', subtitle: 'Com as regiões que você escolheu', steps: shortSession(profile, sessionIndex) }
  }
  const subtitle = week === 7 ? 'Qualidade acima de quantidade' : week >= 8 ? 'Fique com o que for confortável' : 'A sequência completa do FaceZen'
  return { variant: 'completa', title: 'Rotina de 10 minutos', subtitle, steps: complete() }
}

const EYE_STEPS = new Set(['olhosCirculos', 'olhosRastreamento'])
const JAW_LOADED = new Set(['bochechasAr', 'bochechasAr2', 'bochechasPausa', 'projecao'])

/** Monta a sessão do dia a partir do perfil, da semana e do check-in de hoje. */
export function buildSession(profile: ProfileLike, ctx: PlanContext): SessionPlan {
  const flags = profile.safety
  const adaptations: string[] = []

  if (has(flags, 'procedimento') || ctx.procedureToday) {
    const steps = [step('chegada'), step('posturaSemToque'), step('respiracaoFinal')]
    adaptations.push('Procedimento recente: sessão sem toque no rosto até a liberação de quem realizou o procedimento.')
    return finish({ variant: 'respiracao', title: 'Respiração e postura', subtitle: 'Sem toque no rosto', steps }, profile, adaptations)
  }

  if (has(flags, 'peleCrise') || ctx.skinIrritatedToday) {
    const steps = [step('chegada'), step('toquesPescoco'), step('respiracaoFinal')]
    adaptations.push(
      ctx.skinIrritatedToday && !has(flags, 'peleCrise')
        ? 'Sua pele não está íntegra hoje: só respiração e cinco toques leves no pescoço e clavículas.'
        : 'Pele em crise: respiração e cinco toques leves no pescoço e clavículas; nada de massagem em área vermelha.',
    )
    return finish({ variant: 'suave', title: 'Sessão suave', subtitle: 'Respiração e toques mínimos', steps }, profile, adaptations)
  }

  const base = baseFor(profile, ctx)
  let steps = base.steps

  if (has(flags, 'olhos')) {
    let replaced = false
    steps = steps.flatMap((s) => {
      if (!EYE_STEPS.has(s.id)) return [s]
      if (replaced) return []
      replaced = true
      return [step('olhosDescanso')]
    })
    if (replaced) adaptations.push('Sintomas nos olhos: trocamos os toques e o rastreamento por descanso de olhos fechados.')
  }

  if (has(flags, 'atm')) {
    const before = steps.length
    steps = steps.filter((s) => !JAW_LOADED.has(s.id))
    let swapped = false
    steps = steps.map((s) => {
      if (s.id !== 'mandibula') return s
      swapped = true
      return step('mandibulaSoltar')
    })
    steps = steps.map((s) => (s.id === 'sorriso' ? { ...s, note: 'Com ATM sensível, faça só os sorrisos e pule a etapa da mandíbula.' } : s))
    // Evita dois "soltar mandíbula" seguidos.
    steps = steps.filter((s, i) => !(s.id === 'mandibulaSoltar' && steps[i - 1]?.id === 'mandibulaSoltar'))
    if (swapped || steps.length !== before) adaptations.push('Mandíbula (ATM): sem massagem na articulação nem transferência de ar; no lugar, soltar a mandíbula sem toque.')
  }

  if (has(flags, 'cervical')) {
    const before = steps.length
    steps = steps.filter((s) => s.id !== 'projecao')
    steps = steps.map((s) => {
      if (s.id === 'queixo')
        return {
          ...s,
          options: undefined,
          instruction: 'Deixe o queixo repousar levemente sobre as pontas dos dedos por três respirações. Não incline o pescoço para trás.',
        }
      if (s.id === 'pescoco') return { ...s, note: 'Histórico cervical: cabeça neutra e pressão mínima.' }
      return s
    })
    adaptations.push(
      steps.length !== before
        ? 'Pescoço: removemos a extensão da cabeça; no queixo, só o apoio dos dedos.'
        : 'Pescoço: cabeça sempre neutra, sem inclinar para trás.',
    )
  }

  if (profile.sensitive) {
    adaptations.push('Pele sensível: toques mínimos, mais produto tolerado e menos passagens.')
  } else if (profile.skinBase === 'seca' || profile.mature) {
    adaptations.push('Use mais produto para reduzir atrito e faça menos passagens; não massageie descamações.')
  } else if (profile.skinBase === 'oleosa') {
    adaptations.push('Pele oleosa: camada fina de produto tolerado; o brilho nunca é motivo para esfregar mais.')
  }

  return finish(base, profile, adaptations, steps)
}

function finish(base: Base, profile: ProfileLike, adaptations: string[], steps: StepDef[] = base.steps): SessionPlan {
  const withKeys: SessionStep[] = steps.map((s, i) => ({
    ...s,
    key: `${s.id}-${i}`,
    focus: !!s.region && profile.focus.includes(s.region),
    note: s.note ?? (profile.sensitive && s.kind === 'move' ? 'Pele sensível: toque mínimo.' : undefined),
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
