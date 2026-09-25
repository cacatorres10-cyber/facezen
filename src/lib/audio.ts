/** Sons, vibração e voz guiada — tudo gerado no aparelho, sem arquivos de áudio. */

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Precisa ser chamado dentro de um toque do usuário para liberar o áudio no celular. */
export function unlockAudio() {
  audio()
}

function tone(freq: number, start: number, dur: number, gain = 0.18) {
  const a = audio()
  if (!a) return
  const t0 = a.currentTime + start
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(a.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

/** Sino suave: "next" ao trocar de passo, "side" para trocar de lado, "done" ao terminar. */
export function chime(kind: 'next' | 'side' | 'done' = 'next') {
  if (kind === 'next') {
    tone(659.25, 0, 1.2)
    tone(987.77, 0.12, 1.4, 0.1)
  } else if (kind === 'side') {
    tone(783.99, 0, 0.7, 0.14)
  } else {
    tone(523.25, 0, 1.6)
    tone(659.25, 0.18, 1.6, 0.12)
    tone(783.99, 0.36, 2.2, 0.1)
  }
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* sem suporte */
  }
}

let voice: SpeechSynthesisVoice | null | undefined

function ptVoice(): SpeechSynthesisVoice | null {
  if (voice !== undefined) return voice
  try {
    const voices = speechSynthesis.getVoices()
    voice = voices.find((v) => v.lang === 'pt-BR') ?? voices.find((v) => v.lang.startsWith('pt')) ?? null
    if (voices.length === 0) voice = undefined
    return voice ?? null
  } catch {
    return null
  }
}

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(text: string) {
  if (!canSpeak()) return
  try {
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'pt-BR'
    const v = ptVoice()
    if (v) u.voice = v
    u.rate = 0.95
    u.pitch = 1
    speechSynthesis.speak(u)
  } catch {
    /* voz indisponível */
  }
}

export function stopSpeaking() {
  try {
    if (canSpeak()) speechSynthesis.cancel()
  } catch {
    /* ignore */
  }
}
