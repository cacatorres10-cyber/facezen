import { COURSE, type CourseModule } from '../content/course'
import { EXERCISES } from '../content/library'

export interface CourseItem {
  id: string
  title: string
  summary: string
  kind: 'aula' | 'exercicio'
  /** Rota do tutorial. */
  to: string
}

/** Aulas de um módulo, na ordem: aulas de texto ou exercícios dos grupos. */
export function moduleItems(m: CourseModule): CourseItem[] {
  const lessons: CourseItem[] = (m.lessons ?? []).map((l) => ({ id: l.id, title: l.title, summary: l.summary, kind: 'aula', to: `/curso/aula/${l.id}` }))
  const exercises: CourseItem[] = EXERCISES.filter((e) => m.groups?.includes(e.group)).map((e) => ({ id: e.id, title: e.title, summary: e.forWhat, kind: 'exercicio', to: `/exercicios/${e.id}` }))
  return [...lessons, ...exercises]
}

export const COURSE_ITEMS: CourseItem[] = COURSE.flatMap(moduleItems)

/** Próxima aula ainda não concluída (ou nada, se o curso acabou). */
export function nextItem(done: string[]): CourseItem | undefined {
  return COURSE_ITEMS.find((i) => !done.includes(i.id))
}

/** Próxima aula depois de `id`, dentro do curso. */
export function itemAfter(id: string): CourseItem | undefined {
  const i = COURSE_ITEMS.findIndex((x) => x.id === id)
  return i >= 0 ? COURSE_ITEMS[i + 1] : undefined
}
