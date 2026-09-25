import type { Experience, IntentionId, SafetyFlag, SkinBase } from './types'

export const INTENTIONS: { id: IntentionId; label: string; hint: string }[] = [
  { id: 'relaxar', label: 'Desacelerar e respirar', hint: 'Um momento de pausa no dia' },
  { id: 'tensao', label: 'Aliviar tensão', hint: 'Testa franzida, dentes apertados' },
  { id: 'ritual', label: 'Criar um ritual de autocuidado', hint: 'Constância sem exagero' },
  { id: 'aparencia', label: 'Cuidar da aparência da pele', hint: 'Com expectativas realistas' },
  { id: 'skincare', label: 'Aprender skincare', hint: 'Ordem, ingredientes, tipo de pele' },
]

export const SKIN_BASES: { id: SkinBase; label: string; hint: string }[] = [
  { id: 'seca', label: 'Seca', hint: 'Repuxa depois de lavar' },
  { id: 'oleosa', label: 'Oleosa', hint: 'Brilho no rosto todo' },
  { id: 'mista', label: 'Mista', hint: 'Brilho só na zona T' },
  { id: 'normal', label: 'Normal', hint: 'Confortável quase sempre' },
]

export const EXPERIENCES: { id: Experience; label: string; hint: string }[] = [
  { id: 'nunca', label: 'Nunca fiz', hint: 'Vamos começar do zero, com calma' },
  { id: 'algumas', label: 'Já experimentei', hint: 'Fiz alguns vídeos ou rotinas' },
  { id: 'pratico', label: 'Pratico com frequência', hint: 'Mesmo assim, a semana 1 ajusta a dose' },
]

export const SAFETY_OPTIONS: { id: SafetyFlag; label: string; hint: string }[] = [
  { id: 'cervical', label: 'Dor ou histórico cervical', hint: 'Sem extensões de pescoço' },
  { id: 'atm', label: 'Dor ou disfunção na mandíbula (ATM)', hint: 'Sem massagem na articulação' },
  { id: 'olhos', label: 'Sintomas nos olhos', hint: 'Sem toques na região dos olhos' },
  { id: 'procedimento', label: 'Procedimento estético recente', hint: 'Botox, preenchimento, peeling, laser, microagulhamento ou cirurgia' },
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
