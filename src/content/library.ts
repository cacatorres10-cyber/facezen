import type { RegionId, SafetyFlag, ToolId } from './types'

/**
 * Os exercícios essenciais do FaceZen (+ 3 opcionais com a escova facial). Fonte única: app + arquivo do NotebookLM.
 * Texto próprio, a partir dos materiais do curso (manual de exercícios e Xô Rugas) e da técnica de
 * drenagem linfática manual (toque que só estica a pele, sempre em direção à clavícula).
 * 3 passos e um jeito de conferir. Os desenhos ficam em `art.ts`.
 */

export type Level = 'ini' | 'int' | 'ava'

export const LEVEL_LABEL: Record<Level, string> = { ini: 'Iniciante', int: 'Intermediário', ava: 'Avançado' }

export type GroupId =
  | 'aquecimento'
  | 'drenagem'
  | 'testa'
  | 'olhos'
  | 'bochechas'
  | 'bigode'
  | 'labios'
  | 'mandibula'
  | 'pescoco'
  | 'relaxamento'
  | 'escova'

export interface Group {
  id: GroupId
  title: string
  intro: string
  region?: RegionId
}

export const GROUPS: Group[] = [
  { id: 'aquecimento', title: 'Aquecimento', intro: 'Um a dois minutos que preparam pescoço e rosto, como o alongamento de um atleta antes do jogo.', region: 'pescoco' },
  { id: 'drenagem', title: 'Drenagem facial com as mãos', intro: 'A prática principal: toque levíssimo que estica a pele e solta, do pescoço ao rosto e de volta à clavícula. Sem creme.', region: 'pescoco' },
  { id: 'testa', title: 'Testa e entre as sobrancelhas', intro: 'Fortalecer a testa e ensinar o rosto a não franzir sem necessidade.', region: 'testa' },
  { id: 'olhos', title: 'Olhos e pálpebras', intro: 'A região mais delicada: dedos anelares, toque leve e nunca no globo ocular.', region: 'olhos' },
  { id: 'bochechas', title: 'Bochechas e maçãs do rosto', intro: 'Os músculos que levantam o sorriso e dão contorno ao terço médio do rosto.', region: 'bochechas' },
  { id: 'bigode', title: 'Bigode chinês', intro: 'Elevar bochechas e cantos da boca para suavizar a linha entre o nariz e a boca.', region: 'bigode' },
  { id: 'labios', title: 'Lábios e “código de barras”', intro: 'O contorno da boca e as linhas acima do lábio. Sempre com a pele lubrificada.', region: 'bigode' },
  { id: 'mandibula', title: 'Mandíbula, queixo e papada', intro: 'Contorno do queixo, papada e a tensão de quem aperta os dentes.', region: 'papada' },
  { id: 'pescoco', title: 'Pescoço e colo', intro: 'Postura e tônus do pescoço. No pescoço, a massagem vai sempre de cima para baixo.', region: 'pescoco' },
  { id: 'relaxamento', title: 'Relaxamento final', intro: 'Um minuto para soltar o rosto e terminar a sessão.' },
  { id: 'escova', title: 'Exercícios com ferramentas', intro: 'Escova coreana e gua sha: veja os vídeos e depois pratique com a escova, sempre de leve, do centro do rosto para fora.' },
]

export const groupById = (id: GroupId) => GROUPS.find((g) => g.id === id)!

export interface Exercise {
  /** Código curto (ex.: "T1"), igual ao do Guia Prático. */
  id: string
  group: GroupId
  region?: RegionId
  title: string
  forWhat: string
  /** Dose por nível, como aparece para a pessoa (ex.: "2 × 15"). */
  dose: Record<Level, string>
  /** Tempo do cronômetro por nível, em segundos. */
  seconds: Record<Level, number>
  sided?: boolean
  /** No máximo 3 passos, com comparações do dia a dia. */
  steps: string[]
  /** Como conferir no espelho se está certo. */
  check: string
  /** Quando pular (texto para a pessoa). */
  skip?: string
  /** Fica fora do plano de quem marcou estas situações. */
  avoidIf: SafetyFlag[]
  /** Pode ser feito, com este ajuste. */
  adapt?: Partial<Record<SafetyFlag, string>>
  /** Pode ser feito sem as mãos, em qualquer lugar. */
  anywhere?: boolean
  /** Precisa deste acessório. */
  tool?: ToolId
}

const reps = (ini: number, int: number, ava: number): Pick<Exercise, 'dose' | 'seconds'> => ({
  dose: { ini: `1 × ${ini}`, int: `2 × ${int}`, ava: `3 × ${ava}` },
  // ~2 s por repetição + 5 s de pausa entre as séries
  seconds: { ini: ini * 2 + 5, int: int * 2 * 2 + 5, ava: ava * 3 * 2 + 10 },
})
/** Drenagem: repetições de "esticar e soltar" por ponto, ~2 s cada. */
const drain = (points = 1): Pick<Exercise, 'dose' | 'seconds'> => {
  const where = points > 1 ? ' em cada ponto' : ''
  const n = { ini: 5, int: 8, ava: 10 }
  return {
    dose: { ini: `${n.ini} vezes${where}`, int: `${n.int} vezes${where}`, ava: `${n.ava} vezes${where}` },
    seconds: { ini: n.ini * 2 * points + 5, int: n.int * 2 * points + 5, ava: n.ava * 2 * points + 5 },
  }
}
const fixed = (dose: string, seconds: number): Pick<Exercise, 'dose' | 'seconds'> => ({
  dose: { ini: dose, int: dose, ava: dose },
  seconds: { ini: seconds, int: seconds, ava: seconds },
})

const DRAIN_SKIP = 'Febre, infecção, garganta ou gânglios inflamados, ou se o médico proibiu massagem (por exemplo, por trombose ou problema no coração).'

export const EXERCISES: Exercise[] = [
  // ——— Aquecimento
  {
    id: 'A3', group: 'aquecimento', region: 'pescoco', title: 'Meia-lua do pescoço', forWhat: 'Soltar o pescoço antes de começar.',
    ...fixed('5 de cada lado', 40), sided: true,
    steps: ['Desça o queixo em direção ao peito, devagar.', 'Role a cabeça até a orelha chegar perto do ombro direito.', 'Volte pelo meio e vá para o lado esquerdo.'],
    check: 'Só a metade da frente: a cabeça nunca vai para trás.', skip: 'Dor no pescoço ou tontura.', avoidIf: ['cervical'],
  },
  {
    id: 'A5', group: 'aquecimento', region: 'bochechas', title: 'Balão', forWhat: 'Aquecer bochechas e boca.',
    ...fixed('5 voltas', 40), anywhere: true,
    steps: ['Encha as bochechas de ar, com a boca fechada.', 'Passe o ar de uma bochecha para a outra, contando 3 em cada.', 'Leve o ar para cima e para baixo dos lábios, e solte.'],
    check: 'Sem estufar ao máximo e sem prender a respiração.', skip: 'Dor na mandíbula ou no ouvido.', avoidIf: ['atm'],
  },

  // ——— Drenagem facial com as mãos (técnica de drenagem linfática manual)
  // Abrir: clavícula → pescoço → orelhas. Rosto: de baixo para cima, sempre em direção às orelhas.
  // Fechar: descer tudo até a clavícula. Toque que só estica a pele e solta, sem creme.
  {
    id: 'D1', group: 'drenagem', region: 'pescoco', title: 'Abrir a clavícula', forWhat: 'Começar pelo ponto onde o líquido do rosto termina.',
    ...drain(1),
    steps: ['Encoste as pontas de três dedos no “buraquinho” logo acima de cada clavícula.', 'Bem de leve, estique a pele um pouquinho para baixo e para dentro, e solte.', 'Repita devagar, como um bombeamento suave.'],
    check: 'A pele só se mexe alguns milímetros e não fica vermelha. Sem creme.', skip: DRAIN_SKIP, avoidIf: [],
  },
  {
    id: 'D2', group: 'drenagem', region: 'pescoco', title: 'Laterais do pescoço', forWhat: 'Abrir o caminho do pescoço até a clavícula.',
    ...drain(2),
    steps: ['Coloque as mãos abertas dos dois lados do pescoço, logo abaixo das orelhas.', 'Estique a pele bem de leve para baixo, em direção à clavícula, e solte.', 'Depois desça um pouco as mãos e repita.'],
    check: 'Mãos só nas laterais: nunca na frente da garganta.', skip: DRAIN_SKIP, avoidIf: [],
  },
  {
    id: 'D3', group: 'drenagem', region: 'pescoco', title: 'Em volta das orelhas', forWhat: 'Abrir a frente e a parte de trás das orelhas, por onde o rosto drena.',
    ...drain(1),
    steps: ['Faça um “V” com o indicador e o médio e encaixe em volta da orelha: um dedo na frente, outro atrás.', 'Faça pequenos círculos bem leves, levando a pele para baixo e para trás.', 'Repita devagar e solte.'],
    check: 'Os dedos quase não saem do lugar: quem se mexe é a pele.', skip: DRAIN_SKIP, avoidIf: [],
  },
  {
    id: 'D4', group: 'drenagem', region: 'papada', title: 'Embaixo da mandíbula', forWhat: 'Levar o líquido do queixo e da papada para as orelhas.',
    ...drain(3),
    steps: ['Dedos abertos embaixo da mandíbula, perto do queixo.', 'Estique a pele de leve em direção à orelha e solte.', 'Repita no meio da mandíbula e depois perto da orelha.'],
    check: 'Os dedos ficam embaixo do osso, sem apertar a garganta.', skip: DRAIN_SKIP, avoidIf: [],
  },
  {
    id: 'D5', group: 'drenagem', region: 'bigode', title: 'Queixo e acima da boca', forWhat: 'Em volta da boca, em direção à mandíbula.',
    ...drain(1),
    steps: ['Indicador acima do lábio e dedo médio no queixo, dos dois lados.', 'Estique a pele de leve para fora, em direção ao canto da mandíbula, e solte.', 'Repita devagar, com os lábios relaxados.'],
    check: 'A boca fica parada; quem se mexe é a pele.', skip: DRAIN_SKIP, avoidIf: ['peleCrise'],
  },
  {
    id: 'D6', group: 'drenagem', region: 'bochechas', title: 'Bochechas', forWhat: 'Do lado do nariz até as orelhas.',
    ...drain(3),
    steps: ['Apoie os dedos esticados na bochecha, ao lado do nariz.', 'Estique a pele de leve em direção à orelha e solte.', 'Repita no meio da bochecha e depois perto da orelha.'],
    check: 'Mãos macias e espalmadas, sem apertar nem deslizar.', skip: DRAIN_SKIP, avoidIf: ['peleCrise'],
  },
  {
    id: 'D7', group: 'drenagem', region: 'olhos', title: 'Abaixo dos olhos', forWhat: 'Pelo osso abaixo dos olhos, até a têmpora.',
    ...drain(2),
    steps: ['Apoie o dedo anelar no osso abaixo do olho, perto do nariz.', 'Leve a pele, bem de leve, em direção à têmpora e solte.', 'Avance pelo osso até perto da têmpora e repita.'],
    check: 'Sempre sobre o osso, nunca na pálpebra. O toque mais leve de todos.', skip: 'Olhos irritados ou pele machucada nessa região.', avoidIf: ['olhos', 'peleCrise'],
  },
  {
    id: 'D8', group: 'drenagem', region: 'testa', title: 'Testa', forWhat: 'Do meio da testa até as têmporas.',
    ...drain(2),
    steps: ['Dedos esticados no meio da testa, uma mão para cada lado.', 'Estique a pele de leve em direção às têmporas e solte.', 'Avance as mãos até perto das têmporas e repita.'],
    check: 'Testa relaxada, sem franzir.', skip: DRAIN_SKIP, avoidIf: ['peleCrise'],
  },
  {
    id: 'D9', group: 'drenagem', region: 'testa', title: 'Têmporas', forWhat: 'Juntar tudo nas têmporas e levar para baixo.',
    ...drain(1),
    steps: ['Apoie dois dedos em cada têmpora.', 'Faça círculos bem leves, levando a pele para trás.', 'No fim, deslize de leve na frente da orelha, descendo até o pescoço.'],
    check: 'Toque leve, sem apertar a cabeça.', skip: DRAIN_SKIP, avoidIf: [],
  },
  {
    id: 'D10', group: 'drenagem', region: 'pescoco', title: 'Descer até a clavícula', forWhat: 'Fechar a drenagem levando tudo para a clavícula.',
    ...drain(1),
    steps: ['Mãos espalmadas logo abaixo das orelhas.', 'Deslize bem de leve pelas laterais do pescoço até a clavícula.', 'Termine com bombeamentos suaves acima da clavícula.'],
    check: 'Sempre para baixo e nunca na frente da garganta.', skip: DRAIN_SKIP, avoidIf: [],
  },

  // ——— Testa
  {
    id: 'T1', group: 'testa', region: 'testa', title: 'Testa lisa', forWhat: 'Treinar a testa a não enrugar.',
    ...reps(10, 15, 15),
    steps: ['Apoie as mãos na testa, como quem afasta a franja, e segure a pele firme.', 'Feche os olhos e tente descer as sobrancelhas, como quando bate o sono.', 'As mãos não deixam descer: sinta a força e solte.'],
    check: 'A testa não enruga e nada de franzir entre as sobrancelhas.', avoidIf: [],
  },

  // ——— Olhos
  {
    id: 'O4', group: 'olhos', region: 'olhos', title: 'Toque de pena', forWhat: 'Relaxar em volta dos olhos. Ótimo de manhã.',
    ...fixed('30 segundos', 30),
    steps: ['Use o dedo anelar, que é o mais leve.', 'Dê batidinhas em volta do olho, sobre o osso: embaixo da sobrancelha e em cima da maçã do rosto.', 'Como gotas de chuva, sem nunca tocar no olho.'],
    check: 'O toque é tão leve que a pele nem se mexe.', avoidIf: [],
  },

  {
    id: 'O1', group: 'olhos', region: 'olhos', title: 'Pálpebra firme', forWhat: 'Trabalhar a pálpebra de baixo.',
    dose: { ini: '1 × 5', int: '2 × 10', ava: '3 × 10' }, seconds: { ini: 25, int: 50, ava: 80 },
    steps: ['Apoie os indicadores no canto de fora dos olhos e estique a pele bem de leve para os lados.', 'Sem piscar, suba só a pálpebra de baixo, sem fechar o olho.', 'No fim, feche os olhos por 3 segundos e abra bem, sem franzir a testa.'],
    check: 'Só a pálpebra de baixo se mexe; a testa fica parada.', skip: 'Olho seco, irritado ou com lente.', avoidIf: ['olhos'],
  },

  // ——— Bochechas
  {
    id: 'B1', group: 'bochechas', region: 'bochechas', title: 'Do “O” ao sorriso', forWhat: 'Trabalhar as maçãs do rosto.',
    ...reps(10, 15, 15),
    steps: ['Faça um “O” com a boca, como quem diz “Oh!”.', 'Abra um sorriso bem grande, subindo as bochechas.', 'Volte devagar para o “O” e repita.'],
    check: 'Sorria sem apertar os olhos.', avoidIf: [],
  },
  {
    id: 'B3', group: 'bochechas', region: 'bochechas', title: 'Peixinho', forWhat: 'Bochechas e cantos da boca.',
    ...reps(10, 15, 15), anywhere: true,
    steps: ['Feche os lábios e faça boca de peixinho.', 'Faça o movimento de sugar, com a boca fechada, suave e firme.', 'Se ajudar, coloque um dedo entre os lábios e sugue o dedo.'],
    check: 'Você sente as bochechas trabalhando, sem dor.', avoidIf: ['atm'],
  },

  // ——— Bigode chinês e boca
  {
    id: 'N1', group: 'bigode', region: 'bigode', title: 'Bigode chinês', forWhat: 'Bochechas e a linha entre o nariz e a boca.',
    dose: { ini: '1 × 20 s', int: '2 × 30 s', ava: '3 × 30 s' }, seconds: { ini: 20, int: 65, ava: 100 },
    steps: ['Coloque as palmas sobre as orelhas e puxe a pele de leve para trás.', 'Dobre os lábios para dentro, cobrindo os dentes, sem enrugar.', 'Levante os cantos da boca num sorriso bem exagerado e segure.'],
    check: 'Trabalho nas bochechas e ao lado da boca, testa parada.', avoidIf: [],
  },
  {
    id: 'L1', group: 'labios', region: 'bigode', title: '“O” e “A”', forWhat: 'Contorno da boca.',
    ...reps(10, 15, 15),
    steps: ['Faça um biquinho em “O”, com os lábios bem para frente.', 'Abra a boca dizendo “A”, bem exagerado.', 'Volte ao “O” e repita.'],
    check: 'A boca se mexe bastante e a testa fica parada.', avoidIf: [], adapt: { atm: 'Abra pouco a boca no “A”.' },
  },

  // ——— Mandíbula e pescoço
  {
    id: 'M1', group: 'mandibula', region: 'papada', title: 'Lábio para cima', forWhat: 'Queixo e frente do pescoço.',
    ...reps(10, 15, 15),
    steps: ['Junte as palmas na base do pescoço, olhe um pouco para cima e projete o queixo.', 'Leve o lábio de baixo para fora e para cima, cobrindo o lábio de cima.', 'Desça e suba o lábio, devagar.'],
    check: 'Você sente a frente do pescoço trabalhando.', avoidIf: [], adapt: { cervical: 'Faça olhando para frente, com a cabeça reta.' },
  },
  {
    id: 'M4', group: 'mandibula', region: 'mandibula', title: 'Soltar o masseter', forWhat: 'Aliviar quem aperta os dentes.',
    ...fixed('30 segundos', 30),
    steps: ['Deixe os dentes separados, com a boca levemente aberta.', 'Coloque dois dedos na bochecha, onde a mandíbula faz força ao morder.', 'Faça círculos lentos, com pressão média.'],
    check: 'Nunca em cima da articulação, na frente da orelha.', skip: 'Estalo com dor ou travamento.', avoidIf: [], adapt: { atm: 'Toque bem leve; pare ao primeiro estalo.' },
  },

  {
    id: 'M3', group: 'mandibula', region: 'mandibula', title: 'Queixo definido', forWhat: 'Contorno do queixo e da mandíbula.',
    ...fixed('5 repetições', 30),
    steps: ['Apoie três dedos no fim da mandíbula, perto da orelha, e puxe a pele de leve para trás e para cima.', 'Puxe o ar pelo nariz.', 'Solte o ar com força pela boca, como quem apaga uma vela.'],
    check: 'Os dedos só seguram a pele; a força vem do sopro.', avoidIf: [],
  },

  // ——— Pescoço e colo (Xô Rugas)
  {
    id: 'P1', group: 'pescoco', region: 'pescoco', title: 'Língua ao canto', forWhat: 'Pescoço e colo.',
    ...fixed('10 s de cada lado', 30), sided: true,
    steps: ['Cruze as mãos e apoie as palmas no peito, logo abaixo do pescoço.', 'Vire a cabeça para a direita e estique a língua para fora, em direção ao canto de cima. Segure 10 segundos.', 'Volte ao centro e repita para a esquerda.'],
    check: 'As mãos seguram o peito parado: quem alonga é só o pescoço.', skip: 'Dor no pescoço ou tontura.', avoidIf: ['cervical'],
  },

  // ——— Boca e olhos (Xô Rugas)
  {
    id: 'L4', group: 'labios', region: 'bigode', title: 'Código de barras', forWhat: 'As linhas acima dos lábios.',
    dose: { ini: '10 repetições', int: '20 repetições', ava: '2 × 20' }, seconds: { ini: 30, int: 50, ava: 100 },
    steps: ['Com a pele bem hidratada, cubra os dentes com os lábios.', 'Apoie os dedos em cima e embaixo da boca.', 'Faça uma pressão leve de vai e volta com os dedos.'],
    check: 'Nunca com a pele seca. A pele não arde nem fica vermelha.', skip: 'Lábios rachados ou com herpes.', avoidIf: ['peleCrise'],
  },
  {
    id: 'T5', group: 'olhos', region: 'olhos', title: 'Binóculo', forWhat: 'Testa e olhos: os olhos trabalham e a testa fica parada.',
    ...fixed('1 rodada', 35),
    steps: ['Polegares dos lados do nariz e indicadores sobre as sobrancelhas, como um binóculo. Abra o peito.', 'Olhe para longe e aperte os olhos por 10 segundos, sem franzir. Feche e relaxe 3 segundos.', 'Abra os olhos o máximo por 10 segundos, com os indicadores segurando as sobrancelhas. Feche e relaxe.'],
    check: 'Sobrancelhas e testa paradas o tempo todo.', skip: 'Olhos irritados ou lentes incomodando.', avoidIf: ['olhos'],
  },

  // ——— Relaxamento
  {
    id: 'R3', group: 'relaxamento', region: 'mandibula', title: 'Mandíbula solta', forWhat: 'Terminar soltando os dentes apertados.',
    ...fixed('3 respirações', 20), anywhere: true,
    steps: ['Feche os lábios, mas deixe os dentes separados.', 'Deixe a língua descansar no céu da boca.', 'Fique assim por 3 respirações, com a mandíbula pesada.'],
    check: 'Vale fazer também durante o dia, sempre que lembrar.', avoidIf: [],
  },
]

// ——— Escova facial (opcional; só entra nas sessões de quem marcou que tem)
const BRUSH_SKIP = 'Espinha inflamada, ferida, rosácea ou pele irritada.'

EXERCISES.push(
  {
    id: 'E1', group: 'escova', region: 'pescoco', title: 'Escova no pescoço', forWhat: 'Começar a massagem com a escova pelo pescoço.',
    ...fixed('5 passadas de cada lado', 40), sided: true, tool: 'escova',
    steps: ['Encoste as cerdas de leve atrás da orelha.', 'Desça pela lateral do pescoço até a clavícula, devagar.', 'Faça 5 passadas de cada lado, sempre de cima para baixo.'],
    check: 'As cerdas só deslizam: a pele não fica vermelha nem repuxa.', skip: BRUSH_SKIP, avoidIf: ['peleCrise'],
  },
  {
    id: 'E2', group: 'escova', region: 'bochechas', title: 'Escova na mandíbula e bochechas', forWhat: 'Do centro do rosto para as orelhas, em linhas.',
    ...fixed('5 passadas por linha', 60), sided: true, tool: 'escova',
    steps: ['Mandíbula: do queixo até a orelha, seguindo o osso.', 'Bochecha: do canto da boca até a orelha, subindo na diagonal.', 'Ao lado do nariz: suba pela maçã do rosto até a têmpora.'],
    check: 'Cerdas encostando de leve, sempre para fora. Termine descendo da orelha até o pescoço.', skip: BRUSH_SKIP, avoidIf: ['peleCrise'],
  },
  {
    id: 'E4', group: 'escova', region: 'olhos', title: 'Escova abaixo dos olhos', forWhat: 'Uma passada bem leve sobre o osso, de dentro para fora.',
    ...fixed('5 passadas de cada lado', 30), sided: true, tool: 'escova',
    steps: ['Use só as cerdas, nunca o lado das bolinhas.', 'Encoste no osso abaixo do olho, perto do nariz.', 'Deslize bem de leve até a têmpora.'],
    check: 'Sempre sobre o osso, sem tocar a pálpebra nem puxar a pele.', skip: 'Olhos irritados, com lente ou pele sensível nessa região.', avoidIf: ['peleCrise', 'olhos'],
  },
  {
    id: 'E3', group: 'escova', region: 'testa', title: 'Escova na testa', forWhat: 'Da sobrancelha até o cabelo, em faixas.',
    ...fixed('5 passadas por faixa', 40), sided: true, tool: 'escova',
    steps: ['Encoste a escova logo acima da sobrancelha, no meio da testa.', 'Suba até a raiz do cabelo, em linha reta.', 'Repita em faixas, do meio para o lado, e termine na têmpora.'],
    check: 'Movimento lento e leve. Não esfregue para os lados.', skip: BRUSH_SKIP, avoidIf: ['peleCrise'],
  },
)

/** Bloco da escova: entra depois do rosto, antes de fechar a drenagem. */
export const BRUSH_BLOCK: Record<5 | 10 | 15, string[]> = { 5: ['E2'], 10: ['E1', 'E2', 'E4', 'E3'], 15: ['E1', 'E2', 'E4', 'E3'] }

export const exerciseById = (id: string) => EXERCISES.find((e) => e.id === id)

/**
 * A sessão é a drenagem facial com as mãos, sempre na mesma ordem:
 * alongar o pescoço → abrir (clavícula, pescoço, orelhas) → rosto de baixo para cima → seu foco → fechar.
 */
export const ROUTINE = {
  /** Alongar o pescoço e abrir o caminho da drenagem. */
  open: ['A3', 'D1', 'D2', 'D3'],
  /** O rosto, de baixo para cima, sempre em direção às orelhas. */
  face: ['D4', 'D5', 'D6', 'D7', 'D8', 'D9'],
  /** Fechar: descer tudo até a clavícula. */
  close: ['D10'],
}

/**
 * Foco por objetivo: os pontos da drenagem que ganham mais repetições (`boost`)
 * e um exercício com as mãos daquela região (`ids`), feito antes de fechar.
 */
export type FocusId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

export const FOCUS: Record<FocusId, { title: string; boost: string[]; ids: string[] }> = {
  A: { title: 'Bigode chinês', boost: ['D5', 'D6'], ids: ['N1'] },
  B: { title: 'Papada e pescoço', boost: ['D4', 'D10'], ids: ['M3'] },
  C: { title: 'Testa', boost: ['D8', 'D9'], ids: ['T1'] },
  D: { title: 'Olhos', boost: ['D7', 'D9'], ids: ['O4'] },
  E: { title: 'Lábios', boost: ['D5'], ids: ['L4'] },
  F: { title: 'Bochechas e contorno', boost: ['D6', 'D4'], ids: ['M4'] },
  G: { title: 'Tensão', boost: ['D9', 'D3'], ids: ['M4'] },
}
