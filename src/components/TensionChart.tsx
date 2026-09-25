import { useState } from 'react'
import { formatShort, fromDayKey } from '../lib/dates'
import type { SessionLog } from '../lib/store'

/**
 * Tensão percebida (média de testa e mandíbula, 0–10) antes e depois de cada sessão.
 * Forma: "halteres" — um traço por sessão ligando antes (anel) e depois (ponto cheio).
 */
export function TensionChart({ sessions }: { sessions: SessionLog[] }) {
  const data = sessions
    .filter((s) => s.before && s.afterTension)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
    .slice(-10)
    .map((s) => ({
      id: s.id,
      date: s.date,
      before: (s.before!.testa + s.before!.mandibula) / 2,
      after: (s.afterTension!.testa + s.afterTension!.mandibula) / 2,
    }))
  const [active, setActive] = useState<string | null>(null)

  if (data.length === 0) return null

  const W = 320
  const H = 170
  const pad = { l: 26, r: 10, t: 12, b: 26 }
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const x = (i: number) => pad.l + (data.length === 1 ? iw / 2 : (i * iw) / (data.length - 1))
  const y = (v: number) => pad.t + ih - (v / 10) * ih
  const avgBefore = data.reduce((s, d) => s + d.before, 0) / data.length
  const avgAfter = data.reduce((s, d) => s + d.after, 0) / data.length
  const fmt = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
  const act = data.find((d) => d.id === active)
  const actIndex = act ? data.indexOf(act) : -1
  const labelEvery = Math.ceil(data.length / 5)

  return (
    <figure>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <figcaption className="font-display text-xl font-medium text-ink">Tensão percebida</figcaption>
        <div className="flex gap-3 text-xs font-medium text-ink-soft" aria-hidden>
          <span className="inline-flex items-center gap-1.5">
            <svg width="10" height="10">
              <circle cx="5" cy="5" r="3.5" fill="var(--surface)" stroke="var(--chart-before)" strokeWidth="2" />
            </svg>
            Antes
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="10" height="10">
              <circle cx="5" cy="5" r="4.5" fill="var(--chart-after)" />
            </svg>
            Depois
          </span>
        </div>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        Média de testa e mandíbula, de 0 (solta) a 10 (muito tensa). {data.length === 1 ? 'Na última sessão' : `Nas últimas ${data.length} sessões`}: antes {fmt(avgBefore)}, depois {fmt(avgAfter)}.
      </p>

      <div className="relative mt-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" role="img" aria-label={`Tensão média antes ${fmt(avgBefore)} e depois ${fmt(avgAfter)}`}>
          {[0, 5, 10].map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth={1} strokeDasharray={v === 0 ? undefined : '2 4'} />
              <text x={pad.l - 8} y={y(v)} dy="0.32em" textAnchor="end" fontSize="10" fill="var(--ink-faint)" className="tnum">
                {v}
              </text>
            </g>
          ))}
          {actIndex >= 0 && <line x1={x(actIndex)} x2={x(actIndex)} y1={pad.t} y2={pad.t + ih} stroke="var(--ink-faint)" strokeWidth={1} opacity={0.4} />}
          {data.map((d, i) => (
            <g key={d.id}>
              <line x1={x(i)} x2={x(i)} y1={y(d.before)} y2={y(d.after)} stroke="var(--ink-faint)" strokeWidth={2} strokeLinecap="round" opacity={0.5} />
              <circle cx={x(i)} cy={y(d.before)} r={4.5} fill="var(--surface)" stroke="var(--chart-before)" strokeWidth={2} />
              <circle cx={x(i)} cy={y(d.after)} r={5} fill="var(--chart-after)" stroke="var(--surface)" strokeWidth={2} />
              {(i % labelEvery === 0 || i === data.length - 1) && (
                <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--ink-faint)">
                  {formatShort(fromDayKey(d.date))}
                </text>
              )}
              {/* Área de toque maior que a marca */}
              <rect
                x={x(i) - Math.max(12, iw / data.length / 2)}
                y={pad.t}
                width={Math.max(24, iw / data.length)}
                height={ih}
                fill="transparent"
                onPointerEnter={() => setActive(d.id)}
                onPointerDown={() => setActive(d.id)}
                onPointerLeave={() => setActive(null)}
              />
            </g>
          ))}
        </svg>
        {act && (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-xs whitespace-nowrap text-bg shadow-soft"
            style={{ left: `${(x(actIndex) / W) * 100}%` }}
          >
            <p className="font-semibold">{formatShort(fromDayKey(act.date))}</p>
            <p className="tnum">
              Antes {fmt(act.before)} · Depois {fmt(act.after)}
            </p>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-ink-faint">Relaxamento percebido é um bom sinal de técnica; não é medida de mudança anatômica.</p>
    </figure>
  )
}
