import { ExternalLink, Play } from 'lucide-react'
import { useState } from 'react'
import { PLAYLIST, VIDEO } from '../content/guide'
import { Card, Eyebrow, PageHeader } from '../components/ui'

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

/** Player do YouTube que só carrega quando a pessoa toca na prévia. */
function VideoCard({ src, preview, title, subtitle }: { src: string; preview?: string; title: string; subtitle: string }) {
  const [load, setLoad] = useState(false)
  return (
    <div className="overflow-hidden rounded-3xl bg-surface shadow-soft">
      {load ? (
        <iframe className="aspect-video w-full" src={src} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      ) : (
        <button type="button" onClick={() => setLoad(true)} className="relative block aspect-video w-full overflow-hidden bg-hero" aria-label={`Assistir: ${title}`}>
          {preview && <img src={preview} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />}
          <span className="absolute inset-0 bg-[rgb(8_20_17/0.25)]" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full bg-quartz text-[#3a1f1c] shadow-soft">
              <Play className="ml-1 size-7 fill-current" />
            </span>
          </span>
        </button>
      )}
      <div className="p-4">
        <p className="font-display text-xl font-medium text-ink">{title}</p>
        <p className="text-sm text-ink-soft">{subtitle}</p>
      </div>
    </div>
  )
}

export function Lessons() {
  return (
    <div className="px-5 pb-28">
      <PageHeader eyebrow="Vídeo-aulas" title="Aulas" subtitle="Assista antes de praticar e use sempre toque leve." />

      <Eyebrow className="mb-2">Aula 1 · comece por aqui</Eyebrow>
      <VideoCard
        src={`https://www.youtube-nocookie.com/embed/${VIDEO.youtubeId}?start=16&rel=0&autoplay=1`}
        preview={thumb(VIDEO.youtubeId)}
        title="Rotina guiada de yoga facial"
        subtitle={`${VIDEO.channel.split(',')[0]} · cerca de 12 min`}
      />
      <details className="mt-2 rounded-2xl bg-surface-2/60 px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-ink">O que tem nesta aula</summary>
        <ol className="mt-2 grid gap-1 text-sm text-ink-soft">
          {VIDEO.sequence.map((s, i) => (
            <li key={s.title}>
              {i + 1}. {s.title}
            </li>
          ))}
        </ol>
      </details>

      <Eyebrow className="mt-8 mb-2">Aulas 2 a {PLAYLIST.count + 1} · em ordem</Eyebrow>
      <VideoCard
        src={`https://www.youtube-nocookie.com/embed/videoseries?list=${PLAYLIST.url.split('list=')[1]}&rel=0&autoplay=1`}
        title={PLAYLIST.title}
        subtitle={`${PLAYLIST.channel} · ${PLAYLIST.count} vídeos, um depois do outro`}
      />
      <Card className="mt-3">
        <ol className="grid gap-2.5">
          {PLAYLIST.topics.map((t, i) => (
            <li key={t} className="flex items-center gap-3">
              <span className="tnum grid size-8 shrink-0 place-items-center rounded-full bg-jade-soft text-sm font-bold text-jade">{i + 2}</span>
              <span className="text-ink">{t}</span>
            </li>
          ))}
        </ol>
        <a href={PLAYLIST.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-jade">
          Abrir no YouTube <ExternalLink className="size-4" />
        </a>
      </Card>

      <p className="mt-6 text-xs text-ink-faint">Vídeos dos canais Longevidade Yoga e Face Yoga Paula Sá, exibidos pelo YouTube. Os créditos são dos autores.</p>
    </div>
  )
}
