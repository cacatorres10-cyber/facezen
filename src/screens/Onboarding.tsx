import { ArrowLeft, ArrowRight, Smartphone, Sparkles, Timer } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GOALS, regionsForGoals, SAFETY_OPTIONS, SKIN_BASES, WEEKDAYS } from '../content/profileOptions'
import type { SafetyFlag } from '../content/types'
import { FaceMap } from '../components/FaceMap'
import { Wordmark } from '../components/Logo'
import { Photo } from '../components/Photo'
import { Button, cx, Eyebrow, OptionCard, Segmented, Title, Toggle } from '../components/ui'
import { daysLabel } from '../lib/files'
import { defaultPrefsFor, useStore, type Profile } from '../lib/store'

const STEPS = ['boas-vindas', 'nome', 'objetivos', 'pele', 'rotina', 'saude', 'resumo'] as const

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v]
}

export function Onboarding() {
  const navigate = useNavigate()
  const existing = useStore((s) => s.profile)
  const onboarded = useStore((s) => s.onboarded)
  const completeOnboarding = useStore((s) => s.completeOnboarding)
  const currentPrefs = useStore((s) => s.skincarePrefs)

  const [i, setI] = useState(onboarded ? 1 : 0)
  const [p, setP] = useState<Profile>(
    () =>
      existing ?? {
        name: '',
        goals: [],
        focus: [],
        skinBase: 'normal',
        sensitive: false,
        mature: false,
        concerns: [],
        experience: 'nunca',
        minutes: 10,
        days: [1, 3, 5],
        time: '07:30',
        safety: [],
        createdAt: new Date().toISOString(),
      },
  )
  const [noneSafety, setNoneSafety] = useState(!!existing && existing.safety.length === 0)

  const step = STEPS[i]
  const set = (patch: Partial<Profile>) => setP((prev) => ({ ...prev, ...patch }))
  const regions = regionsForGoals(p.goals)

  const canNext = useMemo(() => {
    if (step === 'nome') return p.name.trim().length > 0
    if (step === 'objetivos') return p.goals.length > 0
    if (step === 'rotina') return p.days.length >= 3
    if (step === 'saude') return noneSafety || p.safety.length > 0
    return true
  }, [step, p, noneSafety])

  const next = () => {
    if (step === 'resumo') {
      const profile: Profile = { ...p, name: p.name.trim(), focus: regions, concerns: p.goals.includes('pele') ? ['tom'] : [] }
      const prefs = onboarded ? { ...currentPrefs, ...(profile.safety.includes('gestante') ? { retinoid: false, acid: false } : {}) } : defaultPrefsFor(profile)
      completeOnboarding(profile, prefs)
      navigate('/', { replace: true })
      return
    }
    setI((n) => n + 1)
    window.scrollTo({ top: 0 })
  }
  const back = () => {
    if (onboarded && i === 1) return navigate(-1)
    setI((n) => Math.max(0, n - 1))
    window.scrollTo({ top: 0 })
  }

  if (step === 'boas-vindas') {
    return (
      <div className="flex min-h-full flex-col bg-bg">
        <div className="relative">
          <Photo k="toque" eager className="aspect-square w-full rounded-b-[40px]" position="50% 25%" />
          <div className="absolute top-[calc(env(safe-area-inset-top,0px)+16px)] left-5 rounded-full bg-surface/90 px-3 py-1.5 backdrop-blur">
            <Wordmark className="[&_svg]:size-6 [&>span:last-child]:text-xl" />
          </div>
        </div>
        <div className="flex flex-1 flex-col px-5 pt-7 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          <Title className="text-[2.35rem]">
            Seu rosto merece <em className="text-rose-ink">10 minutos</em> por dia.
          </Title>
          <p className="mt-3 text-[16px] text-ink-soft">Yoga facial e skincare num plano feito para você.</p>
          <ul className="mt-6 grid gap-3 text-sm text-ink-soft">
            <li className="flex items-center gap-3">
              <Sparkles className="size-4 text-jade" /> Plano de 8 semanas
            </li>
            <li className="flex items-center gap-3">
              <Timer className="size-4 text-jade" /> Aulas em vídeo e sessões guiadas
            </li>
            <li className="flex items-center gap-3">
              <Smartphone className="size-4 text-jade" /> Sem cadastro: fica salvo no seu celular
            </li>
          </ul>
          <div className="mt-auto pt-8">
            <Button size="lg" block onClick={next}>
              Começar <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const progress = i / (STEPS.length - 1)

  return (
    <div className="flex min-h-full flex-col bg-bg">
      <div className="sticky top-[env(safe-area-inset-top,0px)] z-10 bg-bg/95 px-5 pt-4 pb-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button type="button" onClick={back} aria-label="Voltar" className="grid size-10 place-items-center rounded-full bg-surface text-ink shadow-soft">
            <ArrowLeft className="size-5" />
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-jade transition-all duration-500" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>

      <div key={step} className="animate-rise flex-1 px-5 pt-4 pb-32">
        {step === 'nome' && (
          <section>
            <Title>Como podemos te chamar?</Title>
            <label htmlFor="fz-name" className="sr-only">
              Seu nome
            </label>
            <input
              id="fz-name"
              autoFocus
              value={p.name}
              onChange={(e) => set({ name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && canNext && next()}
              placeholder="Seu nome"
              maxLength={40}
              autoComplete="given-name"
              className="mt-6 h-14 w-full rounded-2xl border border-line bg-surface px-4 text-lg text-ink placeholder:text-ink-faint focus:border-jade focus:outline-none"
            />
          </section>
        )}

        {step === 'objetivos' && (
          <section>
            <Title>{p.name.trim()}, o que você quer melhorar?</Title>
            <p className="mt-2 text-ink-soft">Escolha quantos quiser.</p>
            <div className="mx-auto mt-2 w-[min(100%,170px)]">
              <FaceMap selected={regions} showHints />
            </div>
            <div className="mt-2 grid gap-2">
              {GOALS.map((g) => (
                <OptionCard key={g.id} multi selected={p.goals.includes(g.id)} onClick={() => set({ goals: toggle(p.goals, g.id) })} title={g.label} hint={g.hint} />
              ))}
            </div>
          </section>
        )}

        {step === 'pele' && (
          <section>
            <Title>Como é a sua pele?</Title>
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              {SKIN_BASES.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={p.skinBase === o.id}
                  onClick={() => set({ skinBase: o.id })}
                  className={cx('rounded-2xl border p-4 text-left transition', p.skinBase === o.id ? 'border-jade bg-jade-soft' : 'border-line bg-surface')}
                >
                  <span className="block font-display text-xl font-medium text-ink">{o.label}</span>
                  <span className="mt-0.5 block text-sm text-ink-soft">{o.hint}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-surface px-4 shadow-soft">
              <Toggle checked={p.sensitive} onChange={(v) => set({ sensitive: v })} label="É sensível" hint="Arde ou fica vermelha com facilidade" />
            </div>
          </section>
        )}

        {step === 'rotina' && (
          <section>
            <Title>Quando você vai praticar?</Title>
            <p className="mt-6 mb-2 font-semibold text-ink">Tempo por dia</p>
            <Segmented
              value={p.minutes}
              onChange={(v) => set({ minutes: v })}
              options={[
                { value: 5, label: '5 min' },
                { value: 10, label: '10 min' },
              ]}
            />
            <p className="mt-6 mb-2 font-semibold text-ink">Dias da semana</p>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAYS.map((d) => {
                const on = p.days.includes(d.id)
                return (
                  <button
                    key={d.id}
                    type="button"
                    aria-pressed={on}
                    aria-label={d.label}
                    disabled={!on && p.days.length >= 6}
                    onClick={() => set({ days: toggle(p.days, d.id) })}
                    className={cx(
                      'aspect-square rounded-2xl border text-sm font-bold transition disabled:opacity-35',
                      on ? 'border-jade bg-jade text-on-jade' : 'border-line bg-surface text-ink-soft',
                    )}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
            <p className={cx('mt-2 text-sm', p.days.length < 3 ? 'text-danger' : 'text-ink-faint')}>De 3 a 6 dias. Descansar também faz parte.</p>
            <label htmlFor="fz-time" className="mt-6 mb-2 block font-semibold text-ink">
              Horário
            </label>
            <input
              id="fz-time"
              type="time"
              value={p.time}
              onChange={(e) => set({ time: e.target.value || '07:30' })}
              className="h-12 w-40 rounded-2xl border border-line bg-surface px-4 text-lg text-ink focus:border-jade focus:outline-none"
            />
          </section>
        )}

        {step === 'saude' && (
          <section>
            <Title>Algo disso vale para você?</Title>
            <p className="mt-2 text-ink-soft">Assim deixamos de fora o que não é para você agora.</p>
            <div className="mt-5 grid gap-2">
              {SAFETY_OPTIONS.map((o) => (
                <OptionCard
                  key={o.id}
                  multi
                  selected={p.safety.includes(o.id)}
                  onClick={() => {
                    setNoneSafety(false)
                    set({ safety: toggle(p.safety, o.id as SafetyFlag) })
                  }}
                  title={o.label}
                  hint={o.hint}
                />
              ))}
              <OptionCard
                multi
                selected={noneSafety}
                onClick={() => {
                  setNoneSafety(!noneSafety)
                  set({ safety: [] })
                }}
                title="Nenhuma"
              />
            </div>
          </section>
        )}

        {step === 'resumo' && (
          <section>
            <Eyebrow>Seu plano</Eyebrow>
            <Title className="mt-1">Tudo pronto, {p.name.trim()}!</Title>
            <div className="mt-6 grid grid-cols-[110px_1fr] items-center gap-4 rounded-3xl bg-hero p-5 text-on-hero shadow-soft">
              <div className="rounded-2xl bg-surface p-2">
                <FaceMap selected={regions} />
              </div>
              <div>
                <p className="font-display text-2xl leading-tight font-medium">8 semanas, {p.minutes} min por dia</p>
                <p className="mt-2 text-sm text-on-hero/85">
                  {daysLabel(p.days)}, às {p.time}. Começa leve e aumenta aos poucos.
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm text-ink-faint">
              O FaceZen é autocuidado e não substitui um profissional de saúde. Se sentir dor, ardor ou tontura, pare.
            </p>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[480px] bg-gradient-to-t from-bg via-bg to-transparent px-5 pt-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <Button size="lg" block disabled={!canNext} onClick={next}>
          {step === 'resumo' ? (onboarded ? 'Salvar' : 'Começar minha jornada') : 'Continuar'}
          <ArrowRight className="size-5" />
        </Button>
      </div>
    </div>
  )
}
