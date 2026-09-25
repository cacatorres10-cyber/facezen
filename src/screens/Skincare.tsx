import { AlertTriangle, BookOpen, Check, FlaskConical, Minus, Moon, Plus, Settings2, Sun, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { WEEKDAYS } from '../content/profileOptions'
import { GOLDEN_RULE, REAPPLY_TIPS } from '../content/skincare'
import { Photo } from '../components/Photo'
import { Accordion, Button, Card, Chip, cx, Eyebrow, Note, Segmented, Sheet, Title, Toggle } from '../components/ui'
import { addDays, daysBetween, dayKey, formatShort, fromDayKey, isMorning } from '../lib/dates'
import { morningRoutine, NIGHT_LABEL, nightKind, nightRoutine, recipesFor, skinLabel, type RoutineStep } from '../lib/skincare'
import { useStore, type PatchTest } from '../lib/store'

export function Skincare() {
  const profile = useStore((s) => s.profile)!
  const prefs = useStore((s) => s.skincarePrefs)
  const skincare = useStore((s) => s.skincare)
  const toggleStep = useStore((s) => s.toggleSkincareStep)
  const setReapplications = useStore((s) => s.setReapplications)
  const location = useLocation()
  const [period, setPeriod] = useState<'manha' | 'noite'>(isMorning() ? 'manha' : 'noite')
  const [prefsOpen, setPrefsOpen] = useState(false)

  const now = new Date()
  const today = dayKey(now)
  const day = skincare[today] ?? { manha: [], noite: [], reaplicacoes: 0 }
  const night = nightRoutine(profile, prefs, now.getDay())
  const steps: RoutineStep[] = period === 'manha' ? morningRoutine(profile, prefs) : night.steps
  const doneList = day[period]
  const done = steps.filter((s) => doneList.includes(s.id)).length
  const recipes = recipesFor(profile)

  useEffect(() => {
    if (location.hash === '#teste') document.getElementById('teste')?.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash])

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
        <p className="mt-2 text-ink-soft">Suporte de barreira e proteção. Um creme melhora sensação e aparência superficial; não muda a anatomia do rosto.</p>

        {profile.safety.includes('gestante') && (
          <Note tone="warn" className="mt-4" icon={<AlertTriangle className="size-4" />}>
            Gravidez ou amamentação: não introduza retinoide, ácido, óleo essencial, fragrância ou procedimento novo sem confirmar com obstetra, dermatologista ou farmacêutico.
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
              <p className="mt-3 text-xs text-ink-faint">
                Esfoliação suave e máscara de argila são opcionais, não etapas diárias. Reduza ou suspenda diante de ardor, descamação ou sensibilidade.
              </p>
            </div>
          )}
        </Card>

        {period === 'manha' && (
          <Card className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-xl font-medium text-ink">Reaplicação do protetor</p>
                <p className="text-sm text-ink-soft">Conforme o rótulo e a exposição.</p>
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
            <Accordion title="Como reaplicar">
              <ul className="grid gap-2 text-sm">
                {REAPPLY_TIPS.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-quartz" />
                    {t}
                  </li>
                ))}
              </ul>
            </Accordion>
          </Card>
        )}

        {/* Receitas */}
        <section className="mt-8" aria-label="Sua receita">
          <h2 className="font-display text-2xl font-medium text-ink">Sua receita</h2>
          <p className="mt-1 text-sm text-ink-soft">Combinações de etapas, não misturas caseiras. Nada de limão, bicarbonato, açúcar ou óleos essenciais no rosto.</p>
          <div className="mt-3 grid gap-3">
            {recipes.map((r, i) => (
              <article key={r.id} className={cx('rounded-3xl p-5', i === 0 ? 'bg-hero text-on-hero shadow-soft' : 'bg-surface shadow-soft')}>
                <p className={cx('eyebrow', i === 0 && '!text-on-hero/70')}>{r.forWhom}</p>
                <h3 className="mt-1 font-display text-2xl font-medium">{r.title}</h3>
                <dl className={cx('mt-3 grid gap-2 text-sm', i === 0 ? 'text-on-hero/90' : 'text-ink-soft')}>
                  <RecipeRow label="Manhã" text={r.morning} />
                  <RecipeRow label="Noite" text={r.night} />
                  {r.active && <RecipeRow label="Ativo" text={r.active} />}
                  <RecipeRow label="Yoga" text={r.yoga} />
                  {r.extra && <p className="pt-1">{r.extra}</p>}
                </dl>
              </article>
            ))}
          </div>
        </section>

        <PatchTests />

        <Card className="mt-8">
          <p className="font-display text-xl font-medium text-ink">A regra de ouro</p>
          <p className="mt-1 text-ink-soft">{GOLDEN_RULE}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/guia/ingredientes" className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3.5 py-2 text-sm font-semibold text-ink">
              <BookOpen className="size-4" /> Ingredientes
            </Link>
            <Link to="/guia/ordem" className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3.5 py-2 text-sm font-semibold text-ink">
              Ordem de aplicação
            </Link>
            <Link to="/guia/tipos-de-pele" className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3.5 py-2 text-sm font-semibold text-ink">
              Tipos de pele
            </Link>
          </div>
        </Card>
      </div>

      <PrefsSheet open={prefsOpen} onClose={() => setPrefsOpen(false)} />
    </div>
  )
}

function RecipeRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="grid grid-cols-[56px_1fr] gap-2">
      <dt className="font-bold">{label}</dt>
      <dd>{text}</dd>
    </div>
  )
}

function PatchTests() {
  const tests = useStore((s) => s.patchTests)
  const add = useStore((s) => s.addPatchTest)
  const [product, setProduct] = useState('')
  const [area, setArea] = useState('Atrás da orelha')
  const [adding, setAdding] = useState(false)

  return (
    <section id="teste" className="mt-8 scroll-mt-6" aria-label="Teste de contato">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-medium text-ink">Teste de contato</h2>
          <p className="mt-1 text-sm text-ink-soft">Produto novo? Aplique numa área pequena duas vezes ao dia por 7 a 10 dias antes de levar ao rosto.</p>
        </div>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" /> Novo
          </Button>
        )}
      </div>

      {adding && (
        <Card className="mt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!product.trim()) return
              add(product.trim(), area.trim() || 'Área pequena')
              setProduct('')
              setAdding(false)
            }}
            className="grid gap-3"
          >
            <div>
              <label htmlFor="pt-product" className="mb-1 block text-sm font-semibold text-ink">
                Qual produto?
              </label>
              <input id="pt-product" autoFocus value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Ex.: sérum de vitamina C" className="h-12 w-full rounded-2xl border border-line bg-bg px-4 text-ink focus:border-jade focus:outline-none" />
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold text-ink">Onde vai testar?</p>
              <div className="flex flex-wrap gap-2">
                {['Atrás da orelha', 'Lateral do pescoço', 'Parte interna do braço'].map((a) => (
                  <Chip key={a} selected={area === a} onClick={() => setArea(a)}>
                    {a}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={!product.trim()}>
                Começar teste
              </Button>
              <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-3 grid gap-3">
        {tests.map((t) => (
          <PatchCard key={t.id} t={t} />
        ))}
        {tests.length === 0 && !adding && (
          <div className="flex items-center gap-3 rounded-3xl border border-dashed border-line p-4 text-sm text-ink-soft">
            <FlaskConical className="size-5 shrink-0 text-jade" />
            Nenhum teste em andamento. Uma variável por vez: um produto novo de cada vez.
          </div>
        )}
      </div>
    </section>
  )
}

function PatchCard({ t }: { t: PatchTest }) {
  const check = useStore((s) => s.checkPatchTest)
  const setStatus = useStore((s) => s.setPatchStatus)
  const remove = useStore((s) => s.deletePatchTest)
  const today = dayKey()
  const dayNum = daysBetween(t.startDate, today) + 1
  const days = Array.from({ length: 10 }, (_, i) => addDays(t.startDate, i))
  const okDays = Object.values(t.checks).filter((v) => v === 'ok').length
  const reaction = Object.values(t.checks).includes('reacao')
  const active = t.status === 'andamento'

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink">{t.product}</p>
          <p className="text-sm text-ink-soft">
            {t.area} · desde {formatShort(fromDayKey(t.startDate))}
          </p>
        </div>
        <span
          className={cx(
            'shrink-0 rounded-full px-3 py-1 text-xs font-bold',
            t.status === 'aprovado' ? 'bg-ok-soft text-ok' : t.status === 'suspenso' ? 'bg-danger-soft text-danger' : 'bg-jade-soft text-jade',
          )}
        >
          {t.status === 'aprovado' ? 'Tolerado' : t.status === 'suspenso' ? 'Suspenso' : `Dia ${Math.min(dayNum, 10)} de 10`}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-10 gap-1" aria-label="Dias do teste">
        {days.map((d, i) => {
          const v = t.checks[d]
          return (
            <div
              key={d}
              title={formatShort(fromDayKey(d))}
              className={cx(
                'tnum grid aspect-square place-items-center rounded-lg text-[11px] font-bold',
                v === 'ok' ? 'bg-ok-soft text-ok' : v === 'reacao' ? 'bg-danger-soft text-danger' : d === today ? 'ring-2 ring-jade text-ink' : 'bg-surface-2 text-ink-faint',
              )}
            >
              {v === 'ok' ? <Check className="size-3" strokeWidth={3} /> : v === 'reacao' ? '!' : i + 1}
            </div>
          )
        })}
      </div>

      {active && dayNum <= 10 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink">Hoje a área está:</span>
          <Chip selected={t.checks[today] === 'ok'} onClick={() => check(t.id, today, t.checks[today] === 'ok' ? null : 'ok')}>
            Tranquila
          </Chip>
          <Chip selected={t.checks[today] === 'reacao'} onClick={() => check(t.id, today, t.checks[today] === 'reacao' ? null : 'reacao')}>
            Vermelha, coçando ou inchada
          </Chip>
        </div>
      )}

      {active && reaction && (
        <Note tone="danger" className="mt-4">
          Suspenda o produto. Lave suavemente, simplifique a rotina e observe. Se a reação for intensa ou não melhorar, procure dermatologista.
          <div className="mt-2">
            <Button size="sm" variant="danger" onClick={() => setStatus(t.id, 'suspenso')}>
              Marcar como suspenso
            </Button>
          </div>
        </Note>
      )}
      {active && !reaction && okDays >= 7 && (
        <Note tone="ok" className="mt-4">
          {okDays} dias sem reação. Se quiser, introduza no rosto aos poucos, sozinho, e observe.
          <div className="mt-2">
            <Button size="sm" onClick={() => setStatus(t.id, 'aprovado')}>
              Concluir teste
            </Button>
          </div>
        </Note>
      )}
      {!active && (
        <button type="button" onClick={() => remove(t.id)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-faint">
          <Trash2 className="size-4" /> Remover
        </button>
      )}
    </Card>
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
      <p className="text-sm text-ink-soft">Marque só o que você já usa ou quer usar. A rotina se ajusta ao seu tipo de pele.</p>
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
      <Note className="mt-4">{GOLDEN_RULE}</Note>
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
