export interface ProgramWeek {
  week: number
  title: string
  /** Sessões mínimas e máximas da semana. */
  sessions: { min: number; max: number }
  /** Duração-alvo das sessões, em minutos. */
  minutes: { min: number; max: number }
  summary: string
  rules: string[]
  /** Exige descanso entre sessões (dias não consecutivos). */
  spacing: boolean
}

const adaptacao = (week: 1 | 2): ProgramWeek => ({
  week,
  title: week === 1 ? 'Adaptação: aprender' : 'Adaptação: sem franzir',
  sessions: week === 1 ? { min: 3, max: 4 } : { min: 4, max: 5 },
  minutes: { min: 5, max: 7 },
  spacing: week === 1,
  summary: week === 1 ? 'A drenagem completa, 5 vezes em cada ponto, com um dia de folga entre as sessões.' : 'A mesma drenagem, agora com o toque levíssimo no automático.',
  rules: [
    'Drenagem completa, 5 repetições em cada ponto.',
    'Aprenda cada exercício no espelho, com o tutorial.',
    'Sem módulo de foco e sem ferramentas por enquanto.',
    'Objetivo da semana: fazer sem franzir a testa.',
  ],
})

const construcao = (week: 3 | 4 | 5): ProgramWeek => ({
  week,
  title: 'Construção',
  sessions: { min: 5, max: 6 },
  minutes: { min: 7, max: 12 },
  spacing: false,
  summary: '8 repetições em cada ponto e o foco no seu objetivo.',
  rules: [
    '8 repetições em cada ponto da drenagem.',
    'Entra o módulo de foco do seu objetivo.',
    'Tem um segundo objetivo? As sessões alternam entre os dois.',
    'Um dia de descanso por semana, sempre.',
  ],
})

const intensificacao = (week: 6 | 7 | 8): ProgramWeek => ({
  week,
  title: week === 8 ? 'Intensificação e avaliação' : 'Intensificação',
  sessions: { min: 5, max: 6 },
  minutes: { min: 7, max: 15 },
  spacing: false,
  summary: 'Nível avançado, só se estiver confortável.',
  rules: [
    '10 repetições em cada ponto, só se a fase anterior terminou sem incômodo.',
    'Se algo incomodar, o app volta ao intermediário.',
    'Foto de acompanhamento uma vez por semana, sempre igual.',
    week === 8 ? 'Compare as fotos da semana 1 com as de agora.' : 'Ferramentas são opcionais, 2 a 3 vezes por semana.',
  ],
})

/** Programa de 8 semanas (Parte 6 do guia). Os dias de descanso são parte da prática. */
export const PROGRAM: ProgramWeek[] = [
  adaptacao(1),
  adaptacao(2),
  construcao(3),
  construcao(4),
  construcao(5),
  intensificacao(6),
  intensificacao(7),
  intensificacao(8),
]

/** Depois da semana 8: manutenção como ritual de autocuidado. */
export const MAINTENANCE: ProgramWeek = {
  week: 9,
  title: 'Manutenção',
  sessions: { min: 4, max: 5 },
  minutes: { min: 5, max: 12 },
  spacing: false,
  summary: 'Quatro ou cinco sessões por semana, com 8 repetições em cada ponto.',
  rules: [
    'Quatro ou cinco sessões por semana, 8 repetições em cada ponto.',
    'O foco continua alternando entre os seus objetivos.',
    'Fim de semana: se quiser, um ritual mais longo com massagem.',
    'Queixas persistentes pedem avaliação profissional, não mais repetições.',
  ],
}

export const weekInfo = (week: number): ProgramWeek => PROGRAM[week - 1] ?? MAINTENANCE
