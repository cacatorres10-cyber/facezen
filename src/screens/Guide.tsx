import {
  AlertTriangle,
  BookMarked,
  ChevronRight,
  CircleHelp,
  Search,
  Sparkles,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  DISCLAIMER,
  FAQ,
  IRRITATION_STEPS,
  PREP_STEPS,
  PRINCIPLES,
  REFERENCES,
  YOGA_ERRORS,
} from '../content/guide'
import { PHOTOS } from '../content/photos'
import { Photo } from '../components/Photo'
import { Accordion, BackLink, Card, cx, Note, Title } from '../components/ui'

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

const H2 = ({ children }: { children: ReactNode }) => <h2 className="mt-8 mb-3 font-display text-2xl font-medium text-ink first:mt-0">{children}</h2>

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

export const SECTIONS: Section[] = [
  {
    id: 'comece',
    title: 'Como praticar',
    hint: 'O essencial em um minuto',
    icon: <Sparkles className="size-5" />,
    body: () => (
      <>
        <div className="grid gap-2.5">
          {PRINCIPLES.map((p) => (
            <Card key={p.title} className="!p-4">
              <p className="font-display text-xl font-medium text-ink">{p.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{p.text.split('. ')[0].replace(/\.$/, '')}.</p>
            </Card>
          ))}
        </div>
        <H2>Antes de cada sessão</H2>
        <Bullets items={PREP_STEPS.map((p) => p.title)} />
        <Note tone="warn" className="mt-6" icon={<AlertTriangle className="size-4" />}>
          {DISCLAIMER.split('. ')[0]}. Com dor no pescoço, na mandíbula, nos olhos, doença de pele ou depois de procedimentos, fale antes com um profissional.
        </Note>
      </>
    ),
  },
  {
    id: 'erros',
    title: 'Quando parar',
    hint: 'Erros comuns e sinais de alerta',
    icon: <AlertTriangle className="size-5" />,
    body: () => (
      <>
        <H2>Evite</H2>
        <Bullets items={YOGA_ERRORS} tone="danger" />
        <H2>Se a pele irritar</H2>
        <Bullets items={IRRITATION_STEPS.slice(0, 3)} />
        <Note tone="danger" className="mt-6">
          Dor nos olhos, visão alterada, inchaço forte ou reação que não melhora: procure um profissional.
        </Note>
      </>
    ),
  },
  { id: 'faq', title: 'Perguntas frequentes', hint: 'As dúvidas mais comuns', icon: <CircleHelp className="size-5" />, body: () => <FaqList /> },
  {
    id: 'referencias',
    title: 'Fontes e créditos',
    hint: 'Referências do ebook e fotos',
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
        <Title className="relative">Dúvidas e cuidados</Title>
                <ul className="mt-5 grid gap-2.5">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <Link to={`/guia/${s.id}`} className="flex items-center gap-4 rounded-3xl bg-surface p-4 shadow-soft">
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
        <BackLink to="/guia" label="Dúvidas" />
        <p className="mt-6 text-ink-soft">Seção não encontrada.</p>
      </div>
    )
  }
  return (
    <div className="px-5 pb-28">
      <div className="pt-4">
        <BackLink to="/guia" label="Dúvidas" />
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
