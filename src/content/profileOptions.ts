import type { GoalId, RegionId, SafetyFlag, SkinBase } from './types'

/** Objetivos do quiz. Cada um acende as regiões do rosto que entram nas sessões. */
export const GOALS: { id: GoalId; label: string; hint: string; regions: RegionId[] }[] = [
  { id: 'pele', label: 'Pele mais bonita e viçosa', hint: 'Rotina de cuidados e toque que não agride', regions: ['bochechas', 'testa'] },
  { id: 'papada', label: 'Cuidar da papada', hint: 'Queixo e pescoço', regions: ['papada', 'pescoco'] },
  { id: 'linhas', label: 'Suavizar linhas de expressão', hint: 'Testa e ao redor dos olhos', regions: ['testa', 'olhos'] },
  { id: 'contorno', label: 'Rosto mais definido', hint: 'Mandíbula e bochechas', regions: ['mandibula', 'bochechas'] },
  { id: 'olheiras', label: 'Olheiras e inchaço', hint: 'Toque leve na região dos olhos', regions: ['olhos'] },
  { id: 'bigode', label: 'Bigode chinês', hint: 'Entre o nariz e a boca', regions: ['bigode'] },
  { id: 'tensao', label: 'Aliviar a tensão do rosto', hint: 'Testa franzida, dentes apertados', regions: ['testa', 'mandibula'] },
]

export const regionsForGoals = (goals: GoalId[]): RegionId[] => [...new Set(GOALS.filter((g) => goals.includes(g.id)).flatMap((g) => g.regions))]

export const SKIN_BASES: { id: SkinBase; label: string; hint: string }[] = [
  { id: 'seca', label: 'Seca', hint: 'Repuxa depois de lavar' },
  { id: 'oleosa', label: 'Oleosa', hint: 'Brilho no rosto todo' },
  { id: 'mista', label: 'Mista', hint: 'Brilho só na zona T' },
  { id: 'normal', label: 'Normal', hint: 'Confortável quase sempre' },
]

export const SAFETY_OPTIONS: { id: SafetyFlag; label: string; hint: string }[] = [
  { id: 'cervical', label: 'Dor ou histórico cervical', hint: 'Sem extensões de pescoço' },
  { id: 'atm', label: 'Dor ou disfunção na mandíbula (ATM)', hint: 'Sem massagem na articulação' },
  { id: 'olhos', label: 'Sintomas nos olhos', hint: 'Sem toques na região dos olhos' },
  { id: 'procedimento', label: 'Procedimento estético recente', hint: 'Botox, preenchimento, peeling, laser ou cirurgia' },
  { id: 'gestante', label: 'Gravidez ou amamentação', hint: 'Cautela com ativos e cosméticos' },
  { id: 'peleCrise', label: 'Pele em crise', hint: 'Rosácea, eczema, acne inflamada ou feridas' },
]

export const WEEKDAYS = [
  { id: 0, short: 'D', label: 'Dom' },
  { id: 1, short: 'S', label: 'Seg' },
  { id: 2, short: 'T', label: 'Ter' },
  { id: 3, short: 'Q', label: 'Qua' },
  { id: 4, short: 'Q', label: 'Qui' },
  { id: 5, short: 'S', label: 'Sex' },
  { id: 6, short: 'S', label: 'Sáb' },
]
