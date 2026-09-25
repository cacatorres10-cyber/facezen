import type { SkinBase } from './types'

export type SkinTypeId = SkinBase | 'sensivel' | 'madura'

export interface SkinTypeInfo {
  id: SkinTypeId
  label: string
  hint: string
  tips: string[]
}

/** Capítulo 6 — Adaptação por tipo de pele. Pontos de partida, não caixas permanentes. */
export const SKIN_TYPES: SkinTypeInfo[] = [
  {
    id: 'seca',
    label: 'Seca',
    hint: 'Repuxa depois de lavar, pode ficar áspera ou descamar.',
    tips: [
      'Prefira limpador cremoso, leite, bálsamo ou gel suave que não deixe repuxamento.',
      'Procure texturas com glicerina, ácido hialurônico, pantenol, ceramidas, dimeticona ou esqualano, conforme tolerância.',
      'Use loção ou creme; reforce somente as áreas ásperas.',
      'Faça a massagem com mais produto deslizante e menos passagens. Não massageie descamação para “soltá-la”.',
      'Evite água quente, toalha áspera, esfoliante físico e vários adstringentes.',
    ],
  },
  {
    id: 'oleosa',
    label: 'Oleosa',
    hint: 'Brilho no rosto todo ao longo do dia.',
    tips: [
      'Comece com limpeza suave de manhã e à noite; se houver suor, limpe sem fricção quando possível.',
      'Prefira gel-creme ou loção leve, sem óleo se essa for sua preferência e não comedogênica conforme o rótulo.',
      'Hidrate mesmo com brilho. Remover toda a hidratação pode aumentar desconforto e levar a excesso de produtos corretivos.',
      'Niacinamida ou ácido salicílico podem ser opções cosméticas, um de cada vez e em baixa frequência.',
      'Se usar argila, aplique apenas na zona desejada, sem deixar rachar completamente e sem usar no mesmo dia de vários ácidos.',
      'Na yoga facial, nunca use o brilho como motivo para esfregar mais; use uma camada fina de produto tolerado e lave as mãos.',
    ],
  },
  {
    id: 'mista',
    label: 'Mista',
    hint: 'Brilho na zona T (testa, nariz, queixo), bochechas normais ou secas.',
    tips: [
      'Limpe a zona T sem prolongar a fricção nas bochechas.',
      'Use textura leve no rosto todo e creme somente nas áreas secas, se necessário.',
      'Uma máscara de argila ou esfoliante pode ser localizado na zona T, com pouca frequência, se a pele estiver estável.',
      'Evite aplicar adstringente forte no rosto inteiro para tratar apenas o nariz.',
      'Faça a massagem com pressão uniforme e não tente “secar” uma área oleosa com mais passagens.',
    ],
  },
  {
    id: 'normal',
    label: 'Normal ou equilibrada',
    hint: 'Confortável na maior parte do tempo, sem brilho ou repuxamento marcantes.',
    tips: [
      'Uma rotina mínima de limpeza, hidratação e protetor solar pode bastar.',
      'Use gel-creme, loção ou creme leve de acordo com o clima.',
      'Ácido hialurônico, glicerina, pantenol e antioxidantes são opções, não obrigações.',
      'Se introduzir esfoliante ou sérum, adicione um por vez e observe antes de aumentar a frequência.',
      'Não procure uma sensação de “rangido” após a limpeza; conforto é um melhor critério.',
    ],
  },
  {
    id: 'sensivel',
    label: 'Sensível',
    hint: 'Arde, coça ou avermelha com facilidade.',
    tips: [
      'Priorize limpador sem sabão e sem fragrância, hidratante simples e protetor bem tolerado.',
      'Evite esfoliação, escova, ferramenta, água quente e massagem durante ardor, rubor, coceira, eczema ou rosácea ativa. A AAD recomenda não esfregar, esfoliar ou massagear pele com rosácea.',
      'Prefira mãos limpas e toques mínimos. Se a própria aplicação do creme exigir muito atrito, use mais produto ou interrompa.',
      '“Natural”, “sem cheiro” ou “hipoalergênico” não garantem tolerância. Sem fragrância não é universalmente igual a unscented; extratos botânicos também podem incomodar.',
      'Faça teste de contato: aplique o produto em uma área pequena duas vezes ao dia por 7–10 dias e suspenda se houver vermelhidão, coceira ou inchaço.',
    ],
  },
  {
    id: 'madura',
    label: 'Madura',
    hint: 'Descrição editorial de sinais visíveis, não diagnóstico.',
    tips: [
      'Use limpeza em leite, balm ou creme; hidrate rosto e pescoço com textura que ofereça conforto.',
      'Glicerina, ceramidas, pantenol, ácido hialurônico, niacinamida e dimeticona são opções de formulação. Elas não significam que o creme produzirá lifting ou apagará rugas.',
      'Retinoide deve ser introduzido lentamente, em noites alternadas ou conforme rótulo, e pode irritar.',
      'Não esfolie diariamente nem esfregue o pescoço. Se a pele estiver fina, seca ou sensibilizada, a rotina mínima é melhor que uma coleção de “anti-idade”.',
      'Proteja também pescoço, colo, mãos e áreas expostas; proteção solar diária é mais responsável que prometer reversão do envelhecimento.',
    ],
  },
]

export const skinTypeById = (id: SkinTypeId) => SKIN_TYPES.find((s) => s.id === id)!

export interface Recipe {
  id: string
  title: string
  forWhom: string
  morning: string
  night: string
  active?: string
  yoga: string
  extra?: string
}

/** Capítulo 8 — Receitas de rotina sem marcas obrigatórias. “Receita” é combinação de etapas, não mistura caseira. */
export const RECIPES: Recipe[] = [
  {
    id: 'essencial',
    title: 'Receita essencial',
    forWhom: 'Para qualquer iniciante',
    morning: 'Limpeza suave, hidratante e protetor solar.',
    night: 'Remover maquiagem/protetor, limpeza suave e hidratante.',
    yoga: 'Cinco minutos, três vezes por semana: respiração, testa, olhos com toque mínimo, mandíbula manual e pescoço sem extensão.',
  },
  {
    id: 'seca-madura',
    title: 'Receita para pele seca ou madura',
    forWhom: 'Pele seca ou madura confortável',
    morning: 'Limpeza cremosa ou enxágue, sérum hidratante opcional, creme e filtro solar confortável.',
    night: 'Limpeza, creme com ceramidas/glicerina/pantenol e óleo opcional em poucas gotas.',
    active: 'Se desejar retinoide cosmético, introduza sozinho, uma noite por semana no início, com teste e orientação do rótulo.',
    yoga: 'Use mais produto para reduzir atrito e faça menos passagens; não massageie descamações.',
  },
  {
    id: 'oleosa-mista',
    title: 'Receita para pele oleosa ou mista',
    forWhom: 'Pele oleosa ou mista',
    morning: 'Gel de limpeza suave, sérum opcional de niacinamida, gel-creme e filtro de textura leve.',
    night: 'Limpeza; tratamento único, se necessário; hidratante leve.',
    active: 'Escolha entre niacinamida ou salicílico, não uma coleção. Introduza um de cada vez.',
    yoga: 'Não use o brilho como motivo para aumentar fricção; se a pele estiver acneica e inflamada, pule a massagem local.',
  },
  {
    id: 'sensivel',
    title: 'Receita para pele sensível',
    forWhom: 'Pele sensível',
    morning: 'Enxágue ou limpador suave, hidratante simples e filtro solar tolerado.',
    night: 'Limpeza, hidratante e nada além até a pele estabilizar.',
    active: 'Somente após teste de contato e, idealmente, orientação profissional.',
    yoga: 'Respiração sem toque ou cinco toques leves no pescoço e clavículas; nada de ferramenta, esfoliação ou massagem em área vermelha.',
  },
  {
    id: 'tom',
    title: 'Receita para aparência de tom irregular',
    forWhom: 'Quem quer cuidar da aparência de tom irregular',
    morning: 'Limpeza, vitamina C ou niacinamida (escolha uma), hidratante e protetor solar.',
    night: 'Limpeza e hidratante; em noites separadas, retinoide ou esfoliante, se a pele tolerar.',
    yoga: 'A rotina do seu programa, com toque leve.',
    extra: 'Acompanhe por várias semanas sem trocar tudo. Manchas novas, mutáveis, que sangram ou coçam precisam de avaliação, não de camadas extras de creme.',
  },
]

export interface Ingredient {
  id: string
  name: string
  when: string
  text: string
}

/** Capítulo 7 — Guia de ingredientes e produtos. */
export const INGREDIENTS: Ingredient[] = [
  {
    id: 'limpeza',
    name: 'Limpeza',
    when: 'Manhã e noite',
    text: 'Gel, espuma, creme, leite, bálsamo, óleo de limpeza e água micelar são veículos diferentes. Escolha o que remove o que precisa sem ardor ou repuxamento. Óleo de limpeza pode ser útil para maquiagem e protetor resistentes, mas confira se o produto deve ser usado em pele seca ou molhada e se haverá uma segunda limpeza.',
  },
  {
    id: 'hidratantes',
    name: 'Hidratantes',
    when: 'Manhã e noite',
    text: 'Umectantes (glicerina, ácido hialurônico, pantenol, sódio PCA) ajudam a fórmula a oferecer sensação de hidratação. Emolientes (óleos, esqualano, manteigas, lipídios) deixam a superfície mais macia. Oclusivos (dimeticona, cremes densos) reduzem a sensação de perda de água. Ceramidas aparecem em fórmulas de conforto e barreira. Nenhum desses ingredientes muda a anatomia do rosto.',
  },
  {
    id: 'vitc',
    name: 'Vitamina C',
    when: 'Manhã',
    text: 'Apresentada como antioxidante e opção para luminosidade e aparência mais uniforme. Use de manhã, depois da limpeza e antes de produtos mais espessos, se a fórmula for tolerada. Não substitui protetor solar e pode arder em algumas peles.',
  },
  {
    id: 'niacinamida',
    name: 'Niacinamida',
    when: 'Manhã ou noite',
    text: 'Aparece em séruns e hidratantes para aparência de poros, oleosidade, barreira e tom. Comece com concentração e frequência moderadas. Para uma rotina inicial, não a combine com uma coleção de ativos fortes no mesmo dia.',
  },
  {
    id: 'hialuronico',
    name: 'Ácido hialurônico',
    when: 'Manhã ou noite',
    text: 'Umectante usado em séruns, géis e cremes. Aplique depois da limpeza e antes do creme, eventualmente sobre pele levemente úmida. Se a pele repuxar, use menos sérum e finalize com creme; ele sozinho não substitui uma formulação hidratante completa.',
  },
  {
    id: 'cafeina',
    name: 'Cafeína para os olhos',
    when: 'Manhã ou noite',
    text: 'Surge em produtos para aparência de inchaço ou olheiras, mas isso é alegação cosmética. Use pequena quantidade no osso orbital, sem encostar nos olhos ou na linha dos cílios. Pare se houver ardor, lacrimejamento ou vermelhidão.',
  },
  {
    id: 'peptideos',
    name: 'Peptídeos',
    when: 'Noite (ou manhã)',
    text: 'Fragmentos usados em séruns e cremes com linguagem de suporte à pele, colágeno e firmeza. Essas expressões são editoriais, não garantia clínica. Se você também usa ácido ou retinoide, pode preferir alternar noites no começo.',
  },
  {
    id: 'retinoides',
    name: 'Retinoides cosméticos',
    when: 'Noite',
    text: 'Retinol, retinal e outros derivados aparecem em rotinas para textura, tom e sinais visíveis, mas podem irritar. Use à noite, sobre pele seca, em pouca quantidade e na menor frequência do rótulo (algumas fontes sugerem iniciar uma ou duas vezes por semana). Não combine inicialmente com ácidos, vitamina C direta ou outro retinoide. Não use na gravidez ou amamentação sem orientação médica.',
  },
  {
    id: 'acidos',
    name: 'AHAs e BHA',
    when: 'Noite, em dias escolhidos',
    text: 'Ácido glicólico e lático são AHAs; salicílico é BHA. São esfoliantes cosméticos para textura, poros e aparência de tom irregular. Não são obrigatórios. Comece com um só, em baixa frequência, não use sobre pele ferida e alterne com retinoide quando houver risco de irritação. Use protetor solar de dia.',
  },
  {
    id: 'olhos',
    name: 'Produtos para a área dos olhos',
    when: 'Manhã e/ou noite',
    text: 'Um produto rotulado para o contorno pode ser hidratante, conter cafeína, niacinamida, vitamina C ou peptídeos. Use pouco, sem esfregar e afastado da linha dos cílios. Não aplique automaticamente qualquer sérum facial concentrado nos olhos.',
  },
]

export interface OrderList {
  id: string
  title: string
  steps: string[]
}

export const APPLICATION_ORDER: OrderList[] = [
  {
    id: 'manha',
    title: 'Manhã',
    steps: ['Limpeza', 'Vitamina C, se escolhida e tolerada', 'Ácido hialurônico ou niacinamida, se necessários', 'Produto para olhos, se desejado', 'Hidratante', 'Protetor solar', 'Maquiagem'],
  },
  {
    id: 'noite',
    title: 'Noite sem retinoide',
    steps: ['Remoção de maquiagem e protetor', 'Limpeza', 'Tônico opcional', 'Esfoliante no dia escolhido, ou sérum hidratante/niacinamida/peptídeos', 'Produto para olhos, se desejado', 'Hidratante', 'Óleo facial opcional, em poucas gotas'],
  },
  {
    id: 'retinoide',
    title: 'Noite com retinoide',
    steps: ['Remoção e limpeza', 'Sérum hidratante aquoso, se o rótulo permitir', 'Retinoide cosmético em pouca quantidade', 'Hidratante', 'Óleo opcional, se compatível'],
  },
]

export const REAPPLY_TIPS = [
  'Reaplique o protetor conforme o rótulo e as condições de exposição. Uma fonte editorial cita a cada duas horas; suor, água, toalha, exercício e exposição intensa podem exigir reaplicação antes.',
  'Não conte hidratante, maquiagem com FPS baixo ou vitamina C como substituto do filtro.',
  'Para retocar sobre maquiagem, use uma estratégia compatível com o produto, sem esfregar.',
  'Se usar óleo facial durante o dia, confira o rótulo: alguns óleos podem interferir na camada do protetor.',
  'Depois de suar, limpe com suavidade quando for possível; não use várias lavagens agressivas para “compensar”.',
]

export const GOLDEN_RULE = 'Um ativo novo de cada vez, baixa frequência e protetor solar de dia. Mais produtos não significam melhores resultados.'
