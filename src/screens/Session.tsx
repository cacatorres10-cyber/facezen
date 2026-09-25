import {
  AlertTriangle,
  Camera,
  CameraOff,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Pause,
  Play,
  SkipForward,
  Star,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { exerciseById, regionById } from '../content/exercises'
import { CHECKLIST, STOP_SIGNALS } from '../content/guide'
import { STEPS as STEP_DEFS } from '../content/routine'
import { BreathOrb } from '../components/BreathOrb'
import { FaceMap } from '../components/FaceMap'
import { Button, Card, Chip, cx, Eyebrow, Field, Note, ProgressRing, ScoreSlider, Sheet, Title, YesNo } from '../components/ui'
import { canSpeak, chime, speak, stopSpeaking, unlockAudio, vibrate } from '../lib/audio'
import { clock, dayKey, formatDuration } from '../lib/dates'
import { buildSession, PREP_SEC, sessionsThisWeek, totalOf, todayInfo, weekStart, type SessionPlan, type SessionStep } from '../lib/plan'
import { uid, useStore, type Scores, type SessionLog } from '../lib/store'

type Mode = 'daily' | 'mini' | 'exercise'
type Phase = 'check' | 'play' | 'after' | 'done'

export function Session() {
  const [params] = useSearchParams()
  const exerciseId = params.get('exercicio')
  const mode: Mode = exerciseId ? 'exercise' : params.get('modo') === 'respiracao' ? 'mini' : 'daily'

  const profile = useStore((s) => s.profile)!
  const program = useStore((s) => s.program)
  const sessions = useStore((s) => s.sessions)
  const logSession = useStore((s) => s.logSession)
  const markPracticed = useStore((s) => s.markPracticed)

  const sessionIndex = sessionsThisWeek(sessions, weekStart(program)).length
  const [skinOk, setSkinOk] = useState<boolean>(true)
  const [procedure, setProcedure] = useState<boolean>(false)

  const plan: SessionPlan = useMemo(() => {
    if (mode === 'mini') {
      const steps: SessionStep[] = [{ ...STEP_DEFS.chegada, key: 'mini', title: 'Um minuto de respiração' }]
      return { variant: 'respiracao', title: 'Respirar 1 minuto', subtitle: 'Inspire em 4, expire em 6', steps, totalSec: 60, adaptations: [] }
    }
    if (mode === 'exercise') {
      const ex = exerciseById(exerciseId!)!
      const steps: SessionStep[] = [
        {
          id: ex.id,
          key: ex.id,
          title: ex.title,
          kind: 'move',
          region: ex.region,
          exerciseId: ex.id,
          durationSec: ex.practiceSec,
          instruction: ex.execution,
          cues: ex.cues,
          sided: ex.sided,
        },
      ]
      return { variant: 'essencial', title: ex.title, subtitle: `Ficha ${ex.number}`, steps, totalSec: totalOf(steps), adaptations: [] }
    }
    return buildSession(profile, { week: program.week, sessionIndex, skinIrritatedToday: !skinOk, procedureToday: procedure })
  }, [mode, exerciseId, profile, program.week, sessionIndex, skinOk, procedure])

  const [skipped, setSkipped] = useState<string[]>([])
  const steps = useMemo(() => plan.steps.filter((s) => !skipped.includes(s.key)), [plan, skipped])

  const [phase, setPhase] = useState<Phase>(mode === 'daily' ? 'check' : 'play')
  const [before, setBefore] = useState<Scores>({ conforto: 7, testa: 5, mandibula: 5, inchaco: 3 })
  const [result, setResult] = useState<{ practicedSec: number; completedKeys: string[]; interrupted?: string } | null>(null)
  const startedAt = useRef(new Date().toISOString())

  const finish = useCallback(
    (practicedSec: number, completedKeys: string[], interrupted?: string) => {
      setResult({ practicedSec, completedKeys, interrupted })
      if (mode === 'exercise' && exerciseId && !interrupted) markPracticed(exerciseId)
      setPhase(mode === 'daily' ? 'after' : 'done')
    },
    [mode, exerciseId, markPracticed],
  )

  if (phase === 'check') {
    return (
      <PreCheck
        plan={plan}
        skipped={skipped}
        setSkipped={setSkipped}
        skinOk={skinOk}
        setSkinOk={setSkinOk}
        procedure={procedure}
        setProcedure={setProcedure}
        before={before}
        setBefore={setBefore}
        totalSec={totalOf(steps)}
        onStart={() => {
          unlockAudio()
          startedAt.current = new Date().toISOString()
          setPhase('play')
        }}
      />
    )
  }

  if (phase === 'play') return <Player plan={plan} steps={steps} onFinish={finish} />

  if (phase === 'after' && result) {
    return (
      <AfterForm
        onSave={(extra) => {
          const log: SessionLog = {
            id: uid(),
            date: dayKey(new Date(startedAt.current)),
            startedAt: startedAt.current,
            week: program.week,
            variant: plan.variant,
            title: plan.title,
            plannedSec: totalOf(steps),
            practicedSec: Math.round(result.practicedSec),
            stepIds: result.completedKeys,
            completed: !result.interrupted,
            before,
            ...extra,
            during: { ...extra.during, interrompido: result.interrupted },
            flagged: !!result.interrupted || extra.during.desconforto.length > 0,
          }
          logSession(log)
          setPhase('done')
        }}
        before={before}
        interrupted={result.interrupted}
      />
    )
  }

  return <Done mode={mode} result={result} exerciseId={exerciseId} />
}

// ————————————————————————————————————————————————————————————— Antes

function PreCheck(props: {
  plan: SessionPlan
  skipped: string[]
  setSkipped: (v: string[]) => void
  skinOk: boolean
  setSkinOk: (v: boolean) => void
  procedure: boolean
  setProcedure: (v: boolean) => void
  before: Scores
  setBefore: (v: Scores) => void
  totalSec: number
  onStart: () => void
}) {
  const { plan, skipped, setSkipped, before, setBefore } = props
  const [checked, setChecked] = useState<string[]>([])
  const week = useStore((s) => s.program.week)
  const ritual = CHECKLIST.antes.filter((c) => !c.gate)

  return (
    <div className="min-h-full bg-bg px-5 pb-36">
      <div className="flex items-center justify-between pt-5">
        <Link to="/" aria-label="Fechar" className="grid size-10 place-items-center rounded-full bg-surface text-ink shadow-soft">
          <X className="size-5" />
        </Link>
        <span className="eyebrow">{week > 8 ? 'Manutenção' : `Semana ${week}`} · antes de começar</span>
        <span className="size-10" />
      </div>

      <div className="animate-rise pt-6">
        <Eyebrow>{formatDuration(props.totalSec)} · {plan.steps.filter((s) => !skipped.includes(s.key)).length} passos</Eyebrow>
        <Title className="mt-1.5">{plan.title}</Title>
        <p className="mt-2 text-ink-soft">{plan.subtitle}</p>
      </div>

      <Card className="mt-6">
        <h2 className="font-display text-xl font-medium text-ink">Como está hoje?</h2>
        <YesNo label="Sua pele está íntegra, sem ferida, crise ou irritação?" value={props.skinOk} onChange={props.setSkinOk} />
        <YesNo label="Fez algum procedimento recente sem liberação?" value={props.procedure} onChange={props.setProcedure} />
        {(!props.skinOk || props.procedure) && (
          <Note tone="warn" className="mt-2" icon={<AlertTriangle className="size-4" />}>
            {props.procedure
              ? 'Hoje, só respiração e postura, sem tocar o rosto. Siga o prazo de quem realizou o procedimento.'
              : 'Hoje, só respiração e toques leves no pescoço e clavículas. Adie a massagem em áreas irritadas.'}
          </Note>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="font-display text-xl font-medium text-ink">Checklist rápido</h2>
        <ul className="mt-2 grid gap-1">
          {ritual.map((c) => {
            const on = checked.includes(c.id)
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setChecked(on ? checked.filter((x) => x !== c.id) : [...checked, c.id])}
                  className="flex w-full items-center gap-3 py-2 text-left"
                >
                  <span className={cx('grid size-6 shrink-0 place-items-center rounded-md border-2 transition', on ? 'border-jade bg-jade text-on-jade' : 'border-line')}>
                    {on && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                  <span className={cx('text-sm', on ? 'text-ink' : 'text-ink-soft')}>{c.text}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </Card>

      <Card className="mt-4">
        <h2 className="font-display text-xl font-medium text-ink">Como você chega</h2>
        <p className="mt-1 text-sm text-ink-soft">Observação objetiva, sem julgamento. Fica no seu diário.</p>
        <div className="mt-4 grid gap-5">
          <ScoreSlider id="b-conforto" label="Conforto da pele" value={before.conforto} onChange={(v) => setBefore({ ...before, conforto: v })} low="desconfortável" high="confortável" />
          <ScoreSlider id="b-testa" label="Tensão na testa" value={before.testa} onChange={(v) => setBefore({ ...before, testa: v })} low="solta" high="muito tensa" />
          <ScoreSlider id="b-mandibula" label="Tensão na mandíbula" value={before.mandibula} onChange={(v) => setBefore({ ...before, mandibula: v })} low="solta" high="muito tensa" />
          <ScoreSlider id="b-inchaco" label="Sensação de inchaço" value={before.inchaco} onChange={(v) => setBefore({ ...before, inchaco: v })} low="nenhuma" high="muita" />
        </div>
      </Card>

      {plan.adaptations.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-display text-xl font-medium text-ink">Ajustado para você</h2>
          <ul className="mt-2 grid gap-2 text-sm text-ink-soft">
            {plan.adaptations.map((a) => (
              <li key={a} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-jade" />
                {a}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="mt-4">
        <h2 className="font-display text-xl font-medium text-ink">Sequência de hoje</h2>
        <p className="mt-1 text-sm text-ink-soft">Toque para tirar um passo. Mais não significa melhor.</p>
        <ol className="mt-3 grid gap-1.5">
          {plan.steps.map((s, n) => {
            const off = skipped.includes(s.key)
            const locked = s.id === 'chegada' || s.id === 'encerramento'
            return (
              <li key={s.key}>
                <button
                  type="button"
                  disabled={locked}
                  aria-pressed={!off}
                  onClick={() => setSkipped(off ? skipped.filter((k) => k !== s.key) : [...skipped, s.key])}
                  className={cx('flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition', off ? 'opacity-45' : 'bg-surface-2/60')}
                >
                  <span className="tnum w-5 text-sm font-bold text-ink-faint">{n + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className={cx('block text-sm font-semibold text-ink', off && 'line-through')}>{s.title}</span>
                    <span className="block text-xs text-ink-faint">
                      {formatDuration(s.durationSec)}
                      {s.optional && ' · opcional'}
                      {s.focus && ' · seu foco'}
                    </span>
                  </span>
                  {s.focus && <Star className="size-4 fill-quartz text-rose-ink" />}
                  {!locked && (
                    <span className={cx('grid size-6 place-items-center rounded-full border-2', off ? 'border-line' : 'border-jade bg-jade text-on-jade')}>
                      {!off && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[480px] bg-gradient-to-t from-bg via-bg to-transparent px-5 pt-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <Button size="lg" block onClick={props.onStart}>
          <Play className="size-5 fill-current" /> Começar · {formatDuration(props.totalSec)}
        </Button>
      </div>
    </div>
  )
}

// ————————————————————————————————————————————————————————————— Player

function Player({ plan, steps, onFinish }: { plan: SessionPlan; steps: SessionStep[]; onFinish: (practicedSec: number, completed: string[], interrupted?: string) => void }) {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)

  const [idx, setIdx] = useState(0)
  const step = steps[idx]
  const stageFor = (s: SessionStep) => (s.kind === 'move' ? 'prep' : 'run')
  const [stage, setStage] = useState<'prep' | 'run'>(() => stageFor(steps[0]))
  const [left, setLeft] = useState(() => (steps[0].kind === 'move' ? PREP_SEC : steps[0].durationSec))
  const [paused, setPaused] = useState(false)
  const [option, setOption] = useState(0)
  const [stopOpen, setStopOpen] = useState(false)
  const [stopReasons, setStopReasons] = useState<string[]>([])
  const practiced = useRef(0)
  const completed = useRef<string[]>([])
  const sideAnnounced = useRef(false)
  const stageRef = useRef(stage)
  stageRef.current = stage

  const announce = useCallback(
    (s: SessionStep, kind: 'prep' | 'run') => {
      if (kind === 'run') {
        if (settings.sound) chime('next')
        if (settings.vibrate) vibrate(60)
      }
      if (settings.voice && (kind === 'prep' || s.kind !== 'move')) speak(`${s.title}. ${s.instruction}`)
    },
    [settings.sound, settings.vibrate, settings.voice],
  )

  const goTo = useCallback(
    (i: number) => {
      if (i >= steps.length) {
        if (settings.sound) chime('done')
        if (settings.vibrate) vibrate([80, 60, 80])
        stopSpeaking()
        onFinish(practiced.current, completed.current)
        return
      }
      const s = steps[Math.max(0, i)]
      const st = stageFor(s)
      setIdx(Math.max(0, i))
      setStage(st)
      setLeft(st === 'prep' ? PREP_SEC : s.durationSec)
      setOption(0)
      sideAnnounced.current = false
      announce(s, st)
    },
    [steps, onFinish, announce, settings.sound, settings.vibrate],
  )

  // Primeiro anúncio
  useEffect(() => {
    announce(steps[0], stageFor(steps[0]))
    return () => stopSpeaking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Relógio
  useEffect(() => {
    if (paused) return
    let last = performance.now()
    const t = setInterval(() => {
      const now = performance.now()
      const dt = (now - last) / 1000
      last = now
      if (stageRef.current === 'run') practiced.current += dt
      setLeft((l) => l - dt)
    }, 200)
    return () => clearInterval(t)
  }, [paused])

  // Fim de etapa, troca de lado
  useEffect(() => {
    if (!step) return
    if (stage === 'run' && step.sided && !sideAnnounced.current && left <= step.durationSec / 2) {
      sideAnnounced.current = true
      if (settings.sound) chime('side')
      if (settings.vibrate) vibrate([40, 40, 40])
      if (settings.voice) speak('Troque de lado.')
    }
    if (left > 0) return
    if (stage === 'prep') {
      setStage('run')
      setLeft(step.durationSec)
      announce(step, 'run')
    } else {
      completed.current = [...new Set([...completed.current, step.key])]
      goTo(idx + 1)
    }
  }, [left, stage, step, idx, goTo, announce, settings.sound, settings.vibrate, settings.voice])

  // Tela ligada durante a sessão
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }
    nav.wakeLock
      ?.request('screen')
      .then((l) => (lock = l))
      .catch(() => {})
    return () => {
      void lock?.release().catch(() => {})
    }
  }, [])

  const total = totalOf(steps)
  const elapsedBefore = totalOf(steps.slice(0, idx))
  const stepTotal = stage === 'prep' ? PREP_SEC : step.durationSec
  const stepElapsed = stage === 'prep' ? 0 : step.durationSec - Math.max(0, left)
  const overall = Math.min(1, (elapsedBefore + (step.kind === 'move' ? PREP_SEC : 0) + stepElapsed) / total)
  const side = step.sided && stage === 'run' ? (left > step.durationSec / 2 ? 'Lado direito' : 'Lado esquerdo') : null
  const exercise = step.exerciseId ? exerciseById(step.exerciseId) : undefined

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-bg">
      {settings.mirror && <Mirror />}

      <div className="relative z-10 px-5 pt-[calc(env(safe-area-inset-top,0px)+14px)]">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setStopOpen(true)} aria-label="Encerrar sessão" className="grid size-10 place-items-center rounded-full bg-surface/90 text-ink shadow-soft backdrop-blur">
            <X className="size-5" />
          </button>
          <div className="flex flex-1 gap-1" aria-hidden>
            {steps.map((s, i) => (
              <span key={s.key} className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <span
                  className="block h-full rounded-full bg-jade transition-[width] duration-200"
                  style={{ width: i < idx ? '100%' : i === idx ? `${(stepElapsed / step.durationSec) * 100}%` : '0%' }}
                />
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => updateSettings({ voice: !settings.voice })}
            aria-label={settings.voice ? 'Desligar voz guiada' : 'Ligar voz guiada'}
            aria-pressed={settings.voice}
            disabled={!canSpeak()}
            className="grid size-10 place-items-center rounded-full bg-surface/90 text-ink shadow-soft backdrop-blur disabled:opacity-40"
          >
            {settings.voice ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
          </button>
          <button
            type="button"
            onClick={() => updateSettings({ mirror: !settings.mirror })}
            aria-label={settings.mirror ? 'Fechar espelho' : 'Abrir espelho (câmera frontal)'}
            aria-pressed={settings.mirror}
            className="grid size-10 place-items-center rounded-full bg-surface/90 text-ink shadow-soft backdrop-blur"
          >
            {settings.mirror ? <CameraOff className="size-5" /> : <Camera className="size-5" />}
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="tnum text-xs font-semibold text-ink-faint">
            Passo {idx + 1} de {steps.length} · {clock(total * (1 - overall))} restantes
          </p>
          <button type="button" onClick={() => setStopOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-3 py-1.5 text-xs font-semibold text-danger">
            <AlertTriangle className="size-3.5" /> Senti desconforto
          </button>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center px-5 pt-2">
        <div className="grid h-[min(54vw,224px)] w-full place-items-center">
          {step.kind === 'move' ? (
            <div className="relative grid place-items-center">
              <ProgressRing value={stage === 'prep' ? 1 - left / PREP_SEC : stepElapsed / stepTotal} size={210} stroke={5}>
                <div className="w-[136px]">
                  <FaceMap highlight={step.region} />
                </div>
              </ProgressRing>
            </div>
          ) : (
            <BreathOrb size={210} running={!paused} label={step.kind === 'breath'} />
          )}
        </div>

        <div className="mt-4 w-full text-center" aria-live="polite">
          <p className="eyebrow">
            {stage === 'prep' ? 'Prepare-se' : side ?? step.minute ?? (step.region ? regionById(step.region).label : 'Respiração')}
            {step.focus && <span className="ml-2 text-rose-ink">· seu foco</span>}
          </p>
          <h1 className="mt-1.5 font-display text-[1.9rem] leading-tight font-medium text-ink">{step.title}</h1>
          <p className="tnum mt-1 font-display text-5xl font-medium text-jade">{clock(left)}</p>
        </div>

        <Card className="mt-4 w-full bg-surface/95 backdrop-blur">
          {step.options && (
            <div className="mb-3 flex gap-2">
              {step.options.map((o, i) => (
                <Chip key={o.label} selected={option === i} onClick={() => setOption(i)}>
                  {o.label}
                </Chip>
              ))}
            </div>
          )}
          <p className="text-[15px] leading-relaxed text-ink">{step.options ? step.options[option].text : step.instruction}</p>
          {step.cues.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {step.cues.map((c) => (
                <li key={c} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-soft">
                  {c}
                </li>
              ))}
            </ul>
          )}
          {step.note && (
            <p className="mt-3 flex gap-2 text-sm text-warn">
              <Info className="mt-0.5 size-4 shrink-0" />
              {step.note}
            </p>
          )}
          {exercise && (
            <Link to={`/exercicios/${exercise.id}`} className="mt-3 inline-block text-sm font-semibold text-jade">
              Ver ficha completa ({exercise.number})
            </Link>
          )}
        </Card>
      </div>

      <div className="sticky bottom-0 z-10 bg-gradient-to-t from-bg via-bg/90 to-transparent px-5 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center justify-center gap-5">
          <button type="button" onClick={() => goTo(idx - 1)} disabled={idx === 0} aria-label="Passo anterior" className="grid size-14 place-items-center rounded-full bg-surface text-ink shadow-soft disabled:opacity-40">
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => {
              unlockAudio()
              setPaused((p) => !p)
              if (!paused) stopSpeaking()
            }}
            aria-label={paused ? 'Continuar' : 'Pausar'}
            className="grid size-20 place-items-center rounded-full bg-jade text-on-jade shadow-soft transition active:scale-95"
          >
            {paused ? <Play className="size-8 fill-current" /> : <Pause className="size-8 fill-current" />}
          </button>
          <button
            type="button"
            onClick={() => {
              completed.current = [...new Set([...completed.current, step.key])]
              goTo(idx + 1)
            }}
            aria-label="Próximo passo"
            className="grid size-14 place-items-center rounded-full bg-surface text-ink shadow-soft"
          >
            {idx === steps.length - 1 ? <Check className="size-6" /> : step.optional ? <SkipForward className="size-6" /> : <ChevronRight className="size-6" />}
          </button>
        </div>
      </div>

      <Sheet open={stopOpen} onClose={() => setStopOpen(false)} title="Parar é parte da prática">
        <p className="text-ink-soft">Se algo causou dor, ardor, tontura, dor ocular, cervical ou na mandíbula, ou piora da pele, pare. O que você sentiu?</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {STOP_SIGNALS.map((s) => (
            <Chip key={s} selected={stopReasons.includes(s)} onClick={() => setStopReasons(stopReasons.includes(s) ? stopReasons.filter((x) => x !== s) : [...stopReasons, s])}>
              {s}
            </Chip>
          ))}
        </div>
        <div className="mt-6 grid gap-2">
          <Button
            variant="danger"
            block
            onClick={() => {
              stopSpeaking()
              onFinish(practiced.current, completed.current, stopReasons.length ? stopReasons.join(', ') : 'Encerrada antes do fim')
            }}
          >
            Encerrar e registrar
          </Button>
          <Button variant="soft" block onClick={() => setStopOpen(false)}>
            Continuar a sessão
          </Button>
        </div>
        <p className="mt-4 text-xs text-ink-faint">
          Dor ocular, alteração visual, secreção ou inchaço importante ao redor dos olhos pedem atendimento. Na dúvida, procure um profissional.
        </p>
        {plan.variant && <span className="sr-only">{plan.title}</span>}
      </Sheet>
    </div>
  )
}

/** Espelho com a câmera frontal: nada é gravado nem sai do aparelho. */
function Mirror() {
  const video = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let stream: MediaStream | null = null
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((s) => {
        stream = s
        if (video.current) video.current.srcObject = s
      })
      .catch(() => setError('Não foi possível abrir a câmera. Verifique a permissão do navegador.'))
    if (!navigator.mediaDevices) setError('Este navegador não oferece acesso à câmera.')
    return () => stream?.getTracks().forEach((t) => t.stop())
  }, [])
  if (error) return <p className="absolute top-28 right-5 left-5 z-20 rounded-2xl bg-warn-soft p-3 text-sm text-ink">{error}</p>
  return (
    <div className="absolute inset-0 z-0">
      <video ref={video} autoPlay playsInline muted className="size-full -scale-x-100 object-cover opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-transparent to-bg/90" />
    </div>
  )
}

// ————————————————————————————————————————————————————————————— Depois

type Extra = Pick<SessionLog, 'afterTension' | 'produto' | 'contexto' | 'observacao'> & { during: NonNullable<SessionLog['during']> }

const DISCOMFORTS = ['Dor', 'Ardor', 'Puxão', 'Tontura', 'Visão alterada', 'Vermelhidão persistente', 'Dor na mandíbula', 'Dor no pescoço']

function AfterForm({ onSave, before, interrupted }: { onSave: (e: Extra) => void; before: Scores; interrupted?: string }) {
  const [respiracao, setRespiracao] = useState<boolean | null>(null)
  const [pressao, setPressao] = useState<boolean | null>(null)
  const [desconforto, setDesconforto] = useState<string[]>([])
  const [testa, setTesta] = useState(before.testa)
  const [mandibula, setMandibula] = useState(before.mandibula)
  const [produto, setProduto] = useState('')
  const [contexto, setContexto] = useState('')
  const [observacao, setObservacao] = useState('')

  return (
    <div className="min-h-full bg-bg px-5 pb-36">
      <div className="animate-rise pt-10">
        <Eyebrow>{interrupted ? 'Sessão encerrada' : 'Sessão concluída'}</Eyebrow>
        <Title className="mt-1.5">{interrupted ? 'Parar também é cuidado.' : 'Como foi?'}</Title>
        <p className="mt-2 text-ink-soft">Leva meio minuto e deixa o seu diário completo. Observe sensação e tensão sem procurar uma transformação imediata.</p>
      </div>

      {interrupted && (
        <Note tone="warn" className="mt-5" icon={<AlertTriangle className="size-4" />}>
          Você registrou: {interrupted}. Na próxima sessão, reduza pela metade ou volte à semana anterior. Se persistir, procure avaliação.
        </Note>
      )}

      <Card className="mt-5">
        <h2 className="font-display text-xl font-medium text-ink">Durante</h2>
        <YesNo label="Respiração confortável?" value={respiracao} onChange={setRespiracao} />
        <YesNo label="Pressão leve o tempo todo?" value={pressao} onChange={setPressao} />
        <p className="mt-3 mb-2 text-sm font-semibold text-ink">Algum sinal de alerta?</p>
        <div className="flex flex-wrap gap-2">
          <Chip selected={desconforto.length === 0} onClick={() => setDesconforto([])}>
            Nenhum
          </Chip>
          {DISCOMFORTS.map((d) => (
            <Chip key={d} selected={desconforto.includes(d)} onClick={() => setDesconforto(desconforto.includes(d) ? desconforto.filter((x) => x !== d) : [...desconforto, d])}>
              {d}
            </Chip>
          ))}
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-display text-xl font-medium text-ink">Como você sai</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Antes: testa {before.testa}, mandíbula {before.mandibula}.
        </p>
        <div className="mt-4 grid gap-5">
          <ScoreSlider id="a-testa" label="Tensão na testa agora" value={testa} onChange={setTesta} low="solta" high="muito tensa" />
          <ScoreSlider id="a-mandibula" label="Tensão na mandíbula agora" value={mandibula} onChange={setMandibula} low="solta" high="muito tensa" />
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-display text-xl font-medium text-ink">Notas (opcional)</h2>
        <div className="mt-3 grid gap-3">
          <Field id="n-produto" label="Produto de deslizamento" value={produto} onChange={setProduto} placeholder="Ex.: hidratante que já uso" />
          <Field id="n-contexto" label="Sono, estresse ou sol relevantes" value={contexto} onChange={setContexto} placeholder="Ex.: dormi pouco" />
          <Field id="n-obs" label="O que farei diferente na próxima?" value={observacao} onChange={setObservacao} placeholder="Ex.: menos pressão nos olhos" multiline />
        </div>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[480px] bg-gradient-to-t from-bg via-bg to-transparent px-5 pt-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <Button
          size="lg"
          block
          onClick={() =>
            onSave({
              during: { respiracao, pressaoLeve: pressao, desconforto },
              afterTension: { testa, mandibula },
              produto: produto.trim() || undefined,
              contexto: contexto.trim() || undefined,
              observacao: observacao.trim() || undefined,
            })
          }
        >
          Salvar no diário
        </Button>
      </div>
    </div>
  )
}

// ————————————————————————————————————————————————————————————— Fim

function Done({ mode, result, exerciseId }: { mode: Mode; result: { practicedSec: number; interrupted?: string } | null; exerciseId: string | null }) {
  const navigate = useNavigate()
  const profile = useStore((s) => s.profile)!
  const program = useStore((s) => s.program)
  const sessions = useStore((s) => s.sessions)
  const info = todayInfo({ sessions, week: program.week, weekStartedAt: weekStart(program), profile })
  const morning = new Date().getHours() < 14

  return (
    <div className="flex min-h-full flex-col items-center bg-bg px-5 pt-16 pb-10 text-center">
      <BreathOrb size={180} label={false} />
      <Eyebrow className="mt-6">{mode === 'daily' ? `${program.week > 8 ? 'Manutenção' : `Semana ${program.week}`} · ${info.done} de ${info.target}` : 'Pronto'}</Eyebrow>
      <Title className="mt-2">{result?.interrupted ? 'Registrado. Descanse.' : `Muito bem, ${profile.name}.`}</Title>
      <p className="mt-3 max-w-sm text-ink-soft">
        {mode === 'daily'
          ? `${formatDuration(Math.round(result?.practicedSec ?? 0))} de prática. ${morning ? 'Agora, hidratante e protetor solar.' : 'Agora, hidratante e boa noite.'} Daqui a uma hora, o FaceZen vai perguntar como sua pele está.`
          : mode === 'exercise'
            ? 'Exercício marcado como feito hoje. Lembre: uma série curta é suficiente.'
            : 'Um minuto de pausa também é autocuidado.'}
      </p>
      {info.weekComplete && program.week <= 8 && mode === 'daily' && !result?.interrupted && (
        <Note tone="ok" className="mt-6 max-w-sm text-left" icon={<Check className="size-4" />}>
          Você completou a meta da semana {Math.min(program.week, 8)}. Na tela Hoje, escolha se quer avançar ou repetir a semana.
        </Note>
      )}
      <div className="mt-auto grid w-full max-w-sm gap-2 pt-10">
        {mode === 'daily' && (
          <Button size="lg" block onClick={() => navigate('/skincare', { replace: true })}>
            Ir para o skincare
          </Button>
        )}
        <Button size="lg" variant={mode === 'daily' ? 'soft' : 'primary'} block onClick={() => navigate(exerciseId ? `/exercicios/${exerciseId}` : '/', { replace: true })}>
          {exerciseId ? 'Voltar à ficha' : 'Voltar para Hoje'}
        </Button>
      </div>
    </div>
  )
}
