import { Check, ChevronRight, Heart, Play, ShieldAlert } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { EXERCISES, exerciseById, GROUPS, groupById, LEVEL_LABEL, type Exercise, type Level } from '../content/library'
import type { RegionId } from '../content/types'
import { ExerciseArt, StepArt } from '../components/ExerciseArt'
import { ExerciseVideo } from '../components/ExerciseVideo'
import { exerciseVideo } from '../content/exerciseVideos'
import { Photo } from '../components/Photo'
import { Stepper } from '../components/Stepper'
import { BackLink, Button, Card, Chip, Eyebrow, Note, Title, Toggle, cx } from '../components/ui'
import { formatDuration } from '../lib/dates'
import { exerciseBlockedBy, FLAG_REASON, hadRecentDiscomfort, isAllowed, levelFor } from '../lib/plan'
import { TOOL_VIDEOS, type ToolVideo } from '../content/toolVideos'
import { useStore } from '../lib/store'
import { useToday } from '../lib/useToday'

const NONE: string[] = []

function useLevel(): Level {
  const week = useStore((s) => s.program.week)
  const sessions = useStore((s) => s.sessions)
  return levelFor(week, hadRecentDiscomfort(sessions))
}

/** Filtros por parte do rosto: cada um junta os exercícios daquela região, de qualquer grupo. */
const AREAS: { id: string; label: string; regions?: RegionId[] }[] = [
  { id: 'pescoco', label: 'Pescoço', regions: ['pescoco'] },
  { id: 'mandibula', label: 'Mandíbula e papada', regions: ['mandibula', 'papada'] },
  { id: 'boca', label: 'Boca e bigode chinês', regions: ['bigode'] },
  { id: 'bochechas', label: 'Bochechas', regions: ['bochechas'] },
  { id: 'olhos', label: 'Olhos', regions: ['olhos'] },
  { id: 'testa', label: 'Testa', regions: ['testa'] },
  { id: 'ferramentas', label: 'Com ferramentas' },
]

const inArea = (e: Exercise, areaId: string) => {
  const area = AREAS.find((a) => a.id === areaId)
  if (!area) return true
  if (!area.regions) return e.group === 'escova'
  return !!e.region && area.regions.includes(e.region)
}

export function Library() {
  const [params, setParams] = useSearchParams()
  const area = params.get('area')
  const favOnly = params.get('favoritos') === '1'
  const profile = useStore((s) => s.profile)!
  const favorites = useStore((s) => s.favorites)
  const lessonsDone = useStore((s) => s.lessonsDone)
  const today = useToday()
  const practicedToday = useStore((s) => s.practiced)[today] ?? NONE
  const level = useLevel()

  const list = EXERCISES.filter((e) => (!area || inArea(e, area)) && (!favOnly || favorites.includes(e.id)))
  const showVideos = !favOnly && (!area || area === 'ferramentas')
  const groups = GROUPS.filter((g) => list.some((e) => e.group === g.id))

  return (
    <div className="pb-28">
      <div className="relative">
        <Photo k="pescoco" className="h-44 w-full" position="50% 30%" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg" />
      </div>
      <div className="-mt-8 px-5">
        <Title className="relative">Exercícios</Title>
        <p className="mt-1 text-ink-soft">
          {EXERCISES.length} exercícios, cada um com tutorial. Doses no seu nível: <span className="font-semibold text-ink">{LEVEL_LABEL[level].toLowerCase()}</span>.
        </p>

        <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
          <Chip selected={!area && !favOnly} onClick={() => setParams({}, { replace: true })} className="shrink-0">
            Todos
          </Chip>
          <Chip selected={favOnly} onClick={() => setParams(favOnly ? {} : { favoritos: '1' }, { replace: true })} className="shrink-0">
            <Heart className="size-3.5" /> Favoritos
          </Chip>
          {AREAS.map((a) => (
            <Chip key={a.id} selected={area === a.id} onClick={() => setParams(area === a.id ? {} : { area: a.id }, { replace: true })} className="shrink-0">
              {a.label}
            </Chip>
          ))}
        </div>

        {favOnly && list.length === 0 && <p className="mt-8 text-center text-ink-soft">Toque no coração de um exercício para guardá-lo aqui.</p>}

        {groups.map((g) => (
          <section key={g.id} className="mt-6">
            <h2 className="font-display text-xl font-medium text-ink">{g.title}</h2>
            {g.id === 'escova' && showVideos && (
              <>
                <p className="mt-1 text-sm text-ink-soft">{g.intro}</p>
                <div className="mt-3 grid gap-3">
                  {TOOL_VIDEOS.map((v) => (
                    <ToolVideoCard key={v.id} v={v} />
                  ))}
                </div>
                <p className="eyebrow mt-5">Pratique com a escova</p>
              </>
            )}
            <ol className="mt-2 grid gap-2">
              {list
                .filter((e) => e.group === g.id)
                .map((e) => {
                  const blocked = !isAllowed(e, profile)
                  return (
                    <li key={e.id}>
                      <Link to={`/exercicios/${e.id}`} className={cx('flex items-center gap-3 rounded-3xl bg-surface p-3 pr-4 shadow-soft', blocked && 'opacity-60')}>
                        <span className="relative w-16 shrink-0 rounded-2xl bg-surface-2 p-1">
                          <ExerciseArt id={e.id} />
                          <span className="absolute -top-1 -left-1 grid h-6 min-w-6 place-items-center rounded-full bg-jade px-1 text-[10px] font-bold text-on-jade">{e.id}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-ink">{e.title}</span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-faint">
                            <span>{e.dose[level]}</span>
                            {e.tool && <span className="font-semibold text-rose-ink">opcional · escova</span>}
                            {exerciseVideo(e.id) && <span className="font-semibold text-jade">com vídeo</span>}
                            {blocked && <span className="font-semibold text-danger">fora do seu plano</span>}
                            {practicedToday.includes(e.id) && <span className="font-semibold text-ok">feito hoje</span>}
                            {!practicedToday.includes(e.id) && lessonsDone.includes(e.id) && <span className="inline-flex items-center gap-0.5 text-ok"><Check className="size-3" /> aprendido</span>}
                          </span>
                        </span>
                        {favorites.includes(e.id) && <Heart className="size-4 fill-quartz text-rose-ink" />}
                        <ChevronRight className="size-5 shrink-0 text-ink-faint" />
                      </Link>
                    </li>
                  )
                })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}

export function ExerciseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const e = exerciseById(id ?? '')
  const profile = useStore((s) => s.profile)!
  const favorites = useStore((s) => s.favorites)
  const lessonsDone = useStore((s) => s.lessonsDone)
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const completeLesson = useStore((s) => s.completeLesson)
  const updateProfile = useStore((s) => s.updateProfile)
  const level = useLevel()

  if (!e) {
    return (
      <div className="px-5 pt-6">
        <BackLink to="/exercicios" label="Exercícios" />
        <p className="mt-6 text-ink-soft">Exercício não encontrado.</p>
      </div>
    )
  }

  const g = groupById(e.group)
  const blockedBy = exerciseBlockedBy(e, profile)
  const blocked = !isAllowed(e, profile)
  const adapt = profile.safety.map((f) => e.adapt?.[f]).filter(Boolean)
  const fav = favorites.includes(e.id)

  return (
    <div className="px-5 pb-44">
      <div className="flex items-center justify-between pt-4">
        <BackLink to="/exercicios" label="Exercícios" />
        <button
          type="button"
          onClick={() => toggleFavorite(e.id)}
          aria-pressed={fav}
          aria-label={fav ? 'Tirar dos favoritos' : 'Guardar nos favoritos'}
          className="grid size-10 place-items-center rounded-full bg-surface shadow-soft"
        >
          <Heart className={cx('size-5', fav ? 'fill-quartz text-rose-ink' : 'text-ink-soft')} />
        </button>
      </div>

      <Eyebrow className="mt-3">
        {e.id} · {g.title}
      </Eyebrow>
      <Title className="mt-1.5">{e.title}</Title>
      <p className="mt-1 text-ink-soft">{e.forWhat}</p>
      <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-jade-soft px-2.5 py-0.5 font-semibold text-jade">{e.dose[level]}</span>
        {e.sided && <span className="text-ink-faint">metade de cada lado</span>}
        {e.anywhere && <span className="text-ink-faint">dá para fazer em qualquer lugar</span>}
      </p>

      {blockedBy.length > 0 && (
        <Note tone="danger" className="mt-4" icon={<ShieldAlert className="size-4" />}>
          Por causa de {blockedBy.map((f) => FLAG_REASON[f]).join(' e ')}, este exercício fica fora do seu plano.
        </Note>
      )}
      {blockedBy.length === 0 && blocked && (
        <Note tone="warn" className="mt-4">
          Com pele sensível, a escova fica fora das sessões. Se quiser testar, comece numa área pequena.
        </Note>
      )}
      {e.tool === 'escova' && (
        <Card className="mt-4 !py-1">
          <Toggle
            id="tem-escova"
            checked={!!profile.tools?.includes('escova')}
            onChange={(v) => updateProfile({ tools: v ? ['escova'] : [] })}
            label="Tenho a escova facial"
            hint={profile.sensitive ? 'Com pele sensível, ela não entra nas sessões.' : 'Entra nas suas sessões 2 a 3 vezes por semana, a partir da semana 3.'}
          />
        </Card>
      )}
      {adapt.length > 0 && (
        <Note tone="info" className="mt-4">
          Para você: {adapt.join(' ')}
        </Note>
      )}

      {exerciseVideo(e.id) && <ExerciseVideo id={e.id} title={e.title} className="mx-auto mt-5 h-[52vh] shadow-soft" />}

      <div className="mt-5">
        <Stepper
          key={e.id}
          steps={e.steps}
          visualFor={(i) => <StepArt id={e.id} step={i} title={`Desenho do passo ${i + 1}: ${e.title}`} />}
          legend={e.tool ? 'Setas: o caminho da escova · cerdas encostando de leve' : 'Dedos em rosa · setas mostram o movimento · pontos são onde tocar'}
          done={lessonsDone.includes(e.id)}
          finishLabel="Aprendi"
          onFinish={() => completeLesson(e.id)}
        />
      </div>

      <div className="mt-4 grid gap-3">
        <Card className="!p-4">
          <p className="eyebrow">Confira no espelho</p>
          <p className="mt-1.5 text-ink">{e.check}</p>
        </Card>
        <Card className="!p-4">
          <p className="eyebrow">Dose por nível</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            {(['ini', 'int', 'ava'] as Level[]).map((l) => (
              <div key={l} className={cx('rounded-2xl p-2', l === level ? 'bg-jade-soft' : 'bg-surface-2')}>
                <p className="text-[11px] font-bold tracking-wide text-ink-faint uppercase">{LEVEL_LABEL[l]}</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{e.dose[l]}</p>
              </div>
            ))}
          </div>
        </Card>
        {e.skip && <p className="rounded-2xl bg-danger-soft px-4 py-3 text-sm text-ink">Pule se: {e.skip}</p>}
      </div>

      {!blocked && (
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-30 mx-auto max-w-[480px] bg-gradient-to-t from-bg via-bg/95 to-transparent px-5 pt-6 pb-3">
          <Button size="lg" block onClick={() => navigate(`/sessao?exercicio=${e.id}`)}>
            <Play className="size-5 fill-current" /> Praticar agora · {formatDuration(e.seconds[level])}
          </Button>
        </div>
      )}
    </div>
  )
}

function ToolVideoCard({ v }: { v: ToolVideo }) {
  return (
    <article className="overflow-hidden rounded-3xl bg-surface shadow-soft">
      <video src={v.src} poster={v.poster} controls playsInline preload="none" className="aspect-[9/16] max-h-[70vh] w-full bg-hero object-contain" aria-label={`Vídeo: ${v.title}`} />
      <div className="p-4">
        <p className="text-xs font-bold tracking-wider text-rose-ink uppercase">{v.tool}</p>
        <h3 className="mt-0.5 font-semibold text-ink">{v.title}</h3>
        <p className="mt-1 text-sm text-ink-soft">{v.summary}</p>
        <ul className="mt-3 grid gap-1.5 text-sm text-ink">
          {v.watch.map((w) => (
            <li key={w} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-jade" />
              {w}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-faint">
          Vídeo de{' '}
          <a href={v.credit.url} target="_blank" rel="noreferrer" className="font-semibold text-jade underline">
            {v.credit.name}
          </a>
        </p>
      </div>
    </article>
  )
}
