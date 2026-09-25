import { AlertTriangle, Camera, CameraOff, Check, ChevronLeft, ChevronRight, Frown, Meh, Pause, Play, Smile, Volume2, VolumeX, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { exerciseById, regionById } from '../content/exercises'
import { STOP_SIGNALS } from '../content/guide'
import { FaceMap } from '../components/FaceMap'
import { Button, Card, Chip, cx, Eyebrow, Note, ProgressRing, Sheet, Title, YesNo } from '../components/ui'
import { canSpeak, chime, speak, stopSpeaking, unlockAudio, vibrate } from '../lib/audio'
import { clock, dayKey, formatDuration } from '../lib/dates'
import { buildSession, PREP_SEC, sessionsThisWeek, totalOf, weekStart, type SessionPlan, type SessionStep } from '../lib/plan'
import { uid, useStore, type SessionLog } from '../lib/store'

type Phase = 'check' | 'play' | 'done'
type Result = { practicedSec: number; completedKeys: string[]; interrupted?: string }

export function Session() {
  const [params] = useSearchParams()
  const exerciseId = params.get('exercicio')
  const single = !!exerciseId

  const profile = useStore((s) => s.profile)!
  const program = useStore((s) => s.program)
  const sessions = useStore((s) => s.sessions)
  const markPracticed = useStore((s) => s.markPracticed)

  const sessionIndex = sessionsThisWeek(sessions, weekStart(program)).length
  const [skinOk, setSkinOk] = useState(true)

  const plan: SessionPlan = useMemo(() => {
    if (single) {
      const ex = exerciseById(exerciseId!)!
      const steps: SessionStep[] = [
        { id: ex.id, key: ex.id, title: ex.title, kind: 'move', region: ex.region, exerciseId: ex.id, durationSec: ex.practiceSec, instruction: ex.cues.join('. ') + '.', sided: ex.sided },
      ]
      return { variant: 'essencial', title: ex.title, subtitle: `Ficha ${ex.number}`, steps, totalSec: totalOf(steps), adaptations: [] }
    }
    return buildSession(profile, { week: program.week, sessionIndex, skinIrritatedToday: !skinOk })
  }, [single, exerciseId, profile, program.week, sessionIndex, skinOk])

  const [phase, setPhase] = useState<Phase>(single ? 'play' : 'check')
  const [result, setResult] = useState<Result | null>(null)
  const startedAt = useRef(new Date().toISOString())

  const finish = useCallback(
    (practicedSec: number, completedKeys: string[], interrupted?: string) => {
      setResult({ practicedSec, completedKeys, interrupted })
      if (single && exerciseId && !interrupted) markPracticed(exerciseId)
      setPhase('done')
    },
    [single, exerciseId, markPracticed],
  )

  if (phase === 'check') {
    return (
      <PreCheck
        plan={plan}
        skinOk={skinOk}
        setSkinOk={setSkinOk}
        onStart={() => {
          unlockAudio()
          startedAt.current = new Date().toISOString()
          setPhase('play')
        }}
      />
    )
  }
  if (phase === 'play') return <Player plan={plan} onFinish={finish} />
  return <Done plan={plan} result={result} single={single} exerciseId={exerciseId} startedAt={startedAt.current} />
}

// ————————————————————————————————————————————————————————————— Antes

function PreCheck({ plan, skinOk, setSkinOk, onStart }: { plan: SessionPlan; skinOk: boolean; setSkinOk: (v: boolean) => void; onStart: () => void }) {
  const paused = plan.steps.length === 0
  return (
    <div className="min-h-full bg-bg px-5 pb-36">
      <div className="pt-5">
        <Link to="/" aria-label="Fechar" className="grid size-10 place-items-center rounded-full bg-surface text-ink shadow-soft">
          <X className="size-5" />
        </Link>
      </div>

      <div className="animate-rise pt-6">
        <Eyebrow>{paused ? 'Hoje' : `${formatDuration(plan.totalSec)} · ${plan.steps.length} passos`}</Eyebrow>
        <Title className="mt-1.5">{plan.title}</Title>
        <p className="mt-1 text-ink-soft">{plan.subtitle}</p>
      </div>

      {!paused && (
        <Card className="mt-6 !py-2">
          <YesNo label="Sua pele está sem feridas ou irritação hoje?" value={skinOk} onChange={setSkinOk} />
        </Card>
      )}

      {plan.adaptations[0] && (
        <Note tone={paused || !skinOk ? 'warn' : 'info'} className="mt-3">
          {plan.adaptations[0]}
        </Note>
      )}

      {!paused && (
        <ol className="mt-6 grid gap-1.5">
          {plan.steps.map((s, n) => (
            <li key={s.key} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-soft">
              <span className="tnum w-5 text-sm font-bold text-ink-faint">{n + 1}</span>
              <span className="min-w-0 flex-1 font-semibold text-ink">{s.title}</span>
              {s.focus && <span className="rounded-full bg-quartz-soft px-2 py-0.5 text-[11px] font-bold text-rose-ink">seu objetivo</span>}
              <span className="tnum text-sm text-ink-faint">{formatDuration(s.durationSec)}</span>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-5 text-sm text-ink-faint">Mãos limpas, toque leve e um pouco de hidratante para deslizar.</p>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[480px] bg-gradient-to-t from-bg via-bg to-transparent px-5 pt-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        {paused ? (
          <Link to="/" className="flex h-14 items-center justify-center rounded-full bg-surface-2 font-semibold text-ink">
            Voltar
          </Link>
        ) : (
          <Button size="lg" block onClick={onStart}>
            <Play className="size-5 fill-current" /> Começar
          </Button>
        )}
      </div>
    </div>
  )
}

// ————————————————————————————————————————————————————————————— Player

function Player({ plan, onFinish }: { plan: SessionPlan; onFinish: (practicedSec: number, completed: string[], interrupted?: string) => void }) {
  const steps = plan.steps
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)

  const stageFor = (s: SessionStep) => (s.kind === 'move' ? 'prep' : 'run')
  const [idx, setIdx] = useState(0)
  const step = steps[idx]
  const [stage, setStage] = useState<'prep' | 'run'>(() => stageFor(steps[0]))
  const [left, setLeft] = useState(() => (steps[0].kind === 'move' ? PREP_SEC : steps[0].durationSec))
  const [paused, setPaused] = useState(false)
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
      sideAnnounced.current = false
      announce(s, st)
    },
    [steps, onFinish, announce, settings.sound, settings.vibrate],
  )

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

  // Fim de etapa e troca de lado
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

  const stepElapsed = stage === 'prep' ? 0 : step.durationSec - Math.max(0, left)
  const ring = stage === 'prep' ? 1 - left / PREP_SEC : stepElapsed / step.durationSec
  const side = step.sided && stage === 'run' ? (left > step.durationSec / 2 ? 'Lado direito' : 'Lado esquerdo') : null
  const label = stage === 'prep' ? 'Prepare-se' : (side ?? (step.region ? regionById(step.region).label : 'Último passo'))

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
                <span className="block h-full rounded-full bg-jade transition-[width] duration-200" style={{ width: i < idx ? '100%' : i === idx ? `${(stepElapsed / step.durationSec) * 100}%` : '0%' }} />
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
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center px-5 pt-6">
        <ProgressRing value={ring} size={220} stroke={5}>
          <div className="w-[140px]">
            <FaceMap highlight={step.region} />
          </div>
        </ProgressRing>

        <div className="mt-5 w-full text-center" aria-live="polite">
          <p className="eyebrow">
            Passo {idx + 1} de {steps.length} · {label}
          </p>
          <h1 className="mt-1.5 font-display text-[2rem] leading-tight font-medium text-ink">{step.title}</h1>
          <p className="tnum mt-1 font-display text-5xl font-medium text-jade">{clock(left)}</p>
        </div>

        <p className="mt-4 max-w-sm text-center text-[16px] leading-relaxed text-ink">{step.instruction}</p>
        {step.exerciseId && (
          <Link to={`/exercicios/${step.exerciseId}`} className="mt-2 text-sm font-semibold text-jade">
            Ver o exercício
          </Link>
        )}
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
              if (!paused) stopSpeaking()
              setPaused((p) => !p)
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
            {idx === steps.length - 1 ? <Check className="size-6" /> : <ChevronRight className="size-6" />}
          </button>
        </div>
        <button type="button" onClick={() => setStopOpen(true)} className="mx-auto mt-3 flex items-center gap-1.5 text-sm font-semibold text-danger">
          <AlertTriangle className="size-4" /> Senti desconforto
        </button>
      </div>

      <Sheet open={stopOpen} onClose={() => setStopOpen(false)} title="Parar é cuidar">
        <p className="text-ink-soft">O que você sentiu?</p>
        <div className="mt-3 flex flex-wrap gap-2">
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
            Encerrar sessão
          </Button>
          <Button variant="soft" block onClick={() => setStopOpen(false)}>
            Continuar
          </Button>
        </div>
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
    if (!navigator.mediaDevices) {
      setError('Este navegador não abre a câmera.')
      return
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((s) => {
        stream = s
        if (video.current) video.current.srcObject = s
      })
      .catch(() => setError('Não foi possível abrir a câmera. Verifique a permissão.'))
    return () => stream?.getTracks().forEach((t) => t.stop())
  }, [])
  if (error) return <p className="absolute top-20 right-5 left-5 z-20 rounded-2xl bg-warn-soft p-3 text-sm text-ink">{error}</p>
  return (
    <div className="absolute inset-0 z-0">
      <video ref={video} autoPlay playsInline muted className="size-full -scale-x-100 object-cover opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-transparent to-bg/90" />
    </div>
  )
}

// ————————————————————————————————————————————————————————————— Fim

const FEELINGS = [
  { id: 'bem', label: 'Foi bem', icon: Smile },
  { id: 'desconforto', label: 'Um incômodo', icon: Meh },
  { id: 'dor', label: 'Senti dor', icon: Frown },
] as const

function Done({ plan, result, single, exerciseId, startedAt }: { plan: SessionPlan; result: Result | null; single: boolean; exerciseId: string | null; startedAt: string }) {
  const navigate = useNavigate()
  const profile = useStore((s) => s.profile)!
  const program = useStore((s) => s.program)
  const logSession = useStore((s) => s.logSession)
  const [feeling, setFeeling] = useState<SessionLog['feeling']>(result?.interrupted ? 'dor' : undefined)

  const save = (f: SessionLog['feeling']) => {
    if (!single && result) {
      logSession({
        id: uid(),
        date: dayKey(new Date(startedAt)),
        startedAt,
        week: program.week,
        variant: plan.variant,
        title: plan.title,
        plannedSec: plan.totalSec,
        practicedSec: Math.round(result.practicedSec),
        stepIds: result.completedKeys,
        completed: !result.interrupted,
        feeling: f,
        during: result.interrupted ? { desconforto: [], interrompido: result.interrupted } : undefined,
        flagged: !!result.interrupted || f !== 'bem',
      })
    }
    navigate(single && exerciseId ? `/exercicios/${exerciseId}` : '/', { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col items-center bg-bg px-5 pt-16 pb-10 text-center">
      <span className="grid size-24 place-items-center rounded-full bg-jade-soft text-jade">
        <Check className="size-12" strokeWidth={2.5} />
      </span>
      <Title className="mt-6">{result?.interrupted ? 'Tudo bem parar.' : `Muito bem, ${profile.name}!`}</Title>
      <p className="mt-2 text-ink-soft">
        {single ? 'Exercício feito.' : `${formatDuration(Math.round(result?.practicedSec ?? 0))} de cuidado com você. Agora, hidratante${new Date().getHours() < 14 ? ' e protetor solar' : ''}.`}
      </p>

      {!single && (
        <>
          <p className="mt-8 font-semibold text-ink">Como foi?</p>
          <div className="mt-3 grid w-full max-w-sm grid-cols-3 gap-2">
            {FEELINGS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={feeling === id}
                onClick={() => setFeeling(id)}
                className={cx('flex flex-col items-center gap-2 rounded-2xl border p-3 text-sm font-semibold transition', feeling === id ? 'border-jade bg-jade-soft text-ink' : 'border-line bg-surface text-ink-soft')}
              >
                <Icon className="size-7" />
                {label}
              </button>
            ))}
          </div>
          {feeling && feeling !== 'bem' && (
            <Note tone="warn" className="mt-4 max-w-sm text-left">
              Na próxima vez, use menos pressão e pule o exercício que incomodou. Se a dor continuar, procure um profissional.
            </Note>
          )}
        </>
      )}

      <div className="mt-auto grid w-full max-w-sm gap-2 pt-10">
        <Button size="lg" block disabled={!single && !feeling} onClick={() => save(feeling)}>
          {single ? 'Voltar' : 'Salvar e voltar'}
        </Button>
      </div>
    </div>
  )
}
