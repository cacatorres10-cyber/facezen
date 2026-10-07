import { ArrowRight, BookOpen, Check, ChevronRight, Droplets, ExternalLink, Hand, Play, PlayCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { lessonById, moduleOfLesson, type ModuleKind } from '../content/course'
import { HelpLink } from '../components/HelpLink'
import { Accordion, BackLink, Button, cx, Eyebrow, Note, Title } from '../components/ui'
import { COURSE_ITEMS, COURSE_MODULES, itemAfter, moduleItems, nextItem } from '../lib/course'
import { useStore } from '../lib/store'
import { VIDEO_LESSONS, VIDEO_MODULES, videoLessonById, videoThumb, youtubeId, youtubeWatchUrl } from '../content/videoLessons'

const KIND_ICON: Record<ModuleKind, typeof BookOpen> = { teoria: BookOpen, exercicios: Hand, skincare: Droplets, video: PlayCircle }

export function Course() {
  const done = useStore((s) => s.lessonsDone)
  const next = nextItem(done)
  const total = COURSE_ITEMS.length
  const count = COURSE_ITEMS.filter((i) => done.includes(i.id)).length

  return (
    <div className="px-5 pb-28">
      <header className="pt-6">
        <Title>Curso</Title>
        <p className="mt-1 text-ink-soft">
          {count} de {total} aulas concluídas
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-jade transition-all" style={{ width: `${total ? (count / total) * 100 : 0}%` }} />
        </div>
      </header>

      {next && (
        <Link to={next.to} className="mt-5 flex items-center gap-3 rounded-3xl bg-hero p-4 text-on-hero shadow-soft">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-jade">
            <Play className="ml-0.5 size-5 fill-current" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold tracking-wider uppercase opacity-75">{count === 0 ? 'Comece por aqui' : 'Continuar'}</span>
            <span className="block truncate font-semibold">{next.title}</span>
          </span>
          <ArrowRight className="size-5 shrink-0 opacity-75" />
        </Link>
      )}

      <ol className="mt-6 grid gap-2">
        {COURSE_MODULES.map((m) => {
          const items = moduleItems(m)
          const d = items.filter((i) => done.includes(i.id)).length
          const Icon = KIND_ICON[m.kind]
          const complete = d === items.length
          return (
            <li key={m.id}>
              <Link to={`/curso/${m.id}`} className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-soft">
                <span className={cx('grid size-10 shrink-0 place-items-center rounded-xl', complete ? 'bg-ok-soft text-ok' : m.kind === 'skincare' ? 'bg-quartz-soft text-rose-ink' : 'bg-jade-soft text-jade')}>
                  {complete ? <Check className="size-5" /> : <Icon className="size-5" />}
                </span>
                <span className="min-w-0 flex-1 font-semibold text-ink">{m.title}</span>
                <span className="tnum text-sm text-ink-faint">
                  {d}/{items.length}
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

export function CourseModulePage() {
  const { modulo } = useParams()
  const done = useStore((s) => s.lessonsDone)
  const index = COURSE_MODULES.findIndex((m) => m.id === modulo)
  const m = COURSE_MODULES[index]
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
                {it.kind === 'video' ? (
                  <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-hero">
                    {it.thumb && <img src={it.thumb} alt="" loading="lazy" className="size-full object-cover" />}
                    <span className="absolute inset-0 grid place-items-center">
                      {ok ? <Check className="size-7 rounded-full bg-ok p-1 text-surface" /> : <PlayCircle className="size-8 text-white drop-shadow" />}
                    </span>
                    <span className="tnum absolute top-1 left-1 rounded-full bg-surface/90 px-1.5 text-[10px] font-bold text-ink">{n + 1}</span>
                  </span>
                ) : (
                  <span className={cx('tnum grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold', ok ? 'bg-ok-soft text-ok' : 'bg-surface-2 text-ink-soft')}>
                    {ok ? <Check className="size-4" /> : it.kind === 'exercicio' ? it.id : n + 1}
                  </span>
                )}
                <span className="min-w-0 flex-1 font-semibold text-ink">{it.title}</span>
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

      <ol className="mt-5 grid gap-3">
        {lesson.steps.map((step, i) => (
          <li key={step} className="rounded-3xl bg-surface p-4 text-ink shadow-soft">
            <span className="font-semibold text-jade">Passo {i + 1}:</span> {step}
          </li>
        ))}
      </ol>

      <Button
        size="lg"
        block
        className="mt-5"
        onClick={() => {
          completeLesson(lesson.id)
          navigate(next ? next.to : '/curso')
        }}
      >
        {done.includes(lesson.id) && <Check className="size-5" />}
        {next ? 'Concluir e ir para a próxima' : 'Concluir'}
      </Button>

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

export function VideoLessonPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const done = useStore((s) => s.lessonsDone)
  const completeLesson = useStore((s) => s.completeLesson)
  const v = videoLessonById(id ?? '')
  const yt = v && youtubeId(v.youtube)

  if (!v || !yt) {
    return (
      <div className="px-5 pt-6">
        <BackLink to="/curso" label="Curso" />
        <p className="mt-6 text-ink-soft">Aula não encontrada.</p>
      </div>
    )
  }

  const index = VIDEO_LESSONS.indexOf(v)
  const key = `v-${v.id}`
  const count = VIDEO_LESSONS.filter((x) => done.includes(`v-${x.id}`)).length
  const next = itemAfter(key)

  return (
    <div className="px-5 pb-28">
      <div className="pt-4">
        <BackLink to={`/curso/video-${v.module}`} label={VIDEO_MODULES.find((m) => m.id === v.module)?.title ?? 'Curso'} />
      </div>
      <Eyebrow className="mt-3">
        Aula {index + 1} de {VIDEO_LESSONS.length}
      </Eyebrow>
      <Title className="mt-1.5">{v.title}</Title>
      {v.summary && <p className="mt-1 text-ink-soft">{v.summary}</p>}

      <VideoPlayer key={yt} yt={yt} title={v.title} thumb={videoThumb(v.youtube)} watchUrl={youtubeWatchUrl(v.youtube)} />
      <a href={youtubeWatchUrl(v.youtube)} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-jade">
        <ExternalLink className="size-4" /> Abrir no YouTube
      </a>
      <HelpLink className="mt-4" />

      <div className="mt-5 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-jade transition-all" style={{ width: `${(count / VIDEO_LESSONS.length) * 100}%` }} />
        </div>
        <span className="tnum text-sm font-semibold text-ink-soft">
          {count}/{VIDEO_LESSONS.length}
        </span>
      </div>

      <Button
        size="lg"
        block
        className="mt-5"
        onClick={() => {
          completeLesson(key)
          navigate(next ? next.to : '/curso')
        }}
      >
        {done.includes(key) ? <Check className="size-5" /> : null}
        {next ? 'Concluir e ir para a próxima' : 'Concluir'}
      </Button>
    </div>
  )
}

/**
 * Capa com play; o vídeo do YouTube só carrega quando a pessoa toca.
 * Na prévia do Claude (que bloqueia o player do YouTube), tocar na capa abre a aula no YouTube.
 */
const EMBED_BLOCKED = !!import.meta.env.VITE_MEMORY_ROUTER

function VideoPlayer({ yt, title, thumb, watchUrl }: { yt: string; title: string; thumb?: string; watchUrl: string }) {
  const [playing, setPlaying] = useState(false)
  if (EMBED_BLOCKED) {
    return (
      <a href={watchUrl} target="_blank" rel="noreferrer" aria-label={`Assistir no YouTube: ${title}`} className="group relative mt-5 grid aspect-video place-items-center overflow-hidden rounded-3xl bg-hero shadow-soft">
        {thumb && <img src={thumb} alt="" className="absolute inset-0 size-full object-cover" />}
        <span className="absolute inset-0 bg-gradient-to-t from-[rgb(8_20_17/0.55)] to-transparent" />
        <span className="relative grid size-16 place-items-center rounded-full bg-surface/95 text-jade shadow-soft transition group-active:scale-95">
          <Play className="ml-1 size-7 fill-current" />
        </span>
        <span className="absolute bottom-3 rounded-full bg-surface/95 px-3 py-1 text-xs font-semibold text-ink">Toque para assistir no YouTube</span>
      </a>
    )
  }
  return (
    <div className="relative mt-5 aspect-video overflow-hidden rounded-3xl bg-hero shadow-soft">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0&playsinline=1&modestbranding=1&autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="size-full"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`Assistir: ${title}`} className="group absolute inset-0 grid place-items-center">
          {thumb && <img src={thumb} alt="" className="absolute inset-0 size-full object-cover" />}
          <span className="absolute inset-0 bg-gradient-to-t from-[rgb(8_20_17/0.55)] to-transparent" />
          <span className="relative grid size-16 place-items-center rounded-full bg-surface/95 text-jade shadow-soft transition group-active:scale-95">
            <Play className="ml-1 size-7 fill-current" />
          </span>
        </button>
      )}
    </div>
  )
}
