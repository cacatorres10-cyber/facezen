import type { RegionId } from '../content/types'
import { regionById } from '../content/exercises'
import { cx } from './ui'

/**
 * Mapa do rosto em traço fino, com as sete regiões do FaceZen.
 * Interativo no onboarding e na biblioteca; decorativo nas sessões.
 */

type Shape = { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number; rotate?: number } | { kind: 'path'; d: string } | { kind: 'rect'; x: number; y: number; w: number; h: number }

const REGION_SHAPES: Record<RegionId, Shape[]> = {
  testa: [{ kind: 'path', d: 'M58 80 C60 50 140 50 142 80 C124 72 76 72 58 80 Z' }],
  olhos: [
    { kind: 'ellipse', cx: 76, cy: 101, rx: 17, ry: 10 },
    { kind: 'ellipse', cx: 124, cy: 101, rx: 17, ry: 10 },
  ],
  bochechas: [
    { kind: 'ellipse', cx: 66, cy: 130, rx: 14, ry: 13 },
    { kind: 'ellipse', cx: 134, cy: 130, rx: 14, ry: 13 },
  ],
  bigode: [
    { kind: 'ellipse', cx: 86, cy: 145, rx: 5, ry: 13, rotate: 18 },
    { kind: 'ellipse', cx: 114, cy: 145, rx: 5, ry: 13, rotate: -18 },
  ],
  mandibula: [
    { kind: 'path', d: 'M49 146 C55 170 74 190 93 197 L95 188 C79 181 64 166 58 144 Z' },
    { kind: 'path', d: 'M151 146 C145 170 126 190 107 197 L105 188 C121 181 136 166 142 144 Z' },
  ],
  papada: [{ kind: 'ellipse', cx: 100, cy: 207, rx: 21, ry: 7 }],
  pescoco: [{ kind: 'rect', x: 80, y: 218, w: 40, h: 24 }],
}

function ShapeEl({ s, className }: { s: Shape; className?: string }) {
  if (s.kind === 'ellipse')
    return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} transform={s.rotate ? `rotate(${s.rotate} ${s.cx} ${s.cy})` : undefined} className={className} />
  if (s.kind === 'rect') return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={9} className={className} />
  return <path d={s.d} className={className} />
}

export function FaceMap({
  selected = [],
  highlight,
  onToggle,
  className,
  showHints = false,
}: {
  selected?: RegionId[]
  highlight?: RegionId
  onToggle?: (r: RegionId) => void
  className?: string
  showHints?: boolean
}) {
  const interactive = !!onToggle
  const regions = Object.keys(REGION_SHAPES) as RegionId[]
  return (
    <svg viewBox="0 0 200 262" className={cx('h-auto w-full', className)} role={interactive ? 'group' : 'img'} aria-label={interactive ? 'Mapa do rosto: toque nas regiões' : 'Ilustração do rosto'}>
      {/* Regiões */}
      {regions.map((r) => {
        const active = selected.includes(r) || highlight === r
        const dim = highlight && highlight !== r
        const label = regionById(r).label
        return (
          <g
            key={r}
            role={interactive ? 'checkbox' : undefined}
            aria-checked={interactive ? selected.includes(r) : undefined}
            aria-label={interactive ? label : undefined}
            tabIndex={interactive ? 0 : undefined}
            onClick={interactive ? () => onToggle(r) : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onToggle(r)
                    }
                  }
                : undefined
            }
            className={cx(interactive && 'cursor-pointer outline-none [&:focus-visible>*]:stroke-jade')}
          >
            {REGION_SHAPES[r].map((s, i) => (
              <ShapeEl
                key={i}
                s={s}
                className={cx(
                  'transition-[fill,stroke,opacity] duration-300',
                  active ? 'fill-quartz stroke-rose-ink' : showHints || interactive ? 'fill-quartz-soft stroke-line' : 'fill-transparent stroke-transparent',
                  dim && 'opacity-30',
                )}
              />
            ))}
          </g>
        )
      })}

      {/* Traço do rosto */}
      <g fill="none" stroke="var(--ink)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" opacity={0.82}>
        <path d="M100 28 C62 28 42 58 42 100 C42 122 45 140 52 156 C60 176 78 196 100 200 C122 196 140 176 148 156 C155 140 158 122 158 100 C158 58 138 28 100 28 Z" />
        <path d="M43 104 C35 104 33 126 45 130" />
        <path d="M157 104 C165 104 167 126 155 130" />
        <path d="M60 60 C74 44 96 40 112 44 C128 48 140 58 146 72" opacity={0.45} />
        <path d="M62 88 C70 82 82 82 88 86" />
        <path d="M112 86 C118 82 130 82 138 88" />
        <path d="M65 103 C71 109 81 109 87 103" />
        <path d="M113 103 C119 109 129 109 135 103" />
        <path d="M100 98 C99 114 95 126 96 132 C98 136 104 136 106 133" />
        <path d="M86 157 C92 153 97 154 100 155 C103 154 108 153 114 157" />
        <path d="M89 158 C95 164 105 164 111 158" opacity={0.6} />
        <path d="M80 194 L78 240 C66 246 44 250 26 258" />
        <path d="M120 194 L122 240 C134 246 156 250 174 258" />
        <path d="M70 252 C82 248 92 250 99 254" opacity={0.5} />
        <path d="M130 252 C118 248 108 250 101 254" opacity={0.5} />
      </g>
    </svg>
  )
}
