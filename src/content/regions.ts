import type { RegionId, RegionInfo } from './types'

export const REGIONS: RegionInfo[] = [
  { id: 'testa', label: 'Testa', short: 'Testa', concern: 'Linhas de expressão' },
  { id: 'olhos', label: 'Olhos', short: 'Olhos', concern: 'Olheiras e inchaço' },
  { id: 'bochechas', label: 'Bochechas', short: 'Bochechas', concern: 'Viço e firmeza' },
  { id: 'bigode', label: 'Bigode chinês', short: 'Bigode chinês', concern: 'Entre o nariz e a boca' },
  { id: 'mandibula', label: 'Mandíbula', short: 'Mandíbula', concern: 'Contorno e tensão' },
  { id: 'papada', label: 'Papada', short: 'Papada', concern: 'Abaixo do queixo' },
  { id: 'pescoco', label: 'Pescoço', short: 'Pescoço', concern: 'Pescoço e colo' },
]

export const regionById = (id: RegionId) => REGIONS.find((r) => r.id === id)!
