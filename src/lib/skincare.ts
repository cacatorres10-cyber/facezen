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
  seca: 'Limpador cremoso, leite, bálsamo ou gel suave que não deixe repuxamento. Se a tolerância indicar, só enxágue pela manhã.',
  oleosa: 'Gel de limpeza suave. Se houver suor, limpe sem fricção quando possível.',
  mista: 'Limpe a zona T sem prolongar a fricção nas bochechas.',
  normal: 'Limpador suave. Não procure a sensação de “rangido”; conforto é o melhor critério.',
}

const MOISTURIZER: Record<SkinBase, string> = {
  seca: 'Loção ou creme; reforce somente as áreas ásperas. Glicerina, ceramidas, pantenol ou esqualano, conforme tolerância.',
  oleosa: 'Gel-creme ou loção leve, não comedogênica conforme o rótulo. Hidrate mesmo com brilho.',
  mista: 'Textura leve no rosto todo e creme somente nas áreas secas, se necessário.',
  normal: 'Gel-creme, loção ou creme leve de acordo com o clima.',
}

function cleanserTip(p: SkinProfile) {
  if (p.sensitive) return 'Enxágue ou limpador sem sabão e sem fragrância. Água morna, nunca quente.'
  if (p.mature) return 'Limpeza em leite, balm ou creme. ' + CLEANSER[p.skinBase]
  return CLEANSER[p.skinBase]
}

function moisturizerTip(p: SkinProfile) {
  if (p.sensitive) return 'Hidratante simples, sem fragrância, que você já tolera.'
  if (p.mature) return 'Textura que ofereça conforto no rosto e no pescoço. ' + MOISTURIZER[p.skinBase]
  return MOISTURIZER[p.skinBase]
}

export function morningRoutine(p: SkinProfile, prefs: SkincarePrefs): RoutineStep[] {
  const steps: RoutineStep[] = [{ id: 'm-limpeza', title: 'Limpeza suave', detail: cleanserTip(p) }]
  if (prefs.vitC) {
    steps.push({
      id: 'm-vitc',
      title: 'Vitamina C',
      optional: true,
      detail: 'Depois da limpeza e antes de produtos mais espessos, se a fórmula for tolerada. Não substitui o filtro solar e pode arder em algumas peles.',
    })
  }
  if (prefs.serum !== 'nenhum') {
    steps.push({
      id: 'm-serum',
      title: prefs.serum === 'hialuronico' ? 'Sérum de ácido hialurônico' : 'Sérum de niacinamida',
      optional: true,
      detail:
        prefs.serum === 'hialuronico'
          ? 'Sobre a pele limpa, antes do creme. Se repuxar, use menos sérum e finalize com creme.'
          : 'Concentração e frequência moderadas. Não combine com uma coleção de ativos fortes no mesmo dia.',
    })
  }
  if (prefs.eye) {
    steps.push({
      id: 'm-olhos',
      title: 'Produto para olhos',
      optional: true,
      detail: 'Pequena quantidade no osso orbital, longe da linha dos cílios. Nada de ácido ou retinoide facial no contorno sem orientação do rótulo.',
    })
  }
  steps.push({ id: 'm-hidratante', title: 'Hidratante', detail: moisturizerTip(p) })
  steps.push({
    id: 'm-protetor',
    title: 'Protetor solar',
    detail: 'Último passo do skincare da manhã. FPS e modo de uso conforme o rótulo; as fontes citam FPS mínimo 30. Aplique também no pescoço e áreas expostas. Maquiagem vem depois.',
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
      detail: 'Água micelar, óleo de limpeza ou removedor conforme a embalagem. Não esfregue a área dos olhos.',
    },
    {
      id: 'n-limpeza',
      title: 'Limpeza facial',
      detail:
        (prefs.makeup ? 'Uma segunda limpeza pode fazer sentido para produto resistente ou maquiagem. ' : '') +
        'Se a pele repuxar, não transforme a dupla limpeza em regra rígida.',
    },
  ]
  if (prefs.toner) {
    steps.push({ id: 'n-tonico', title: 'Tônico', optional: true, detail: 'Somente se desejar. Evite adstringentes muito alcoólicos se ressecarem ou arderem.' })
  }
  if (kind === 'retinoide') {
    if (prefs.serum === 'hialuronico') {
      steps.push({ id: 'n-serum', title: 'Sérum hidratante aquoso', optional: true, detail: 'Se o rótulo permitir, antes do retinoide.' })
    }
    steps.push({
      id: 'n-tratamento',
      title: 'Retinoide cosmético',
      detail: 'Pouca quantidade, sobre a pele seca, na menor frequência do rótulo. Não combine com ácido, vitamina C direta ou outro retinoide na mesma noite.',
      warn: p.sensitive ? 'Pele sensível: só depois de teste de contato e, idealmente, orientação profissional.' : undefined,
    })
  } else if (kind === 'acido') {
    steps.push({
      id: 'n-tratamento',
      title: 'Esfoliante (AHA ou BHA)',
      detail: 'Um só, em baixa frequência, nunca sobre pele ferida. Protetor solar no dia seguinte.',
      warn: p.sensitive ? 'Pele sensível: evite esfoliação durante ardor, rubor ou coceira.' : undefined,
    })
  } else if (prefs.serum !== 'nenhum' && !p.sensitive) {
    steps.push({
      id: 'n-serum',
      title: prefs.serum === 'hialuronico' ? 'Sérum hidratante' : 'Niacinamida ou peptídeos',
      optional: true,
      detail: 'Um tratamento de cada vez. Nenhum precisa aparecer todas as noites.',
    })
  }
  if (prefs.eye) {
    steps.push({ id: 'n-olhos', title: 'Produto para olhos', optional: true, detail: 'Pouco, sem esfregar e afastado da linha dos cílios.' })
  }
  steps.push({ id: 'n-hidratante', title: 'Hidratante', detail: moisturizerTip(p) })
  if (prefs.oil) {
    steps.push({ id: 'n-oleo', title: 'Óleo facial', optional: true, detail: 'Algumas gotas como etapa final, se a pele tolera.' })
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
