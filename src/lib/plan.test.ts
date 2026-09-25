import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MOVES } from '../content/moves'
import { weekInfo } from '../content/program'
import type { SafetyFlag } from '../content/types'
import { addDays, dayKey } from './dates'
import { buildSession, todayInfo, weekStart, weekTarget, type PlanContext } from './plan'
import { nightRoutine, periodStatus } from './skincare'
import { defaultPrefsFor, type Profile, type SessionLog } from './store'

const profile = (patch: Partial<Profile> = {}): Profile => ({
  name: 'Ana',
  goals: [],
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

describe('sessões com os movimentos das aulas', () => {
  it('semana 1: poucos movimentos, curtos, sempre terminando com "Finalizar"', () => {
    const plan = buildSession(profile(), { week: 1, sessionIndex: 0 })
    expect(plan.steps.map((s) => s.id)).toEqual(['pescoco', 'papada', 'olhos', 'testa', 'finalizar'])
    expect(plan.totalSec).toBeLessThanOrEqual(5 * 60)
  })

  it('segue a ordem da aula guiada', () => {
    const order = MOVES.map((m) => m.id)
    const s = ids(profile(), { week: 3 })
    expect([...s].sort((a, b) => order.indexOf(a) - order.indexOf(b))).toEqual(s)
  })

  it('a partir da semana 4: a aula completa, com os 12 movimentos', () => {
    const plan = buildSession(profile(), { week: 4, sessionIndex: 0 })
    expect(plan.variant).toBe('completa')
    expect(plan.steps).toHaveLength(12)
  })

  it('5 minutos: prioriza os movimentos dos objetivos e cabe no tempo', () => {
    const plan = buildSession(profile({ minutes: 5, focus: ['papada', 'pescoco'] }), { week: 4, sessionIndex: 0 })
    expect(plan.totalSec).toBeLessThanOrEqual(5 * 60)
    expect(plan.steps.map((s) => s.id)).toEqual(['pescoco', 'papada', 'finalizar'])
  })
})

describe('segurança', () => {
  const withFlags = (...safety: SafetyFlag[]) => profile({ safety })

  it('procedimento recente: sessões em pausa', () => {
    expect(buildSession(withFlags('procedimento'), { week: 4, sessionIndex: 0 }).steps).toHaveLength(0)
  })

  it('pele irritada: só pescoço e finalização', () => {
    expect(ids(profile(), { week: 4, skinIrritatedToday: true })).toEqual(['pescoco', 'finalizar'])
  })

  it('ATM: sem masseter, contorno nem bochechas com ar', () => {
    const s = ids(withFlags('atm'), { week: 4 })
    for (const id of ['masseter', 'contorno', 'bochechas']) expect(s).not.toContain(id)
  })

  it('olhos: sem o movimento dos olhos', () => {
    expect(ids(withFlags('olhos'), { week: 4 })).not.toContain('olhos')
  })

  it('pele sensível: sem pinçamento', () => {
    expect(ids(profile({ sensitive: true }), { week: 4 })).not.toContain('pincamento')
  })
})

describe('semana e dia', () => {
  const log = (date: string): SessionLog => ({
    id: date, date, startedAt: `${date}T08:00:00.000Z`, week: 1, variant: 'essencial', title: 'x',
    plannedSec: 300, practicedSec: 300, stepIds: [], completed: true, flagged: false,
  })
  const monday = new Date(2026, 8, 28, 9)
  const today = dayKey(monday)

  it('semana 1 pede dias não consecutivos', () => {
    expect(todayInfo({ sessions: [log(addDays(today, -1))], week: 1, weekStartedAt: '2026-01-01', profile: { days: [0, 1, 2, 3, 4, 5, 6] }, now: monday }).state).toBe('descanso')
  })

  it('uma sessão por dia', () => {
    expect(todayInfo({ sessions: [log(today)], week: 4, weekStartedAt: '2026-01-01', profile: { days: [1] }, now: monday }).state).toBe('feita')
  })

  it('meta respeita os dias escolhidos', () => {
    expect(weekTarget(weekInfo(4), { days: [1, 3, 5] }).target).toBe(3)
    expect(weekTarget(weekInfo(4), { days: [1, 2, 3, 4, 5, 6] }).target).toBe(5)
  })

  it('manutenção recomeça toda segunda', () => {
    const start = new Date(weekStart({ week: 9, weekStartedAt: '2026-01-01T00:00:00.000Z' }, new Date(2026, 9, 14, 10)))
    expect(start.getDay()).toBe(1)
  })
})

describe('skincare básico', () => {
  it('manhã completa só com limpar, hidratar e proteger', () => {
    expect(periodStatus(['m-limpeza', 'm-hidratante', 'm-protetor'], 'manha')).toBe('completo')
    expect(periodStatus(['m-limpeza'], 'manha')).toBe('parcial')
    expect(periodStatus(undefined, 'noite')).toBe('nada')
  })

  it('na gravidez, nenhuma noite de retinoide', () => {
    const p = profile({ safety: ['gestante'] })
    const prefs = { ...defaultPrefsFor(), retinoid: true, retinoidNights: [0, 1, 2, 3, 4, 5, 6] }
    for (let d = 0; d < 7; d++) expect(nightRoutine(p, prefs, d).kind).toBe('hidratacao')
  })
})

describe('dados salvos no aparelho', () => {
  beforeEach(() => {
    const mem = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    })
    vi.resetModules()
  })

  it('grava o skincare do dia e zera no dia seguinte', async () => {
    const { useStore, STORAGE_KEY } = await import('./store')
    const d1 = '2026-09-25'
    useStore.getState().toggleSkincareStep(d1, 'manha', 'm-limpeza')
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.state.skincare[d1].manha).toEqual(['m-limpeza'])
    expect(useStore.getState().skincare[addDays(d1, 1)]).toBeUndefined()
  })

  it('recupera tudo ao reabrir o app', async () => {
    const first = await import('./store')
    first.useStore.getState().toggleFavorite('testa')
    vi.resetModules()
    const again = await import('./store')
    expect(again.useStore.getState().favorites).toContain('testa')
    expect(again.useStore.getState().device.id).toBe(first.useStore.getState().device.id)
  })
})
