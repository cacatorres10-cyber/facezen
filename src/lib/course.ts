import { COURSE, type CourseModule } from '../content/course'
import { EXERCISES } from '../content/library'
import { VIDEO_LESSONS, VIDEO_MODULES, videoThumb } from '../content/videoLessons'

export interface CourseItem {
  id: string
  title: string
  summary: string
  kind: 'aula' | 'exercicio' | 'video'
  /** Capa (aulas em vídeo). */
  thumb?: string
  /** Rota do tutorial. */
  to: string
}

/** Aulas de um módulo, na ordem: aulas de texto ou exercícios dos grupos. */
export function moduleItems(m: CourseModule): CourseItem[] {
  if (m.videoModule) return VIDEO_LESSONS.filter((v) => v.module === m.videoModule).map((v) => ({ id: `v-${v.id}`, title: v.title, summary: v.summary ?? '', kind: 'video', to: `/curso/video/${v.id}`, thumb: videoThumb(v.youtube) }))
  const lessons: CourseItem[] = (m.lessons ?? []).map((l) => ({ id: l.id, title: l.title, summary: l.summary, kind: 'aula', to: `/curso/aula/${l.id}` }))
  const exercises: CourseItem[] = EXERCISES.filter((e) => m.groups?.includes(e.group)).map((e) => ({ id: e.id, title: e.title, summary: e.forWhat, kind: 'exercicio', to: `/exercicios/${e.id}` }))
  return [...lessons, ...exercises]
}

/** O curso no app: os módulos em vídeo e, em texto, o skincare. */
export const COURSE_MODULES: CourseModule[] = [
  ...VIDEO_MODULES.filter((m) => VIDEO_LESSONS.some((v) => v.module === m.id)).map(
    (m): CourseModule => ({ id: `video-${m.id}`, kind: 'video', title: m.title, intro: m.intro, videoModule: m.id }),
  ),
  // Das aulas em texto, só as de skincare ficam no curso do app (as outras seguem no PDF do NotebookLM).
  ...COURSE.filter((m) => m.kind === 'skincare'),
]

export const COURSE_ITEMS: CourseItem[] = COURSE_MODULES.flatMap(moduleItems)

/** Próxima aula ainda não concluída (ou nada, se o curso acabou). */
export function nextItem(done: string[]): CourseItem | undefined {
  return COURSE_ITEMS.find((i) => !done.includes(i.id))
}

/** Próxima aula depois de `id`, dentro do curso. */
export function itemAfter(id: string): CourseItem | undefined {
  const i = COURSE_ITEMS.findIndex((x) => x.id === id)
  return i >= 0 ? COURSE_ITEMS[i + 1] : undefined
}
