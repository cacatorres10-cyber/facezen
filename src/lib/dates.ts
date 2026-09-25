/** Chave de dia local no formato AAAA-MM-DD. */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Diferença em dias de calendário (b − a). */
export function daysBetween(a: string, b: string): number {
  const ms = fromDayKey(b).getTime() - fromDayKey(a).getTime()
  return Math.round(ms / 86_400_000)
}

export function addDays(key: string, n: number): string {
  const d = fromDayKey(key)
  d.setDate(d.getDate() + n)
  return dayKey(d)
}

const fmtLong = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
const fmtShort = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
const fmtTime = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

export const formatLong = (d: Date) => fmtLong.format(d)
export const formatShort = (d: Date) => fmtShort.format(d).replace('.', '')
export const formatTime = (d: Date) => fmtTime.format(d)

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  if (m === 0) return `${s} s`
  if (s === 0) return `${m} min`
  return `${m} min ${s} s`
}

export function clock(sec: number): string {
  const s = Math.max(0, Math.ceil(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function greeting(d: Date = new Date()): string {
  const h = d.getHours()
  if (h < 5) return 'Boa noite'
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function isMorning(d: Date = new Date()): boolean {
  const h = d.getHours()
  return h >= 4 && h < 14
}
