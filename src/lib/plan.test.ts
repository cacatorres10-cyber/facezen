import { describe, expect, it } from 'vitest'
import { weekInfo } from '../content/program'
import type { SafetyFlag } from '../content/types'
import { addDays, dayKey } from './dates'
import { buildSession, todayInfo, weekTarget, type PlanContext } from './plan'
import { nightRoutine } from './skincare'
import { defaultPrefsFor, type Profile, type SessionLog } from './store'

const profile = (patch: Partial<Profile> = {}): Profile => ({
  name: 'Ana',
  intentions: [],
  focus: [],
  skinBase: 'normal',
  sensitive: false,
  mature: false,
  concerns: [],
  experience: 'nunca',
  minutes: 10,
  days: [1, 3, 5],
  time: '07:30',
  safety: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  ...patch,
})

const ids = (p: Profile, ctx: Partial<PlanContext> = {}) => buildSession(p, { week: 1, sessionIndex: 0, ...ctx }).steps.map((s) => s.id)

describe('buildSession — calendário de 8 semanas', () => {
  it('semana 1: só respiração, testa, olhos com toque leve, mandíbula manual e pescoço, em ~5 min', () => {
    const plan = buildSession(profile(), { week: 1, sessionIndex: 0 })
    expect(plan.steps.map((s) => s.id)).toEqual(['chegada', 'aquecimento', 'testa', 'olhosCirculos', 'mandibula', 'pescoco', 'encerramento'])
    expect(plan.totalSec).toBeGreaterThanOrEqual(4.5 * 60)
    expect(plan.totalSec).toBeLessThanOrEqual(5.5 * 60)
  })

  it('semana 2: transferência de ar em apenas duas sessões', () => {
    const withAir = [0, 1, 2, 3].filter((i) => ids(profile(), { week: 2, sessionIndex: i }).includes('bochechasAr'))
    expect(withAir).toEqual([0, 2])
  })

  it('semana 3: alterna sorriso protegido e bigode chinês, nunca os dois', () => {
    const a = ids(profile(), { week: 3, sessionIndex: 0 })
    const b = ids(profile(), { week: 3, sessionIndex: 1 })
    expect(a).toContain('sorriso')
    expect(a).not.toContain('bigode')
    expect(b).toContain('bigode')
    expect(b).not.toContain('sorriso')
  })

  it('semana 4: a rotina completa tem cerca de 10 minutos', () => {
    const plan = buildSession(profile(), { week: 4, sessionIndex: 0 })
    expect(plan.variant).toBe('completa')
    expect(plan.totalSec).toBeGreaterThanOrEqual(9 * 60)
    expect(plan.totalSec).toBeLessThanOrEqual(11 * 60)
  })

  it('semana 5: foco alternado (2 testa/mandíbula, 2 bochechas/bigode, 1 pescoço/papada)', () => {
    const variants = [0, 1, 2, 3, 4].map((i) => buildSession(profile(), { week: 5, sessionIndex: i }).variant)
    expect(variants).toEqual(['foco-testa', 'foco-testa', 'foco-bochechas', 'foco-bochechas', 'foco-pescoco'])
  })

  it('semana 6: a sexta sessão é curta', () => {
    expect(buildSession(profile(), { week: 6, sessionIndex: 5 }).variant).toBe('curta')
  })

  it('preferência de 5 minutos usa as regiões de foco', () => {
    const plan = buildSession(profile({ minutes: 5, focus: ['bochechas', 'bigode'] }), { week: 4, sessionIndex: 0 })
    expect(plan.variant).toBe('curta')
    expect(plan.steps.map((s) => s.id)).toEqual(expect.arrayContaining(['bochechasAr', 'bigode']))
    expect(plan.totalSec).toBeLessThanOrEqual(6 * 60)
    expect(plan.steps.filter((s) => s.focus).map((s) => s.region)).toEqual(expect.arrayContaining(['bochechas', 'bigode']))
  })
})

describe('buildSession — segurança', () => {
  const withFlags = (...safety: SafetyFlag[]) => profile({ safety })

  it('procedimento recente: só respiração, sem toque', () => {
    const plan = buildSession(withFlags('procedimento'), { week: 4, sessionIndex: 0 })
    expect(plan.variant).toBe('respiracao')
    expect(plan.steps.every((s) => s.kind !== 'move')).toBe(true)
  })

  it('pele em crise ou irritada hoje: sessão suave', () => {
    expect(buildSession(withFlags('peleCrise'), { week: 4, sessionIndex: 0 }).variant).toBe('suave')
    expect(buildSession(profile(), { week: 4, sessionIndex: 0, skinIrritatedToday: true }).variant).toBe('suave')
  })

  it('ATM: sem massagem na mandíbula nem transferência de ar', () => {
    const s = ids(withFlags('atm'), { week: 4 })
    expect(s).not.toContain('mandibula')
    expect(s).not.toContain('bochechasAr')
    expect(s).not.toContain('bochechasAr2')
    expect(s).toContain('mandibulaSoltar')
  })

  it('sintomas nos olhos: troca toques e rastreamento por um descanso sem toque', () => {
    const s = ids(withFlags('olhos'), { week: 4 })
    expect(s).not.toContain('olhosCirculos')
    expect(s).not.toContain('olhosRastreamento')
    expect(s.filter((x) => x === 'olhosDescanso')).toHaveLength(1)
  })

  it('cervical: sem projeção da mandíbula no foco de pescoço', () => {
    expect(ids(profile(), { week: 5, sessionIndex: 4 })).toContain('projecao')
    expect(ids(withFlags('cervical'), { week: 5, sessionIndex: 4 })).not.toContain('projecao')
  })
})

describe('todayInfo', () => {
  const log = (date: string, completed = true): SessionLog => ({
    id: date,
    date,
    startedAt: `${date}T08:00:00.000Z`,
    week: 1,
    variant: 'essencial',
    title: 'x',
    plannedSec: 300,
    practicedSec: 300,
    stepIds: [],
    completed,
    flagged: false,
  })
  const monday = new Date(2026, 8, 28, 9) // segunda-feira
  const today = dayKey(monday)

  it('semana 1 pede dias não consecutivos', () => {
    const info = todayInfo({ sessions: [log(addDays(today, -1))], week: 1, weekStartedAt: '2026-01-01', profile: { days: [0, 1, 2, 3, 4, 5, 6] }, now: monday })
    expect(info.state).toBe('descanso')
  })

  it('uma sessão por dia', () => {
    const info = todayInfo({ sessions: [log(today)], week: 4, weekStartedAt: '2026-01-01', profile: { days: [1] }, now: monday })
    expect(info.state).toBe('feita')
  })

  it('dia fora do plano fica livre', () => {
    const info = todayInfo({ sessions: [], week: 4, weekStartedAt: '2026-01-01', profile: { days: [2, 4, 6] }, now: monday })
    expect(info.state).toBe('livre')
  })

  it('meta da semana respeita os dias escolhidos, com mínimo de 3', () => {
    expect(weekTarget(weekInfo(4), { days: [1, 3, 5] }).target).toBe(3)
    expect(weekTarget(weekInfo(4), { days: [1, 2, 3, 4, 5, 6] }).target).toBe(5)
    expect(weekTarget(weekInfo(1), { days: [1, 2, 3, 4, 5] }).target).toBe(3)
  })
})

describe('skincare', () => {
  it('na gravidez, nenhuma noite de retinoide ou ácido', () => {
    const p = profile({ safety: ['gestante'] })
    const prefs = { ...defaultPrefsFor(p), retinoid: true, retinoidNights: [0, 1, 2, 3, 4, 5, 6], acid: true, acidNights: [0, 1, 2, 3, 4, 5, 6] }
    for (let d = 0; d < 7; d++) expect(nightRoutine(p, prefs, d).kind).toBe('hidratacao')
  })

  it('retinoide só nas noites escolhidas', () => {
    const p = profile()
    const prefs = { ...defaultPrefsFor(p), retinoid: true, retinoidNights: [3] }
    expect(nightRoutine(p, prefs, 3).kind).toBe('retinoide')
    expect(nightRoutine(p, prefs, 4).kind).toBe('hidratacao')
  })
})

describe('manutenção', () => {
  it('depois da semana 8, a contagem recomeça toda segunda-feira', async () => {
    const { weekStart } = await import('./plan')
    const wed = new Date(2026, 9, 14, 10) // quarta-feira
    const start = new Date(weekStart({ week: 9, weekStartedAt: '2026-01-01T00:00:00.000Z' }, wed))
    expect(start.getDay()).toBe(1)
    expect(start.getDate()).toBe(12)
    expect(weekStart({ week: 4, weekStartedAt: '2026-01-01T00:00:00.000Z' }, wed)).toBe('2026-01-01T00:00:00.000Z')
  })
})
