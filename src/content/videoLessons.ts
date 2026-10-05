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

export const VIDEO_LESSONS: VideoLesson[] = []

/** Extrai o código do vídeo de qualquer formato de link do YouTube. */
export function youtubeId(url: string): string | undefined {
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/)
  return m?.[1]
}

export const videoLessonById = (id: string) => VIDEO_LESSONS.find((v) => v.id === id)
