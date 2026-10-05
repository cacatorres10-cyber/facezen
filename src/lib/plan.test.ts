import { beforeEach, describe, expect, it, vi } from 'vitest'
import { exerciseSvg } from '../content/art'
import { EXERCISES, FOCUS, ROUTINE } from '../content/library'
import { weekInfo } from '../content/program'
import type { SafetyFlag } from '../content/types'
import { addDays, dayKey } from './dates'
import { BUDGET, buildSession, focusFor, levelFor, todayInfo, weekStart, weekTarget, type PlanContext } from './plan'
import { morningRoutine, nightKind, nightRoutine, periodStatus, skincareAdvice } from './skincare'
import type { Profile, SessionLog } from './store'

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
  tools: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  ...patch,
})

const ids = (p: Profile, ctx: Partial<PlanContext> = {}) => buildSession(p, { week: 1, sessionIndex: 0, ...ctx }).steps.map((s) => s.id)

describe('sessão de drenagem facial com as mãos', () => {
  const ROTINA = [...ROUTINE.open, ...ROUTINE.face, ...ROUTINE.close]

  it('semanas 1 e 2: a drenagem completa, na ordem, sem foco', () => {
    const plan = buildSession(profile({ goals: ['papada'] }), { week: 1, sessionIndex: 0 })
    expect(plan.steps.map((s) => s.id)).toEqual(ROTINA)
    expect(plan.level).toBe('ini')
    expect(plan.steps.some((s) => s.focus)).toBe(false)
  })

  it('a ordem da drenagem: abre na clavícula, sobe pelo rosto e fecha na clavícula', () => {
    const s = ids(profile(), { week: 4 })
    expect(s.slice(0, 4)).toEqual(['A3', 'D1', 'D2', 'D3'])
    expect(s.at(-1)).toBe('D10')
    expect(s.indexOf('D4')).toBeLessThan(s.indexOf('D8'))
  })

  it('a partir da semana 3: mais repetições nos pontos do objetivo e um exercício com as mãos', () => {
    const plan = buildSession(profile({ goals: ['papada'], minutes: 15 }), { week: 3, sessionIndex: 0 })
    const d4 = plan.steps.find((s) => s.id === 'D4')!
    const d6 = plan.steps.find((s) => s.id === 'D6')!
    expect(d4.focus).toBe(true)
    expect(d4.durationSec).toBeGreaterThan(d6.durationSec)
    expect(plan.steps.map((s) => s.id)).toContain(FOCUS.B.ids[0])
    expect(plan.steps.at(-1)?.id).toBe('D10')
  })

  it('objetivo secundário entra em dias alternados', () => {
    expect(focusFor(['papada', 'linhas'], 0)).toBe('B')
    expect(focusFor(['papada', 'linhas'], 1)).toBe('C')
    expect(focusFor(['pele', 'contorno'], 1)).toBe('F')
  })

  it('avançado nas semanas 6–8, mas volta ao intermediário depois de incômodo', () => {
    expect(levelFor(6)).toBe('ava')
    expect(levelFor(6, true)).toBe('int')
    expect(levelFor(9)).toBe('int')
  })

  it('sempre cabe no tempo e a drenagem nunca é cortada', () => {
    for (const minutes of [5, 10, 15] as const)
      for (const week of [1, 3, 6, 9])
        for (const sessionIndex of [0, 1]) {
          const plan = buildSession(profile({ minutes, goals: ['bigode', 'tensao'], tools: ['escova'] }), { week, sessionIndex })
          expect(plan.totalSec).toBeLessThanOrEqual(BUDGET[minutes])
          for (const id of ROTINA) expect(plan.steps.map((s) => s.id)).toContain(id)
        }
  })

  it('todos os exercícios da rotina e do foco existem', () => {
    const all = new Set(EXERCISES.map((e) => e.id))
    for (const id of [...ROTINA, ...Object.values(FOCUS).flatMap((f) => [...f.ids, ...f.boost])]) expect(all.has(id)).toBe(true)
    expect(all.size).toBe(EXERCISES.length)
  })
})

describe('segurança', () => {
  const withFlags = (...safety: SafetyFlag[]) => profile({ safety, goals: ['contorno'], minutes: 15 })

  it('procedimento recente: sessões em pausa', () => {
    expect(buildSession(withFlags('procedimento'), { week: 4, sessionIndex: 0 }).steps).toHaveLength(0)
  })

  it('pele irritada: só a drenagem do pescoço, sem tocar o rosto', () => {
    expect(ids(profile(), { week: 4, skinIrritatedToday: true })).toEqual(['A3', 'D1', 'D2', 'D3', 'D10', 'R3'])
  })

  it('pescoço: sem a meia-lua', () => {
    expect(ids(withFlags('cervical'), { week: 1 })).not.toContain('A3')
  })

  it('olhos: sem drenagem abaixo dos olhos', () => {
    expect(ids(withFlags('olhos'), { week: 4 })).not.toContain('D7')
  })

  it('escova: só para quem tem, a partir da semana 3, em sessões alternadas', () => {
    const comEscova = profile({ tools: ['escova'], goals: ['papada'], minutes: 15 })
    const has = (p: Profile, week: number, sessionIndex: number) => ids(p, { week, sessionIndex }).some((id) => id.startsWith('E'))
    expect(has(comEscova, 1, 0)).toBe(false)
    expect(has(comEscova, 3, 0)).toBe(true)
    expect(has(comEscova, 3, 1)).toBe(false)
    expect(has(profile({ goals: ['papada'], minutes: 15 }), 3, 0)).toBe(false)
    expect(has(profile({ tools: ['escova'], sensitive: true, minutes: 15 }), 3, 0)).toBe(false)
    const plan = buildSession(comEscova, { week: 3, sessionIndex: 0 })
    expect(plan.steps.at(-1)?.id).toBe('D10')
  })

  it('todo exercício tem desenho e no máximo 3 passos', () => {
    for (const e of EXERCISES) {
      expect(exerciseSvg(e.id)).toContain('<svg')
      expect(e.steps.length).toBeLessThanOrEqual(3)
    }
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

  it('na gravidez, nenhuma noite de retinol e aviso para pausar', () => {
    const p = profile({ safety: ['gestante'] })
    for (let d = 0; d < 7; d++) expect(nightRoutine(p, ['retinol'], d).kind).toBe('hidratacao')
    expect(skincareAdvice(p, ['retinol', 'protetor', 'hidratante-creme']).map((a) => a.id)).toContain('gestante-retinol')
  })

  it('retinol e ácido nunca na mesma noite', () => {
    for (let d = 0; d < 7; d++) {
      const kinds = [nightKind(['retinol', 'acido'], d, profile())]
      expect(kinds.length).toBe(1)
    }
    const week = [0, 1, 2, 3, 4, 5, 6].map((d) => nightKind(['retinol', 'acido'], d, profile()))
    expect(week.filter((k) => k === 'retinoide')).toHaveLength(2)
    expect(week.filter((k) => k === 'acido')).toHaveLength(2)
  })

  it('sem protetor: a primeira recomendação é o protetor', () => {
    expect(skincareAdvice(profile(), ['limpador-gel'])[0].id).toBe('protetor')
  })

  it('troca esfoliante com grãos e sabonete em barra', () => {
    const ids = skincareAdvice(profile(), ['sabonete-barra', 'esfoliante-fisico', 'protetor', 'hidratante-gel']).map((a) => a.id)
    expect(ids).toEqual(expect.arrayContaining(['sabonete', 'scrub']))
  })

  it('usa o produto da pessoa na rotina e marca o que falta', () => {
    const m = morningRoutine(profile({ skinBase: 'oleosa' }), ['limpador-gel', 'vitc'])
    expect(m.map((s) => s.id)).toEqual(['m-limpeza', 'm-vitc', 'm-hidratante', 'm-protetor'])
    expect(m.find((s) => s.id === 'm-protetor')?.missing).toBe(true)
  })

  it('só sugere ativo novo quando a base está completa, no máximo 2', () => {
    const p = profile({ goals: ['linhas', 'pele'], skinBase: 'oleosa' })
    expect(skincareAdvice(p, ['limpador-gel']).some((a) => a.tone === 'tip')).toBe(false)
    const tips = skincareAdvice(p, ['limpador-gel', 'protetor', 'hidratante-gel']).filter((a) => a.tone === 'tip')
    expect(tips.length).toBeGreaterThan(0)
    expect(tips.length).toBeLessThanOrEqual(2)
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
