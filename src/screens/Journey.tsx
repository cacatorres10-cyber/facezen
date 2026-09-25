import { AlertTriangle, Check, ChevronRight, Lock, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { MAINTENANCE, PROGRAM, type ProgramWeek } from '../content/program'
import { Button, Card, cx, PageHeader, ProgressRing } from '../components/ui'
import { formatDuration, formatShort, fromDayKey } from '../lib/dates'
import { sessionsThisWeek, weekStart, weekTarget } from '../lib/plan'
import { useStore } from '../lib/store'
import { useToday } from '../lib/useToday'
import { SkincareHistory } from '../components/SkincareHistory'

const FEELING_LABEL = { bem: 'Foi bem', desconforto: 'Um incômodo', dor: 'Senti dor' } as const

export function Journey() {
  const program = useStore((s) => s.program)
  const sessions = useStore((s) => s.sessions)
  const profile = useStore((s) => s.profile)!
  const deleteSession = useStore((s) => s.deleteSession)
  const [confirm, setConfirm] = useState<string | null>(null)
  const skincare = useStore((s) => s.skincare)
  const today = useToday()
  const thisWeek = sessionsThisWeek(sessions, weekStart(program))
  const completed = sessions.filter((s) => s.completed)
  const totalMin = Math.round(sessions.reduce((s, x) => s + x.practicedSec, 0) / 60)
  const weeks: ProgramWeek[] = program.week > 8 ? [...PROGRAM, MAINTENANCE] : PROGRAM

  return (
    <div className="px-5 pb-28">
      <PageHeader eyebrow={program.week > 8 ? 'Manutenção' : `Semana ${program.week} de 8`} title="Seu progresso" />

      <div className="grid grid-cols-2 gap-2.5">
        <Stat value={completed.length} label={completed.length === 1 ? 'sessão feita' : 'sessões feitas'} />
        <Stat value={totalMin} label="minutos de cuidado" />
      </div>

      <Card className="mt-4">
        <SkincareHistory skincare={skincare} today={today} />
      </Card>

      <section className="mt-6" aria-label="As 8 semanas">
        <h2 className="mb-3 font-display text-2xl font-medium text-ink">As 8 semanas</h2>
        <ol className="grid gap-2">
          {weeks.map((w) => (
            <WeekRow
              key={w.week}
              w={w}
              current={program.week}
              done={program.week === w.week ? thisWeek.length : (program.history.filter((h) => h.week === w.week && !h.repeated).at(-1)?.sessions ?? 0)}
              target={weekTarget(w, profile).target}
            />
          ))}
        </ol>
      </section>

      <section className="mt-8" aria-label="Histórico">
        <h2 className="mb-3 font-display text-2xl font-medium text-ink">Histórico</h2>
        {sessions.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line p-5 text-sm text-ink-soft">Suas sessões aparecem aqui.</p>
        ) : (
          <ul className="grid gap-2">
            {[...sessions].reverse().map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-3xl bg-surface p-4 shadow-soft">
                <span className={cx('grid size-10 shrink-0 place-items-center rounded-2xl', s.flagged ? 'bg-warn-soft text-warn' : 'bg-jade-soft text-jade')}>
                  {s.flagged ? <AlertTriangle className="size-5" /> : <Check className="size-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink">{s.title}</span>
                  <span className="tnum block text-sm text-ink-soft">
                    {formatShort(fromDayKey(s.date))} · {formatDuration(s.practicedSec)}
                    {s.feeling && ` · ${FEELING_LABEL[s.feeling]}`}
                  </span>
                </span>
                {confirm === s.id ? (
                  <Button size="sm" variant="danger" onClick={() => deleteSession(s.id)}>
                    Apagar
                  </Button>
                ) : (
                  <button type="button" onClick={() => setConfirm(s.id)} aria-label="Apagar registro" className="grid size-9 place-items-center rounded-full text-ink-faint">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-3xl bg-surface p-4 shadow-soft">
      <p className="tnum font-display text-3xl leading-none font-medium text-ink">{value}</p>
      <p className="mt-1.5 text-xs font-medium text-ink-soft">{label}</p>
    </div>
  )
}

function WeekRow({ w, current, done, target }: { w: ProgramWeek; current: number; done: number; target: number }) {
  const setWeek = useStore((s) => s.setWeek)
  const status = w.week < current ? 'feita' : w.week === current ? 'atual' : 'futura'
  const [open, setOpen] = useState(false)
  const minutes = w.minutes.min === w.minutes.max ? `${w.minutes.max} min` : `${w.minutes.min}–${w.minutes.max} min`

  return (
    <li className={cx('rounded-3xl', status === 'atual' ? 'bg-surface shadow-soft ring-1 ring-jade/25' : status === 'feita' ? 'bg-surface/70' : 'ring-1 ring-line')}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-3 p-4 text-left">
        {status === 'atual' ? (
          <ProgressRing value={target ? done / target : 0} size={40} stroke={4}>
            <span className="tnum text-xs font-bold text-ink">{w.week > 8 ? '∞' : w.week}</span>
          </ProgressRing>
        ) : (
          <span className={cx('grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold', status === 'feita' ? 'bg-jade text-on-jade' : 'bg-surface-2 text-ink-faint')}>
            {status === 'feita' ? <Check className="size-5" strokeWidth={3} /> : w.week}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className={cx('block font-semibold', status === 'futura' ? 'text-ink-soft' : 'text-ink')}>{w.title}</span>
          <span className="block text-sm text-ink-faint">
            {status === 'atual' ? `${done} de ${target} sessões` : `${w.sessions.min === w.sessions.max ? w.sessions.min : `${w.sessions.min}–${w.sessions.max}`} sessões`} · {minutes}
          </span>
        </span>
        {status === 'futura' ? <Lock className="size-4 text-ink-faint" /> : <ChevronRight className={cx('size-5 text-ink-faint transition', open && 'rotate-90')} />}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-ink-soft">{w.summary}</p>
          {status !== 'atual' && w.week <= 8 && (
            <button type="button" onClick={() => setWeek(w.week)} className="mt-3 text-sm font-semibold text-jade">
              {status === 'feita' ? 'Voltar para esta semana' : 'Ir para esta semana'}
            </button>
          )}
        </div>
      )}
    </li>
  )
}
