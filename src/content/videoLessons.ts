/**
 * Aulas em vídeo do Curso (feitas no NotebookLM e publicadas no YouTube como "Não listado").
 * Para adicionar: cole o título e o link, na ordem em que a pessoa deve assistir.
 */
export interface VideoLesson {
  id: string
  title: string
  summary?: string
  /** Link do YouTube (watch, youtu.be ou shorts). */
  youtube: string
}

export const VIDEO_LESSONS: VideoLesson[] = [
  { id: 'aula-01', title: 'Aula 01 Introdução', youtube: 'https://youtu.be/A6NZPxv0tqU' },
  { id: 'aula-02', title: 'Aula 02   Treino de Aquecimento, Postura e Soltura do Masseter Treine Comigo', youtube: 'https://youtu.be/xIa2yHNyafM' },
  { id: 'aula-03', title: 'Aula 03 Treino de Testa Lisa e Olhar Jovem', youtube: 'https://youtu.be/9SbeDmCjucY' },
  { id: 'aula-04', title: 'Aula 04 Treino de bochechas, maças e bigode chinês', youtube: 'https://youtu.be/DYgC1kQW-xk' },
  { id: 'aula-05', title: 'Aula 05: V Line e Mandíbula', youtube: 'https://youtu.be/zAFoHNSXmJ4' },
  { id: 'aula-06', title: 'Aula 06: Limpeza profunda', youtube: 'https://youtu.be/oTpbvJkjiDQ' },
  { id: 'aula-07', title: 'Aula 07: Guia de Ativos e Vitaminas', youtube: 'https://youtu.be/l69mor40fWs' },
  { id: 'aula-08', title: 'Aula 08: Manchas, melasma e proteção solar', youtube: 'https://youtu.be/h5Z4x-WpuVo' },
  { id: 'aula-09', title: 'Aula 09: Drenagem linfática e Hanbang 3 Minutos', youtube: 'https://youtu.be/Ng_yTCxJgOA' },
  { id: 'aula-10', title: 'Aula 10: Escultura com Gua sha e ferramentas', youtube: 'https://youtu.be/cC78MA4jbQg' },
]

/** Extrai o código do vídeo de qualquer formato de link do YouTube. */
export function youtubeId(url: string): string | undefined {
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/)
  return m?.[1]
}

export const videoLessonById = (id: string) => VIDEO_LESSONS.find((v) => v.id === id)
