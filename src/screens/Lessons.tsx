import { ExternalLink, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AULAS, embedUrl, youtubeUrl } from '../content/aulas'
import { MOVES } from '../content/moves'
import { Photo } from '../components/Photo'
import { cx, Title } from '../components/ui'

export function Lessons() {
  const { hash } = useLocation()
  const [playing, setPlaying] = useState<string | null>(null)

  useEffect(() => {
    const id = hash.replace('#', '')
    if (!id) return
    setPlaying(id)
    document.getElementById(`aula-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  return (
    <div className="pb-28">
      <div className="relative">
        <Photo k="guaSha" className="h-44 w-full" position="50% 35%" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg" />
      </div>
      <div className="-mt-8 px-5">
        <Title className="relative">Aulas</Title>
        <p className="mt-1 text-ink-soft">{AULAS.length} vídeo-aulas, em ordem. Comece pela primeira.</p>

        <ol className="mt-5 grid gap-4">
          {AULAS.map((a, i) => {
            const open = playing === a.id
            return (
              <li key={a.id} id={`aula-${a.id}`} className="scroll-mt-4 overflow-hidden rounded-3xl bg-surface shadow-soft">
                {open ? (
                  <iframe
                    className="aspect-video w-full"
                    src={embedUrl(a.id)}
                    title={a.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <button type="button" onClick={() => setPlaying(a.id)} className="relative block aspect-video w-full overflow-hidden bg-hero" aria-label={`Assistir aula ${i + 1}: ${a.title}`}>
                    {a.thumb && <img src={a.thumb} alt="" loading={i < 2 ? 'eager' : 'lazy'} className="absolute inset-0 size-full object-cover" />}
                    <span className="absolute inset-0 bg-[rgb(8_20_17/0.15)]" />
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid size-14 place-items-center rounded-full bg-quartz/95 text-[#3a1f1c] shadow-soft">
                        <Play className="ml-0.5 size-6 fill-current" />
                      </span>
                    </span>
                    <span className="tnum absolute top-3 left-3 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-bold text-ink">Aula {i + 1}</span>
                  </button>
                )}
                <div className="flex items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug text-ink">{a.title}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">{a.channel}</p>
                  </div>
                  <a href={youtubeUrl(a.id)} target="_blank" rel="noreferrer" aria-label="Abrir no YouTube" className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-ink-soft">
                    <ExternalLink className="size-4" />
                  </a>
                </div>
                {i === 0 && (
                  <div className="border-t border-line px-4 py-3">
                    <p className="mb-2 text-xs font-semibold text-ink-faint">Os movimentos desta aula</p>
                    <div className="flex flex-wrap gap-1.5">
                      {MOVES.map((m, n) => (
                        <Link key={m.id} to={`/exercicios/${m.id}`} className={cx('rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-soft')}>
                          {n + 1}. {m.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ol>

        <p className="mt-6 text-xs text-ink-faint">Vídeos dos canais Longevidade Yoga e Face Yoga Paula Sá, exibidos pelo YouTube. Pratique sempre com toque leve.</p>
      </div>
    </div>
  )
}
