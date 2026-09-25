import { WEEKDAYS } from '../content/profileOptions'
import type { FaceZenData, Profile } from './store'

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

const ICS_DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

/** Evento recorrente (.ics) nos dias e horário escolhidos — funciona em qualquer calendário. */
export function practiceCalendar(profile: Pick<Profile, 'days' | 'time' | 'minutes' | 'name'>, appUrl: string): string {
  const [hh, mm] = profile.time.split(':').map(Number)
  const start = new Date()
  start.setHours(hh, mm, 0, 0)
  // Primeiro dia planejado a partir de hoje.
  for (let i = 0; i < 7 && !profile.days.includes(start.getDay()); i++) start.setDate(start.getDate() + 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  const local = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const byday = [...profile.days].sort().map((d) => ICS_DAYS[d]).join(',')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FaceZen//PT-BR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:facezen-${stamp}@facezen.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${local(start)}`,
    `DURATION:PT${profile.minutes}M`,
    `RRULE:FREQ=WEEKLY;BYDAY=${byday}`,
    'SUMMARY:FaceZen · seu momento de yoga facial',
    `DESCRIPTION:${profile.minutes} minutos de autocuidado consciente. Abra o FaceZen: ${appUrl}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Hora do FaceZen',
    'TRIGGER:-PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

export const daysLabel = (days: number[]) =>
  [...days]
    .sort()
    .map((d) => WEEKDAYS[d].label)
    .join(', ')

export function exportBackup(data: FaceZenData) {
  const date = new Date().toISOString().slice(0, 10)
  downloadFile(`facezen-backup-${date}.json`, JSON.stringify({ app: 'FaceZen', version: 1, exportedAt: new Date().toISOString(), data }, null, 2), 'application/json')
}

export function parseBackup(text: string): FaceZenData {
  const parsed = JSON.parse(text)
  const data = parsed?.data ?? parsed
  if (!data || typeof data !== 'object' || !('sessions' in data) || !('program' in data)) {
    throw new Error('Este arquivo não parece um backup do FaceZen.')
  }
  return data as FaceZenData
}
