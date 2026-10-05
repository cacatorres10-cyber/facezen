/**
 * Aulas em vídeo do Curso (feitas no NotebookLM e publicadas no YouTube como "Não listado").
 * Para adicionar: cole o link com o título provisório "Aula NN" e o módulo; o workflow
 * "Atualizar títulos das aulas" troca pelo título do YouTube.
 */
export interface VideoLesson {
  id: string
  /** Módulo do curso (`VIDEO_MODULES`). */
  module: string
  title: string
  summary?: string
  /** Link do YouTube (watch, youtu.be ou shorts). */
  youtube: string
}

/** Módulos das aulas em vídeo, na ordem do curso. */
export const VIDEO_MODULES: { id: string; title: string; intro: string }[] = [
  { id: 'comece', title: 'Boas-vindas', intro: 'A primeira aula: como o FaceZen funciona.' },
  { id: 'treinos', title: 'Treinos guiados', intro: 'Faça junto: aquecimento, testa e olhos, bochechas e mandíbula.' },
  { id: 'skincare', title: 'Skincare em vídeo', intro: 'Limpeza, ativos, manchas e proteção solar.' },
  { id: 'drenagem', title: 'Drenagem e ferramentas', intro: 'Drenagem linfática, Hanbang e gua sha.' },
]

export const VIDEO_LESSONS: VideoLesson[] = [
  { id: 'aula-01', module: 'comece', title: 'Introdução', youtube: 'https://youtu.be/A6NZPxv0tqU' },
  { id: 'aula-02', module: 'treinos', title: 'Aquecimento, postura e soltura do masseter', youtube: 'https://youtu.be/xIa2yHNyafM' },
  { id: 'aula-03', module: 'treinos', title: 'Testa lisa e olhar descansado', youtube: 'https://youtu.be/9SbeDmCjucY' },
  { id: 'aula-04', module: 'treinos', title: 'Bochechas, maçãs e bigode chinês', youtube: 'https://youtu.be/DYgC1kQW-xk' },
  { id: 'aula-05', module: 'treinos', title: 'V line e mandíbula', youtube: 'https://youtu.be/zAFoHNSXmJ4' },
  { id: 'aula-06', module: 'skincare', title: 'Limpeza profunda', youtube: 'https://youtu.be/oTpbvJkjiDQ' },
  { id: 'aula-07', module: 'skincare', title: 'Guia de ativos e vitaminas', youtube: 'https://youtu.be/l69mor40fWs' },
  { id: 'aula-08', module: 'skincare', title: 'Manchas, melasma e proteção solar', youtube: 'https://youtu.be/h5Z4x-WpuVo' },
  { id: 'aula-09', module: 'drenagem', title: 'Drenagem linfática e Hanbang em 3 minutos', youtube: 'https://youtu.be/Ng_yTCxJgOA' },
  { id: 'aula-10', module: 'drenagem', title: 'Gua sha e ferramentas', youtube: 'https://youtu.be/cC78MA4jbQg' },
]

/** Extrai o código do vídeo de qualquer formato de link do YouTube. */
export function youtubeId(url: string): string | undefined {
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/)
  return m?.[1]
}

export const videoLessonById = (id: string) => VIDEO_LESSONS.find((v) => v.id === id)

const thumbs = import.meta.glob('../assets/aulas-video/*.jpg', { eager: true, import: 'default' }) as Record<string, string>

/** Capa do vídeo (baixada pelo workflow para dentro do app), se já existir. */
export function videoThumb(url: string): string | undefined {
  const id = youtubeId(url)
  return id ? thumbs[`../assets/aulas-video/${id}.jpg`] : undefined
}

export const youtubeWatchUrl = (url: string) => `https://www.youtube.com/watch?v=${youtubeId(url)}`
