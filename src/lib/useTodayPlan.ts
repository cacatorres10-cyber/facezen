import { useMemo } from 'react'
import { buildSession, hadRecentDiscomfort, sessionsThisWeek, todayInfo, weekStart } from './plan'
import { useStore } from './store'

/** A sessão do dia (a mesma que o player monta) e como está a semana. */
export function useTodayPlan() {
  const profile = useStore((s) => s.profile)!
  const program = useStore((s) => s.program)
  const sessions = useStore((s) => s.sessions)
  const now = new Date()
  const start = weekStart(program, now)
  const info = todayInfo({ sessions, week: program.week, weekStartedAt: start, profile, now })
  const index = sessionsThisWeek(sessions, start).length
  const recentDiscomfort = hadRecentDiscomfort(sessions, now)
  const plan = useMemo(() => buildSession(profile, { week: program.week, sessionIndex: index, recentDiscomfort }), [profile, program.week, index, recentDiscomfort])
  return { plan, info }
}
