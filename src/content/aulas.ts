import data from './aulas.json'

/** Vídeo-aulas, na ordem em que aparecem no app. Capas baixadas do YouTube por `scripts/baixar_midia.py`. */
export interface Aula {
  id: string
  title: string
  channel: string
  thumb?: string
}

const thumbs = import.meta.glob('../assets/aulas/*.jpg', { eager: true, import: 'default' }) as Record<string, string>

/** Tira o nome do canal e os emojis do título do YouTube. */
const clean = (t: string) =>
  t
    .replace(/\s*\|.*$/, '')
    .replace(/[\u{1F300}-\u{1FAFF}✨]/gu, '')
    .trim()

export const AULAS: Aula[] = (data as { id: string; title: string; channel: string }[]).map((a) => ({
  id: a.id,
  title: clean(a.title),
  channel: a.channel,
  thumb: thumbs[`../assets/aulas/${a.id}.jpg`],
}))

export const aulaById = (id: string) => AULAS.find((a) => a.id === id)
export const AULA_GUIADA = AULAS[0]
export const youtubeUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`
export const embedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1&playsinline=1`
