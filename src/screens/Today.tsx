import { ArrowRight, Check, ChevronRight, Droplets, FlaskConical, Moon, Play, RotateCcw, Sparkles, Sun, Wind } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { REGIONS } from '../content/exercises'
import { DAILY_TIPS } from '../content/guide'
import { BreathOrb } from '../components/BreathOrb'
import { HourLaterSheet } from '../components/HourLater'
import { Button, Card, cx, Eyebrow, Note, ProgressRing, Title } from '../components/ui'
import { daysBetween, dayKey, formatDuration, formatLong, greeting, isMorning } from '../lib/dates'
import { buildSession, pendingHourCheck, sessionsThisWeek, todayInfo, weekStart } from '../lib/plan'
import { morningRoutine, nightRoutine } from '../lib/skincare'
import { useStore } from '../lib/store'

export function Today() {
  const navigate = useNavigate()
  const profile = useStore((s) => s.profile)!
  const program = useStore((s) => s.program)
  const sessions = useStore((s) => s.sessions)
  const skincare = useStore((s) => s.skincare)
  const prefs = useStore((s) => s.skincarePrefs)
  const patchTests = useStore((s) => s.patchTests)
  const advanceWeek = useStore((s) => s.advanceWeek)
  const repeatWeek = useStore((s) => s.repeatWeek)
  const [hourOpen, setHourOpen] = useState(false)

  const now = new Date()
  const today = dayKey(now)
  const start = weekStart(program, now)
  const info = todayInfo({ sessions, week: program.week, weekStartedAt: start, profile, now })
  const index = sessionsThisWeek(sessions, start).length
  const plan = useMemo(() => buildSession(profile, { week: program.week, sessionIndex: index }), [profile, program.week, index])
  const pending = pendingHourCheck(sessions, now)

  const morning = morningRoutine(profile, prefs)
  const night = nightRoutine(profile, prefs, now.getDay())
  const day = skincare[today]
  const mDone = morning.filter((s) => day?.manha.includes(s.id)).length
  const nDone = night.steps.filter((s) => day?.noite.includes(s.id)).length
  const activeTest = patchTests.find((t) => t.status === 'andamento')
  const tip = DAILY_TIPS[Math.abs(daysBetween('2026-01-01', today)) % DAILY_TIPS.length]
  const focus = REGIONS.filter((r) => profile.focus.includes(r.id))
  const weekNumber = Math.min(program.week, 8)
  const canPractice = info.state === 'praticar' || info.state === 'livre'

  return (
    <div className="px-5 pb-28">
      <header className="flex items-center justify-between gap-4 pt-6">
        <div className="min-w-0">
          <Eyebrow className="capitalize">{formatLong(now)}</Eyebrow>
          <Title className="mt-1">
            {greeting(now)}, <span className="italic text-rose-ink">{profile.name}</span>
          </Title>
        </div>
        <Link
          to="/perfil"
          aria-label="Seu perfil e ajustes"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-jade font-display text-xl font-medium text-on-jade shadow-soft"
        >
          {profile.name.slice(0, 1).toUpperCase()}
        </Link>
      </header>

      {/* Sessão do dia */}
      <section
        aria-label="Sessão de hoje"
        className="relative mt-6 overflow-hidden rounded-[32px] bg-hero p-5 text-on-hero shadow-soft"
        style={{ backgroundImage: 'radial-gradient(90% 70% at 100% 0%, color-mix(in oklab, var(--quartz) 45%, transparent), transparent 70%)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow !text-on-hero/70">
              {program.week > 8 ? 'Manutenção' : `Semana ${weekNumber} de 8 · ${info.week.title}`}
            </p>
            {canPractice ? (
              <>
                <h2 className="mt-2 font-display text-[1.85rem] leading-tight font-medium">{plan.title}</h2>
                <p className="mt-1 text-on-hero/80">
                  {formatDuration(plan.totalSec)} · {plan.subtitle}
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-2 font-display text-[1.85rem] leading-tight font-medium">
                  {info.state === 'feita' ? 'Sessão de hoje feita' : 'Dia de descanso'}
                </h2>
                <p className="mt-1 text-on-hero/85">{info.message}</p>
              </>
            )}
          </div>
          <BreathOrb size={92} label={false} className="-mt-1 -mr-1 shrink-0" />
        </div>

        {info.state === 'livre' && <p className="mt-3 text-sm text-on-hero/80">{info.message}</p>}

        {plan.adaptations.length > 0 && canPractice && (
          <p className="mt-3 rounded-2xl bg-white/10 px-3 py-2 text-sm text-on-hero/90">{plan.adaptations[0]}</p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {canPractice ? (
            <Button variant="quartz" size="lg" onClick={() => navigate('/sessao')}>
              <Play className="size-5 fill-current" /> Começar sessão
            </Button>
          ) : (
            <Button variant="quartz" onClick={() => navigate('/sessao?modo=respiracao')}>
              <Wind className="size-5" /> Respirar 1 minuto
            </Button>
          )}
          {!canPractice && info.state !== 'feita' && (
            <button type="button" onClick={() => navigate('/sessao')} className="h-11 rounded-full px-4 text-sm font-semibold text-on-hero/85 underline-offset-4 hover:underline">
              Praticar mesmo assim
            </button>
          )}
        </div>
      </section>

      {/* Uma hora depois */}
      {pending && (
        <button type="button" onClick={() => setHourOpen(true)} className="mt-4 flex w-full items-center gap-4 rounded-3xl bg-quartz-soft p-4 text-left">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-rose-ink">
            <Sparkles className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink">Como está sua pele uma hora depois?</span>
            <span className="block text-sm text-ink-soft">Quatro perguntas rápidas para o diário.</span>
          </span>
          <ChevronRight className="size-5 text-ink-faint" />
        </button>
      )}
      {pending && <HourLaterSheet key={pending.id} session={pending} open={hourOpen} onClose={() => setHourOpen(false)} />}

      {/* Semana */}
      <Card className="mt-4">
        <div className="flex items-center gap-4">
          <ProgressRing value={info.target ? info.done / info.target : 0} size={68}>
            <span className="tnum font-display text-xl font-medium text-ink">
              {info.done}/{info.target}
            </span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">Meta da semana</p>
            <p className="text-sm text-ink-soft">
              {info.weekComplete
                ? info.done < info.max
                  ? `Meta cumprida. Até ${info.max} sessões, se estiver confortável.`
                  : 'Meta cumprida. Descanso merecido.'
                : `${info.target - info.done} ${info.target - info.done === 1 ? 'sessão' : 'sessões'} para fechar a semana. Dias de descanso contam.`}
            </p>
          </div>
        </div>
        {info.weekComplete && program.week <= 8 && (
          <div className="mt-4 border-t border-line pt-4">
            {info.flaggedThisWeek ? (
              <Note tone="warn" className="mb-3">
                Houve algum desconforto nesta semana. O guia recomenda voltar ou repetir a semana antes de avançar.
              </Note>
            ) : (
              <p className="mb-3 text-sm text-ink-soft">
                {program.week === 8 ? 'Você chegou ao fim das 8 semanas. Hora de decidir uma manutenção realista.' : `Seguir para a semana ${program.week + 1}? Avance só se as sessões terminaram sem dor e sem vermelhidão persistente.`}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={info.flaggedThisWeek ? 'soft' : 'primary'} onClick={advanceWeek}>
                {program.week === 8 ? 'Ir para manutenção' : `Avançar para a semana ${program.week + 1}`} <ArrowRight className="size-4" />
              </Button>
              <Button size="sm" variant={info.flaggedThisWeek ? 'primary' : 'soft'} onClick={repeatWeek}>
                <RotateCcw className="size-4" /> Repetir a semana
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Skincare */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <SkincareTile icon={<Sun className="size-5" />} label="Manhã" done={mDone} total={morning.length} highlight={isMorning(now)} />
        <SkincareTile icon={<Moon className="size-5" />} label={night.kind === 'hidratacao' ? 'Noite' : night.kind === 'retinoide' ? 'Noite · retinoide' : 'Noite · esfoliante'} done={nDone} total={night.steps.length} highlight={!isMorning(now)} />
      </div>
      <p className="mt-2 flex items-center gap-2 px-1 text-sm text-ink-soft">
        <Droplets className="size-4 text-jade" /> Protetor reaplicado {day?.reaplicacoes ?? 0}× hoje
      </p>

      {activeTest && (
        <Link to="/skincare#teste" className="mt-4 flex items-center gap-4 rounded-3xl bg-surface p-4 shadow-soft">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-jade-soft text-jade">
            <FlaskConical className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink">Teste de contato: {activeTest.product}</span>
            <span className="block text-sm text-ink-soft">
              Dia {Math.min(daysBetween(activeTest.startDate, today) + 1, 10)} de 10 · {activeTest.checks[today] ? 'registrado hoje' : 'registre como a área está'}
            </span>
          </span>
          {activeTest.checks[today] ? <Check className="size-5 text-ok" /> : <ChevronRight className="size-5 text-ink-faint" />}
        </Link>
      )}

      {/* Dica */}
      <figure className="mt-6 rounded-3xl border border-line p-5">
        <Eyebrow>Lembrete do dia</Eyebrow>
        <blockquote className="mt-2 font-display text-[1.45rem] leading-snug font-medium text-ink italic">“{tip}”</blockquote>
      </figure>

      {focus.length > 0 && (
        <section className="mt-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-medium text-ink">Suas regiões</h2>
            <Link to="/exercicios" className="text-sm font-semibold text-jade">
              Ver fichas
            </Link>
          </div>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
            {focus.map((r) => (
              <Link key={r.id} to={`/exercicios?regiao=${r.id}`} className="shrink-0 rounded-2xl bg-surface px-4 py-3 shadow-soft">
                <span className="block font-semibold text-ink">{r.short}</span>
                <span className="block text-xs text-ink-soft">{r.concern}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function SkincareTile({ icon, label, done, total, highlight }: { icon: React.ReactNode; label: string; done: number; total: number; highlight: boolean }) {
  const complete = total > 0 && done >= total
  return (
    <Link
      to="/skincare"
      className={cx('rounded-3xl p-4 shadow-soft transition', highlight ? 'bg-surface ring-1 ring-jade/30' : 'bg-surface')}
    >
      <div className="flex items-center justify-between">
        <span className={cx('grid size-9 place-items-center rounded-full', complete ? 'bg-ok-soft text-ok' : 'bg-surface-2 text-jade')}>{complete ? <Check className="size-5" /> : icon}</span>
        <span className="tnum text-sm font-semibold text-ink-soft">
          {done}/{total}
        </span>
      </div>
      <p className="mt-3 font-semibold text-ink">{label}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-jade transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>
    </Link>
  )
}
