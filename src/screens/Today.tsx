import { ArrowRight, Check, Moon, Play, PlayCircle, RotateCcw, Sun } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaceMap } from '../components/FaceMap'
import { Button, Card, cx, Eyebrow, ProgressRing, Title } from '../components/ui'
import { dayKey, formatDuration, formatLong, greeting, isMorning } from '../lib/dates'
import { buildSession, sessionsThisWeek, todayInfo, weekStart } from '../lib/plan'
import { morningRoutine, nightRoutine } from '../lib/skincare'
import { useStore } from '../lib/store'

export function Today() {
  const navigate = useNavigate()
  const profile = useStore((s) => s.profile)!
  const program = useStore((s) => s.program)
  const sessions = useStore((s) => s.sessions)
  const skincare = useStore((s) => s.skincare)
  const prefs = useStore((s) => s.skincarePrefs)
  const advanceWeek = useStore((s) => s.advanceWeek)
  const repeatWeek = useStore((s) => s.repeatWeek)

  const now = new Date()
  const today = dayKey(now)
  const start = weekStart(program, now)
  const info = todayInfo({ sessions, week: program.week, weekStartedAt: start, profile, now })
  const index = sessionsThisWeek(sessions, start).length
  const plan = useMemo(() => buildSession(profile, { week: program.week, sessionIndex: index }), [profile, program.week, index])

  const morning = morningRoutine(profile, prefs)
  const night = nightRoutine(profile, prefs, now.getDay())
  const day = skincare[today]
  const mDone = morning.filter((s) => day?.manha.includes(s.id)).length
  const nDone = night.steps.filter((s) => day?.noite.includes(s.id)).length
  const paused = plan.steps.length === 0
  const canPractice = !paused && (info.state === 'praticar' || info.state === 'livre')
  const weekLabel = program.week > 8 ? 'Manutenção' : `Semana ${program.week} de 8`

  return (
    <div className="px-5 pb-28">
      <header className="flex items-center justify-between gap-4 pt-6">
        <div className="min-w-0">
          <Eyebrow className="capitalize">{formatLong(now)}</Eyebrow>
          <Title className="mt-1">
            {greeting(now)}, <span className="italic text-rose-ink">{profile.name}</span>
          </Title>
        </div>
        <Link to="/perfil" aria-label="Seu perfil" className="grid size-12 shrink-0 place-items-center rounded-full bg-jade font-display text-xl font-medium text-on-jade shadow-soft">
          {profile.name.slice(0, 1).toUpperCase()}
        </Link>
      </header>

      {/* Sessão do dia */}
      <section aria-label="Sessão de hoje" className="mt-6 overflow-hidden rounded-[32px] bg-hero p-5 text-on-hero shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow !text-on-hero/70">{weekLabel}</p>
            <h2 className="mt-2 font-display text-[1.85rem] leading-tight font-medium">
              {paused ? plan.title : canPractice ? plan.title : info.state === 'feita' ? 'Feito por hoje' : 'Dia de descanso'}
            </h2>
            <p className="mt-1 text-on-hero/80">
              {paused ? plan.subtitle : canPractice ? `${formatDuration(plan.totalSec)} · ${plan.subtitle}` : info.state === 'feita' ? 'Volte amanhã. Uma sessão por dia basta.' : 'Descansar também faz parte.'}
            </p>
          </div>
          <div className="w-[76px] shrink-0 rounded-2xl bg-surface p-1.5">
            <FaceMap selected={profile.focus} />
          </div>
        </div>
        {(canPractice || (!paused && info.state !== 'feita')) && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button variant="quartz" size="lg" onClick={() => navigate('/sessao')}>
              <Play className="size-5 fill-current" /> {canPractice ? 'Começar' : 'Praticar mesmo assim'}
            </Button>
          </div>
        )}
      </section>

      {/* Semana */}
      <Card className="mt-4">
        <div className="flex items-center gap-4">
          <ProgressRing value={info.target ? info.done / info.target : 0} size={60}>
            <span className="tnum font-display text-lg font-medium text-ink">
              {info.done}/{info.target}
            </span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">Sessões da semana</p>
            <p className="text-sm text-ink-soft">{info.weekComplete ? 'Meta cumprida!' : `Faltam ${info.target - info.done}.`}</p>
          </div>
        </div>
        {info.weekComplete && program.week <= 8 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            <Button size="sm" variant={info.flaggedThisWeek ? 'soft' : 'primary'} onClick={advanceWeek}>
              {program.week === 8 ? 'Ir para manutenção' : `Ir para a semana ${program.week + 1}`} <ArrowRight className="size-4" />
            </Button>
            <Button size="sm" variant={info.flaggedThisWeek ? 'primary' : 'soft'} onClick={repeatWeek}>
              <RotateCcw className="size-4" /> Repetir semana
            </Button>
            {info.flaggedThisWeek && <p className="w-full text-sm text-warn">Houve incômodo nesta semana: melhor repetir.</p>}
          </div>
        )}
      </Card>

      {/* Skincare */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <SkincareTile icon={<Sun className="size-5" />} label="Skincare manhã" done={mDone} total={morning.length} highlight={isMorning(now)} />
        <SkincareTile icon={<Moon className="size-5" />} label="Skincare noite" done={nDone} total={night.steps.length} highlight={!isMorning(now)} />
      </div>

      {/* Aulas */}
      <Link to="/aulas" className="mt-4 flex items-center gap-4 rounded-3xl bg-quartz-soft p-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-surface text-rose-ink">
          <PlayCircle className="size-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-ink">Vídeo-aulas</span>
          <span className="block text-sm text-ink-soft">Veja os movimentos antes de praticar</span>
        </span>
        <ArrowRight className="size-5 text-ink-faint" />
      </Link>
    </div>
  )
}

function SkincareTile({ icon, label, done, total, highlight }: { icon: React.ReactNode; label: string; done: number; total: number; highlight: boolean }) {
  const complete = total > 0 && done >= total
  return (
    <Link to="/skincare" className={cx('rounded-3xl bg-surface p-4 shadow-soft', highlight && 'ring-1 ring-jade/30')}>
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
