import type { SkinBase } from '../content/types'
import type { Profile } from './store'

/**
 * Skincare personalizado a partir dos produtos que a pessoa já tem.
 *
 * Lógica usada por dermatologistas (a "pirâmide" do skincare):
 * 1. Base diária: limpar com suavidade, hidratar e usar protetor solar FPS 30+.
 * 2. Só depois, ativos, um de cada vez: antioxidante de manhã (vitamina C),
 *    renovação à noite (retinoide), esfoliação química poucas vezes por semana.
 * 3. Nada de ativos fortes na mesma noite; nada de esfoliação física agressiva;
 *    na gravidez, sem retinoide; pele sensível, rotina mínima.
 * 4. Ordem de aplicação: do mais fluido ao mais espesso; protetor por último de manhã.
 */

export type ProductId =
  | 'limpador-gel'
  | 'limpador-cremoso'
  | 'sabonete-barra'
  | 'micelar'
  | 'oleo-limpeza'
  | 'tonico-suave'
  | 'tonico-alcool'
  | 'vitc'
  | 'niacinamida'
  | 'hialuronico'
  | 'retinol'
  | 'acido'
  | 'esfoliante-fisico'
  | 'olhos'
  | 'hidratante-gel'
  | 'hidratante-creme'
  | 'oleo-facial'
  | 'protetor'
  | 'protetor-baixo'
  | 'argila'
  | 'maquiagem'

export interface ProductInfo {
  id: ProductId
  label: string
  hint?: string
}

/** Perguntas do "Seus produtos", agrupadas como na prateleira. */
export const PRODUCT_GROUPS: { title: string; items: ProductInfo[] }[] = [
  {
    title: 'Para limpar',
    items: [
      { id: 'limpador-gel', label: 'Gel ou espuma de limpeza' },
      { id: 'limpador-cremoso', label: 'Limpador cremoso ou leite' },
      { id: 'sabonete-barra', label: 'Sabonete em barra comum' },
      { id: 'micelar', label: 'Água micelar' },
      { id: 'oleo-limpeza', label: 'Óleo ou balm de limpeza' },
    ],
  },
  {
    title: 'Tônico',
    items: [
      { id: 'tonico-suave', label: 'Tônico suave, sem álcool' },
      { id: 'tonico-alcool', label: 'Tônico adstringente, com álcool' },
    ],
  },
  {
    title: 'Séruns e tratamentos',
    items: [
      { id: 'vitc', label: 'Vitamina C' },
      { id: 'niacinamida', label: 'Niacinamida' },
      { id: 'hialuronico', label: 'Ácido hialurônico' },
      { id: 'retinol', label: 'Retinol ou retinoide' },
      { id: 'acido', label: 'Ácido esfoliante', hint: 'glicólico, lático, salicílico' },
      { id: 'esfoliante-fisico', label: 'Esfoliante com grãos' },
      { id: 'olhos', label: 'Creme para olhos' },
    ],
  },
  {
    title: 'Hidratar',
    items: [
      { id: 'hidratante-gel', label: 'Hidratante em gel ou gel-creme' },
      { id: 'hidratante-creme', label: 'Hidratante em creme' },
      { id: 'oleo-facial', label: 'Óleo facial' },
    ],
  },
  {
    title: 'Proteger',
    items: [
      { id: 'protetor', label: 'Protetor solar FPS 30 ou mais' },
      { id: 'protetor-baixo', label: 'Protetor com FPS menor que 30', hint: 'ou só base/hidratante com FPS' },
    ],
  },
  {
    title: 'Outros',
    items: [
      { id: 'argila', label: 'Máscara de argila' },
      { id: 'maquiagem', label: 'Uso maquiagem quase todo dia' },
    ],
  },
]

export const productLabel = (id: ProductId) => PRODUCT_GROUPS.flatMap((g) => g.items).find((p) => p.id === id)?.label ?? id

export interface RoutineStep {
  id: string
  title: string
  /** Como usar, em uma ou duas frases curtas. */
  detail: string
  /** Produto da pessoa usado neste passo. */
  product?: string
  /** A pessoa ainda não tem um produto para este passo. */
  missing?: boolean
  optional?: boolean
}

export interface Advice {
  id: string
  title: string
  text: string
  tone: 'fix' | 'tip'
}

type SkinProfile = Pick<Profile, 'skinBase' | 'sensitive' | 'safety' | 'goals'>

const has = (list: readonly ProductId[], ...ids: ProductId[]) => ids.some((id) => list.includes(id))

const CLEANSER_FOR: Record<SkinBase, string> = {
  seca: 'um limpador cremoso ou leite de limpeza',
  oleosa: 'um gel de limpeza suave',
  mista: 'um gel de limpeza suave',
  normal: 'um limpador suave, em gel ou creme',
}

const MOISTURIZER_FOR: Record<SkinBase, string> = {
  seca: 'um hidratante em creme, com ceramidas ou glicerina',
  oleosa: 'um hidratante em gel ou gel-creme, “oil free”',
  mista: 'um gel-creme leve',
  normal: 'um gel-creme ou loção leve',
}

// ———————————————————— Noites de ativos

export type NightKind = 'retinoide' | 'acido' | 'hidratacao'

export const NIGHT_LABEL: Record<NightKind, string> = {
  retinoide: 'Noite de retinol',
  acido: 'Noite de ácido',
  hidratacao: 'Noite de hidratação',
}

/** Retinol 2 noites (seg e qui) e ácido 2 noites (ter e sáb), nunca juntos. Pele sensível: 1 de cada. */
export function nightKind(products: readonly ProductId[], weekday: number, p: SkinProfile): NightKind {
  if (p.safety.includes('gestante') || p.safety.includes('peleCrise')) return 'hidratacao'
  const retinolNights = p.sensitive ? [1] : [1, 4]
  const acidNights = p.sensitive ? [5] : [2, 6]
  if (has(products, 'retinol') && retinolNights.includes(weekday)) return 'retinoide'
  if (has(products, 'acido') && acidNights.includes(weekday)) return 'acido'
  return 'hidratacao'
}

// ———————————————————— Rotinas

function cleanseStep(products: readonly ProductId[], p: SkinProfile, period: 'manha' | 'noite'): RoutineStep {
  const id = period === 'manha' ? 'm-limpeza' : 'n-limpeza'
  const firstOff = period === 'noite' && (has(products, 'maquiagem') || has(products, 'protetor', 'protetor-baixo'))
  const remover = has(products, 'oleo-limpeza') ? 'o óleo de limpeza (na pele seca, depois enxágue)' : has(products, 'micelar') ? 'a água micelar num algodão' : null
  const own = has(products, 'limpador-cremoso') ? 'limpador cremoso' : has(products, 'limpador-gel') ? 'gel de limpeza' : has(products, 'sabonete-barra') ? 'sabonete' : null

  if (period === 'manha') {
    const dry = p.skinBase === 'seca' || p.sensitive
    return {
      id,
      title: 'Limpar',
      product: own ?? undefined,
      missing: !own,
      detail: dry ? 'De manhã, só água morna já basta. Seque sem esfregar.' : own ? `Use seu ${own} com água morna, por uns 30 segundos. Seque sem esfregar.` : `Água morna. Vale ter ${CLEANSER_FOR[p.skinBase]}.`,
    }
  }
  return {
    id,
    title: 'Limpar',
    product: own ?? remover ?? undefined,
    missing: !own && !remover,
    detail:
      (firstOff && remover ? `Primeiro tire protetor${has(products, 'maquiagem') ? ' e maquiagem' : ''} com ${remover}. ` : '') +
      (own ? `Depois lave com seu ${own}.` : `Depois lave com ${CLEANSER_FOR[p.skinBase]}.`),
  }
}

function moistureStep(products: readonly ProductId[], p: SkinProfile, period: 'manha' | 'noite'): RoutineStep {
  const id = period === 'manha' ? 'm-hidratante' : 'n-hidratante'
  const gel = has(products, 'hidratante-gel')
  const cream = has(products, 'hidratante-creme')
  const product = period === 'noite' && cream ? 'hidratante em creme' : gel ? 'hidratante em gel' : cream ? 'hidratante em creme' : undefined
  return {
    id,
    title: 'Hidratar',
    product,
    missing: !product,
    detail: product ? 'Uma quantidade do tamanho de uma moeda, no rosto e no pescoço.' : `Vale ter ${MOISTURIZER_FOR[p.skinBase]}.`,
  }
}

export function morningRoutine(p: SkinProfile, products: readonly ProductId[]): RoutineStep[] {
  const steps: RoutineStep[] = [cleanseStep(products, p, 'manha')]
  if (has(products, 'tonico-suave')) steps.push({ id: 'm-tonico', title: 'Tônico', product: 'tônico', optional: true, detail: 'Com as mãos, dando batidinhas. Sem algodão esfregando.' })
  const vitcOk = has(products, 'vitc') && !p.safety.includes('peleCrise')
  if (vitcOk) steps.push({ id: 'm-vitc', title: 'Vitamina C', product: 'sérum de vitamina C', detail: '3 a 4 gotas na pele seca, logo depois de limpar. Espere 1 minuto.' })
  if (has(products, 'niacinamida')) steps.push({ id: 'm-niacinamida', title: 'Niacinamida', product: 'sérum de niacinamida', optional: true, detail: vitcOk ? 'Se arder junto com a vitamina C, passe a usar à noite.' : '2 a 3 gotas antes do hidratante.' })
  if (has(products, 'hialuronico')) steps.push({ id: 'm-hialuronico', title: 'Ácido hialurônico', product: 'sérum hialurônico', optional: true, detail: 'Na pele ainda um pouco úmida, e logo em seguida o hidratante.' })
  if (has(products, 'olhos')) steps.push({ id: 'm-olhos', title: 'Olhos', product: 'creme para olhos', optional: true, detail: 'Um grão de arroz para os dois olhos, com o dedo anelar, batendo de leve.' })
  steps.push(moistureStep(products, p, 'manha'))
  const good = has(products, 'protetor')
  steps.push({
    id: 'm-protetor',
    title: 'Proteger',
    product: good ? 'protetor solar' : has(products, 'protetor-baixo') ? 'protetor de FPS baixo' : undefined,
    missing: !good,
    detail: good
      ? 'A medida de dois dedos para rosto e pescoço. Sempre o último passo, antes da maquiagem.'
      : 'O passo mais importante do dia: protetor FPS 30 ou mais, a medida de dois dedos.',
  })
  return steps
}

export function nightRoutine(p: SkinProfile, products: readonly ProductId[], weekday: number): { kind: NightKind; steps: RoutineStep[] } {
  const kind = nightKind(products, weekday, p)
  const steps: RoutineStep[] = [cleanseStep(products, p, 'noite')]
  if (has(products, 'tonico-suave') && kind === 'hidratacao') steps.push({ id: 'n-tonico', title: 'Tônico', product: 'tônico', optional: true, detail: 'Com as mãos, dando batidinhas.' })
  if (kind === 'retinoide') {
    steps.push({ id: 'n-ativo', title: 'Retinol', product: 'retinol', detail: 'Na pele bem seca, um grão de ervilha para o rosto todo. Evite cantos do nariz, da boca e dos olhos.' })
  } else if (kind === 'acido') {
    steps.push({ id: 'n-ativo', title: 'Ácido esfoliante', product: 'ácido', detail: 'Uma camada fina, na pele seca. Se arder forte, lave e pule até a próxima semana.' })
  } else {
    if (has(products, 'niacinamida') && has(products, 'vitc')) steps.push({ id: 'n-niacinamida', title: 'Niacinamida', product: 'sérum de niacinamida', optional: true, detail: '2 a 3 gotas antes do hidratante.' })
    if (has(products, 'hialuronico')) steps.push({ id: 'n-hialuronico', title: 'Ácido hialurônico', product: 'sérum hialurônico', optional: true, detail: 'Na pele ainda úmida, antes do hidratante.' })
  }
  if (has(products, 'olhos')) steps.push({ id: 'n-olhos', title: 'Olhos', product: 'creme para olhos', optional: true, detail: 'Um grão de arroz, batendo de leve no osso ao redor dos olhos.' })
  steps.push({
    ...moistureStep(products, p, 'noite'),
    detail: kind === 'retinoide' ? 'Por cima do retinol, para diminuir a irritação.' : moistureStep(products, p, 'noite').detail,
  })
  if (has(products, 'oleo-facial') && kind === 'hidratacao') steps.push({ id: 'n-oleo', title: 'Óleo facial', product: 'óleo facial', optional: true, detail: '2 ou 3 gotas por último, pressionando com as mãos.' })
  return { kind, steps }
}

// ———————————————————— Recomendações

/** O que ajustar no que a pessoa já usa (fix) e o que pode valer a pena ter (tip). No máximo 2 dicas: um ativo novo por vez. */
export function skincareAdvice(p: SkinProfile, products: readonly ProductId[]): Advice[] {
  const out: Advice[] = []
  const fix = (id: string, title: string, text: string) => out.push({ id, title, text, tone: 'fix' })
  const pregnant = p.safety.includes('gestante')
  const crisis = p.safety.includes('peleCrise')

  // 1. Base: proteção, limpeza e hidratação
  if (!has(products, 'protetor')) {
    fix(
      'protetor',
      has(products, 'protetor-baixo') ? 'Suba o FPS para 30 ou mais' : 'Comece pelo protetor solar',
      has(products, 'protetor-baixo')
        ? 'Base ou hidratante com FPS não protege o suficiente sozinho. Use um protetor FPS 30+ todos os dias, na medida de dois dedos.'
        : 'É o cuidado que as dermatologistas mais indicam para manchas e sinais de idade. Protetor FPS 30+, todo dia, até em casa.',
    )
  }
  if (has(products, 'sabonete-barra') && !has(products, 'limpador-gel', 'limpador-cremoso')) {
    fix('sabonete', 'Troque o sabonete em barra do rosto', `Ele costuma ressecar e repuxar. Prefira ${CLEANSER_FOR[p.skinBase]}.`)
  }
  if (p.skinBase === 'seca' && has(products, 'limpador-gel') && !has(products, 'limpador-cremoso')) {
    fix('gel-seca', 'Pele seca pede limpador cremoso', 'Se o gel deixa o rosto repuxando, troque por um limpador cremoso e use só água de manhã.')
  }
  if (!has(products, 'hidratante-gel', 'hidratante-creme')) {
    fix('hidratante', 'Inclua um hidratante', `Toda pele precisa, até a oleosa. Para você: ${MOISTURIZER_FOR[p.skinBase]}.`)
  }

  // 2. O que usar com cuidado
  if (has(products, 'esfoliante-fisico')) {
    fix('scrub', 'Deixe de lado o esfoliante com grãos', has(products, 'acido') ? 'Você já tem um ácido, que esfolia de forma mais uniforme. Os grãos podem machucar a pele.' : 'Os grãos podem causar microlesões. Se quiser esfoliar, um ácido suave 1 ou 2 vezes por semana é mais gentil.')
  }
  if (has(products, 'tonico-alcool') && (p.skinBase === 'seca' || p.sensitive)) {
    fix('tonico', 'Pause o tônico com álcool', 'Na sua pele ele tende a ressecar e irritar. Se gostar do passo, use um tônico sem álcool.')
  }
  if (pregnant && has(products, 'retinol')) {
    fix('gestante-retinol', 'Pause o retinol', 'Retinoides não são indicados na gravidez e na amamentação. Converse com seu médico sobre alternativas.')
  }
  if (pregnant && has(products, 'acido')) {
    fix('gestante-acido', 'Confirme o ácido com seu médico', 'Alguns ácidos, como o salicílico em concentração alta, pedem liberação na gravidez.')
  }
  if (crisis && has(products, 'retinol', 'acido', 'vitc', 'esfoliante-fisico')) {
    fix('crise', 'Pause os ativos enquanto a pele estiver irritada', 'Fique só em limpar, hidratar e proteger até a pele acalmar.')
  }
  if (has(products, 'retinol') && has(products, 'acido') && !pregnant) {
    out.push({ id: 'alternar', title: 'Retinol e ácido em noites diferentes', text: 'Já organizamos assim nas suas noites. Nunca os dois juntos.', tone: 'tip' })
  }
  if (has(products, 'argila') && (p.skinBase === 'seca' || p.sensitive)) {
    fix('argila', 'Argila só de vez em quando', 'Na sua pele, no máximo uma vez por semana e só na zona T.')
  }

  // 3. Um próximo passo, de acordo com os objetivos (só se a base estiver completa)
  const baseOk = has(products, 'protetor') && has(products, 'hidratante-gel', 'hidratante-creme')
  if (baseOk && !crisis) {
    const tips: Advice[] = []
    const tip = (id: string, title: string, text: string) => tips.push({ id, title, text, tone: 'tip' })
    const goals = p.goals
    if ((goals.includes('linhas') || goals.includes('contorno') || goals.includes('papada')) && !has(products, 'retinol') && !pregnant && !p.sensitive) {
      tip('add-retinol', 'Próximo passo: retinol à noite', 'É o ativo com mais estudos para textura e linhas. Comece com concentração baixa, 2 noites por semana.')
    }
    if (goals.includes('pele') && !has(products, 'vitc') && !p.sensitive) {
      tip('add-vitc', 'Próximo passo: vitamina C de manhã', 'Ajuda no viço e potencializa o protetor. Use antes do hidratante.')
    }
    if ((p.skinBase === 'oleosa' || p.skinBase === 'mista') && !has(products, 'niacinamida')) {
      tip('add-niacinamida', 'Para oleosidade: niacinamida', 'Ajuda a controlar o brilho e a aparência dos poros, e costuma ser bem tolerada.')
    }
    if ((p.skinBase === 'seca' || p.sensitive) && !has(products, 'hialuronico')) {
      tip('add-hialuronico', 'Para a pele seca: ácido hialurônico', 'Aplique na pele úmida, antes do creme, para mais conforto.')
    }
    if (goals.includes('olheiras') && !has(products, 'olhos')) {
      tip('add-olhos', 'Para olheiras e inchaço: creme com cafeína', 'Um grão de arroz de manhã, batendo de leve. Dormir bem e usar protetor ajudam mais que tudo.')
    }
    out.push(...tips.slice(0, 2))
  }
  return out
}

// ———————————————————— Histórico

/** Passos básicos que contam para o histórico (os extras são opcionais). */
export const BASIC = { manha: ['m-limpeza', 'm-hidratante', 'm-protetor'], noite: ['n-limpeza', 'n-hidratante'] } as const

export type DayStatus = 'completo' | 'parcial' | 'nada'

export function periodStatus(done: string[] | undefined, period: 'manha' | 'noite'): DayStatus {
  const basic = BASIC[period]
  const n = basic.filter((id) => done?.includes(id)).length
  return n === basic.length ? 'completo' : n > 0 || (done?.length ?? 0) > 0 ? 'parcial' : 'nada'
}

export function skinLabel(p: Pick<Profile, 'skinBase' | 'sensitive' | 'mature'>): string {
  const mods = [p.sensitive && 'sensível', p.mature && 'madura'].filter(Boolean)
  return `Pele ${p.skinBase}` + (mods.length ? `, ${mods.join(' e ')}` : '')
}
