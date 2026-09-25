import { ArrowLeft, ArrowRight, CalendarDays, Clock, HeartPulse, Leaf, ShieldCheck, Smartphone, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { REGIONS } from '../content/exercises'
import { DISCLAIMER } from '../content/guide'
import { EXPERIENCES, INTENTIONS, SAFETY_OPTIONS, SKIN_BASES, WEEKDAYS } from '../content/profileOptions'
import { PROGRAM } from '../content/program'
import type { RegionId, SafetyFlag } from '../content/types'
import { FaceMap } from '../components/FaceMap'
import { Wordmark } from '../components/Logo'
import { Photo } from '../components/Photo'
import { Button, Chip, cx, Eyebrow, Note, OptionCard, Segmented, Title, Toggle } from '../components/ui'
import { daysLabel } from '../lib/files'
import { FLAG_REASON } from '../lib/plan'
import { recipesFor, skinLabel } from '../lib/skincare'
import { defaultPrefsFor, useStore, type Profile, type SkinConcern } from '../lib/store'

const CONCERNS: { id: SkinConcern; label: string }[] = [
  { id: 'tom', label: 'Tom irregular ou manchas' },
  { id: 'poros', label: 'Poros e oleosidade' },
  { id: 'ressecamento', label: 'Ressecamento' },
  { id: 'sinais', label: 'Sinais de idade' },
]

const STEPS = ['boas-vindas', 'nome', 'intencao', 'regioes', 'pele', 'experiencia', 'rotina', 'saude', 'resumo'] as const

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
        intentions: [],
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
  const [accepted, setAccepted] = useState(onboarded)
  const [skinHelp, setSkinHelp] = useState(false)

  const step = STEPS[i]
  const set = (patch: Partial<Profile>) => setP((prev) => ({ ...prev, ...patch }))

  const canNext = useMemo(() => {
    switch (step) {
      case 'nome':
        return p.name.trim().length > 0
      case 'rotina':
        return p.days.length >= 3
      case 'saude':
        return noneSafety || p.safety.length > 0
      case 'resumo':
        return accepted
      default:
        return true
    }
  }, [step, p, noneSafety, accepted])

  const next = () => {
    if (step === 'resumo') {
      const profile = { ...p, name: p.name.trim() }
      const prefs = onboarded ? { ...currentPrefs, ...(profile.safety.includes('gestante') ? { retinoid: false, acid: false } : {}) } : defaultPrefsFor(profile)
      completeOnboarding(profile, prefs)
      navigate('/', { replace: true })
      return
    }
    setI((n) => Math.min(n + 1, STEPS.length - 1))
    window.scrollTo({ top: 0 })
  }
  const back = () => {
    if (i === 0 || (onboarded && i === 1)) {
      if (onboarded) navigate(-1)
      return
    }
    setI((n) => n - 1)
    window.scrollTo({ top: 0 })
  }

  if (step === 'boas-vindas') {
    return (
      <div className="flex min-h-full flex-col bg-bg">
        <div className="relative">
          <Photo k="boasVindas" eager className="aspect-[4/4.2] w-full rounded-b-[40px]" width={1200} />
          <div className="absolute top-[calc(env(safe-area-inset-top,0px)+16px)] left-5 rounded-full bg-surface/90 px-3 py-1.5 backdrop-blur">
            <Wordmark className="[&_svg]:size-6 [&>span:last-child]:text-xl" />
          </div>
        </div>
        <div className="flex flex-1 flex-col px-5 pt-7 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          <Eyebrow>Yoga facial e skincare consciente</Eyebrow>
          <Title className="mt-2 text-[2.35rem]">
            Dez minutos para <em className="text-rose-ink">voltar ao seu rosto</em>.
          </Title>
          <p className="mt-4 text-[16px] text-ink-soft">
            Uma prática guiada de toque leve, respiração e cuidado com a pele, montada para você e sem promessas milagrosas.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-ink-soft">
            <li className="flex items-center gap-3">
              <Sparkles className="size-4 text-jade" /> Programa de 8 semanas que respeita o seu ritmo
            </li>
            <li className="flex items-center gap-3">
              <Leaf className="size-4 text-jade" /> Skincare de manhã e à noite para o seu tipo de pele
            </li>
            <li className="flex items-center gap-3">
              <Smartphone className="size-4 text-jade" /> Tudo fica salvo neste aparelho, sem cadastro
            </li>
          </ul>
          <div className="mt-auto pt-8">
            <Button size="lg" block onClick={next}>
              Montar meu plano <ArrowRight className="size-5" />
            </Button>
            <p className="mt-3 text-center text-xs text-ink-faint">Leva cerca de 2 minutos.</p>
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
          <span className="tnum w-10 text-right text-xs font-semibold text-ink-faint">
            {i}/{STEPS.length - 1}
          </span>
        </div>
      </div>

      <div key={step} className="animate-rise flex-1 px-5 pt-4 pb-32">
        {step === 'nome' && (
          <section>
            <Eyebrow>Vamos nos conhecer</Eyebrow>
            <Title className="mt-2">Como podemos te chamar?</Title>
            <p className="mt-3 text-ink-soft">Seu nome aparece só aqui, neste aparelho.</p>
            <label htmlFor="fz-name" className="sr-only">
              Seu nome
            </label>
            <input
              id="fz-name"
              autoFocus
              value={p.name}
              onChange={(e) => set({ name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && canNext && next()}
              placeholder="Seu nome ou apelido"
              maxLength={40}
              autoComplete="given-name"
              className="mt-6 h-14 w-full rounded-2xl border border-line bg-surface px-4 text-lg text-ink placeholder:text-ink-faint focus:border-jade focus:outline-none"
            />
          </section>
        )}

        {step === 'intencao' && (
          <section>
            <Eyebrow>Sua intenção</Eyebrow>
            <Title className="mt-2">O que você busca no FaceZen, {p.name.trim()}?</Title>
            <p className="mt-3 text-ink-soft">Escolha quantas quiser.</p>
            <div className="mt-6 grid gap-2.5">
              {INTENTIONS.map((o) => (
                <OptionCard key={o.id} multi selected={p.intentions.includes(o.id)} onClick={() => set({ intentions: toggle(p.intentions, o.id) })} title={o.label} hint={o.hint} />
              ))}
            </div>
            {p.intentions.includes('aparencia') && (
              <Note className="mt-4" icon={<HeartPulse className="size-4" />}>
                Combinado: vamos cuidar da aparência com expectativa realista. O benefício mais defensável da yoga facial é o ritual de atenção, relaxamento e aplicação com menos atrito.
              </Note>
            )}
          </section>
        )}

        {step === 'regioes' && (
          <section>
            <Eyebrow>Seu mapa</Eyebrow>
            <Title className="mt-2">Quais regiões você quer cuidar?</Title>
            <p className="mt-3 text-ink-soft">Toque no rosto ou nos nomes. Elas ganham destaque nas suas sessões.</p>
            <div className="mx-auto mt-4 w-[min(100%,260px)]">
              <FaceMap selected={p.focus} onToggle={(r: RegionId) => set({ focus: toggle(p.focus, r) })} />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {REGIONS.map((r) => (
                <Chip key={r.id} selected={p.focus.includes(r.id)} onClick={() => set({ focus: toggle(p.focus, r.id) })}>
                  {r.short}
                </Chip>
              ))}
            </div>
          </section>
        )}

        {step === 'pele' && (
          <section>
            <Eyebrow>Sua pele</Eyebrow>
            <Title className="mt-2">Como sua pele costuma se comportar?</Title>
            <p className="mt-3 text-ink-soft">Tipos de pele são pontos de partida, não caixas permanentes.</p>
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              {SKIN_BASES.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={p.skinBase === o.id}
                  onClick={() => set({ skinBase: o.id })}
                  className={cx(
                    'rounded-2xl border p-4 text-left transition',
                    p.skinBase === o.id ? 'border-jade bg-jade-soft' : 'border-line bg-surface',
                  )}
                >
                  <span className="block font-display text-xl font-medium text-ink">{o.label}</span>
                  <span className="mt-0.5 block text-sm text-ink-soft">{o.hint}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setSkinHelp((v) => !v)} className="mt-3 text-sm font-semibold text-jade underline-offset-4 hover:underline">
              {skinHelp ? 'Fechar dica' : 'Não sei meu tipo'}
            </button>
            {skinHelp && (
              <Note className="mt-2">
                Lave o rosto com um limpador suave, seque por encostamento e espere uma hora sem produtos. Se repuxar, tende a seca; brilho no rosto todo, oleosa; brilho só na testa, nariz e queixo, mista; confortável, normal.
              </Note>
            )}
            <div className="mt-6 rounded-2xl bg-surface px-4 shadow-soft">
              <Toggle checked={p.sensitive} onChange={(v) => set({ sensitive: v })} label="Também é sensível" hint="Arde, coça ou avermelha com facilidade" />
              <div className="border-t border-line" />
              <Toggle checked={p.mature} onChange={(v) => set({ mature: v })} label="Tem sinais de maturidade" hint="Descrição editorial, não diagnóstico" />
            </div>
            <p className="mt-6 mb-2 font-semibold text-ink">Quer cuidar de algo em especial?</p>
            <div className="flex flex-wrap gap-2">
              {CONCERNS.map((c) => (
                <Chip key={c.id} selected={p.concerns.includes(c.id)} onClick={() => set({ concerns: toggle(p.concerns, c.id) })}>
                  {c.label}
                </Chip>
              ))}
            </div>
          </section>
        )}

        {step === 'experiencia' && (
          <section>
            <Eyebrow>Sua experiência</Eyebrow>
            <Title className="mt-2">Você já praticou yoga facial?</Title>
            <div className="mt-6 grid gap-2.5">
              {EXPERIENCES.map((o) => (
                <OptionCard key={o.id} selected={p.experience === o.id} onClick={() => set({ experience: o.id })} title={o.label} hint={o.hint} />
              ))}
            </div>
            <Note className="mt-4">
              Todo mundo começa pela semana 1. O calendário foi feito para impedir que a ansiedade por resultado leve a excesso de força.
            </Note>
          </section>
        )}

        {step === 'rotina' && (
          <section>
            <Eyebrow>Seu ritmo</Eyebrow>
            <Title className="mt-2">Quando o FaceZen cabe no seu dia?</Title>

            <p className="mt-6 mb-2 flex items-center gap-2 font-semibold text-ink">
              <Clock className="size-4 text-jade" /> Tempo por sessão
            </p>
            <Segmented
              value={p.minutes}
              onChange={(v) => set({ minutes: v })}
              options={[
                { value: 5, label: '5 minutos' },
                { value: 10, label: '10 minutos' },
              ]}
            />
            <p className="mt-2 text-sm text-ink-soft">
              {p.minutes === 10 ? 'Nas três primeiras semanas as sessões são mais curtas de propósito; a rotina de 10 minutos chega na semana 4.' : 'Sessões curtas, com as regiões que você escolheu em rodízio.'}
            </p>

            <p className="mt-7 mb-2 flex items-center gap-2 font-semibold text-ink">
              <CalendarDays className="size-4 text-jade" /> Dias da semana
            </p>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAYS.map((d) => {
                const on = p.days.includes(d.id)
                const disabled = !on && p.days.length >= 6
                return (
                  <button
                    key={d.id}
                    type="button"
                    aria-pressed={on}
                    aria-label={d.label}
                    disabled={disabled}
                    onClick={() => set({ days: toggle(p.days, d.id) })}
                    className={cx(
                      'flex aspect-square flex-col items-center justify-center rounded-2xl border text-sm font-bold transition disabled:opacity-35',
                      on ? 'border-jade bg-jade text-on-jade' : 'border-line bg-surface text-ink-soft',
                    )}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
            <p className={cx('mt-2 text-sm', p.days.length < 3 ? 'text-danger' : 'text-ink-soft')}>
              {p.days.length < 3 ? 'Escolha pelo menos 3 dias.' : 'Entre 3 e 6 dias. Pelo menos um dia de descanso por semana faz parte da prática.'}
            </p>

            <label htmlFor="fz-time" className="mt-7 mb-2 flex items-center gap-2 font-semibold text-ink">
              <Clock className="size-4 text-jade" /> Horário preferido
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
            <Eyebrow>Seu cuidado</Eyebrow>
            <Title className="mt-2">Alguma destas situações se aplica a você?</Title>
            <p className="mt-3 text-ink-soft">Assim o FaceZen deixa de fora o que pede orientação profissional antes.</p>
            <div className="mt-6 grid gap-2.5">
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
                title="Nenhuma destas"
              />
            </div>
            {p.safety.length > 0 && (
              <Note className="mt-4" tone="warn" icon={<ShieldCheck className="size-4" />}>
                Converse com o profissional que acompanha você antes de praticar. Depois de procedimentos, siga o prazo de quem realizou; não copie a liberação de outra pessoa.
              </Note>
            )}
          </section>
        )}

        {step === 'resumo' && <Summary p={p} accepted={accepted} setAccepted={setAccepted} />}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[480px] bg-gradient-to-t from-bg via-bg to-transparent px-5 pt-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <Button size="lg" block disabled={!canNext} onClick={next}>
          {step === 'resumo' ? (onboarded ? 'Salvar meu plano' : 'Começar minha jornada') : 'Continuar'}
          <ArrowRight className="size-5" />
        </Button>
        {step === 'regioes' && p.focus.length === 0 && <p className="mt-2 text-center text-xs text-ink-faint">Pode pular: a rotina completa passa por todas.</p>}
      </div>
    </div>
  )
}

function Summary({ p, accepted, setAccepted }: { p: Profile; accepted: boolean; setAccepted: (v: boolean) => void }) {
  const w1 = PROGRAM[0]
  const recipe = recipesFor(p)[0]
  const focus = REGIONS.filter((r) => p.focus.includes(r.id)).map((r) => r.short)
  return (
    <section>
      <Eyebrow>Seu plano FaceZen</Eyebrow>
      <Title className="mt-2">Pronto, {p.name.trim()}. Este é o seu começo.</Title>

      <div className="mt-6 overflow-hidden rounded-3xl bg-hero text-on-hero shadow-soft">
        <div className="p-5">
          <p className="eyebrow !text-on-hero/70">Semana 1 · {w1.title}</p>
          <p className="mt-2 font-display text-3xl leading-tight font-medium">3 sessões de 5 minutos</p>
          <p className="mt-2 text-on-hero/85">
            {daysLabel(p.days)}, às {p.time}. Nesta semana, as sessões ficam em dias não consecutivos: respiração, postura, aquecimento e deslizamento manual.
          </p>
        </div>
      </div>

      <dl className="mt-4 grid gap-3">
        <div className="rounded-2xl bg-surface p-4 shadow-soft">
          <dt className="eyebrow">Regiões em destaque</dt>
          <dd className="mt-1 font-medium text-ink">{focus.length ? focus.join(' · ') : 'Todas, pela rotina completa'}</dd>
        </div>
        <div className="rounded-2xl bg-surface p-4 shadow-soft">
          <dt className="eyebrow">Sua pele</dt>
          <dd className="mt-1 font-medium text-ink">{skinLabel(p)}</dd>
          <dd className="mt-1 text-sm text-ink-soft">
            {recipe.title}: {recipe.morning.toLowerCase()}
          </dd>
        </div>
        {p.safety.length > 0 && (
          <div className="rounded-2xl bg-warn-soft p-4">
            <dt className="eyebrow !text-warn">Ajustes de cuidado</dt>
            <dd className="mt-1 text-sm text-ink">
              Adaptamos suas sessões por: {p.safety.map((f) => FLAG_REASON[f]).join(', ')}. Você pode mudar isso a qualquer momento no seu perfil.
            </dd>
          </div>
        )}
      </dl>

      <label htmlFor="fz-accept" className="mt-6 flex cursor-pointer gap-3 rounded-2xl border border-line bg-surface p-4">
        <input id="fz-accept" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 size-5 shrink-0 accent-[var(--jade)]" />
        <span className="text-sm text-ink-soft">
          <strong className="block text-ink">Entendo e pratico com conforto.</strong>
          {DISCLAIMER.split('. ').slice(0, 2).join('. ')}. Se algo causar dor, ardor, tontura ou piora da pele, eu paro.
        </span>
      </label>
    </section>
  )
}
