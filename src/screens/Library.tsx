import { AlertTriangle, Check, ChevronRight, Clock, Heart, Play, ShieldAlert, Star } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { EXERCISES, exerciseById, REGIONS, regionById } from '../content/exercises'
import type { RegionId } from '../content/types'
import { FaceMap } from '../components/FaceMap'
import { Accordion, BackLink, Button, Card, Chip, cx, Eyebrow, Note, PageHeader, Title } from '../components/ui'
import { dayKey, formatDuration } from '../lib/dates'
import { exerciseStatus, FLAG_REASON } from '../lib/plan'
import { useStore } from '../lib/store'

const NONE: string[] = []

export function Library() {
  const [params, setParams] = useSearchParams()
  const region = params.get('regiao') as RegionId | null
  const favOnly = params.get('favoritos') === '1'
  const profile = useStore((s) => s.profile)!
  const week = useStore((s) => s.program.week)
  const favorites = useStore((s) => s.favorites)
  const practicedToday = useStore((s) => s.practiced)[dayKey()] ?? NONE

  const setRegion = (r: RegionId | null) => {
    const next = new URLSearchParams(params)
    if (r && r !== region) next.set('regiao', r)
    else next.delete('regiao')
    next.delete('favoritos')
    setParams(next, { replace: true })
  }

  const list = EXERCISES.filter((e) => (!region || e.region === region) && (!favOnly || favorites.includes(e.id)))
  const groups = REGIONS.filter((r) => list.some((e) => e.region === r.id))

  return (
    <div className="px-5 pb-28">
      <PageHeader eyebrow="14 exercícios" title="Exercícios" />

      <div className="grid grid-cols-[120px_1fr] items-center gap-4 rounded-3xl bg-surface p-4 shadow-soft">
        <FaceMap selected={region ? [region] : []} onToggle={(r) => setRegion(r)} />
        <div>
          <p className="font-display text-xl font-medium text-ink">{region ? regionById(region).label : 'Toque numa região'}</p>
          <p className="mt-1 text-sm text-ink-soft">{region ? regionById(region).concern : 'As estrelas marcam os seus objetivos.'}</p>
          {region && (
            <button type="button" onClick={() => setRegion(null)} className="mt-2 text-sm font-semibold text-jade">
              Ver todas
            </button>
          )}
        </div>
      </div>

      <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        <Chip selected={!region && !favOnly} onClick={() => setParams({}, { replace: true })}>
          Todas
        </Chip>
        <Chip selected={favOnly} onClick={() => setParams(favOnly ? {} : { favoritos: '1' }, { replace: true })}>
          <Heart className="size-3.5" /> Favoritas
        </Chip>
        {REGIONS.map((r) => (
          <Chip key={r.id} selected={region === r.id} onClick={() => setRegion(r.id)} className="shrink-0">
            {profile.focus.includes(r.id) && <Star className="size-3 fill-current" />}
            {r.short}
          </Chip>
        ))}
      </div>

      {profile.safety.includes('procedimento') && (
        <Note tone="warn" className="mt-4" icon={<ShieldAlert className="size-4" />}>
          Procedimento recente: espere a liberação antes de massagear o rosto.
        </Note>
      )}

      {favOnly && list.length === 0 && <p className="mt-8 text-center text-ink-soft">Toque no coração de uma ficha para guardá-la aqui.</p>}

      <div className="mt-5 grid gap-7">
        {groups.map((g) => (
          <section key={g.id} aria-label={g.label}>
            <h2 className="mb-2.5 flex items-center gap-2 font-display text-2xl font-medium text-ink">
              {g.label}
              {profile.focus.includes(g.id) && <Star className="size-4 fill-quartz text-rose-ink" />}
            </h2>
            <ul className="grid gap-2.5">
              {list
                .filter((e) => e.region === g.id)
                .map((e) => {
                  const st = exerciseStatus(e, profile, week)
                  return (
                    <li key={e.id}>
                      <Link to={`/exercicios/${e.id}`} className="flex items-center gap-3 rounded-3xl bg-surface p-4 shadow-soft">
                        <span className="tnum grid size-11 shrink-0 place-items-center rounded-2xl bg-surface-2 text-sm font-bold text-ink-soft">{e.number}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-ink">{e.title}</span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-faint">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="size-3" /> {formatDuration(e.practiceSec)}
                            </span>
                            {e.optional && <span>opcional</span>}
                            {st.blocked ? (
                              <span className="font-semibold text-danger">pede liberação</span>
                            ) : st.early ? (
                              <span>a partir da semana {e.minWeek}</span>
                            ) : null}
                            {practicedToday.includes(e.id) && <span className="font-semibold text-ok">feito hoje</span>}
                          </span>
                        </span>
                        {favorites.includes(e.id) && <Heart className="size-4 fill-quartz text-rose-ink" />}
                        <ChevronRight className="size-5 shrink-0 text-ink-faint" />
                      </Link>
                    </li>
                  )
                })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

export function ExerciseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const ex = exerciseById(id ?? '')
  const profile = useStore((s) => s.profile)!
  const week = useStore((s) => s.program.week)
  const favorites = useStore((s) => s.favorites)
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const practicedToday = useStore((s) => s.practiced)[dayKey()] ?? NONE

  if (!ex) {
    return (
      <div className="px-5 pt-10">
        <p className="text-ink-soft">Ficha não encontrada.</p>
        <BackLink to="/exercicios" label="Exercícios" />
      </div>
    )
  }

  const st = exerciseStatus(ex, profile, week)
  const fav = favorites.includes(ex.id)
  const done = practicedToday.includes(ex.id)
  const details: { label: string; text: string }[] = [
    { label: 'Para que serve', text: ex.goal },
    { label: 'Posição', text: ex.position },
    { label: 'Execução completa', text: ex.execution },
    { label: 'Respiração', text: ex.breathing },
    { label: 'Frequência', text: ex.frequency },
    { label: 'O que sentir', text: ex.sensation },
    ...(ex.note ? [{ label: ex.note.title, text: ex.note.text }] : []),
  ]

  return (
    <div className="px-5 pb-44">
      <div className="flex items-center justify-between pt-4">
        <BackLink to="/exercicios" label="Exercícios" />
        <button
          type="button"
          onClick={() => toggleFavorite(ex.id)}
          aria-pressed={fav}
          aria-label={fav ? 'Tirar dos favoritos' : 'Guardar nos favoritos'}
          className="grid size-10 place-items-center rounded-full bg-surface shadow-soft"
        >
          <Heart className={cx('size-5', fav ? 'fill-quartz text-rose-ink' : 'text-ink-soft')} />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-[1fr_104px] items-end gap-4">
        <div>
          <Eyebrow>
            Ficha {ex.number} · {regionById(ex.region).label}
          </Eyebrow>
          <Title className="mt-1.5">{ex.title}</Title>
        </div>
        <FaceMap highlight={ex.region} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-ink-soft">
          <Clock className="size-3.5" /> {ex.sided ? `${formatDuration(ex.practiceSec / 2)} por lado` : formatDuration(ex.practiceSec)}
        </span>
        {ex.optional && <span className="rounded-full bg-surface-2 px-3 py-1.5 text-ink-soft">Opcional</span>}
        <span className="rounded-full bg-surface-2 px-3 py-1.5 text-ink-soft">A partir da semana {ex.minWeek}</span>
        {done && (
          <span className="inline-flex items-center gap-1 rounded-full bg-ok-soft px-3 py-1.5 text-ok">
            <Check className="size-3.5" /> Feito hoje
          </span>
        )}
      </div>

      {st.blocked && (
        <Note tone="danger" className="mt-4" icon={<ShieldAlert className="size-4" />}>
          Por causa de {st.blockedBy.map((f) => FLAG_REASON[f]).join(' e ')}, este exercício fica fora do seu plano. Converse com um profissional antes.
        </Note>
      )}
      {!st.blocked && st.caution.length > 0 && (
        <Note tone="warn" className="mt-4" icon={<AlertTriangle className="size-4" />}>
          Cuidado extra ({st.caution.map((f) => FLAG_REASON[f]).join(', ')}): pressão mínima.
        </Note>
      )}

      <Card className="mt-5">
        <p className="eyebrow">Como fazer</p>
        <ol className="mt-3 grid gap-3">
          {ex.cues.map((c, i) => (
            <li key={c} className="flex gap-3 text-ink">
              <span className="tnum grid size-7 shrink-0 place-items-center rounded-full bg-jade-soft text-sm font-bold text-jade">{i + 1}</span>
              <span className="pt-0.5">{c}</span>
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-3 rounded-3xl bg-danger-soft p-4">
        <p className="eyebrow !text-danger">Pare se sentir</p>
        <p className="mt-1 text-sm text-ink">{ex.stopSigns.split('.')[0]}.</p>
      </div>

      <div className="mt-3 rounded-3xl bg-surface px-5 shadow-soft">
        <Accordion title="Mais detalhes">
          <dl className="grid gap-4">
            {details.map((r) => (
              <div key={r.label}>
                <dt className="eyebrow">{r.label}</dt>
                <dd className="mt-1 text-ink">{r.text}</dd>
              </div>
            ))}
          </dl>
        </Accordion>
      </div>

      {!st.blocked && (
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-30 mx-auto max-w-[480px] bg-gradient-to-t from-bg via-bg/95 to-transparent px-5 pt-6 pb-3">
          <Button size="lg" block onClick={() => navigate(`/sessao?exercicio=${ex.id}`)}>
            <Play className="size-5 fill-current" /> Praticar agora · {formatDuration(ex.practiceSec)}
          </Button>
        </div>
      )}
    </div>
  )
}
