import { exerciseSvg } from '../content/art'
import { cx } from './ui'

/** Desenho do exercício: dedos, setas e expressão (gerado em `art.ts`). */
export function ExerciseArt({ id, title, className }: { id: string; title?: string; className?: string }) {
  const svg = exerciseSvg(id, title)
  if (!svg) return null
  return <div className={cx('[&>svg]:h-auto [&>svg]:w-full', className)} dangerouslySetInnerHTML={{ __html: svg }} />
}
