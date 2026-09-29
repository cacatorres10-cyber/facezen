import { AlertTriangle, Check, Lightbulb, Minus, Moon, Plus, ShoppingBag, Sun } from 'lucide-react'
import { useState } from 'react'
import { WEEKDAYS } from '../content/profileOptions'
import { Photo } from '../components/Photo'
import { SkincareHistory } from '../components/SkincareHistory'
import { Button, Card, Chip, cx, Eyebrow, Note, Segmented, Sheet, Title } from '../components/ui'
import { isMorning } from '../lib/dates'
import { morningRoutine, NIGHT_LABEL, nightKind, nightRoutine, PRODUCT_GROUPS, skinLabel, skincareAdvice, type ProductId, type RoutineStep } from '../lib/skincare'
import { useStore } from '../lib/store'
import { useToday } from '../lib/useToday'

const NO_PRODUCTS: ProductId[] = []

export function Skincare() {
  const profile = useStore((s) => s.profile)!
  const products = useStore((s) => s.products)
  const skincare = useStore((s) => s.skincare)
  const toggleStep = useStore((s) => s.toggleSkincareStep)
  const setReapplications = useStore((s) => s.setReapplications)
  const [period, setPeriod] = useState<'manha' | 'noite'>(isMorning() ? 'manha' : 'noite')
  const [productsOpen, setProductsOpen] = useState(false)

  const today = useToday()
  const now = new Date()
  const mine = products ?? NO_PRODUCTS
  const day = skincare[today] ?? { manha: [], noite: [], reaplicacoes: 0 }
  const night = nightRoutine(profile, mine, now.getDay())
  const steps: RoutineStep[] = period === 'manha' ? morningRoutine(profile, mine) : night.steps
  const doneList = day[period]
  const done = steps.filter((s) => doneList.includes(s.id)).length
  const advice = products ? skincareAdvice(profile, mine) : []
  const fixes = advice.filter((a) => a.tone === 'fix')
  const tips = advice.filter((a) => a.tone === 'tip')
  const hasActives = mine.includes('retinol') || mine.includes('acido')

  return (
    <div className="pb-28">
      <div className="relative">
        <Photo k="creme" className="h-48 w-full" position="50% 30%" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg" />
      </div>
      <div className="-mt-10 px-5">
        <Eyebrow className="relative">{skinLabel(profile)}</Eyebrow>
        <Title className="relative mt-1">Skincare</Title>

        {products === null ? (
          <Card className="mt-4 bg-hero text-on-hero">
            <p className="font-display text-2xl leading-tight font-medium">Monte sua rotina com o que você já tem</p>
            <p className="mt-2 text-sm text-on-hero/85">Marque os produtos que usa. Mostramos como usar cada um, na ordem certa, e o que vale ajustar.</p>
            <Button variant="quartz" className="mt-4" onClick={() => setProductsOpen(true)}>
              <ShoppingBag className="size-4" /> Contar meus produtos
            </Button>
          </Card>
        ) : (
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-sm text-ink-soft">
              Rotina feita com seus {mine.length} {mine.length === 1 ? 'produto' : 'produtos'}.
            </p>
            <button type="button" onClick={() => setProductsOpen(true)} className="shrink-0 text-sm font-semibold text-jade">
              Editar produtos
            </button>
          </div>
        )}

        {fixes.length > 0 && (
          <section className="mt-5" aria-label="O que ajustar">
            <p className="eyebrow mb-2">O que ajustar</p>
            <div className="grid gap-2">
              {fixes.map((a) => (
                <div key={a.id} className="flex gap-3 rounded-2xl bg-warn-soft p-4">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
                  <div>
                    <p className="font-semibold text-ink">{a.title}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">{a.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tips.length > 0 && (
          <section className="mt-4" aria-label="Pode valer a pena">
            <p className="eyebrow mb-2">{fixes.length ? 'Depois' : 'Seu próximo passo'}</p>
            <div className="grid gap-2">
              {tips.map((a) => (
                <div key={a.id} className="flex gap-3 rounded-2xl bg-jade-soft p-4">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-jade" />
                  <div>
                    <p className="font-semibold text-ink">{a.title}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">{a.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-faint">Um produto novo de cada vez. Teste antes numa área pequena, como atrás da orelha.</p>
          </section>
        )}

        <Segmented
          className="mt-6"
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
                <p className="font-display text-xl font-medium text-ink">{period === 'manha' ? 'Manhã' : night.kind === 'hidratacao' ? 'Noite' : NIGHT_LABEL[night.kind]}</p>
                <p className="tnum text-sm text-ink-soft">
                  {done} de {steps.length} hoje · zera à meia-noite
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
                      <span className={cx('flex flex-wrap items-center gap-x-2 font-semibold', on ? 'text-ink-soft line-through decoration-ink-faint' : 'text-ink')}>
                        {s.title}
                        {s.missing && products !== null && <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[11px] font-bold text-warn no-underline">falta</span>}
                        {s.optional && <span className="text-xs font-medium text-ink-faint">opcional</span>}
                      </span>
                      <span className="mt-0.5 block text-sm text-ink-soft">{s.detail}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          {period === 'noite' && hasActives && (
            <div className="mt-2 border-t border-line pt-4">
              <p className="eyebrow mb-2">Suas noites</p>
              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAYS.map((d) => {
                  const k = nightKind(mine, d.id, profile)
                  return (
                    <div key={d.id} className={cx('rounded-xl py-2', d.id === now.getDay() ? 'bg-jade-soft' : 'bg-surface-2/60')}>
                      <p className="text-[11px] font-bold text-ink-soft">{d.label}</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-ink-faint">{k === 'retinoide' ? 'Retinol' : k === 'acido' ? 'Ácido' : 'Hidrat.'}</p>
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
                <p className="font-display text-xl font-medium text-ink">Reaplicou o protetor?</p>
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

        <Card className="mt-4">
          <SkincareHistory skincare={skincare} today={today} />
        </Card>

        {profile.safety.includes('gestante') && (
          <Note tone="warn" className="mt-4">
            Na gravidez ou amamentação, confirme qualquer ativo com seu médico.
          </Note>
        )}
        <p className="mt-4 text-xs text-ink-faint">Orientações gerais de cuidado com a pele. Para manchas, acne ou irritação que não passa, procure um dermatologista.</p>
      </div>

      <ProductsSheet open={productsOpen} onClose={() => setProductsOpen(false)} />
    </div>
  )
}

function ProductsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const saved = useStore((s) => s.products)
  const setProducts = useStore((s) => s.setProducts)
  const [picked, setPicked] = useState<ProductId[]>(saved ?? [])
  const toggle = (id: ProductId) => setPicked((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]))

  return (
    <Sheet open={open} onClose={onClose} title="Seus produtos">
      <p className="text-sm text-ink-soft">Marque o que você tem em casa e usa. Não precisa ter tudo.</p>
      <div className="mt-4 grid gap-5">
        {PRODUCT_GROUPS.map((g) => (
          <div key={g.title}>
            <p className="mb-2 text-sm font-semibold text-ink">{g.title}</p>
            <div className="flex flex-wrap gap-2">
              {g.items.map((p) => (
                <Chip key={p.id} selected={picked.includes(p.id)} onClick={() => toggle(p.id)}>
                  {p.label}
                  {p.hint && <span className="text-xs opacity-70">({p.hint})</span>}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Button
        block
        size="lg"
        className="mt-6"
        onClick={() => {
          setProducts(picked)
          onClose()
        }}
      >
        Montar minha rotina
      </Button>
    </Sheet>
  )
}
