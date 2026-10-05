import { exerciseSvg, stepSvg } from '../content/art'
import { cx } from './ui'

/** Desenho do exercício: dedos, setas e expressão (gerado em `art.ts`). */
export function ExerciseArt({ id, title, className }: { id: string; title?: string; className?: string }) {
  const svg = exerciseSvg(id, title)
  if (!svg) return null
  return <div className={cx('[&>svg]:h-auto [&>svg]:w-full', className)} dangerouslySetInnerHTML={{ __html: svg }} />
}

/** Desenho de um passo do tutorial (ou o desenho principal, se o exercício não tiver um por passo). */
export function StepArt({ id, step, title, className }: { id: string; step: number; title?: string; className?: string }) {
  const svg = stepSvg(id, step, title)
  if (!svg) return null
  return <div className={cx('[&>svg]:h-auto [&>svg]:w-full', className)} dangerouslySetInnerHTML={{ __html: svg }} />
}
