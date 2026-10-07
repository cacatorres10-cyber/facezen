import { ArrowRight, Play } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { hasStepPoses } from '../content/art'
import { LEVEL_LABEL, ROUTINE } from '../content/library'
import { ExerciseArt, StepArt } from '../components/ExerciseArt'
import { HelpLink } from '../components/HelpLink'
import { Button, Eyebrow, Note, Title } from '../components/ui'
import { formatDuration } from '../lib/dates'
import type { SessionStep } from '../lib/plan'
import { useTodayPlan } from '../lib/useTodayPlan'

/** Partes da rotina, na ordem em que aparecem na sessão. */
const PARTS = {
  abrir: { title: 'Abra o caminho', hint: 'Pescoço, clavícula e orelhas.' },
  rosto: { title: 'Drene o rosto', hint: 'De baixo para cima, sempre em direção às orelhas.' },
  foco: { title: 'Seu objetivo', hint: 'Um exercício a mais para a região que você escolheu.' },
  escova: { title: 'Com a escova', hint: 'Cerdas encostando de leve.' },
  soltar: { title: 'Solte', hint: 'Para terminar relaxando.' },
  fechar: { title: 'Feche na clavícula', hint: 'Leve tudo para baixo, até a clavícula.' },
}
type PartId = keyof typeof PARTS

function partOf(s: SessionStep): PartId {
  if (ROUTINE.open.includes(s.id)) return 'abrir'
  if (ROUTINE.face.includes(s.id)) return 'rosto'
  if (ROUTINE.close.includes(s.id)) return 'fechar'
  if (s.extra) return 'escova'
  if (s.focus) return 'foco'
  return 'soltar'
}

/** Junta os exercícios seguidos da mesma parte, sem mudar a ordem. */
function byPart(steps: SessionStep[]) {
  const parts: { id: PartId; items: { s: SessionStep; n: number }[] }[] = []
  steps.forEach((s, i) => {
    const id = partOf(s)
    const last = parts[parts.length - 1]
    if (last?.id === id) last.items.push({ s, n: i + 1 })
    else parts.push({ id, items: [{ s, n: i + 1 }] })
  })
  return parts
}

/** A rotina pronta: todos os exercícios da sessão, na ordem, com os passos e os desenhos. */
export function Routine() {
  const navigate = useNavigate()
  const { plan, info } = useTodayPlan()
  const paused = plan.steps.length === 0
  const doneToday = info.state === 'feita'

  return (
    <div className="px-5 pb-48">
      <header className="pt-6">
        <Eyebrow>{doneToday ? 'Sua próxima rotina' : 'Sua rotina de hoje'}</Eyebrow>
        <Title className="mt-1.5">{plan.title}</Title>
        {!paused && (
          <p className="mt-1 text-ink-soft">
            {formatDuration(plan.totalSec)} · {plan.steps.length} exercícios{plan.level && ` · nível ${LEVEL_LABEL[plan.level].toLowerCase()}`}
          </p>
        )}
      </header>

      {doneToday && !paused && (
        <Note tone="ok" className="mt-4">
          A de hoje já está feita. Esta é a da próxima sessão.
        </Note>
      )}
      {plan.adaptations[0] && (
        <Note tone={paused ? 'warn' : 'info'} className="mt-4">
          {plan.adaptations[0]}
        </Note>
      )}

      {!paused && (
        <>
          <div className="mt-4 rounded-3xl bg-surface p-4 shadow-soft">
            <p className="font-semibold text-ink">É só seguir na ordem, de cima para baixo.</p>
            <p className="mt-1 text-sm text-ink-soft">Rosto e mãos limpos, sem creme. Toque levíssimo: os dedos só esticam a pele e soltam. Pare se sentir dor, ardor ou tontura.</p>
          </div>

          {byPart(plan.steps).map((part) => (
            <section key={`${part.id}-${part.items[0].n}`} className="mt-7">
              <h2 className="font-display text-2xl font-medium text-ink">{PARTS[part.id].title}</h2>
              <p className="text-sm text-ink-soft">{PARTS[part.id].hint}</p>
              <ol className="mt-3 grid gap-3">
                {part.items.map(({ s, n }) => (
                  <RoutineItem key={s.key} s={s} n={n} />
                ))}
              </ol>
            </section>
          ))}

          <HelpLink className="mt-6" />

          <Link to="/exercicios" className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-surface-2 p-4 text-sm font-semibold text-ink">
            Quer explorar? Ver todos os exercícios
            <ArrowRight className="size-4 shrink-0 text-ink-faint" />
          </Link>

          <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-30 mx-auto max-w-[480px] bg-gradient-to-t from-bg via-bg/95 to-transparent px-5 pt-6 pb-3">
            <Button size="lg" block onClick={() => navigate('/sessao')}>
              <Play className="size-5 fill-current" /> Fazer com o cronômetro
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function RoutineItem({ s, n }: { s: SessionStep; n: number }) {
  const poses = hasStepPoses(s.id)
  return (
    <li className="rounded-3xl bg-surface p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="tnum grid size-9 shrink-0 place-items-center rounded-full bg-jade font-bold text-on-jade">{n}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg leading-snug font-semibold text-ink">{s.title}</h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-semibold text-jade">{s.dose}</span>
            {s.sided && <span className="text-ink-faint">metade de cada lado</span>}
            {s.focus && <span className="rounded-full bg-quartz-soft px-2 py-0.5 text-[11px] font-bold text-rose-ink">seu objetivo</span>}
          </p>
        </div>
      </div>

      {!poses && (
        <div className="mx-auto mt-3 max-w-[180px] rounded-2xl bg-bg p-2">
          <ExerciseArt id={s.id} title={`Desenho: ${s.title}`} />
        </div>
      )}

      <ol className="mt-3 grid gap-3">
        {s.steps.map((text, i) => (
          <li key={text} className={poses ? 'grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-3' : undefined}>
            {poses && (
              <div className="rounded-2xl bg-bg p-1">
                <StepArt id={s.id} step={i} title={`Passo ${i + 1}: ${s.title}`} />
              </div>
            )}
            <p className="text-ink">
              <span className="font-semibold text-jade">Passo {i + 1}:</span> {text}
            </p>
          </li>
        ))}
      </ol>

      {s.note && <p className="mt-3 rounded-2xl bg-jade-soft px-3 py-2 text-sm text-ink">Para você: {s.note}</p>}
    </li>
  )
}
