import { COURSE, type CourseModule } from '../content/course'
import { EXERCISES } from '../content/library'
import { VIDEO_LESSONS } from '../content/videoLessons'

export interface CourseItem {
  id: string
  title: string
  summary: string
  kind: 'aula' | 'exercicio' | 'video'
  /** Rota do tutorial. */
  to: string
}

/** Aulas de um módulo, na ordem: aulas de texto ou exercícios dos grupos. */
export function moduleItems(m: CourseModule): CourseItem[] {
  if (m.videos) return VIDEO_LESSONS.map((v) => ({ id: `v-${v.id}`, title: v.title, summary: v.summary ?? 'Aula em vídeo', kind: 'video', to: `/curso/video/${v.id}` }))
  const lessons: CourseItem[] = (m.lessons ?? []).map((l) => ({ id: l.id, title: l.title, summary: l.summary, kind: 'aula', to: `/curso/aula/${l.id}` }))
  const exercises: CourseItem[] = EXERCISES.filter((e) => m.groups?.includes(e.group)).map((e) => ({ id: e.id, title: e.title, summary: e.forWhat, kind: 'exercicio', to: `/exercicios/${e.id}` }))
  return [...lessons, ...exercises]
}

/** O curso no app: as aulas em vídeo (quando houver) abrem o curso. */
export const COURSE_MODULES: CourseModule[] = [
  ...(VIDEO_LESSONS.length ? [{ id: 'aulas', kind: 'video', title: 'Aulas em vídeo', intro: 'Assista na ordem. Cada aula concluída avança o seu progresso.', videos: true } satisfies CourseModule] : []),
  ...COURSE,
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
