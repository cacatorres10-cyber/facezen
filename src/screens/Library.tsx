import { ChevronRight, Clock, Heart, Play, PlayCircle, ShieldAlert, Star } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { aulaById } from '../content/aulas'
import { MOVES, moveById, REGIONS, regionById, RELATED_AULAS } from '../content/moves'
import type { RegionId } from '../content/types'
import { FaceMap } from '../components/FaceMap'
import { Photo } from '../components/Photo'
import { BackLink, Button, Card, Chip, cx, Eyebrow, Note, Title } from '../components/ui'
import { formatDuration } from '../lib/dates'
import { FLAG_REASON, moveBlockedBy } from '../lib/plan'
import { useStore } from '../lib/store'
import { useToday } from '../lib/useToday'

const NONE: string[] = []

export function Library() {
  const [params, setParams] = useSearchParams()
  const region = params.get('regiao') as RegionId | null
  const favOnly = params.get('favoritos') === '1'
  const profile = useStore((s) => s.profile)!
  const favorites = useStore((s) => s.favorites)
  const today = useToday()
  const practicedToday = useStore((s) => s.practiced)[today] ?? NONE

  const list = MOVES.filter((m) => (!region || m.region === region) && (!favOnly || favorites.includes(m.id)))
  const regions = REGIONS.filter((r) => MOVES.some((m) => m.region === r.id))

  return (
    <div className="pb-28">
      <div className="relative">
        <Photo k="pescoco" className="h-44 w-full" position="50% 30%" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg" />
      </div>
      <div className="-mt-8 px-5">
        <Title className="relative">Exercícios</Title>
        <p className="mt-1 text-ink-soft">Os movimentos da aula guiada, na mesma ordem do vídeo.</p>

        <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
          <Chip selected={!region && !favOnly} onClick={() => setParams({}, { replace: true })} className="shrink-0">
            Todos
          </Chip>
          <Chip selected={favOnly} onClick={() => setParams(favOnly ? {} : { favoritos: '1' }, { replace: true })} className="shrink-0">
            <Heart className="size-3.5" /> Favoritos
          </Chip>
          {regions.map((r) => (
            <Chip key={r.id} selected={region === r.id} onClick={() => setParams(region === r.id ? {} : { regiao: r.id }, { replace: true })} className="shrink-0">
              {profile.focus.includes(r.id) && <Star className="size-3 fill-current" />}
              {r.short}
            </Chip>
          ))}
        </div>

        {favOnly && list.length === 0 && <p className="mt-8 text-center text-ink-soft">Toque no coração de um exercício para guardá-lo aqui.</p>}

        <ol className="mt-4 grid gap-2.5">
          {list.map((m) => {
            const n = MOVES.indexOf(m) + 1
            const blocked = moveBlockedBy(m, profile).length > 0
            return (
              <li key={m.id}>
                <Link to={`/exercicios/${m.id}`} className={cx('flex items-center gap-3 rounded-3xl bg-surface p-3 pr-4 shadow-soft', blocked && 'opacity-60')}>
                  <span className="relative w-16 shrink-0 rounded-2xl bg-surface-2 p-1">
                    <FaceMap highlight={m.region} />
                    <span className="tnum absolute -top-1 -left-1 grid size-6 place-items-center rounded-full bg-jade text-[11px] font-bold text-on-jade">{n}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{m.title}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-faint">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" /> {formatDuration(m.durationSec)}
                      </span>
                      {blocked && <span className="font-semibold text-danger">fora do seu plano</span>}
                      {practicedToday.includes(m.id) && <span className="font-semibold text-ok">feito hoje</span>}
                    </span>
                  </span>
                  {favorites.includes(m.id) && <Heart className="size-4 fill-quartz text-rose-ink" />}
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

export function ExerciseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const m = moveById(id ?? '')
  const profile = useStore((s) => s.profile)!
  const favorites = useStore((s) => s.favorites)
  const toggleFavorite = useStore((s) => s.toggleFavorite)

  if (!m) {
    return (
      <div className="px-5 pt-6">
        <BackLink to="/exercicios" label="Exercícios" />
        <p className="mt-6 text-ink-soft">Exercício não encontrado.</p>
      </div>
    )
  }

  const blockedBy = moveBlockedBy(m, profile)
  const fav = favorites.includes(m.id)
  const aula = aulaById(m.aula)
  const related = (m.region ? (RELATED_AULAS[m.region] ?? []) : []).map(aulaById).filter((a) => !!a)

  return (
    <div className="px-5 pb-44">
      <div className="flex items-center justify-between pt-4">
        <BackLink to="/exercicios" label="Exercícios" />
        <button
          type="button"
          onClick={() => toggleFavorite(m.id)}
          aria-pressed={fav}
          aria-label={fav ? 'Tirar dos favoritos' : 'Guardar nos favoritos'}
          className="grid size-10 place-items-center rounded-full bg-surface shadow-soft"
        >
          <Heart className={cx('size-5', fav ? 'fill-quartz text-rose-ink' : 'text-ink-soft')} />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-[1fr_96px] items-end gap-4">
        <div>
          <Eyebrow>
            Movimento {MOVES.indexOf(m) + 1} de {MOVES.length}
            {m.region && ` · ${regionById(m.region).label}`}
          </Eyebrow>
          <Title className="mt-1.5">{m.title}</Title>
          <p className="mt-2 inline-flex items-center gap-1 text-sm text-ink-soft">
            <Clock className="size-4" /> {formatDuration(m.durationSec)}
            {m.sided && ' · metade de cada lado'}
          </p>
        </div>
        <FaceMap highlight={m.region} />
      </div>

      {blockedBy.length > 0 && (
        <Note tone="danger" className="mt-4" icon={<ShieldAlert className="size-4" />}>
          Por causa de {blockedBy.map((f) => FLAG_REASON[f]).join(' e ')}, este movimento fica fora do seu plano.
        </Note>
      )}

      <Card className="mt-5">
        <p className="eyebrow">Como fazer</p>
        <ol className="mt-3 grid gap-3">
          {m.steps.map((c, i) => (
            <li key={c} className="flex gap-3 text-ink">
              <span className="tnum grid size-7 shrink-0 place-items-center rounded-full bg-jade-soft text-sm font-bold text-jade">{i + 1}</span>
              <span className="pt-0.5">{c}</span>
            </li>
          ))}
        </ol>
      </Card>

      <p className="mt-3 rounded-2xl bg-danger-soft px-4 py-3 text-sm text-ink">{m.stop}</p>

      {aula && (
        <section className="mt-6">
          <p className="eyebrow mb-2">Veja na aula</p>
          <AulaLink id={aula.id} />
          {related.length > 0 && (
            <>
              <p className="eyebrow mt-5 mb-2">Para ir além</p>
              <div className="grid gap-2">
                {related.map((a) => (
                  <AulaLink key={a.id} id={a.id} />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {blockedBy.length === 0 && (
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-30 mx-auto max-w-[480px] bg-gradient-to-t from-bg via-bg/95 to-transparent px-5 pt-6 pb-3">
          <Button size="lg" block onClick={() => navigate(`/sessao?exercicio=${m.id}`)}>
            <Play className="size-5 fill-current" /> Praticar agora · {formatDuration(m.durationSec)}
          </Button>
        </div>
      )}
    </div>
  )
}

function AulaLink({ id }: { id: string }) {
  const a = aulaById(id)
  if (!a) return null
  return (
    <Link to={`/aulas#${a.id}`} className="flex items-center gap-3 rounded-2xl bg-surface p-2 pr-4 shadow-soft">
      <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-hero">
        {a.thumb && <img src={a.thumb} alt="" className="size-full object-cover" loading="lazy" />}
        <PlayCircle className="absolute inset-0 m-auto size-7 text-white drop-shadow" />
      </span>
      <span className="min-w-0 flex-1 text-sm font-semibold text-ink">{a.title}</span>
    </Link>
  )
}
