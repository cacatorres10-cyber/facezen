import { Check, ChevronDown, X } from 'lucide-react'
import { useEffect, useId, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

type Variant = 'primary' | 'soft' | 'ghost' | 'danger' | 'quartz'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-jade text-on-jade hover:bg-jade-strong shadow-soft',
  soft: 'bg-surface-2 text-ink hover:bg-jade-soft',
  ghost: 'bg-transparent text-jade hover:bg-surface-2',
  danger: 'bg-danger-soft text-danger hover:brightness-95',
  quartz: 'bg-quartz text-[#3a1f1c] hover:brightness-95 shadow-soft',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
}

export function Button({ variant = 'primary', size = 'md', block, className, children, ...rest }: ButtonProps) {
  const sizes = { sm: 'h-9 px-3.5 text-sm', md: 'h-11 px-5 text-[15px]', lg: 'h-14 px-6 text-base' }
  return (
    <button
      {...rest}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45',
        VARIANTS[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function LinkButton({ to, variant = 'primary', className, children }: { to: string; variant?: Variant; className?: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={cx('inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold transition active:scale-[0.98]', VARIANTS[variant], className)}
    >
      {children}
    </Link>
  )
}

export function Card({ className, children, as: As = 'div' }: { className?: string; children: ReactNode; as?: 'div' | 'section' | 'article' }) {
  return <As className={cx('rounded-3xl bg-surface p-5 shadow-soft', className)}>{children}</As>
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('eyebrow', className)}>{children}</p>
}

export function Title({ children, className, as: As = 'h1' }: { children: ReactNode; className?: string; as?: 'h1' | 'h2' | 'h3' }) {
  const size = As === 'h1' ? 'text-[2rem] leading-[1.1]' : As === 'h2' ? 'text-[1.6rem] leading-tight' : 'text-xl leading-snug'
  return <As className={cx('font-display font-medium tracking-[-0.01em] text-ink', size, className)}>{children}</As>
}

export function Chip({
  selected,
  onClick,
  children,
  className,
  disabled,
}: {
  selected?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
        selected ? 'border-jade bg-jade text-on-jade' : 'border-line bg-surface text-ink-soft hover:border-jade/50',
        disabled && 'opacity-40',
        className,
      )}
    >
      {selected && <Check className="size-3.5" strokeWidth={3} />}
      {children}
    </button>
  )
}

/** Opção grande de múltipla escolha (onboarding, ajustes). */
export function OptionCard({
  selected,
  onClick,
  title,
  hint,
  icon,
  multi,
}: {
  selected: boolean
  onClick: () => void
  title: string
  hint?: string
  icon?: ReactNode
  multi?: boolean
}) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      onClick={onClick}
      className={cx(
        'flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition',
        selected ? 'border-jade bg-jade-soft' : 'border-line bg-surface hover:border-jade/40',
      )}
    >
      {icon && <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-jade">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink">{title}</span>
        {hint && <span className="mt-0.5 block text-sm text-ink-soft">{hint}</span>}
      </span>
      <span
        className={cx(
          'grid size-6 shrink-0 place-items-center border-2 transition',
          multi ? 'rounded-md' : 'rounded-full',
          selected ? 'border-jade bg-jade text-on-jade' : 'border-line',
        )}
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  )
}

export function Toggle({ checked, onChange, label, hint, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string; id?: string }) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <label htmlFor={inputId} className="flex cursor-pointer items-center gap-4 py-3">
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-ink">{label}</span>
        {hint && <span className="block text-sm text-ink-soft">{hint}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input id={inputId} type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-7 w-12 rounded-full bg-surface-2 ring-1 ring-line transition peer-checked:bg-jade peer-focus-visible:outline-2 peer-focus-visible:outline-jade" />
        <span className="absolute top-1 left-1 size-5 rounded-full bg-surface shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  )
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  className,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div role="radiogroup" className={cx('flex rounded-full bg-surface-2 p-1', className)}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'h-9 flex-1 rounded-full px-3 text-sm font-semibold transition',
            value === o.value ? 'bg-surface text-ink shadow-soft' : 'text-ink-soft',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Escala de 0 a 10, como no diário do ebook. */
export function ScoreSlider({ label, value, onChange, low, high, id }: { label: string; value: number; onChange: (v: number) => void; low: string; high: string; id: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-medium text-ink">
          {label}
        </label>
        <span className="tnum font-display text-2xl font-medium text-jade">{value}</span>
      </div>
      <input id={id} type="range" min={0} max={10} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="zen-range" />
      <div className="flex justify-between text-xs text-ink-faint">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  )
}

export function YesNo({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-ink">{label}</span>
      <div className="flex shrink-0 gap-1.5">
        {[
          { v: true, t: 'Sim' },
          { v: false, t: 'Não' },
        ].map((o) => (
          <button
            key={o.t}
            type="button"
            aria-pressed={value === o.v}
            onClick={() => onChange(o.v)}
            className={cx(
              'h-9 min-w-14 rounded-full border px-3 text-sm font-semibold transition',
              value === o.v ? 'border-jade bg-jade text-on-jade' : 'border-line bg-surface text-ink-soft',
            )}
          >
            {o.t}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Accordion({ title, children, defaultOpen, meta }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean; meta?: ReactNode }) {
  return (
    <details className="group border-b border-line last:border-b-0" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center gap-3 py-4 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1 font-semibold text-ink">{title}</span>
        {meta}
        <ChevronDown className="size-5 shrink-0 text-ink-faint transition group-open:rotate-180" />
      </summary>
      <div className="pb-5 text-ink-soft">{children}</div>
    </details>
  )
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-[rgb(8_20_17/0.45)] backdrop-blur-[2px]" />
      <div className="animate-rise relative max-h-[88dvh] w-full max-w-[480px] overflow-y-auto rounded-t-[28px] bg-surface px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-soft sm:rounded-[28px]">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line sm:hidden" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-medium text-ink">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="grid size-9 place-items-center rounded-full bg-surface-2 text-ink-soft">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Note({ tone = 'info', icon, children, className }: { tone?: 'info' | 'warn' | 'danger' | 'ok'; icon?: ReactNode; children: ReactNode; className?: string }) {
  const tones = {
    info: 'bg-jade-soft text-ink',
    warn: 'bg-warn-soft text-ink',
    danger: 'bg-danger-soft text-ink',
    ok: 'bg-ok-soft text-ink',
  }
  const iconTone = { info: 'text-jade', warn: 'text-warn', danger: 'text-danger', ok: 'text-ok' }
  return (
    <div className={cx('flex gap-3 rounded-2xl p-4 text-sm leading-relaxed', tones[tone], className)}>
      {icon && <span className={cx('mt-0.5 shrink-0', iconTone[tone])}>{icon}</span>}
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function ProgressRing({ value, size = 64, stroke = 6, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value))
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--jade)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

export function PageHeader({ eyebrow, title, subtitle, right }: { eyebrow?: string; title: string; subtitle?: ReactNode; right?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-4 pt-6 pb-5">
      <div className="min-w-0">
        {eyebrow && <Eyebrow className="mb-1.5">{eyebrow}</Eyebrow>}
        <Title>{title}</Title>
        {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}

export function BackLink({ to, label = 'Voltar' }: { to: string; label?: string }) {
  return (
    <Link to={to} className="inline-flex h-10 items-center gap-1 rounded-full pr-3 text-sm font-semibold text-jade">
      <ChevronDown className="size-4 rotate-90" />
      {label}
    </Link>
  )
}

export function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
}) {
  const cls = 'w-full rounded-2xl border border-line bg-bg px-4 py-3 text-ink placeholder:text-ink-faint focus:border-jade focus:outline-none'
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-ink">
        {label}
      </label>
      {multiline ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls} />
      ) : (
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cx(cls, 'h-12 py-0')} />
      )}
    </div>
  )
}
