import { AlertTriangle, Award, Camera, Check, ChevronRight, Clock, Lock, Sparkles, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { PHOTO_GUIDANCE, WEEKLY_REVIEW } from '../content/guide'
import { MAINTENANCE, PROGRAM, type ProgramWeek } from '../content/program'
import { HourLaterSheet } from '../components/HourLater'
import { Photo } from '../components/Photo'
import { TensionChart } from '../components/TensionChart'
import { Button, Card, cx, Eyebrow, Field, Note, PageHeader, ProgressRing, Sheet } from '../components/ui'
import { formatDuration, formatShort, formatTime, fromDayKey } from '../lib/dates'
import { sessionsThisWeek, weekStart, weekTarget } from '../lib/plan'
import { useStore, type FaceZenData, type SessionLog } from '../lib/store'

export function Journey() {
  const state = useStore()
  const { program, sessions, profile } = state
  const [openEntry, setOpenEntry] = useState<SessionLog | null>(null)
  const thisWeek = sessionsThisWeek(sessions, weekStart(program))
  const completed = sessions.filter((s) => s.completed)
  const totalMin = Math.round(sessions.reduce((s, x) => s + x.practicedSec, 0) / 60)
  const calm = completed.filter((s) => !s.flagged).length
  const weeks: ProgramWeek[] = program.week > 8 ? [...PROGRAM, MAINTENANCE] : PROGRAM

  return (
    <div className="px-5 pb-28">
      <PageHeader eyebrow={program.week > 8 ? 'Manutenção' : `Semana ${program.week} de 8`} title="Sua jornada" subtitle="Oito semanas para avaliar conforto, constância e tolerância da pele, sem exigir uma transformação." />

      <div className="grid grid-cols-3 gap-2.5">
        <Stat value={completed.length} label={completed.length === 1 ? 'sessão' : 'sessões'} />
        <Stat value={totalMin} label="minutos" />
        <Stat value={calm} label="sem desconforto" />
      </div>

      {/* Linha do tempo das semanas */}
      <section className="mt-6" aria-label="Calendário de oito semanas">
        <ol className="relative grid gap-2.5">
          {weeks.map((w) => (
            <WeekRow key={w.week} w={w} current={program.week} done={program.week === w.week ? thisWeek.length : (program.history.filter((h) => h.week === w.week && !h.repeated).at(-1)?.sessions ?? 0)} target={weekTarget(w, profile!).target} />
          ))}
        </ol>
      </section>

      {program.week === 5 && (
        <Note className="mt-4" icon={<Camera className="size-4" />}>
          Semana 5: se for confortável, tire uma foto de acompanhamento. {PHOTO_GUIDANCE}
        </Note>
      )}

      {sessions.some((s) => s.afterTension) && (
        <Card className="mt-6">
          <TensionChart sessions={sessions} />
        </Card>
      )}

      <Milestones state={state} />

      <WeeklyReviewCard week={program.week} sessionsCount={thisWeek.length} calmCount={thisWeek.filter((s) => !s.flagged).length} />

      {/* Diário */}
      <section className="mt-8" aria-label="Diário de sessões">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-medium text-ink">Diário</h2>
          <span className="text-sm text-ink-faint">{sessions.length} registros</span>
        </div>
        {sessions.length === 0 ? (
          <div className="overflow-hidden rounded-3xl bg-surface shadow-soft">
            <Photo k="respiro" className="h-36 w-full" width={900} />
            <div className="p-5">
              <p className="font-semibold text-ink">Seu diário começa na primeira sessão.</p>
              <p className="mt-1 text-sm text-ink-soft">
                Antes e depois de cada prática você registra conforto e tensão. A finalidade é reconhecer tolerância, não procurar provas fotográficas de perfeição.
              </p>
            </div>
          </div>
        ) : (
          <ul className="grid gap-2.5">
            {[...sessions].reverse().map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => setOpenEntry(s)} className="flex w-full items-center gap-3 rounded-3xl bg-surface p-4 text-left shadow-soft">
                  <span className={cx('grid size-11 shrink-0 place-items-center rounded-2xl', s.flagged ? 'bg-warn-soft text-warn' : 'bg-jade-soft text-jade')}>
                    {s.flagged ? <AlertTriangle className="size-5" /> : <Check className="size-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{s.title}</span>
                    <span className="tnum block text-sm text-ink-soft">
                      {formatShort(fromDayKey(s.date))} · {formatDuration(s.practicedSec)} · sem. {Math.min(s.week, 8)}
                      {s.before && s.afterTension && ` · mandíbula ${s.before.mandibula}→${s.afterTension.mandibula}`}
                    </span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-ink-faint" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {openEntry && <EntrySheet entry={sessions.find((s) => s.id === openEntry.id) ?? openEntry} onClose={() => setOpenEntry(null)} />}
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
  const [open, setOpen] = useState(status === 'atual')
  const [confirm, setConfirm] = useState(false)
  const minutes = w.minutes.min === w.minutes.max ? `${w.minutes.max} min` : `${w.minutes.min}–${w.minutes.max} min`
  const sessionsLabel = w.sessions.min === w.sessions.max ? `${w.sessions.min} sessões` : `${w.sessions.min}–${w.sessions.max} sessões`

  return (
    <li className={cx('rounded-3xl transition', status === 'atual' ? 'bg-surface shadow-soft ring-1 ring-jade/25' : status === 'feita' ? 'bg-surface/70' : 'bg-transparent ring-1 ring-line')}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-3 p-4 text-left">
        {status === 'atual' ? (
          <ProgressRing value={target ? done / target : 0} size={44} stroke={4}>
            <span className="tnum text-xs font-bold text-ink">{w.week > 8 ? '∞' : w.week}</span>
          </ProgressRing>
        ) : (
          <span className={cx('grid size-11 shrink-0 place-items-center rounded-full font-bold', status === 'feita' ? 'bg-jade text-on-jade' : 'bg-surface-2 text-ink-faint')}>
            {status === 'feita' ? <Check className="size-5" strokeWidth={3} /> : w.week}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className={cx('block font-semibold', status === 'futura' ? 'text-ink-soft' : 'text-ink')}>{w.week > 8 ? w.title : `Semana ${w.week} · ${w.title}`}</span>
          <span className="block text-sm text-ink-faint">
            {sessionsLabel} · {minutes}
            {status === 'atual' && ` · ${done} de ${target} feitas`}
            {status === 'feita' && done > 0 && ` · ${done} feitas`}
          </span>
        </span>
        {status === 'futura' ? <Lock className="size-4 text-ink-faint" /> : <ChevronRight className={cx('size-5 text-ink-faint transition', open && 'rotate-90')} />}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-ink-soft">{w.summary}</p>
          <ul className="mt-3 grid gap-2">
            {w.rules.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-ink">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-quartz" />
                {r}
              </li>
            ))}
          </ul>
          {status !== 'atual' && w.week <= 8 && (
            <div className="mt-4">
              {confirm ? (
                <div className="rounded-2xl bg-surface-2 p-3">
                  <p className="text-sm text-ink">
                    {status === 'feita' ? 'Voltar a esta semana reinicia a contagem dela. Útil se algo causou desconforto.' : 'Pular etapas aumenta a chance de excesso. Tem certeza?'}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" onClick={() => setWeek(w.week)}>
                      Ir para a semana {w.week}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirm(true)} className="text-sm font-semibold text-jade">
                  {status === 'feita' ? 'Voltar para esta semana' : 'Ir para esta semana'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  )
}

function Milestones({ state }: { state: FaceZenData }) {
  const completed = state.sessions.filter((s) => s.completed)
  const sunscreenDays = Object.values(state.skincare).filter((d) => d.manha.includes('m-protetor')).length
  const items = [
    { id: 'primeira', label: 'Primeira sessão', done: completed.length >= 1 },
    { id: 'tres', label: '3 sessões sem desconforto', done: completed.filter((s) => !s.flagged).length >= 3 },
    { id: 'semana1', label: 'Semana 1 concluída', done: state.program.week > 1 },
    { id: 'diario', label: '5 registros de 1 hora depois', done: state.sessions.filter((s) => s.hourLater).length >= 5 },
    { id: 'dez', label: 'Primeira rotina de 10 minutos', done: completed.some((s) => s.variant === 'completa') },
    { id: 'protetor', label: '7 manhãs com protetor', done: sunscreenDays >= 7 },
    { id: 'teste', label: 'Teste de contato concluído', done: state.patchTests.some((t) => t.status === 'aprovado') },
    { id: 'oito', label: '8 semanas completas', done: state.program.week > 8 },
  ]
  const count = items.filter((i) => i.done).length
  return (
    <section className="mt-6" aria-label="Marcos">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-medium text-ink">Marcos</h2>
        <span className="tnum text-sm text-ink-faint">
          {count} de {items.length}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-2.5">
        {items.map((m) => (
          <li key={m.id} className={cx('flex items-center gap-2.5 rounded-2xl p-3', m.done ? 'bg-quartz-soft' : 'bg-surface-2/60')}>
            <span className={cx('grid size-8 shrink-0 place-items-center rounded-full', m.done ? 'bg-surface text-rose-ink' : 'text-ink-faint')}>
              {m.done ? <Award className="size-4" /> : <Sparkles className="size-4 opacity-50" />}
            </span>
            <span className={cx('text-sm leading-tight font-medium', m.done ? 'text-ink' : 'text-ink-faint')}>{m.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function WeeklyReviewCard({ week, sessionsCount, calmCount }: { week: number; sessionsCount: number; calmCount: number }) {
  const saved = useStore((s) => s.reviews[week])
  const saveReview = useStore((s) => s.saveReview)
  const [answers, setAnswers] = useState<Record<string, string>>(() => saved?.answers ?? { semDesconforto: sessionsCount ? `${calmCount} de ${sessionsCount}` : '' })
  const [open, setOpen] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  if (sessionsCount === 0 && !saved) return null
  return (
    <Card className="mt-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Eyebrow>Semana {Math.min(week, 8)}</Eyebrow>
          <h2 className="mt-1 font-display text-xl font-medium text-ink">Revisão semanal</h2>
          <p className="mt-1 text-sm text-ink-soft">{saved ? `Salva em ${formatShort(fromDayKey(saved.date))}.` : 'Seis perguntas curtas para ajustar a próxima semana.'}</p>
        </div>
        <Button size="sm" variant="soft" onClick={() => setOpen(!open)}>
          {open ? 'Fechar' : saved ? 'Rever' : 'Responder'}
        </Button>
      </div>
      {open && (
        <div className="mt-4 grid gap-4">
          {WEEKLY_REVIEW.map((q) => (
            <Field key={q.id} id={`r-${q.id}`} label={q.q} value={answers[q.id] ?? ''} onChange={(v) => setAnswers({ ...answers, [q.id]: v })} multiline={q.id !== 'semDesconforto'} />
          ))}
          <Button
            onClick={() => {
              saveReview(week, answers)
              setJustSaved(true)
              setOpen(false)
            }}
          >
            Salvar revisão
          </Button>
        </div>
      )}
      {justSaved && !open && <p className="mt-3 text-sm font-semibold text-ok">Revisão salva neste aparelho.</p>}
    </Card>
  )
}

function EntrySheet({ entry, onClose }: { entry: SessionLog; onClose: () => void }) {
  const deleteSession = useStore((s) => s.deleteSession)
  const [hourOpen, setHourOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const yn = (v: boolean | null | undefined) => (v === true ? 'sim' : v === false ? 'não' : '—')
  const started = new Date(entry.startedAt)

  return (
    <>
      <Sheet open={!hourOpen} onClose={onClose} title={entry.title}>
        <p className="tnum -mt-2 text-sm text-ink-soft">
          {formatShort(started)} às {formatTime(started)} · semana {Math.min(entry.week, 8)} · <Clock className="inline size-3.5" /> {formatDuration(entry.practicedSec)}
        </p>
        {entry.during?.interrompido && (
          <Note tone="warn" className="mt-3">
            Interrompida: {entry.during.interrompido}
          </Note>
        )}
        {entry.before && (
          <div className="mt-4">
            <p className="eyebrow mb-2">Antes → depois</p>
            <div className="tnum grid grid-cols-2 gap-2 text-sm">
              <Row label="Conforto da pele" value={`${entry.before.conforto}`} />
              <Row label="Inchaço" value={`${entry.before.inchaco}`} />
              <Row label="Tensão na testa" value={`${entry.before.testa} → ${entry.afterTension?.testa ?? '—'}`} />
              <Row label="Tensão na mandíbula" value={`${entry.before.mandibula} → ${entry.afterTension?.mandibula ?? '—'}`} />
            </div>
          </div>
        )}
        {entry.during && (
          <div className="mt-4">
            <p className="eyebrow mb-2">Durante</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Row label="Respiração confortável" value={yn(entry.during.respiracao)} />
              <Row label="Pressão leve" value={yn(entry.during.pressaoLeve)} />
            </div>
            <p className="mt-2 text-sm text-ink-soft">Sinais de alerta: {entry.during.desconforto.length ? entry.during.desconforto.join(', ') : 'nenhum'}</p>
          </div>
        )}
        <div className="mt-4">
          <p className="eyebrow mb-2">Uma hora depois</p>
          {entry.hourLater ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Row label="Pele confortável" value={yn(entry.hourLater.peleOk)} />
              <Row label="Vermelhidão persistente" value={yn(entry.hourLater.vermelhidao)} />
              <Row label="Olhos diferentes" value={yn(entry.hourLater.olhos)} />
              <Row label="Mandíbula e pescoço ok" value={yn(entry.hourLater.mandibulaOk)} />
            </div>
          ) : (
            <Button size="sm" variant="soft" onClick={() => setHourOpen(true)}>
              Registrar agora
            </Button>
          )}
          {entry.hourLater?.proxima && <p className="mt-2 text-sm text-ink-soft">Próxima vez: {entry.hourLater.proxima}</p>}
        </div>
        {(entry.produto || entry.contexto || entry.observacao) && (
          <div className="mt-4 grid gap-1 text-sm text-ink-soft">
            <p className="eyebrow mb-1">Notas</p>
            {entry.produto && <p>Produto: {entry.produto}</p>}
            {entry.contexto && <p>Contexto: {entry.contexto}</p>}
            {entry.observacao && <p>Próxima sessão: {entry.observacao}</p>}
          </div>
        )}
        <div className="mt-6 border-t border-line pt-4">
          {confirmDelete ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-ink">Apagar este registro?</span>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  deleteSession(entry.id)
                  onClose()
                }}
              >
                Apagar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-danger">
              <Trash2 className="size-4" /> Apagar registro
            </button>
          )}
        </div>
      </Sheet>
      {hourOpen && <HourLaterSheet session={entry} open onClose={() => setHourOpen(false)} />}
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2/70 px-3 py-2">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="font-semibold text-ink">{value}</p>
    </div>
  )
}
