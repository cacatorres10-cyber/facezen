import {
  AlertTriangle,
  BookMarked,
  CalendarRange,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Droplet,
  FlaskConical,
  Layers,
  ListOrdered,
  PlayCircle,
  Search,
  Sparkles,
  Timer,
  MonitorPlay,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CHECKLIST,
  COPYRIGHT_NOTE,
  DISCLAIMER,
  FAQ,
  HOW_TO_USE,
  IRRITATION_STEPS,
  MATERIALS,
  MATERIALS_WARNING,
  PLAYLIST,
  PREP_STEPS,
  PRINCIPLES,
  REFERENCES,
  SEEK_HELP,
  SKINCARE_ERRORS,
  VIDEO,
  WHEN_NOT,
  YOGA_ERRORS,
} from '../content/guide'
import { PHOTOS } from '../content/photos'
import { STEPS } from '../content/routine'
import { APPLICATION_ORDER, INGREDIENTS, RECIPES, SKIN_TYPES } from '../content/skincare'
import { Photo } from '../components/Photo'
import { Accordion, BackLink, Card, cx, Eyebrow, LinkButton, Note, Title } from '../components/ui'
import { formatDuration } from '../lib/dates'
import { useStore } from '../lib/store'

interface Section {
  id: string
  title: string
  hint: string
  icon: ReactNode
  body: () => ReactNode
}

const Bullets = ({ items, tone = 'quartz' }: { items: string[]; tone?: 'quartz' | 'danger' }) => (
  <ul className="grid gap-2.5">
    {items.map((t) => (
      <li key={t} className="flex gap-3 text-ink">
        <span className={cx('mt-2 size-1.5 shrink-0 rounded-full', tone === 'danger' ? 'bg-danger' : 'bg-quartz')} />
        <span>{t}</span>
      </li>
    ))}
  </ul>
)

const Numbered = ({ items }: { items: { title: string; text: string }[] }) => (
  <ol className="grid gap-4">
    {items.map((s, i) => (
      <li key={s.title} className="grid grid-cols-[36px_1fr] gap-3">
        <span className="tnum grid size-9 place-items-center rounded-full bg-jade-soft font-display text-lg font-medium text-jade">{i + 1}</span>
        <div>
          <p className="font-semibold text-ink">{s.title}</p>
          <p className="mt-0.5 text-ink-soft">{s.text}</p>
        </div>
      </li>
    ))}
  </ol>
)

const H2 = ({ children }: { children: ReactNode }) => <h2 className="mt-8 mb-3 font-display text-2xl font-medium text-ink first:mt-0">{children}</h2>

const ROUTINE_ORDER = ['chegada', 'aquecimento', 'testa', 'olhosCirculos', 'olhosRastreamento', 'bochechasAr', 'bigode', 'mandibula', 'queixo', 'pescoco', 'encerramento']

function SkinTypes() {
  const profile = useStore((s) => s.profile)
  const mine = [profile?.skinBase, profile?.sensitive && 'sensivel', profile?.mature && 'madura'].filter(Boolean)
  return (
    <>
      <p className="text-ink-soft">Tipos de pele são pontos de partida, não caixas permanentes. Sensibilidade pode coexistir com oleosidade, secura ou combinação; estação, estresse, hormônios e produtos também mudam o comportamento do rosto.</p>
      <div className="mt-4 rounded-3xl bg-surface px-5 shadow-soft">
        {SKIN_TYPES.map((t) => (
          <Accordion
            key={t.id}
            defaultOpen={mine.includes(t.id)}
            title={t.label}
            meta={mine.includes(t.id) ? <span className="rounded-full bg-quartz-soft px-2.5 py-0.5 text-xs font-bold text-rose-ink">sua pele</span> : undefined}
          >
            <p className="mb-3 text-sm italic">{t.hint}</p>
            <Bullets items={t.tips} />
          </Accordion>
        ))}
      </div>
    </>
  )
}

function FaqList() {
  const [q, setQ] = useState('')
  const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
  const list = FAQ.filter((f) => !q || norm(f.q + f.a).includes(norm(q)))
  return (
    <>
      <label htmlFor="faq-search" className="relative block">
        <span className="sr-only">Buscar nas perguntas</span>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-faint" />
        <input id="faq-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar: olheiras, retinoide, papada…" className="h-12 w-full rounded-full border border-line bg-surface pr-4 pl-11 text-ink placeholder:text-ink-faint focus:border-jade focus:outline-none" />
      </label>
      <div className="mt-4 rounded-3xl bg-surface px-5 shadow-soft">
        {list.map((f) => (
          <Accordion key={f.q} title={f.q}>
            <p>{f.a}</p>
          </Accordion>
        ))}
        {list.length === 0 && <p className="py-6 text-center text-ink-soft">Nenhuma pergunta encontrada.</p>}
      </div>
    </>
  )
}

function VideoEmbed() {
  const [load, setLoad] = useState(false)
  return (
    <div className="overflow-hidden rounded-3xl bg-ink shadow-soft">
      {load ? (
        <iframe
          className="aspect-video w-full"
          src={`https://www.youtube-nocookie.com/embed/${VIDEO.youtubeId}?start=16&rel=0`}
          title={VIDEO.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setLoad(true)} className="relative grid aspect-video w-full place-items-center text-on-jade" style={{ background: 'radial-gradient(120% 90% at 20% 10%, #2c6b5d, #10302a)' }}>
          <span className="grid justify-items-center gap-2">
            <PlayCircle className="size-14 text-quartz" strokeWidth={1.4} />
            <span className="font-semibold text-white">Assistir aqui</span>
            <span className="text-xs text-white/70">Carrega o vídeo do YouTube</span>
          </span>
        </button>
      )}
    </div>
  )
}

export const SECTIONS: Section[] = [
  {
    id: 'comece',
    title: 'Comece aqui',
    hint: 'Aviso, como usar e princípios',
    icon: <Sparkles className="size-5" />,
    body: () => (
      <>
        <Note tone="warn" icon={<AlertTriangle className="size-4" />}>
          <strong className="block">Aviso de escopo e responsabilidade</strong>
          {DISCLAIMER}
        </Note>
        <H2>Como usar</H2>
        <div className="grid gap-3 text-ink">
          {HOW_TO_USE.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <H2>Princípios</H2>
        <div className="grid gap-2.5">
          {PRINCIPLES.map((p) => (
            <Card key={p.title} className="!p-4">
              <p className="font-display text-xl font-medium text-ink">{p.title}</p>
              <p className="mt-1 text-ink-soft">{p.text}</p>
            </Card>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'antes',
    title: 'Antes de começar',
    hint: 'Materiais, preparação e quando não praticar',
    icon: <ClipboardCheck className="size-5" />,
    body: () => (
      <>
        <H2>Materiais</H2>
        <p className="mb-3 text-ink-soft">A rotina pode ser feita somente com as mãos. Separe:</p>
        <Bullets items={MATERIALS} />
        <Note tone="warn" className="mt-4">
          {MATERIALS_WARNING}
        </Note>
        <H2>Preparação em oito passos</H2>
        <Numbered items={PREP_STEPS} />
        <H2>Quando não praticar sem orientação</H2>
        <div className="grid gap-3 text-ink">
          {WHEN_NOT.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'rotina',
    title: 'A rotina de 10 minutos',
    hint: 'A sequência completa, minuto a minuto',
    icon: <Timer className="size-5" />,
    body: () => (
      <>
        <p className="text-ink-soft">Uma adaptação editorial conservadora dos movimentos publicados. Não some a várias outras rotinas longas no mesmo dia. Em olhos, pescoço e mandíbula, escolha a versão leve e pule a etapa se houver dúvida.</p>
        <ol className="mt-5 grid gap-3">
          {ROUTINE_ORDER.map((id) => {
            const s = STEPS[id]
            return (
              <li key={id} className="rounded-3xl bg-surface p-4 shadow-soft">
                <p className="eyebrow">
                  {s.minute ?? 'Complemento'} · {formatDuration(s.durationSec)}
                </p>
                <p className="mt-1 font-display text-xl font-medium text-ink">{s.title}</p>
                <p className="mt-1 text-ink-soft">{s.instruction}</p>
              </li>
            )
          })}
        </ol>
        <LinkButton to="/sessao" className="mt-5 w-full">
          Fazer minha sessão de hoje
        </LinkButton>
      </>
    ),
  },
  {
    id: 'calendario',
    title: 'Calendário de 8 semanas',
    hint: 'A progressão e seus dias de descanso',
    icon: <CalendarRange className="size-5" />,
    body: () => null,
  },
  { id: 'tipos-de-pele', title: 'Tipos de pele', hint: 'Seca, oleosa, mista, normal, sensível, madura', icon: <Droplet className="size-5" />, body: () => <SkinTypes /> },
  {
    id: 'ingredientes',
    title: 'Ingredientes',
    hint: 'Vitamina C, niacinamida, retinoides e mais',
    icon: <FlaskConical className="size-5" />,
    body: () => (
      <>
        <Photo k="serum" className="mb-5 h-44 w-full rounded-3xl" width={900} />
        <div className="rounded-3xl bg-surface px-5 shadow-soft">
          {INGREDIENTS.map((i) => (
            <Accordion key={i.id} title={i.name} meta={<span className="shrink-0 text-xs font-semibold text-ink-faint">{i.when}</span>}>
              <p>{i.text}</p>
            </Accordion>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'ordem',
    title: 'Ordem de aplicação',
    hint: 'Manhã, noite e noite com retinoide',
    icon: <ListOrdered className="size-5" />,
    body: () => (
      <>
        <div className="grid gap-3">
          {APPLICATION_ORDER.map((o) => (
            <Card key={o.id}>
              <p className="font-display text-xl font-medium text-ink">{o.title}</p>
              <ol className="mt-3 grid gap-2">
                {o.steps.map((s, i) => (
                  <li key={s} className="flex gap-3 text-ink">
                    <span className="tnum w-5 shrink-0 font-bold text-jade">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-ink-soft">A regra “do mais leve ao mais espesso” é uma convenção útil, não uma lei absoluta. Se um produto esfarelar, arder ou deixar a pele desconfortável, simplifique.</p>
      </>
    ),
  },
  {
    id: 'receitas',
    title: 'Receitas de rotina',
    hint: 'Combinações sem marcas obrigatórias',
    icon: <Layers className="size-5" />,
    body: () => (
      <>
        <p className="text-ink-soft">“Receita” aqui significa uma combinação de etapas e texturas, não uma mistura caseira. Não prepare cosméticos com limão, bicarbonato, açúcar, óleos essenciais ou ingredientes de cozinha no rosto.</p>
        <div className="mt-4 grid gap-3">
          {RECIPES.map((r) => (
            <Card key={r.id}>
              <p className="eyebrow">{r.forWhom}</p>
              <p className="mt-1 font-display text-xl font-medium text-ink">{r.title}</p>
              <dl className="mt-2 grid gap-1.5 text-sm text-ink-soft">
                <p>
                  <b className="text-ink">Manhã:</b> {r.morning}
                </p>
                <p>
                  <b className="text-ink">Noite:</b> {r.night}
                </p>
                {r.active && (
                  <p>
                    <b className="text-ink">Ativo:</b> {r.active}
                  </p>
                )}
                <p>
                  <b className="text-ink">Yoga:</b> {r.yoga}
                </p>
                {r.extra && <p>{r.extra}</p>}
              </dl>
            </Card>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'erros',
    title: 'Erros e irritação',
    hint: 'O que evitar e quando interromper',
    icon: <AlertTriangle className="size-5" />,
    body: () => (
      <>
        <H2>Erros de yoga facial</H2>
        <Bullets items={YOGA_ERRORS} tone="danger" />
        <p className="mt-3 text-sm text-ink-soft">A AAD recomenda não esfregar, esfoliar ou massagear a pele com rosácea e alerta que apertar acne pode aumentar inflamação e risco de cicatriz.</p>
        <H2>Erros de skincare</H2>
        <Bullets items={SKINCARE_ERRORS} tone="danger" />
        <H2>Se houver irritação leve</H2>
        <Numbered items={IRRITATION_STEPS.map((t, i) => ({ title: ['Pare', 'Lave suavemente', 'Simplifique', 'Não neutralize', 'Observe'][i], text: t }))} />
        <H2>Interrompa e procure avaliação</H2>
        <div className="grid gap-3">
          {SEEK_HELP.map((p) => (
            <Note key={p} tone="danger">
              {p}
            </Note>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'checklist',
    title: 'Checklist da sessão',
    hint: 'Antes, durante e depois',
    icon: <ClipboardCheck className="size-5" />,
    body: () => (
      <div className="grid gap-3">
        {[
          { t: 'Antes', items: CHECKLIST.antes.map((c) => c.text) },
          { t: 'Durante', items: CHECKLIST.durante },
          { t: 'Depois', items: CHECKLIST.depois },
        ].map((g) => (
          <Card key={g.t}>
            <p className="font-display text-xl font-medium text-ink">{g.t}</p>
            <div className="mt-3">
              <Bullets items={g.items} />
            </div>
          </Card>
        ))}
        <p className="text-sm text-ink-soft">No FaceZen, o “antes” aparece no início de cada sessão e o “durante” e o “depois” viram o seu diário.</p>
      </div>
    ),
  },
  { id: 'faq', title: 'Perguntas frequentes', hint: 'Funciona? Tira rugas? E a papada?', icon: <CircleHelp className="size-5" />, body: () => <FaqList /> },
  {
    id: 'videos',
    title: 'Vídeos recomendados',
    hint: 'Rotina guiada e playlist complementar',
    icon: <MonitorPlay className="size-5" />,
    body: () => (
      <>
        <VideoEmbed />
        <p className="mt-3 font-display text-xl font-medium text-ink">{VIDEO.title}</p>
        <p className="text-sm text-ink-soft">
          {VIDEO.channel} · {VIDEO.duration} ·{' '}
          <a href={VIDEO.url} target="_blank" rel="noreferrer" className="font-semibold text-jade">
            abrir no YouTube
          </a>
        </p>
        <p className="mt-3 text-ink-soft">{VIDEO.intro}</p>
        <H2>Sequência observada</H2>
        <Numbered items={VIDEO.sequence} />
        <H2>Como transformar o vídeo em uma prática segura</H2>
        <div className="grid gap-3 text-ink">
          {VIDEO.safety.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <H2>Playlist complementar</H2>
        <Card>
          <p className="font-semibold text-ink">{PLAYLIST.title}</p>
          <p className="text-sm text-ink-soft">
            {PLAYLIST.channel} · {PLAYLIST.count} vídeos
          </p>
          <div className="mt-3">
            <Bullets items={PLAYLIST.topics} />
          </div>
          <a href={PLAYLIST.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-jade px-5 font-semibold text-on-jade">
            <MonitorPlay className="size-5" /> Abrir playlist
          </a>
        </Card>
        <p className="mt-4 text-sm text-ink-soft">{PLAYLIST.note}</p>
        <Note className="mt-4">{COPYRIGHT_NOTE}</Note>
      </>
    ),
  },
  {
    id: 'referencias',
    title: 'Referências e créditos',
    hint: '52 fontes consultadas e fotos',
    icon: <BookMarked className="size-5" />,
    body: () => (
      <>
        <ol className="grid gap-2">
          {REFERENCES.map((r) => (
            <li key={r.n} className="grid grid-cols-[32px_1fr] gap-2 text-sm">
              <span className="tnum font-bold text-ink-faint">[{r.n}]</span>
              <a href={r.url} target="_blank" rel="noreferrer" className="text-ink underline decoration-line underline-offset-4 hover:decoration-jade">
                {r.title}
              </a>
            </li>
          ))}
        </ol>
        <H2>Fotos</H2>
        <ul className="grid gap-2 text-sm">
          {Object.values(PHOTOS).map((p) => (
            <li key={p.id}>
              <a href={p.page} target="_blank" rel="noreferrer" className="text-ink underline decoration-line underline-offset-4">
                {p.alt}
              </a>{' '}
              <span className="text-ink-faint">· {p.credit} no Unsplash</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
]

export function Guide() {
  return (
    <div className="pb-28">
      <div className="relative">
        <Photo k="guaSha" className="h-60 w-full" width={1200} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg" />
      </div>
      <div className="-mt-12 px-5">
        <Eyebrow className="relative">Yoga Facial e Skincare Consciente</Eyebrow>
        <Title className="relative mt-1">Guia</Title>
        <p className="mt-2 text-ink-soft">Um guia brasileiro, prático e responsável para 10 minutos de autocuidado, sem promessas milagrosas.</p>
        <ul className="mt-5 grid gap-2.5">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <Link to={s.id === 'calendario' ? '/jornada' : `/guia/${s.id}`} className="flex items-center gap-4 rounded-3xl bg-surface p-4 shadow-soft">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-jade-soft text-jade">{s.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">{s.title}</span>
                  <span className="block text-sm text-ink-soft">{s.hint}</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-ink-faint" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function GuideSection() {
  const { id } = useParams()
  const s = SECTIONS.find((x) => x.id === id)
  if (!s) {
    return (
      <div className="px-5 pt-6">
        <BackLink to="/guia" label="Guia" />
        <p className="mt-6 text-ink-soft">Seção não encontrada.</p>
      </div>
    )
  }
  return (
    <div className="px-5 pb-28">
      <div className="pt-4">
        <BackLink to="/guia" label="Guia" />
      </div>
      <header className="flex items-center gap-4 pt-2 pb-6">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-jade-soft text-jade">{s.icon}</span>
        <div className="min-w-0">
          <Title>{s.title}</Title>
        </div>
      </header>
      <div className="animate-rise">{s.body()}</div>
    </div>
  )
}
