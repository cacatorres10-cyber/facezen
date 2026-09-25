import { cx } from './ui'

/** Marca FaceZen: orbe de quartzo sobre jade, com a curva de olhos fechados. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cx('shrink-0', className)} aria-hidden>
      <defs>
        <radialGradient id="fz-orb" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#F8E2DE" />
          <stop offset="0.5" stopColor="#E8BCB5" />
          <stop offset="1" stopColor="#8FBFAE" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="#1F5A4E" />
      <circle cx="32" cy="32" r="19" fill="url(#fz-orb)" />
      <path d="M22.5 33.5c2.6 3.4 6.6 3.4 9.5 0M32 33.5c2.9 3.4 6.9 3.4 9.5 0" fill="none" stroke="#1F5A4E" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      <LogoMark className="size-8" />
      <span className="font-display text-2xl font-medium tracking-tight text-ink">
        Face<span className="italic text-rose-ink">Zen</span>
      </span>
    </span>
  )
}
