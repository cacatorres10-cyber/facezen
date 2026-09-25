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

/** Capítulo 4 — Calendário de oito semanas. Os dias de descanso são parte da prática. */
export const PROGRAM: ProgramWeek[] = [
  {
    week: 1,
    title: 'Familiarização',
    sessions: { min: 3, max: 3 },
    minutes: { min: 5, max: 5 },
    spacing: true,
    summary: 'Respiração, postura, aquecimento e deslizamento manual, cinco minutos, em três dias não consecutivos.',
    rules: [
      'Faça a rotina de respiração, postura, aquecimento e deslizamento manual por cinco minutos, em três dias não consecutivos.',
      'Pratique somente testa, olhos com toque leve, mandíbula manual e pescoço com deslizamento.',
      'Não faça extensões cervicais, bola sob o queixo, contrações intensas ou várias séries de bochechas.',
      'Registre o estado da pele antes e uma hora depois: confortável, repuxada, vermelha, ardendo ou sem alteração.',
    ],
  },
  {
    week: 2,
    title: 'Uma região por vez',
    sessions: { min: 4, max: 4 },
    minutes: { min: 5, max: 6 },
    spacing: true,
    summary: 'Quatro sessões curtas; a transferência de ar nas bochechas entra em duas delas.',
    rules: [
      'Faça quatro sessões de cinco a seis minutos, com um dia de descanso entre sessões sempre que possível.',
      'Acrescente transferência de ar nas bochechas por 30 segundos em apenas duas sessões.',
      'Use um único produto de deslizamento já tolerado; não teste cosmético novo nesta semana.',
      'Aprenda a parar antes de aparecer vermelhidão.',
    ],
  },
  {
    week: 3,
    title: 'Dose curta e controlada',
    sessions: { min: 4, max: 4 },
    minutes: { min: 6, max: 7 },
    spacing: false,
    summary: 'Até sete minutos, alternando sorriso protegido e bigode chinês.',
    rules: [
      'Faça quatro sessões de até sete minutos.',
      'Inclua uma escolha entre sorriso protegido e exercício de bigode chinês; não faça ambos no mesmo dia se a boca ficar cansada.',
      'Na mandíbula, mantenha somente massagem manual, sem movimentos de resistência.',
      'Se quiser testar um exercício de papada, escolha o apoio dos dedos, não a extensão cervical.',
    ],
  },
  {
    week: 4,
    title: 'Primeira rotina de 10 minutos',
    sessions: { min: 5, max: 5 },
    minutes: { min: 10, max: 10 },
    spacing: false,
    summary: 'A sequência completa de 10 minutos, cinco vezes, com pelo menos um dia de descanso.',
    rules: [
      'Faça cinco sessões de até dez minutos, deixando pelo menos um dia de descanso.',
      'Siga a sequência de 10 minutos, sem repetir os blocos de olhos ou de pescoço.',
      'A rotina deve terminar sem dor e sem vermelhidão persistente. Se não terminar assim, reduza pela metade.',
    ],
  },
  {
    week: 5,
    title: 'Seleção por objetivo de aparência',
    sessions: { min: 5, max: 5 },
    minutes: { min: 7, max: 10 },
    spacing: false,
    summary: 'Cinco sessões com foco alternado: testa e mandíbula, bochechas e bigode chinês, pescoço e papada.',
    rules: [
      'Faça cinco sessões, mas alterne o foco: duas para relaxamento de testa/mandíbula, duas para bochechas/bigode chinês, uma para pescoço/papada leve.',
      'Mantenha o toque ocular em no máximo 30 segundos.',
      'Não aumente simultaneamente duração e força.',
      'Tire uma foto de acompanhamento somente se isso for confortável, sempre com a mesma luz, expressão e distância.',
    ],
  },
  {
    week: 6,
    title: 'Consistência sem acumular',
    sessions: { min: 5, max: 6 },
    minutes: { min: 8, max: 10 },
    spacing: false,
    summary: 'Cinco sessões de oito a dez minutos; uma sexta, opcional, de apenas cinco.',
    rules: [
      'Faça cinco sessões de oito a dez minutos.',
      'Se não houver qualquer reação, teste uma sexta sessão opcional de apenas cinco minutos; não pratique duas rotinas completas no mesmo dia.',
      'Exercícios de mandíbula e pescoço de resistência continuam opcionais e não devem ser feitos em dias consecutivos no início.',
      'Mantenha skincare simples: limpeza, hidratação e proteção, sem adicionar vários ativos para “acelerar”.',
    ],
  },
  {
    week: 7,
    title: 'Observação de tensão e técnica',
    sessions: { min: 4, max: 5 },
    minutes: { min: 10, max: 10 },
    spacing: false,
    summary: 'Qualidade acima de quantidade: mandíbula descruzada, testa sem franzir, ombros baixos.',
    rules: [
      'Faça quatro a cinco sessões de dez minutos.',
      'Priorize qualidade: mandíbula descruzada, testa sem franzir, ombros baixos e respiração livre.',
      'Compare sensação e conforto no diário, não apenas fotografias. Uma aparência temporariamente menos inchada não é prova de transformação permanente.',
      'Se houver dúvida sobre um exercício, remova-o por uma semana e observe se a tensão melhora.',
    ],
  },
  {
    week: 8,
    title: 'Avaliação e manutenção',
    sessions: { min: 4, max: 6 },
    minutes: { min: 5, max: 10 },
    spacing: false,
    summary: 'Escolha os movimentos mais confortáveis e decida uma manutenção realista.',
    rules: [
      'Faça quatro a seis sessões de cinco a dez minutos, escolhendo os movimentos mais confortáveis.',
      'Avalie: a prática cabe na sua rotina? A pele permanece íntegra? Houve dor, irritação, cefaleia ou tensão articular? Se sim, não aumente a dose.',
      'Decida uma manutenção realista: três ou quatro sessões semanais são suficientes como ritual de autocuidado; mais não significa melhor.',
      'Para queixas persistentes de acne, rosácea, eczema, manchas, olheiras marcantes, papada ou mudanças de contorno, procure avaliação em vez de aumentar repetições.',
    ],
  },
]

/** Depois da semana 8: manutenção como ritual de autocuidado. */
export const MAINTENANCE: ProgramWeek = {
  week: 9,
  title: 'Manutenção',
  sessions: { min: 3, max: 4 },
  minutes: { min: 5, max: 10 },
  spacing: false,
  summary: 'Três ou quatro sessões semanais são suficientes como ritual de autocuidado; mais não significa melhor.',
  rules: [
    'Três ou quatro sessões por semana, de cinco a dez minutos.',
    'Escolha os movimentos que trazem conforto e atenção útil.',
    'Se algo causar tensão ou irritação, remova por uma semana e observe.',
    'Queixas persistentes pedem avaliação profissional, não mais repetições.',
  ],
}

export const weekInfo = (week: number): ProgramWeek => PROGRAM[week - 1] ?? MAINTENANCE
