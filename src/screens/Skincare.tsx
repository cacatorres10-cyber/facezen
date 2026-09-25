import { AlertTriangle, Check, Minus, Moon, Plus, Settings2, Sun } from 'lucide-react'
import { useState } from 'react'
import { WEEKDAYS } from '../content/profileOptions'
import { Photo } from '../components/Photo'
import { Button, Card, cx, Eyebrow, Note, Segmented, Sheet, Title, Toggle } from '../components/ui'
import { dayKey, isMorning } from '../lib/dates'
import { morningRoutine, NIGHT_LABEL, nightKind, nightRoutine, skinLabel, type RoutineStep } from '../lib/skincare'
import { useStore } from '../lib/store'

export function Skincare() {
  const profile = useStore((s) => s.profile)!
  const prefs = useStore((s) => s.skincarePrefs)
  const skincare = useStore((s) => s.skincare)
  const toggleStep = useStore((s) => s.toggleSkincareStep)
  const setReapplications = useStore((s) => s.setReapplications)
  const [period, setPeriod] = useState<'manha' | 'noite'>(isMorning() ? 'manha' : 'noite')
  const [prefsOpen, setPrefsOpen] = useState(false)

  const now = new Date()
  const today = dayKey(now)
  const day = skincare[today] ?? { manha: [], noite: [], reaplicacoes: 0 }
  const night = nightRoutine(profile, prefs, now.getDay())
  const steps: RoutineStep[] = period === 'manha' ? morningRoutine(profile, prefs) : night.steps
  const doneList = day[period]
  const done = steps.filter((s) => doneList.includes(s.id)).length

  return (
    <div className="pb-28">
      <div className="relative">
        <Photo k="produtos" className="h-52 w-full" width={1200} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg" />
      </div>
      <div className="-mt-10 px-5">
        <div className="relative flex items-end justify-between gap-3">
          <div>
            <Eyebrow>{skinLabel(profile)}</Eyebrow>
            <Title className="mt-1">Skincare</Title>
          </div>
          <Button size="sm" variant="soft" onClick={() => setPrefsOpen(true)}>
            <Settings2 className="size-4" /> Ajustar
          </Button>
        </div>

        {profile.safety.includes('gestante') && (
          <Note tone="warn" className="mt-4" icon={<AlertTriangle className="size-4" />}>
            Na gravidez ou amamentação, nada de ativo novo sem falar com seu médico.
          </Note>
        )}

        <Segmented
          className="mt-5"
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'manha', label: 'Manhã' },
            { value: 'noite', label: 'Noite' },
          ]}
        />

        <Card className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-surface-2 text-jade">{period === 'manha' ? <Sun className="size-5" /> : <Moon className="size-5" />}</span>
              <div>
                <p className="font-display text-xl font-medium text-ink">{period === 'manha' ? 'Rotina da manhã' : NIGHT_LABEL[night.kind]}</p>
                <p className="tnum text-sm text-ink-soft">
                  {done} de {steps.length} passos hoje
                </p>
              </div>
            </div>
            {done === steps.length && steps.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-ok-soft px-3 py-1 text-xs font-bold text-ok">
                <Check className="size-3.5" /> Feito
              </span>
            )}
          </div>

          <ol className="mt-4 grid gap-1">
            {steps.map((s, i) => {
              const on = doneList.includes(s.id)
              return (
                <li key={s.id}>
                  <button type="button" aria-pressed={on} onClick={() => toggleStep(today, period, s.id)} className="flex w-full gap-3 rounded-2xl py-3 text-left">
                    <span className={cx('tnum grid size-8 shrink-0 place-items-center rounded-full border-2 text-sm font-bold transition', on ? 'border-jade bg-jade text-on-jade' : 'border-line text-ink-faint')}>
                      {on ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cx('block font-semibold', on ? 'text-ink-soft line-through decoration-ink-faint' : 'text-ink')}>
                        {s.title}
                        {s.optional && <span className="ml-2 text-xs font-medium text-ink-faint no-underline">opcional</span>}
                      </span>
                      <span className="mt-0.5 block text-sm text-ink-soft">{s.detail}</span>
                      {s.warn && <span className="mt-1 block text-sm text-warn">{s.warn}</span>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          {period === 'noite' && (
            <div className="mt-2 border-t border-line pt-4">
              <p className="eyebrow mb-2">Suas noites</p>
              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAYS.map((d) => {
                  const k = nightKind(prefs, d.id, profile)
                  return (
                    <div key={d.id} className={cx('rounded-xl py-2', d.id === now.getDay() ? 'bg-jade-soft' : 'bg-surface-2/60')}>
                      <p className="text-[11px] font-bold text-ink-soft">{d.label}</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-ink-faint">{k === 'retinoide' ? 'Retin.' : k === 'acido' ? 'Esfol.' : 'Hidrat.'}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </Card>

        {period === 'manha' && (
          <Card className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-xl font-medium text-ink">Reaplicação do protetor</p>
                <p className="text-sm text-ink-soft">A cada 2 horas no sol, ou depois de suar.</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Menos uma reaplicação" onClick={() => setReapplications(today, day.reaplicacoes - 1)} className="grid size-10 place-items-center rounded-full bg-surface-2 text-ink">
                  <Minus className="size-4" />
                </button>
                <span className="tnum w-8 text-center font-display text-3xl font-medium text-jade" aria-live="polite">
                  {day.reaplicacoes}
                </span>
                <button type="button" aria-label="Mais uma reaplicação" onClick={() => setReapplications(today, day.reaplicacoes + 1)} className="grid size-10 place-items-center rounded-full bg-jade text-on-jade">
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          </Card>
        )}

      </div>

      <PrefsSheet open={prefsOpen} onClose={() => setPrefsOpen(false)} />
    </div>
  )
}

function PrefsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const prefs = useStore((s) => s.skincarePrefs)
  const update = useStore((s) => s.updateSkincarePrefs)
  const profile = useStore((s) => s.profile)!
  const pregnant = profile.safety.includes('gestante')

  const setNight = (kind: 'retinoidNights' | 'acidNights', d: number) => {
    const other = kind === 'retinoidNights' ? 'acidNights' : 'retinoidNights'
    const list = prefs[kind].includes(d) ? prefs[kind].filter((x) => x !== d) : [...prefs[kind], d]
    update({ [kind]: list, [other]: prefs[other].filter((x) => x !== d) })
  }

  return (
    <Sheet open={open} onClose={onClose} title="Minha rotina">
      <p className="text-sm text-ink-soft">Marque o que você usa.</p>
      <div className="mt-2 divide-y divide-line">
        <Toggle id="p-makeup" checked={prefs.makeup} onChange={(v) => update({ makeup: v })} label="Uso maquiagem" hint="Inclui a remoção e a limpeza dupla à noite" />
        <Toggle id="p-vitc" checked={prefs.vitC} onChange={(v) => update({ vitC: v })} label="Vitamina C pela manhã" hint="Opcional; não substitui o protetor" />
        <div className="py-3">
          <p className="font-medium text-ink">Sérum hidratante</p>
          <Segmented
            className="mt-2"
            value={prefs.serum}
            onChange={(v) => update({ serum: v })}
            options={[
              { value: 'nenhum', label: 'Nenhum' },
              { value: 'hialuronico', label: 'Hialurônico' },
              { value: 'niacinamida', label: 'Niacinamida' },
            ]}
          />
        </div>
        <Toggle id="p-eye" checked={prefs.eye} onChange={(v) => update({ eye: v })} label="Produto para olhos" />
        <Toggle id="p-toner" checked={prefs.toner} onChange={(v) => update({ toner: v })} label="Tônico à noite" />
        <Toggle id="p-oil" checked={prefs.oil} onChange={(v) => update({ oil: v })} label="Óleo facial à noite" hint="Poucas gotas, se a pele tolera" />
        <div className="py-1">
          <Toggle id="p-retinoid" checked={prefs.retinoid && !pregnant} onChange={(v) => update({ retinoid: v })} label="Retinoide cosmético" hint={pregnant ? 'Indisponível na gravidez ou amamentação sem orientação médica' : 'Comece uma noite por semana'} />
          {prefs.retinoid && !pregnant && <NightPicker selected={prefs.retinoidNights} onToggle={(d) => setNight('retinoidNights', d)} />}
        </div>
        <div className="py-1">
          <Toggle id="p-acid" checked={prefs.acid && !pregnant} onChange={(v) => update({ acid: v })} label="Esfoliante (AHA ou BHA)" hint={pregnant ? 'Confirme com obstetra ou dermatologista antes' : 'Em noites diferentes do retinoide'} />
          {prefs.acid && !pregnant && <NightPicker selected={prefs.acidNights} onToggle={(d) => setNight('acidNights', d)} />}
        </div>
      </div>
      <Note className="mt-4">Um produto novo de cada vez.</Note>
      <Button block className="mt-4" onClick={onClose}>
        Pronto
      </Button>
    </Sheet>
  )
}

function NightPicker({ selected, onToggle }: { selected: number[]; onToggle: (d: number) => void }) {
  return (
    <div className="grid grid-cols-7 gap-1 pb-3">
      {WEEKDAYS.map((d) => (
        <button
          key={d.id}
          type="button"
          aria-pressed={selected.includes(d.id)}
          onClick={() => onToggle(d.id)}
          className={cx('h-9 rounded-xl text-xs font-bold', selected.includes(d.id) ? 'bg-jade text-on-jade' : 'bg-surface-2 text-ink-soft')}
        >
          {d.label}
        </button>
      ))}
    </div>
  )
}
