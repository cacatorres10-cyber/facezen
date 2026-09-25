import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import type { Experience, IntentionId, RegionId, SafetyFlag, SkinBase } from '../content/types'
import { dayKey } from './dates'

export type SkinConcern = 'tom' | 'poros' | 'ressecamento' | 'sinais'

export interface Profile {
  name: string
  intentions: IntentionId[]
  focus: RegionId[]
  skinBase: SkinBase
  sensitive: boolean
  mature: boolean
  concerns: SkinConcern[]
  experience: Experience
  minutes: 5 | 10
  /** Dias da semana planejados (0 = domingo). */
  days: number[]
  /** Horário preferido, "HH:MM". */
  time: string
  safety: SafetyFlag[]
  createdAt: string
}

export interface Scores {
  conforto: number
  testa: number
  mandibula: number
  inchaco: number
}

export interface SessionLog {
  id: string
  date: string
  startedAt: string
  week: number
  variant: string
  title: string
  plannedSec: number
  practicedSec: number
  stepIds: string[]
  completed: boolean
  before?: Scores
  afterTension?: { testa: number; mandibula: number }
  during?: {
    respiracao: boolean | null
    pressaoLeve: boolean | null
    desconforto: string[]
    interrompido?: string
  }
  hourLater?: {
    peleOk: boolean | null
    vermelhidao: boolean | null
    olhos: boolean | null
    mandibulaOk: boolean | null
    proxima: string
    at: string
  }
  produto?: string
  contexto?: string
  observacao?: string
  /** Houve dor, ardor ou outro sinal de alerta. */
  flagged: boolean
}

export interface SkincareDay {
  manha: string[]
  noite: string[]
  reaplicacoes: number
}

export interface SkincarePrefs {
  makeup: boolean
  vitC: boolean
  serum: 'nenhum' | 'hialuronico' | 'niacinamida'
  eye: boolean
  toner: boolean
  oil: boolean
  retinoid: boolean
  retinoidNights: number[]
  acid: boolean
  acidNights: number[]
}

export interface PatchTest {
  id: string
  product: string
  area: string
  startDate: string
  checks: Record<string, 'ok' | 'reacao'>
  status: 'andamento' | 'aprovado' | 'suspenso'
}

export interface WeeklyReview {
  week: number
  date: string
  answers: Record<string, string>
}

export interface Settings {
  voice: boolean
  sound: boolean
  vibrate: boolean
  mirror: boolean
  theme: 'system' | 'light' | 'dark'
}

export interface ProgramState {
  week: number
  weekStartedAt: string
  history: { week: number; startedAt: string; endedAt: string; sessions: number; repeated?: boolean }[]
}

export interface FaceZenData {
  device: { id: string; registeredAt: string }
  onboarded: boolean
  profile: Profile | null
  program: ProgramState
  sessions: SessionLog[]
  favorites: string[]
  practiced: Record<string, string[]>
  skincare: Record<string, SkincareDay>
  skincarePrefs: SkincarePrefs
  patchTests: PatchTest[]
  reviews: Record<number, WeeklyReview>
  settings: Settings
}

interface Actions {
  completeOnboarding: (profile: Profile, prefs: SkincarePrefs) => void
  updateProfile: (patch: Partial<Profile>) => void
  logSession: (log: SessionLog) => void
  updateSession: (id: string, patch: Partial<SessionLog>) => void
  deleteSession: (id: string) => void
  advanceWeek: () => void
  repeatWeek: () => void
  setWeek: (week: number) => void
  toggleFavorite: (exerciseId: string) => void
  markPracticed: (exerciseId: string) => void
  toggleSkincareStep: (date: string, period: 'manha' | 'noite', stepId: string) => void
  setReapplications: (date: string, n: number) => void
  updateSkincarePrefs: (patch: Partial<SkincarePrefs>) => void
  addPatchTest: (product: string, area: string) => void
  checkPatchTest: (id: string, date: string, value: 'ok' | 'reacao' | null) => void
  setPatchStatus: (id: string, status: PatchTest['status']) => void
  deletePatchTest: (id: string) => void
  saveReview: (week: number, answers: Record<string, string>) => void
  updateSettings: (patch: Partial<Settings>) => void
  importData: (data: FaceZenData) => void
  resetAll: () => void
}

export type FaceZenState = FaceZenData & Actions

export const STORAGE_KEY = 'facezen:v1'

export function uid(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  }
}

/** localStorage que nunca lança erro (modo privado, armazenamento bloqueado etc.). */
const memory = new Map<string, string>()
export const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return memory.get(name) ?? null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch {
      memory.set(name, value)
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch {
      memory.delete(name)
    }
  },
}

export function defaultPrefsFor(profile: Pick<Profile, 'skinBase' | 'sensitive' | 'mature' | 'concerns'>): SkincarePrefs {
  const serum: SkincarePrefs['serum'] = profile.sensitive
    ? 'nenhum'
    : profile.skinBase === 'seca' || profile.mature
      ? 'hialuronico'
      : profile.skinBase === 'oleosa' || profile.skinBase === 'mista'
        ? 'niacinamida'
        : 'nenhum'
  return {
    makeup: false,
    vitC: profile.concerns.includes('tom') && !profile.sensitive,
    serum,
    eye: false,
    toner: false,
    oil: profile.skinBase === 'seca' || profile.mature,
    retinoid: false,
    retinoidNights: [3],
    acid: false,
    acidNights: [6],
  }
}

const initialData = (): FaceZenData => ({
  device: { id: uid(), registeredAt: new Date().toISOString() },
  onboarded: false,
  profile: null,
  program: { week: 1, weekStartedAt: new Date().toISOString(), history: [] },
  sessions: [],
  favorites: [],
  practiced: {},
  skincare: {},
  skincarePrefs: defaultPrefsFor({ skinBase: 'normal', sensitive: false, mature: false, concerns: [] }),
  patchTests: [],
  reviews: {},
  settings: { voice: false, sound: true, vibrate: true, mirror: false, theme: 'system' },
})

const emptyDay = (): SkincareDay => ({ manha: [], noite: [], reaplicacoes: 0 })

export const useStore = create<FaceZenState>()(
  persist(
    (set, get) => ({
      ...initialData(),

      completeOnboarding: (profile, prefs) =>
        set((s) => ({
          onboarded: true,
          profile,
          skincarePrefs: prefs,
          program: s.onboarded ? s.program : { week: 1, weekStartedAt: new Date().toISOString(), history: [] },
        })),

      updateProfile: (patch) => set((s) => (s.profile ? { profile: { ...s.profile, ...patch } } : {})),

      logSession: (log) => set((s) => ({ sessions: [...s.sessions, log] })),

      updateSession: (id, patch) =>
        set((s) => ({ sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

      deleteSession: (id) => set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),

      advanceWeek: () =>
        set((s) => {
          const now = new Date().toISOString()
          const done = s.sessions.filter((x) => x.completed && x.startedAt >= s.program.weekStartedAt).length
          return {
            program: {
              week: Math.min(s.program.week + 1, 9),
              weekStartedAt: now,
              history: [...s.program.history, { week: s.program.week, startedAt: s.program.weekStartedAt, endedAt: now, sessions: done }],
            },
          }
        }),

      repeatWeek: () =>
        set((s) => {
          const now = new Date().toISOString()
          const done = s.sessions.filter((x) => x.completed && x.startedAt >= s.program.weekStartedAt).length
          return {
            program: {
              week: s.program.week,
              weekStartedAt: now,
              history: [...s.program.history, { week: s.program.week, startedAt: s.program.weekStartedAt, endedAt: now, sessions: done, repeated: true }],
            },
          }
        }),

      setWeek: (week) =>
        set((s) => ({ program: { ...s.program, week: Math.max(1, Math.min(9, week)), weekStartedAt: new Date().toISOString() } })),

      toggleFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id] })),

      markPracticed: (id) =>
        set((s) => {
          const key = dayKey()
          const list = s.practiced[key] ?? []
          return list.includes(id) ? {} : { practiced: { ...s.practiced, [key]: [...list, id] } }
        }),

      toggleSkincareStep: (date, period, stepId) =>
        set((s) => {
          const day = s.skincare[date] ?? emptyDay()
          const list = day[period]
          const next = list.includes(stepId) ? list.filter((x) => x !== stepId) : [...list, stepId]
          return { skincare: { ...s.skincare, [date]: { ...day, [period]: next } } }
        }),

      setReapplications: (date, n) =>
        set((s) => {
          const day = s.skincare[date] ?? emptyDay()
          return { skincare: { ...s.skincare, [date]: { ...day, reaplicacoes: Math.max(0, n) } } }
        }),

      updateSkincarePrefs: (patch) => set((s) => ({ skincarePrefs: { ...s.skincarePrefs, ...patch } })),

      addPatchTest: (product, area) =>
        set((s) => ({
          patchTests: [
            { id: uid(), product, area, startDate: dayKey(), checks: {}, status: 'andamento' },
            ...s.patchTests,
          ],
        })),

      checkPatchTest: (id, date, value) =>
        set((s) => ({
          patchTests: s.patchTests.map((t) => {
            if (t.id !== id) return t
            const checks = { ...t.checks }
            if (value) checks[date] = value
            else delete checks[date]
            return { ...t, checks }
          }),
        })),

      setPatchStatus: (id, status) =>
        set((s) => ({ patchTests: s.patchTests.map((t) => (t.id === id ? { ...t, status } : t)) })),

      deletePatchTest: (id) => set((s) => ({ patchTests: s.patchTests.filter((t) => t.id !== id) })),

      saveReview: (week, answers) =>
        set((s) => ({ reviews: { ...s.reviews, [week]: { week, date: dayKey(), answers } } })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      importData: (data) => set(() => ({ ...initialData(), ...data, device: get().device })),

      resetAll: () => set(() => ({ ...initialData(), device: get().device })),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
    },
  ),
)

/** Extrai somente os dados (sem funções) para backup. */
export function snapshot(state: FaceZenState): FaceZenData {
  const { device, onboarded, profile, program, sessions, favorites, practiced, skincare, skincarePrefs, patchTests, reviews, settings } = state
  return { device, onboarded, profile, program, sessions, favorites, practiced, skincare, skincarePrefs, patchTests, reviews, settings }
}
