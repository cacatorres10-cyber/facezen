import { WEEKDAYS } from '../content/profileOptions'
import { addDays, fromDayKey } from '../lib/dates'
import { periodStatus, type DayStatus } from '../lib/skincare'
import type { SkincareDay } from '../lib/store'
import { cx } from './ui'

const CELL: Record<DayStatus, string> = {
  completo: 'bg-jade',
  parcial: 'bg-jade/35',
  nada: 'bg-surface-2',
}

/** Últimos 14 dias de skincare: manhã e noite, completo / em parte / não feito. */
export function SkincareHistory({ skincare, today, days = 14 }: { skincare: Record<string, SkincareDay>; today: string; days?: number }) {
  const list = Array.from({ length: days }, (_, i) => addDays(today, i - days + 1))
  const full = (d: string) => periodStatus(skincare[d]?.manha, 'manha') === 'completo' && periodStatus(skincare[d]?.noite, 'noite') === 'completo'
  const doneDays = list.filter(full).length
  let streak = 0
  for (let i = list.length - 1; i >= 0; i--) {
    if (full(list[i])) streak++
    else if (i === list.length - 1) continue // hoje ainda pode estar em andamento
    else break
  }

  return (
    <figure>
      <div className="flex items-end justify-between gap-3">
        <figcaption className="font-display text-xl font-medium text-ink">Sua evolução</figcaption>
        <p className="tnum text-sm text-ink-soft">
          <b className="text-ink">{doneDays}</b> de {days} dias completos
        </p>
      </div>
      {streak > 1 && <p className="mt-1 text-sm font-semibold text-ok">{streak} dias seguidos!</p>}

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-separate border-spacing-[3px] text-center" aria-label="Skincare dos últimos dias">
          <thead>
            <tr>
              <th className="w-12" />
              {list.map((d) => (
                <th key={d} scope="col" className={cx('text-[10px] font-semibold', d === today ? 'text-jade' : 'text-ink-faint')}>
                  {WEEKDAYS[fromDayKey(d).getDay()].short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(['manha', 'noite'] as const).map((period) => (
              <tr key={period}>
                <th scope="row" className="pr-1 text-left text-xs font-semibold text-ink-soft">
                  {period === 'manha' ? 'Manhã' : 'Noite'}
                </th>
                {list.map((d) => {
                  const st = periodStatus(skincare[d]?.[period], period)
                  return (
                    <td key={d} title={`${fromDayKey(d).toLocaleDateString('pt-BR')}: ${st === 'completo' ? 'completo' : st === 'parcial' ? 'em parte' : 'não feito'}`}>
                      <span className={cx('block aspect-square min-w-4 rounded-[5px]', CELL[st], d === today && 'ring-2 ring-jade/40 ring-offset-1 ring-offset-surface')} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-ink-soft" aria-hidden>
        {(['completo', 'parcial', 'nada'] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={cx('size-3 rounded-[4px]', CELL[k])} />
            {k === 'completo' ? 'Completo' : k === 'parcial' ? 'Em parte' : 'Não feito'}
          </span>
        ))}
      </div>
    </figure>
  )
}
