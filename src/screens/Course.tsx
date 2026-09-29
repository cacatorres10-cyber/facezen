import { ArrowRight, BookOpen, Check, ChevronRight, Droplets, Hand } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { COURSE, lessonById, moduleOfLesson, type ModuleKind } from '../content/course'
import { Photo } from '../components/Photo'
import { Stepper } from '../components/Stepper'
import { Accordion, BackLink, Card, cx, Eyebrow, Note, ProgressRing, Title } from '../components/ui'
import { COURSE_ITEMS, itemAfter, moduleItems, nextItem } from '../lib/course'
import { useStore } from '../lib/store'

const KIND_ICON: Record<ModuleKind, typeof BookOpen> = { teoria: BookOpen, exercicios: Hand, skincare: Droplets }

export function Course() {
  const done = useStore((s) => s.lessonsDone)
  const next = nextItem(done)
  const total = COURSE_ITEMS.length
  const count = COURSE_ITEMS.filter((i) => done.includes(i.id)).length

  return (
    <div className="pb-28">
      <div className="relative">
        <Photo k="espelho" className="h-44 w-full" position="50% 35%" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg" />
      </div>
      <div className="-mt-8 px-5">
        <Title className="relative">Curso</Title>
        <p className="mt-1 text-ink-soft">Cada exercício e cada cuidado com a pele, um passo por vez.</p>

        <Card className="mt-5">
          <div className="flex items-center gap-4">
            <ProgressRing value={total ? count / total : 0} size={60}>
              <span className="tnum text-sm font-bold text-ink">{Math.round((count / total) * 100)}%</span>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">
                {count} de {total} aulas
              </p>
              <p className="truncate text-sm text-ink-soft">{next ? `Próxima: ${next.title}` : 'Curso concluído. Que bom que você chegou até aqui!'}</p>
            </div>
          </div>
          {next && (
            <Link to={next.to} className="mt-4 flex h-12 items-center justify-center gap-2 rounded-full bg-jade font-semibold text-on-jade">
              {count === 0 ? 'Começar o curso' : 'Continuar'} <ArrowRight className="size-5" />
            </Link>
          )}
        </Card>

        <ol className="mt-6 grid gap-2.5">
          {COURSE.map((m, n) => {
            const items = moduleItems(m)
            const d = items.filter((i) => done.includes(i.id)).length
            const Icon = KIND_ICON[m.kind]
            const complete = d === items.length
            return (
              <li key={m.id}>
                <Link to={`/curso/${m.id}`} className="flex items-center gap-3 rounded-3xl bg-surface p-4 shadow-soft">
                  <span className={cx('grid size-11 shrink-0 place-items-center rounded-2xl', complete ? 'bg-ok-soft text-ok' : m.kind === 'skincare' ? 'bg-quartz-soft text-rose-ink' : 'bg-jade-soft text-jade')}>
                    {complete ? <Check className="size-5" /> : <Icon className="size-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-bold tracking-wider text-ink-faint uppercase">Módulo {n + 1}</span>
                    <span className="block font-semibold text-ink">{m.title}</span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                        <span className="block h-full rounded-full bg-jade" style={{ width: `${(d / items.length) * 100}%` }} />
                      </span>
                      <span className="tnum text-xs text-ink-faint">
                        {d}/{items.length}
                      </span>
                    </span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-ink-faint" />
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

export function CourseModulePage() {
  const { modulo } = useParams()
  const done = useStore((s) => s.lessonsDone)
  const index = COURSE.findIndex((m) => m.id === modulo)
  const m = COURSE[index]
  if (!m) {
    return (
      <div className="px-5 pt-6">
        <BackLink to="/curso" label="Curso" />
        <p className="mt-6 text-ink-soft">Módulo não encontrado.</p>
      </div>
    )
  }
  const items = moduleItems(m)
  return (
    <div className="px-5 pb-28">
      <div className="pt-4">
        <BackLink to="/curso" label="Curso" />
      </div>
      <Eyebrow className="mt-3">Módulo {index + 1}</Eyebrow>
      <Title className="mt-1.5">{m.title}</Title>
      <p className="mt-1 text-ink-soft">{m.intro}</p>

      <ol className="mt-6 grid gap-2">
        {items.map((it, n) => {
          const ok = done.includes(it.id)
          return (
            <li key={it.id}>
              <Link to={it.to} className="flex items-center gap-3 rounded-2xl bg-surface p-3 pr-4 shadow-soft">
                <span className={cx('tnum grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold', ok ? 'bg-ok-soft text-ok' : 'bg-surface-2 text-ink-soft')}>
                  {ok ? <Check className="size-4" /> : it.kind === 'exercicio' ? it.id : n + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">{it.title}</span>
                  <span className="block truncate text-sm text-ink-faint">{it.summary}</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-ink-faint" />
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function LessonPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const done = useStore((s) => s.lessonsDone)
  const completeLesson = useStore((s) => s.completeLesson)
  const lesson = lessonById(id ?? '')
  const mod = moduleOfLesson(id ?? '')

  if (!lesson || !mod) {
    return (
      <div className="px-5 pt-6">
        <BackLink to="/curso" label="Curso" />
        <p className="mt-6 text-ink-soft">Aula não encontrada.</p>
      </div>
    )
  }

  const next = itemAfter(lesson.id)
  const hasMore = !!(lesson.details || lesson.table)

  return (
    <div className="px-5 pb-28">
      <div className="pt-4">
        <BackLink to={`/curso/${mod.id}`} label={mod.title} />
      </div>
      <Eyebrow className="mt-3">{mod.title}</Eyebrow>
      <Title className="mt-1.5">{lesson.title}</Title>
      <p className="mt-1 text-ink-soft">{lesson.summary}</p>

      <div className="mt-5">
        <Stepper
          key={lesson.id}
          steps={lesson.steps}
          done={done.includes(lesson.id)}
          finishLabel={next ? 'Concluir e seguir' : 'Concluir'}
          onFinish={() => {
            completeLesson(lesson.id)
            navigate(next ? next.to : '/curso')
          }}
        />
      </div>

      {lesson.avoid && (
        <Note tone="warn" className="mt-4">
          <span className="font-semibold">Evite: </span>
          {lesson.avoid.join(' · ')}
        </Note>
      )}

      {hasMore && (
        <div className="mt-4 rounded-3xl bg-surface px-5 shadow-soft">
          <Accordion title="Mais detalhes">
            {lesson.details && (
              <ul className="grid gap-2">
                {lesson.details.map((d) => (
                  <li key={d} className="flex gap-2.5">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-quartz" />
                    {d}
                  </li>
                ))}
              </ul>
            )}
            {lesson.table && (
              <table className="mt-3 w-full text-left text-sm">
                <thead>
                  <tr className="text-ink-faint">
                    <th className="pb-2 font-semibold">{lesson.table.head[0]}</th>
                    <th className="pb-2 font-semibold">{lesson.table.head[1]}</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson.table.rows.map(([a, b]) => (
                    <tr key={a} className="border-t border-line">
                      <td className="py-2 pr-3 font-semibold text-ink">{a}</td>
                      <td className="py-2 text-ink-soft">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Accordion>
        </div>
      )}
    </div>
  )
}
