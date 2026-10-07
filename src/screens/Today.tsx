import { ArrowRight, Check, GraduationCap, ListChecks, Moon, Play, RotateCcw, Sun } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { FaceMap } from '../components/FaceMap'
import { Button, Card, cx, Eyebrow, Title } from '../components/ui'
import { formatDuration, formatLong, greeting, isMorning } from '../lib/dates'
import { useToday } from '../lib/useToday'
import { COURSE_ITEMS, nextItem } from '../lib/course'
import { PHASE_LABEL, phaseOf } from '../lib/plan'
import { useTodayPlan } from '../lib/useTodayPlan'
import { morningRoutine, nightRoutine, type ProductId } from '../lib/skincare'

const NO_PRODUCTS: ProductId[] = []
import { storageIsPersistent, useStore } from '../lib/store'

export function Today() {
  const navigate = useNavigate()
  const profile = useStore((s) => s.profile)!
  const program = useStore((s) => s.program)
  const sessions = useStore((s) => s.sessions)
  const skincare = useStore((s) => s.skincare)
  const products = useStore((s) => s.products) ?? NO_PRODUCTS
  const advanceWeek = useStore((s) => s.advanceWeek)
  const repeatWeek = useStore((s) => s.repeatWeek)

  const today = useToday()
  const now = new Date()
  const { plan, info } = useTodayPlan()
  const lessonsDone = useStore((s) => s.lessonsDone)
  const nextLesson = nextItem(lessonsDone)
  const firstLesson = COURSE_ITEMS[0]
  const skincareDays = useStore((s) => s.skincare)
  const firstSteps = [
    ...(firstLesson ? [{ label: `Assista: ${firstLesson.title}`, to: firstLesson.to, done: lessonsDone.includes(firstLesson.id) }] : []),
    { label: 'Faça a sua rotina pela primeira vez', to: '/rotina', done: sessions.some((s) => s.completed) },
    { label: 'Marque o skincare de hoje', to: '/skincare', done: Object.values(skincareDays).some((d) => d.manha.length + d.noite.length > 0) },
  ]
  const firstStepsDone = firstSteps.every((f) => f.done)

  const morning = morningRoutine(profile, products)
  const night = nightRoutine(profile, products, now.getDay())
  const day = skincare[today]
  const mDone = morning.filter((s) => day?.manha.includes(s.id)).length
  const nDone = night.steps.filter((s) => day?.noite.includes(s.id)).length
  const paused = plan.steps.length === 0
  const canPractice = !paused && (info.state === 'praticar' || info.state === 'livre')
  const weekLabel = program.week > 8 ? 'Manutenção' : `Semana ${program.week} de 8 · ${PHASE_LABEL[phaseOf(program.week)]}`

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

      {!storageIsPersistent() && (
        <p className="mt-4 rounded-2xl bg-danger-soft p-3 text-sm text-ink">Seus dados não estão sendo salvos neste navegador (modo anônimo?). Abra numa aba normal.</p>
      )}

      {/* Primeiros passos: some quando os três estiverem feitos */}
      {!firstStepsDone && (
        <section aria-label="Primeiros passos" className="mt-6 rounded-3xl bg-surface p-5 shadow-soft">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl font-medium text-ink">Comece por aqui</h2>
            <span className="tnum text-sm font-semibold text-ink-soft">
              {firstSteps.filter((f) => f.done).length} de {firstSteps.length}
            </span>
          </div>
          <ol className="mt-3 grid gap-2">
            {firstSteps.map((f, n) => (
              <li key={f.label}>
                <Link to={f.to} className={cx('flex items-center gap-3 rounded-2xl p-3', f.done ? 'bg-ok-soft' : 'bg-surface-2')}>
                  <span className={cx('tnum grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold', f.done ? 'bg-ok text-surface' : 'bg-jade text-on-jade')}>
                    {f.done ? <Check className="size-4" /> : n + 1}
                  </span>
                  <span className={cx('min-w-0 flex-1 font-semibold', f.done ? 'text-ink-soft line-through' : 'text-ink')}>{f.label}</span>
                  {!f.done && <ArrowRight className="size-5 shrink-0 text-ink-faint" />}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Sessão do dia */}
      <section aria-label="Sessão de hoje" className="mt-6 overflow-hidden rounded-[32px] bg-hero p-5 text-on-hero shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow !text-on-hero/70">{weekLabel}</p>
            <h2 className="mt-2 font-display text-[1.85rem] leading-tight font-medium">
              {paused ? plan.title : canPractice ? plan.title : info.state === 'feita' ? 'Feito por hoje' : 'Dia de descanso'}
            </h2>
            <p className="mt-1 text-on-hero/80">
              {paused ? plan.subtitle : canPractice ? `${formatDuration(plan.totalSec)} · ${plan.steps.length} exercícios` : info.state === 'feita' ? 'Volte amanhã. Uma sessão por dia basta.' : 'Descansar também faz parte.'}
            </p>
            <p className="mt-3 text-sm text-on-hero/70">
              {info.done} de {info.target} sessões nesta semana
            </p>
          </div>
          <div className="w-[76px] shrink-0 rounded-2xl bg-surface p-1.5">
            <FaceMap selected={profile.focus} />
          </div>
        </div>
        {!paused && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {info.state !== 'feita' && (
              <Button variant="quartz" size="lg" onClick={() => navigate('/sessao')}>
                <Play className="size-5 fill-current" /> {canPractice ? 'Começar' : 'Praticar mesmo assim'}
              </Button>
            )}
            <Link to="/rotina" className="inline-flex h-14 items-center gap-2 rounded-full bg-on-hero/12 px-5 font-semibold text-on-hero">
              <ListChecks className="size-5" /> Ver a rotina
            </Link>
          </div>
        )}
      </section>

      {/* Semana concluída: avançar ou repetir */}
      {info.weekComplete && program.week <= 8 && (
        <Card className="mt-4">
          <p className="font-semibold text-ink">Semana concluída!</p>
          {info.flaggedThisWeek && <p className="mt-1 text-sm text-warn">Houve incômodo nesta semana: melhor repetir.</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant={info.flaggedThisWeek ? 'soft' : 'primary'} onClick={advanceWeek}>
              {program.week === 8 ? 'Ir para manutenção' : `Ir para a semana ${program.week + 1}`} <ArrowRight className="size-4" />
            </Button>
            <Button size="sm" variant={info.flaggedThisWeek ? 'primary' : 'soft'} onClick={repeatWeek}>
              <RotateCcw className="size-4" /> Repetir semana
            </Button>
          </div>
        </Card>
      )}

      {/* Skincare */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <SkincareTile icon={<Sun className="size-5" />} label="Skincare manhã" done={mDone} total={morning.length} highlight={isMorning(now)} />
        <SkincareTile icon={<Moon className="size-5" />} label="Skincare noite" done={nDone} total={night.steps.length} highlight={!isMorning(now)} />
      </div>

      {/* Próxima aula */}
      {nextLesson && (
        <Link to={nextLesson.to} className="mt-4 flex items-center gap-4 rounded-3xl bg-surface p-4 shadow-soft">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-quartz-soft text-rose-ink">
            <GraduationCap className="size-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold tracking-wider text-rose-ink uppercase">Próxima aula</span>
            <span className="block truncate font-semibold text-ink">{nextLesson.title}</span>
          </span>
          <ArrowRight className="size-5 shrink-0 text-ink-faint" />
        </Link>
      )}
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
