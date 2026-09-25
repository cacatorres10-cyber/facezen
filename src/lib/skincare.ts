import { RECIPES, type Recipe } from '../content/skincare'
import type { SkinBase } from '../content/types'
import type { Profile, SkincarePrefs } from './store'

export interface RoutineStep {
  id: string
  title: string
  detail: string
  optional?: boolean
  warn?: string
}

type SkinProfile = Pick<Profile, 'skinBase' | 'sensitive' | 'mature' | 'concerns' | 'safety'>

const CLEANSER: Record<SkinBase, string> = {
  seca: 'Limpador cremoso ou só água morna.',
  oleosa: 'Gel de limpeza suave.',
  mista: 'Limpador suave, sem esfregar as bochechas.',
  normal: 'Limpador suave.',
}

const MOISTURIZER: Record<SkinBase, string> = {
  seca: 'Creme ou loção mais nutritiva.',
  oleosa: 'Gel-creme leve. Hidrate mesmo com brilho.',
  mista: 'Textura leve; creme só onde resseca.',
  normal: 'Gel-creme ou loção leve.',
}

function cleanserTip(p: SkinProfile) {
  return p.sensitive ? 'Limpador suave, sem fragrância.' : CLEANSER[p.skinBase]
}

function moisturizerTip(p: SkinProfile) {
  return p.sensitive ? 'Hidratante simples, sem fragrância.' : MOISTURIZER[p.skinBase]
}

export function morningRoutine(p: SkinProfile, prefs: SkincarePrefs): RoutineStep[] {
  const steps: RoutineStep[] = [{ id: 'm-limpeza', title: 'Limpeza suave', detail: cleanserTip(p) }]
  if (prefs.vitC) {
    steps.push({
      id: 'm-vitc',
      title: 'Vitamina C',
      optional: true,
      detail: 'Depois da limpeza. Não substitui o protetor.',
    })
  }
  if (prefs.serum !== 'nenhum') {
    steps.push({
      id: 'm-serum',
      title: prefs.serum === 'hialuronico' ? 'Sérum de ácido hialurônico' : 'Sérum de niacinamida',
      optional: true,
      detail:
        prefs.serum === 'hialuronico'
          ? 'Antes do hidratante.'
          : 'Antes do hidratante.',
    })
  }
  if (prefs.eye) {
    steps.push({
      id: 'm-olhos',
      title: 'Produto para olhos',
      optional: true,
      detail: 'Pouquinho, no osso ao redor dos olhos.',
    })
  }
  steps.push({ id: 'm-hidratante', title: 'Hidratante', detail: moisturizerTip(p) })
  steps.push({
    id: 'm-protetor',
    title: 'Protetor solar',
    detail: 'FPS 30 ou mais, também no pescoço. Sempre o último passo.',
  })
  return steps
}

export type NightKind = 'retinoide' | 'acido' | 'hidratacao'

export function nightKind(prefs: SkincarePrefs, weekday: number, p: SkinProfile): NightKind {
  if (p.safety.includes('gestante')) return 'hidratacao'
  if (prefs.retinoid && prefs.retinoidNights.includes(weekday)) return 'retinoide'
  if (prefs.acid && prefs.acidNights.includes(weekday)) return 'acido'
  return 'hidratacao'
}

export const NIGHT_LABEL: Record<NightKind, string> = {
  retinoide: 'Noite de retinoide',
  acido: 'Noite de esfoliante',
  hidratacao: 'Noite de hidratação',
}

export function nightRoutine(p: SkinProfile, prefs: SkincarePrefs, weekday: number): { kind: NightKind; steps: RoutineStep[] } {
  const kind = nightKind(prefs, weekday, p)
  const steps: RoutineStep[] = [
    {
      id: 'n-remocao',
      title: prefs.makeup ? 'Remova maquiagem e protetor' : 'Remova o protetor solar',
      detail: 'Água micelar ou óleo de limpeza, sem esfregar os olhos.',
    },
    {
      id: 'n-limpeza',
      title: 'Limpeza facial',
      detail:
        'Água morna e o seu limpador. Seque sem esfregar.',
    },
  ]
  if (prefs.toner) {
    steps.push({ id: 'n-tonico', title: 'Tônico', optional: true, detail: 'Opcional, sem álcool.' })
  }
  if (kind === 'retinoide') {
    if (prefs.serum === 'hialuronico') {
      steps.push({ id: 'n-serum', title: 'Sérum hidratante aquoso', optional: true, detail: 'Antes do retinoide.' })
    }
    steps.push({
      id: 'n-tratamento',
      title: 'Retinoide cosmético',
      detail: 'Uma gota do tamanho de uma ervilha, na pele seca.',
      warn: p.sensitive ? 'Pele sensível: teste antes numa área pequena.' : undefined,
    })
  } else if (kind === 'acido') {
    steps.push({
      id: 'n-tratamento',
      title: 'Esfoliante (AHA ou BHA)',
      detail: 'Um só, nunca em pele ferida. Protetor no dia seguinte.',
      warn: p.sensitive ? 'Pule se a pele estiver ardendo.' : undefined,
    })
  } else if (prefs.serum !== 'nenhum' && !p.sensitive) {
    steps.push({
      id: 'n-serum',
      title: prefs.serum === 'hialuronico' ? 'Sérum hidratante' : 'Niacinamida ou peptídeos',
      optional: true,
      detail: 'Antes do hidratante.',
    })
  }
  if (prefs.eye) {
    steps.push({ id: 'n-olhos', title: 'Produto para olhos', optional: true, detail: 'Pouquinho, sem esfregar.' })
  }
  steps.push({ id: 'n-hidratante', title: 'Hidratante', detail: moisturizerTip(p) })
  if (prefs.oil) {
    steps.push({ id: 'n-oleo', title: 'Óleo facial', optional: true, detail: 'Duas ou três gotas, por último.' })
  }
  return { kind, steps }
}

/** Receitas do capítulo 8 que combinam com a pessoa (a primeira é a principal). */
export function recipesFor(p: SkinProfile): Recipe[] {
  const byId = (id: string) => RECIPES.find((r) => r.id === id)!
  const list: Recipe[] = []
  if (p.sensitive) list.push(byId('sensivel'))
  else if (p.skinBase === 'seca' || p.mature) list.push(byId('seca-madura'))
  else if (p.skinBase === 'oleosa' || p.skinBase === 'mista') list.push(byId('oleosa-mista'))
  else list.push(byId('essencial'))
  if (p.concerns.includes('tom')) list.push(byId('tom'))
  if (list[0].id !== 'essencial') list.push(byId('essencial'))
  return list
}

export function skinLabel(p: Pick<Profile, 'skinBase' | 'sensitive' | 'mature'>): string {
  const mods = [p.sensitive && 'sensível', p.mature && 'madura'].filter(Boolean)
  return `Pele ${p.skinBase}` + (mods.length ? `, ${mods.join(' e ')}` : '')
}
