import type { RegionId } from './types'

export type StepKind = 'breath' | 'move' | 'rest'

/** Um passo da sessão guiada. */
export interface StepDef {
  id: string
  /** Trecho da rotina de 10 minutos a que o passo pertence (ex.: "Minuto 2–3"). */
  minute?: string
  title: string
  kind: StepKind
  region?: RegionId
  exerciseId?: string
  durationSec: number
  /** Texto principal, lido pela voz guiada. */
  instruction: string
  cues: string[]
  /** Divide o tempo ao meio e avisa a troca de lado. */
  sided?: boolean
  /** Pode ser pulado sem culpa. */
  optional?: boolean
  /** Alternativas para escolher na hora (ex.: queixo). */
  options?: { label: string; text: string }[]
  /** Aviso personalizado mostrado no passo. */
  note?: string
}

/**
 * Capítulo 2 — A rotina de 10 minutos, destrinchada em passos cronometrados.
 * Adaptação editorial conservadora: em olhos, pescoço e mandíbula, a versão leve.
 */
export const STEPS: Record<string, StepDef> = {
  chegada: {
    id: 'chegada',
    minute: 'Minuto 0–1',
    title: 'Chegada e respiração',
    kind: 'breath',
    durationSec: 60,
    instruction:
      'Sente-se ou fique de pé. Inspire pelo nariz contando quatro e expire contando seis, sem levantar os ombros. Relaxe língua, dentes e testa.',
    cues: ['Inspire em 4 tempos', 'Expire em 6 tempos', 'Ombros soltos', 'Não transforme a respiração em competição'],
  },
  aquecimento: {
    id: 'aquecimento',
    minute: 'Minuto 1–2',
    title: 'Aquecimento sem esticar',
    kind: 'move',
    region: 'pescoco',
    durationSec: 60,
    instruction:
      'Com as polpas dos dedos, toques leves nas clavículas, suba para os ombros, passe pelas laterais do pescoço e volte às clavículas. Depois, toques muito suaves na linha do cabelo e acima das sobrancelhas.',
    cues: ['Clavículas → ombros → pescoço', 'Linha do cabelo e sobrancelhas', 'Nunca um tapa: toque leve'],
  },
  testa: {
    id: 'testa',
    minute: 'Minuto 2–3',
    title: 'Testa: alisamento para as têmporas',
    kind: 'move',
    region: 'testa',
    exerciseId: 'testa-alisamento',
    durationSec: 30,
    instruction:
      'Pontas dos dedos no centro da testa. Deslize para fora, até as têmporas, com contato contínuo e mínimo. Não levante repetidamente as sobrancelhas.',
    cues: ['Deslize do centro às têmporas', 'Contato mínimo', 'Se repuxar, menos pressão ou um pouco de produto'],
  },
  testaSobrancelhas: {
    id: 'testaSobrancelhas',
    title: 'Pausa entre as sobrancelhas',
    kind: 'move',
    region: 'testa',
    exerciseId: 'testa-sobrancelhas',
    durationSec: 30,
    optional: true,
    instruction:
      'Polegar entre as sobrancelhas: uma passagem para cima e uma curta para fora. Levante o dedo, reposicione e repita. Cinco passagens no total.',
    cues: ['Sem pressionar o nariz ou os olhos', 'Expire na passagem', '5 passagens'],
  },
  olhosCirculos: {
    id: 'olhosCirculos',
    minute: 'Minuto 3–4',
    title: 'Olhos: círculos de toque leve',
    kind: 'move',
    region: 'olhos',
    exerciseId: 'olhos-pena',
    durationSec: 30,
    instruction:
      'Com o dedo anelar, toque de pena ao redor do osso orbital, evitando o globo ocular e a linha dos cílios. Sobrancelha, têmpora, maçã do rosto e de volta ao canto interno.',
    cues: ['Toque quase imperceptível', 'Sobre o osso, nunca no olho', 'Suspenda se arder ou lacrimejar'],
  },
  olhosRastreamento: {
    id: 'olhosRastreamento',
    title: 'Olhos: rastreamento',
    kind: 'move',
    region: 'olhos',
    exerciseId: 'olhos-rastreamento',
    durationSec: 30,
    instruction:
      'Sem mover a cabeça: direita, centro, esquerda, centro, teto, centro, chão, centro. Feche os olhos por cinco segundos e reabra sem apertar.',
    cues: ['Cabeça parada', 'Pisque quando precisar', 'Pare se houver tontura'],
  },
  olhosDescanso: {
    id: 'olhosDescanso',
    title: 'Olhos: descanso sem toque',
    kind: 'breath',
    region: 'olhos',
    durationSec: 30,
    instruction:
      'Feche os olhos suavemente, sem apertar as pálpebras, e apenas respire. Nenhum toque na região dos olhos hoje.',
    cues: ['Pálpebras soltas', 'Respiração natural', 'Sem pressionar'],
  },
  bochechasAr: {
    id: 'bochechasAr',
    minute: 'Minuto 4–5',
    title: 'Bochechas: transferência de ar',
    kind: 'move',
    region: 'bochechas',
    exerciseId: 'bochechas-ar',
    durationSec: 30,
    instruction:
      'Encha as bochechas de ar e transfira-o de um lado para o outro, respirando pelo nariz quando necessário. Sem estufar ao máximo.',
    cues: ['Lábios fechados sem apertar', 'Pause para respirar', 'Mandíbula solta'],
  },
  bochechasPausa: {
    id: 'bochechasPausa',
    title: 'Pausa: solte a mandíbula',
    kind: 'rest',
    region: 'bochechas',
    durationSec: 10,
    instruction: 'Faça uma pausa e relaxe a mandíbula. Repita a transferência só se estiver confortável.',
    cues: ['Dentes separados', 'Língua solta'],
  },
  bochechasAr2: {
    id: 'bochechasAr2',
    title: 'Bochechas: mais uma vez, se confortável',
    kind: 'move',
    region: 'bochechas',
    exerciseId: 'bochechas-ar',
    durationSec: 30,
    optional: true,
    instruction: 'Repita a transferência de ar apenas mais uma vez, se estiver confortável. Esta é uma prática editorial; não é prova de remodelação de volume.',
    cues: ['Só se estiver confortável', 'Respire pelo nariz'],
  },
  sorriso: {
    id: 'sorriso',
    title: 'Bochechas: sorriso protegido',
    kind: 'move',
    region: 'bochechas',
    exerciseId: 'bochechas-sorriso',
    durationSec: 45,
    instruction:
      'Esconda os dentes com os lábios e forme um “O” pequeno. Amplie o sorriso sem mostrar os dentes e relaxe. Seis sorrisos.',
    cues: ['Inspire no “O”', 'Expire no sorriso', 'Solte a mandíbula entre repetições'],
  },
  bigode: {
    id: 'bigode',
    minute: 'Minuto 5–6',
    title: 'Bigode chinês: resistência mínima',
    kind: 'move',
    region: 'bigode',
    exerciseId: 'bigode-resistencia',
    durationSec: 60,
    instruction:
      'Sorria de maneira natural, sem apertar os olhos. Toque a dobra entre nariz e lábios e ofereça resistência mínima enquanto eleva a musculatura. Até dez repetições lentas.',
    cues: ['O dedo acompanha, não puxa', 'Relaxe a boca entre repetições', 'Até 10 repetições lentas'],
  },
  mandibula: {
    id: 'mandibula',
    minute: 'Minuto 6–7',
    title: 'Mandíbula: círculos na linha mandibular',
    kind: 'move',
    region: 'mandibula',
    exerciseId: 'mandibula-deslizamento',
    durationSec: 60,
    sided: true,
    instruction:
      'Com dois dedos, trace círculos pequenos do centro do queixo ao longo da mandíbula até diante da orelha e volte. Trinta segundos de cada lado.',
    cues: ['Dentes sem se tocar', 'Nunca belisque', 'Sem pressão dentro da articulação'],
  },
  mandibulaSoltar: {
    id: 'mandibulaSoltar',
    title: 'Mandíbula: soltar sem toque',
    kind: 'breath',
    region: 'mandibula',
    durationSec: 45,
    instruction:
      'Lábios fechados com suavidade, dentes separados, língua repousando. Respire e perceba a mandíbula soltar. Nenhuma massagem na articulação.',
    cues: ['Dentes separados', 'Língua repousando', 'Apenas observe'],
  },
  queixo: {
    id: 'queixo',
    minute: 'Minuto 7–8',
    title: 'Abaixo do queixo: escolha uma opção',
    kind: 'move',
    region: 'papada',
    exerciseId: 'papada-apoio',
    durationSec: 30,
    instruction:
      'Escolha uma opção: pressione o queixo de forma leve sobre as pontas dos dedos durante três respirações profundas, ou faça batidas delicadas sob o queixo por 15 segundos.',
    cues: ['Uma opção só', 'Sem inclinar o pescoço para trás'],
    options: [
      { label: 'Apoio dos dedos', text: 'Queixo repousa levemente sobre as pontas dos dedos por três respirações profundas.' },
      { label: 'Batidas de chuva', text: 'Batidas delicadas sob o queixo com a ponta dos dedos por 15 segundos.' },
    ],
  },
  pescoco: {
    id: 'pescoco',
    minute: 'Minuto 8–9',
    title: 'Pescoço: deslizamento até a clavícula',
    kind: 'move',
    region: 'pescoco',
    exerciseId: 'pescoco-deslizamento',
    durationSec: 30,
    instruction: 'Deslize os dedos do alto do pescoço até as clavículas com pressão suave. Evite puxar a pele para baixo.',
    cues: ['Pressão suave', 'Expire no deslizamento', 'Não puxe a pele'],
  },
  pescocoRespiracao: {
    id: 'pescocoRespiracao',
    title: 'Três respirações, pescoço quieto',
    kind: 'breath',
    region: 'pescoco',
    durationSec: 20,
    instruction: 'Relaxe os ombros e faça três respirações sem movimentar o pescoço.',
    cues: ['Ombros baixos', 'Pescoço parado'],
  },
  encerramento: {
    id: 'encerramento',
    minute: 'Minuto 9–10',
    title: 'Encerramento e registro',
    kind: 'rest',
    durationSec: 60,
    instruction:
      'Aplique hidratante e, de manhã, protetor solar. Observe cor, sensação e tensão sem procurar uma transformação imediata. A sessão termina quando o rosto está tão confortável quanto antes, ou mais relaxado.',
    cues: ['Hidratante', 'Protetor solar pela manhã', 'Note se algo ardeu, repuxou ou doeu'],
  },
  // Passos usados em sessões adaptadas
  toquesPescoco: {
    id: 'toquesPescoco',
    title: 'Cinco toques leves no pescoço e clavículas',
    kind: 'move',
    region: 'pescoco',
    durationSec: 45,
    instruction:
      'Com as mãos limpas, cinco toques leves descendo do pescoço às clavículas. Nada de ferramenta, esfoliação ou massagem em área vermelha.',
    cues: ['Toques mínimos', 'Evite áreas irritadas', 'Pare se arder'],
  },
  posturaSemToque: {
    id: 'posturaSemToque',
    title: 'Postura e relaxamento sem toque',
    kind: 'breath',
    durationSec: 60,
    instruction:
      'Pés apoiados, coluna crescendo para cima, ombros soltos, queixo paralelo ao chão. Perceba testa, dentes e ombros e solte cada um, sem tocar o rosto.',
    cues: ['Orelhas sobre os ombros', 'Queixo levemente recolhido', 'Testa lisa, dentes separados'],
  },
  respiracaoFinal: {
    id: 'respiracaoFinal',
    title: 'Respiração final',
    kind: 'breath',
    durationSec: 45,
    instruction: 'Mais alguns ciclos: inspire em quatro, expire em seis. Se a contagem incomodar, respire normalmente.',
    cues: ['4 para dentro', '6 para fora', 'Sem prender o ar'],
  },
  projecao: {
    id: 'projecao',
    title: 'Papada: projeção suave (opcional)',
    kind: 'move',
    region: 'papada',
    exerciseId: 'papada-projecao',
    durationSec: 60,
    optional: true,
    instruction:
      'Olhe para o teto sem comprimir a nuca e projete a mandíbula para a frente até um alongamento confortável. Segure contando até dez; até cinco repetições.',
    cues: ['Não leve a cabeça ao limite', 'Expire na projeção', 'Até 5 repetições'],
  },
}
