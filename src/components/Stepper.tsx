import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Button, cx } from './ui'

/** Tutorial passo a passo: um passo por vez, com anterior e próximo. */
export function Stepper({
  steps,
  visual,
  onFinish,
  finishLabel = 'Concluir',
  done,
}: {
  steps: string[]
  /** Ilustração ao lado do passo (ex.: o mapa do rosto). */
  visual?: ReactNode
  onFinish?: () => void
  finishLabel?: string
  /** Já concluído antes: mostra o selo no fim. */
  done?: boolean
}) {
  const [i, setI] = useState(0)
  const last = i === steps.length - 1

  return (
    <section aria-label="Tutorial passo a passo" className="rounded-3xl bg-surface p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">
          Passo {i + 1} de {steps.length}
        </p>
        {done && (
          <span className="inline-flex items-center gap-1 rounded-full bg-ok-soft px-2 py-0.5 text-[11px] font-bold text-ok">
            <Check className="size-3" /> concluído
          </span>
        )}
      </div>

      <div className="mt-2 flex gap-1" aria-hidden>
        {steps.map((_, n) => (
          <span key={n} className={cx('h-1.5 flex-1 rounded-full transition', n <= i ? 'bg-jade' : 'bg-surface-2')} />
        ))}
      </div>

      <div className={cx('mt-5 grid min-h-[128px] items-center gap-4', visual ? 'grid-cols-[1fr_84px]' : 'grid-cols-1')}>
        <p key={i} className="animate-rise font-display text-[1.45rem] leading-snug font-medium text-ink" aria-live="polite">
          {steps[i]}
        </p>
        {visual && <div className="self-start">{visual}</div>}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setI(Math.max(0, i - 1))}
          disabled={i === 0}
          aria-label="Passo anterior"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-surface-2 text-ink disabled:opacity-40"
        >
          <ArrowLeft className="size-5" />
        </button>
        {last ? (
          <Button block onClick={() => onFinish?.()} disabled={!onFinish}>
            <Check className="size-5" /> {finishLabel}
          </Button>
        ) : (
          <Button block onClick={() => setI(i + 1)}>
            Próximo <ArrowRight className="size-5" />
          </Button>
        )}
      </div>
    </section>
  )
}
