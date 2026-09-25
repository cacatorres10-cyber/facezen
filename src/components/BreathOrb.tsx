import { useEffect, useState } from 'react'
import { cx } from './ui'

const INHALE = 4000
const EXHALE = 6000
const CYCLE = INHALE + EXHALE

/**
 * Orbe de respiração: cresce em 4 tempos (inspire) e recolhe em 6 (expire),
 * o ritmo sugerido no guia. É o gesto visual central do FaceZen.
 */
export function BreathOrb({ size = 220, running = true, label = true, className }: { size?: number; running?: boolean; label?: boolean; className?: string }) {
  const [start, setStart] = useState(() => Date.now())
  const [phase, setPhase] = useState<'in' | 'out'>('in')

  // Ao retomar, reinicia o ciclo para o texto e a animação andarem juntos.
  useEffect(() => {
    if (running) setStart(Date.now())
  }, [running])

  useEffect(() => {
    if (!running || !label) return
    const tick = () => setPhase((Date.now() - start) % CYCLE < INHALE ? 'in' : 'out')
    tick()
    const t = setInterval(tick, 200)
    return () => clearInterval(t)
  }, [running, label, start])

  return (
    <div className={cx('relative grid place-items-center', className)} style={{ width: size, height: size, maxWidth: '100%' }} aria-hidden={!label}>
      <div className="absolute inset-0 rounded-full opacity-60 blur-2xl" style={{ background: 'radial-gradient(circle at 50% 45%, var(--orb-a), transparent 70%)' }} />
      <div
        key={start}
        className={cx('absolute inset-[6%] rounded-full', running && 'animate-breathe')}
        style={{
          background: 'radial-gradient(circle at 35% 30%, color-mix(in oklab, var(--orb-a) 80%, white) 0%, var(--orb-a) 38%, var(--orb-b) 100%)',
          boxShadow: 'inset 0 -12px 40px rgb(0 0 0 / 0.12), 0 20px 60px -24px var(--orb-b)',
          transform: running ? undefined : 'scale(0.8)',
        }}
      />
      <div className="absolute inset-[6%] rounded-full ring-1 ring-white/30" />
      {label && (
        <span className="relative font-display text-2xl font-medium text-[#20312d] italic" aria-live="polite">
          {running ? (phase === 'in' ? 'Inspire' : 'Expire') : 'Pausa'}
        </span>
      )}
    </div>
  )
}
