import type { GroupId } from './library'

/**
 * Curso FaceZen: aulas de teoria e de skincare, em passos curtos.
 * As aulas de exercício vêm de `library.ts` (uma por exercício).
 * Fonte única para o app e para o arquivo do NotebookLM (`npm run aulas`).
 */

export interface Lesson {
  id: string
  title: string
  /** Uma frase: o que a pessoa leva desta aula. */
  summary: string
  /** O tutorial, um passo por tela. */
  steps: string[]
  /** Complemento (aparece em "Mais detalhes" e no arquivo do NotebookLM). */
  details?: string[]
  /** Uma tabela simples, quando ajuda. */
  table?: { head: [string, string]; rows: [string, string][] }
  /** Cuidados ou "não faça". */
  avoid?: string[]
}

export type ModuleKind = 'teoria' | 'exercicios' | 'skincare'

export interface CourseModule {
  id: string
  kind: ModuleKind
  title: string
  intro: string
  lessons?: Lesson[]
  /** Exercícios dos grupos (depois das aulas, se houver). */
  groups?: GroupId[]
}

const COMECE: Lesson[] = [
  {
    id: 'c-como-funciona',
    title: 'Como o FaceZen funciona',
    summary: 'Quatro linhas de trabalho e três princípios que guiam tudo.',
    steps: [
      'O FaceZen junta quatro coisas: exercícios com leve resistência dos dedos, posturas que você segura por alguns segundos, massagem e o skincare básico.',
      'Funciona como um treino: aquecer, trabalhar o rosto inteiro, descansar, progredir aos poucos e manter.',
      'Princípio 1 · Pouco, bem feito e com frequência. Sessões curtas valem mais que uma longa de vez em quando.',
      'Princípio 2 · Rosto inteiro, com foco. Toda sessão passa pelo rosto todo; o seu objetivo ganha alguns minutos a mais.',
      'Princípio 3 · Conforto é o limite. Nada deve doer, arder, repuxar ou marcar a pele.',
    ],
    details: [
      'Trabalhar só uma área pode criar tensão em outras. Por isso existe a série de rosto inteiro.',
      'Os músculos do rosto são finos e cansam rápido: mais força não significa mais resultado.',
    ],
  },
  {
    id: 'c-rosto',
    title: 'O que muda no rosto e onde a prática entra',
    summary: 'O que os exercícios podem ajudar, e o que eles não fazem.',
    steps: [
      'Com o tempo, três coisas mudam em todo mundo: os ossos do rosto, as almofadinhas de gordura e o colágeno da pele.',
      'Somam-se fatores do dia a dia: sol sem protetor, cigarro, noites mal dormidas, estresse e falta de hidratação.',
      'O rosto tem dezenas de músculos. Diferente de osso e gordura, músculo responde a estímulo.',
      'A prática ajuda na consciência (perceber quando franze a testa ou aperta os dentes), no relaxamento, no tônus e na postura.',
      'Ela não repõe osso nem gordura, não substitui o protetor solar, não trata doença de pele e não tem prazo garantido.',
    ],
    table: {
      head: ['Região', 'Músculo e o que ele faz'],
      rows: [
        ['Testa', 'Frontal: levanta as sobrancelhas'],
        ['Entre as sobrancelhas', 'Corrugador e prócero: franzem'],
        ['Olhos', 'Orbicular dos olhos: fecha e aperta os olhos'],
        ['Maçãs do rosto', 'Zigomáticos: levantam o sorriso'],
        ['Bochecha', 'Bucinador: suga e empurra o ar'],
        ['Boca', 'Orbicular da boca: fecha e projeta os lábios'],
        ['Mandíbula', 'Masseter: mastiga (e aperta na tensão)'],
        ['Pescoço', 'Platisma: tensiona a pele do pescoço'],
      ],
    },
  },
  {
    id: 'c-regras',
    title: 'As 10 regras de ouro',
    summary: 'O que vale para todos os exercícios, sempre.',
    steps: [
      'Aqueça antes: um a dois minutos de pescoço e rosto.',
      'Nunca com a pele seca: use um sérum, óleo ou creme que você já usa. A pele desliza, nunca é arrastada.',
      'Trabalhe o rosto inteiro em toda sessão e some o módulo do seu objetivo.',
      'Pouco e com frequência. No máximo 15 minutos por dia.',
      'Descanse: solte o rosto entre as séries e tenha pelo menos um dia de folga por semana.',
      'Não franza a testa nos exercícios de olhos e boca. Vigie no espelho; se franzir, apoie os dedos na testa.',
      'Respire pelo nariz, sem prender o ar.',
      'Troque de série a cada período e aumente as repetições aos poucos.',
      'Pare ao primeiro sinal: dor, ardor, estalo na mandíbula, tontura, visão embaçada, vermelhidão que não passa ou marca roxa.',
      'Termine relaxando e aplique o hidratante (e o protetor, se for de manhã).',
    ],
  },
  {
    id: 'c-preparo',
    title: 'Prepare-se em 2 minutos',
    summary: 'Materiais e o checklist antes de cada sessão.',
    steps: [
      'Rosto limpo, sem maquiagem nem protetor.',
      'Mãos lavadas, unhas curtas, sem anéis. Cabelo preso.',
      'Espalhe no rosto e no pescoço 3 a 4 gotas de sérum ou óleo, ou uma ervilha de creme.',
      'Sente com a coluna longa, ombros baixos e queixo paralelo ao chão.',
      'Espelho na altura dos olhos.',
      'Olhe a pele: se houver ferida ou espinha inflamada, pule os movimentos naquela área hoje.',
    ],
    details: [
      'Lave as ferramentas antes e depois. Não use ferramenta lascada e não compartilhe.',
      'Manhã desincha e prepara o dia. Noite relaxa e solta a tensão. Em pausas curtas, só os exercícios sem as mãos.',
    ],
  },
  {
    id: 'c-programa',
    title: 'Seu programa de 8 semanas',
    summary: 'Como a sua sessão é montada e como ela evolui.',
    steps: [
      'Toda sessão é a drenagem facial com as mãos, sempre na mesma ordem: alongar o pescoço, abrir o caminho, drenar o rosto de baixo para cima e fechar na clavícula.',
      'Semanas 1 e 2 · Adaptação: 5 repetições em cada ponto. O objetivo é aprender o caminho e o toque levíssimo.',
      'Semanas 3 a 5 · Construção: 8 repetições, e entra o seu foco: mais repetições na região do seu objetivo e um exercício com as mãos.',
      'Semanas 6 a 8 · Intensificação: 10 repetições, só se estiver confortável. Houve incômodo? O app volta para 8.',
      'Depois: manutenção, 4 a 5 dias por semana.',
    ],
    details: [
      'Só avance se a fase anterior terminou sem dor, sem cansaço que dura e sem franzir.',
      'Tem um objetivo secundário? O app alterna: um dia o principal, no outro o secundário.',
      'Um dia de descanso por semana, sempre.',
    ],
  },
  {
    id: 'c-seguranca',
    title: 'Quando parar e quando procurar ajuda',
    summary: 'Os sinais que encerram a sessão e quem procurar.',
    steps: [
      'Pare na hora com dor, ardor, estalo na mandíbula, tontura, visão embaçada, vermelhidão que não passa ou marca roxa.',
      'Depois de botox, preenchimento, peeling, laser ou cirurgia: espere a liberação de quem fez.',
      'Mandíbula que dói, estala ou trava: dentista ou fisioterapeuta.',
      'Dor no pescoço, formigamento ou tontura: médico ou fisioterapeuta.',
      'Olho vermelho, dolorido ou visão alterada: oftalmologista.',
      'Acne profunda, mancha que muda, rosácea ou pinta nova: dermatologista.',
    ],
  },
]

const DRENAGEM: Lesson[] = [
  {
    id: 'c-drenagem',
    title: 'Drenagem facial: o caminho',
    summary: 'A prática principal: por onde começar, para onde levar e o toque certo.',
    steps: [
      'O líquido do rosto desce pelo pescoço e termina logo acima da clavícula.',
      'Por isso a drenagem começa ali: primeiro a clavícula, depois as laterais do pescoço e a região das orelhas.',
      'O toque é levíssimo: os dedos só esticam a pele alguns milímetros e soltam. Não é para apertar o músculo nem deslizar.',
      'Sem creme ou óleo: com a mão escorregando, não dá para esticar a pele.',
      'Sempre para baixo e para trás, em direção à clavícula. Nunca na frente da garganta.',
      'No rosto, a ordem é de baixo para cima: mandíbula, boca, bochechas, abaixo dos olhos, testa e têmporas, sempre em direção às orelhas.',
      'Para fechar, desça das orelhas pelo pescoço até a clavícula.',
    ],
    details: [
      'A drenagem linfática manual é bem estabelecida no tratamento de linfedema. No rosto, o que muitas pessoas sentem é relaxamento e o rosto mais leve logo depois, de forma passageira.',
      'Se a pele ficar vermelha, a pressão foi forte demais.',
    ],
    avoid: ['Febre, infecção, garganta ou gânglios inflamados', 'Trombose, insuficiência cardíaca ou câncer em tratamento sem liberação médica', 'Apertar, esfregar ou fazer na frente da garganta'],
  },
]

const SKIN_BASICO: Lesson[] = [
  {
    id: 's-limpar',
    title: 'Limpar do jeito certo',
    summary: 'Limpeza suave de manhã e completa à noite.',
    steps: [
      'Manhã: limpeza suave (gel, espuma ou creme). Pele seca ou sensível pode usar só água morna.',
      'Noite, se usou maquiagem ou protetor: primeiro remova (água micelar, óleo ou balm), depois lave.',
      'Molhe o rosto com água morna, nunca quente.',
      'Use uma moeda pequena de limpador e massageie em círculos por cerca de 1 minuto.',
      'Enxágue bem, inclusive a linha do cabelo e o queixo.',
      'Seque pressionando a toalha, sem esfregar. Toalha só do rosto, trocada a cada 2 ou 3 dias.',
    ],
  },
  {
    id: 's-hidratar',
    title: 'Hidratar (inclusive pele oleosa)',
    summary: 'Hidratar fortalece a barreira que protege a pele.',
    steps: [
      'Pele desidratada tende a produzir mais óleo para compensar.',
      'O hidratante fortalece a barreira da pele, que protege contra irritação.',
      'Quantidade: uma ervilha para cada lado do rosto e uma para a testa.',
      'Escolha a textura pela sua pele: gel para oleosa, gel-creme para mista, creme para seca.',
    ],
  },
  {
    id: 's-proteger',
    title: 'Protetor solar: o passo mais importante',
    summary: 'FPS 30 ou mais, na quantidade certa, todos os dias.',
    steps: [
      'Escolha FPS 30 ou mais, com proteção UVA indicada no rótulo.',
      'Quantidade: uma colher de chá para rosto e pescoço, o equivalente a 3 dedos de protetor.',
      'Achou muito? Aplique duas camadas generosas.',
      'Reaplique a cada 2 a 3 horas de exposição e depois de suar ou entrar na água.',
      'Todos os dias, mesmo nublado e em casa perto da janela.',
      'Tem manchas ou fica no computador? Prefira protetor com cor ou mineral.',
    ],
    details: ['Um tubo de 50 ml usado na quantidade certa todo dia dura cerca de um mês. Se dura três, você está passando pouco.'],
  },
  {
    id: 's-ordem',
    title: 'A ordem certa dos produtos',
    summary: 'Do mais líquido para o mais denso; protetor por último de manhã.',
    steps: [
      'Manhã: limpeza → tônico (opcional) → vitamina C → sérum → creme de olhos → hidratante → protetor → maquiagem.',
      'Noite: demaquilante → limpeza → tônico (opcional) → esfoliante ou máscara (1 a 3 vezes por semana) → yoga facial → sérum de tratamento → creme de olhos → hidratante → óleo.',
      'A yoga facial entra depois da limpeza, usando o sérum ou hidratante para deslizar.',
      'Retinol e ácidos entram depois dos exercícios, nunca antes: massagear sobre ácido irrita.',
    ],
  },
  {
    id: 's-quantidades',
    title: 'Quanto usar de cada produto',
    summary: 'A cola para deixar no espelho.',
    steps: [
      'Limpador ou esfoliante: uma moeda pequena.',
      'Sérum: 3 a 4 gotas.',
      'Hidratante: uma ervilha por lado e uma na testa.',
      'Creme de olhos: um grão de arroz por olho.',
      'Pescoço e colo: uma moeda pequena.',
      'Protetor: 3 dedos (uma colher de chá) para rosto e pescoço.',
    ],
  },
]

const SKIN_ATIVOS: Lesson[] = [
  {
    id: 's-hidratantes',
    title: 'Ácido hialurônico e niacinamida',
    summary: 'Dois ativos gentis, que quase todo mundo tolera.',
    steps: [
      'Ácido hialurônico hidrata e “segura” água. Não esfolia, apesar do nome.',
      'Aplique na pele levemente úmida e feche com o hidratante. Manhã e noite.',
      'Niacinamida (vitamina B3) ajuda na oleosidade, nos poros, nas manchas e na vermelhidão.',
      'É muito bem tolerada: manhã e noite, começando com concentração moderada.',
    ],
  },
  {
    id: 's-vitc',
    title: 'Vitamina C',
    summary: 'Antioxidante da manhã, parceira do protetor.',
    steps: [
      'Dá viço, uniformiza o tom e ajuda a prevenir manchas.',
      'Use de manhã, antes do hidratante e do protetor.',
      'A forma pura é mais potente e pode arder; os derivados são mais suaves.',
      'Guarde longe da luz. O ácido ferúlico costuma vir junto e potencializa o efeito.',
    ],
  },
  {
    id: 's-acidos',
    title: 'Ácidos esfoliantes',
    summary: 'Salicílico, glicólico, lático e mandélico: para que serve cada um.',
    steps: [
      'Salicílico (BHA) entra no poro: cravos, espinhas e oleosidade. Pode ressecar.',
      'Glicólico (AHA) esfolia: textura, poros e manchas. Pode pinicar no começo.',
      'Lático (AHA) é mais suave e hidratante: bom para começar.',
      'Mandélico (AHA) é suave e muito tolerado, bom para pele sensível ou negra.',
      'De preferência à noite, e protetor obrigatório no dia seguinte.',
    ],
    avoid: ['Evite ácidos em dias de praia ou piscina.', 'Não use dois esfoliantes ao mesmo tempo.'],
  },
  {
    id: 's-retinol',
    title: 'Retinol',
    summary: 'O ativo mais estudado para linhas e textura. Só à noite.',
    steps: [
      'Ajuda em linhas, textura, firmeza e tom.',
      'Só à noite, depois dos exercícios.',
      'Comece 2 a 3 noites por semana, depois dias alternados, e só então todo dia, se a pele tolerar.',
      'Não use na mesma noite que ácido: alterne as noites.',
    ],
    avoid: ['Proibido na gravidez.', 'Suspenda semanas antes de praia.', 'Ácido retinoico (tretinoína) é remédio: só com receita.'],
  },
  {
    id: 's-clareadores',
    title: 'Clareadores',
    summary: 'Para manchas e melasma, sempre com protetor com cor.',
    steps: [
      'Exemplos: alfa-arbutin, ácido tranexâmico e tiamidol.',
      'Use conforme o rótulo, com constância.',
      'Sem protetor com cor e reaplicação, eles não funcionam.',
    ],
  },
  {
    id: 's-luz',
    title: 'Fotossensível ou fotossensibilizante?',
    summary: 'Duas palavras parecidas, dois cuidados diferentes.',
    steps: [
      'Fotossensível: o produto se estraga com a luz (ex.: vitamina C pura). Guarde fechado e longe da luz.',
      'Fotossensibilizante: o ativo deixa a pele sensível ao sol (ex.: retinol, ácidos). Use à noite e nunca saia sem protetor.',
    ],
  },
  {
    id: 's-misturar',
    title: 'Pode misturar ativos?',
    summary: 'As quatro regras para combinar sem irritar.',
    steps: [
      'Leia o modo de uso do fabricante.',
      'Não use dois ativos fortes na mesma noite (ex.: retinol e ácido glicólico). Alterne.',
      'Evite repetir a mesma função, como dois esfoliantes.',
      'Um produto novo por vez, e espere 2 semanas antes do próximo.',
    ],
  },
]

const SKIN_ROTINA: Lesson[] = [
  {
    id: 's-texturas',
    title: 'Texturas: qual escolher',
    summary: 'A textura certa para a sua pele e o seu clima.',
    steps: [
      'Sérum: leve e concentrado. Serve para todos: é o veículo, não a função.',
      'Gel: aquoso e sem óleo. Pele oleosa e clima quente.',
      'Gel-creme: meio-termo leve. Pele mista, normal ou oleosa desidratada.',
      'Loção: parecida com creme, mais leve. Pele normal.',
      'Creme: encorpado e nutritivo. Pele seca, madura ou clima frio.',
      'No verão, texturas leves. No inverno, ou quando a pele repuxar, mais cremosas.',
    ],
  },
  {
    id: 's-fixa-reserva',
    title: 'Rotina fixa e reserva',
    summary: 'O que é todo dia e o que entra só quando a pele pede.',
    steps: [
      'Fixa: cuida do que é constante na sua pele (oleosidade, sinais do tempo, melasma). Todo dia.',
      'Reserva: entra só quando precisa (secativo para espinha, esfoliante quando a pele está áspera).',
      'Liste o que mais te incomoda e escolha um ativo para cada queixa.',
      'Comece pelo que mais incomoda. Um produto novo a cada 2 semanas.',
    ],
  },
  {
    id: 's-seca',
    title: 'Rotina para pele seca',
    summary: 'Conforto e água morna.',
    steps: [
      'Nível 1 · Manhã: água morna, creme hidratante, protetor. Noite: limpador cremoso e creme.',
      'Nível 2 · Acrescente ácido hialurônico antes do creme.',
      'Nível 3 · Vitamina C derivada de manhã e retinol 2 noites por semana. Óleo facial por último.',
    ],
    avoid: ['Água quente', 'Sabonete em barra comum', 'Tônico com álcool', 'Esfoliante com grãos'],
  },
  {
    id: 's-oleosa',
    title: 'Rotina para pele oleosa',
    summary: 'Leveza, sem pular o hidratante.',
    steps: [
      'Nível 1 · Gel de limpeza, hidratante em gel e protetor oil-free ou toque seco.',
      'Nível 2 · Acrescente niacinamida. À noite, alterne niacinamida e ácido salicílico.',
      'Nível 3 · Vitamina C de manhã; à noite, ácido glicólico 2 vezes e retinol 2 vezes por semana, em noites diferentes.',
    ],
    avoid: ['Ficar sem hidratante', 'Lavar mais de 3 vezes ao dia', 'Adstringente forte todo dia'],
  },
  {
    id: 's-mista',
    title: 'Rotina para pele mista',
    summary: 'Equilibrar a zona T sem ressecar as bochechas.',
    steps: [
      'Nível 1 · Gel de limpeza suave, gel-creme e protetor.',
      'Nível 2 · Acrescente niacinamida manhã e noite.',
      'Nível 3 · Vitamina C de manhã; à noite, salicílico só na zona T 2 vezes e retinol 2 vezes por semana.',
      'Se as bochechas repuxarem, creme mais nutritivo só nelas.',
    ],
  },
  {
    id: 's-normal',
    title: 'Rotina para pele normal',
    summary: 'Manter o que já está bom.',
    steps: [
      'Nível 1 · Limpador suave, loção ou gel-creme e protetor.',
      'Nível 2 · Vitamina C de manhã; à noite, ácido hialurônico ou niacinamida.',
      'Nível 3 · Vitamina C com ferúlico; retinol 3 noites por semana, avançando aos poucos.',
    ],
  },
  {
    id: 's-sensivel',
    title: 'Rotina para pele sensível',
    summary: 'Menos produtos, sem fragrância, sempre testando antes.',
    steps: [
      'Nível 1 · Limpador sem fragrância (ou só água), hidratante simples e protetor mineral.',
      'Nível 2 · Niacinamida em concentração baixa de manhã; ácido hialurônico à noite.',
      'Nível 3 · Só com orientação de dermatologista.',
      'Sempre teste um produto novo atrás da orelha ou na parte de dentro do braço por 7 a 10 dias.',
    ],
  },
  {
    id: 's-objetivos',
    title: 'Complementos por objetivo',
    summary: 'O que acrescentar ao básico, conforme o que te incomoda.',
    steps: [
      'Linhas e firmeza: retinol à noite (não na gravidez), ácido hialurônico, peptídeos.',
      'Manchas: vitamina C, um clareador e protetor com cor, reaplicado.',
      'Acne e cravos: ácido salicílico, niacinamida e secativo só na espinha.',
      'Olhos inchados: creme de olhos com cafeína e rolo ou colher gelados de manhã.',
      'Pescoço: leve todos os produtos até o colo, inclusive o protetor.',
    ],
  },
  {
    id: 's-manchas',
    title: 'Manchas: o combo que funciona',
    summary: 'Protetor, luz visível, clareador e zero atrito.',
    steps: [
      'Protetor na quantidade certa e reaplicado.',
      'Proteção contra a luz visível: protetor com cor ou base por cima da mancha.',
      'Um clareador, com constância.',
      'Zero atrito: não esfregue toalha, algodão ou esponja.',
      'Não esprema espinhas: é a principal causa de mancha pós-acne.',
    ],
    avoid: ['Mancha que muda de cor, sangra, coça ou cresce: dermatologista.'],
  },
  {
    id: 's-habitos',
    title: 'Hábitos que mudam a pele',
    summary: 'Pequenas escolhas diárias que somam.',
    steps: [
      'Nunca durma de maquiagem. Deixe água micelar perto da cama para os dias de preguiça.',
      'Água morna, nunca quente.',
      'Lave o rosto no máximo 3 vezes ao dia.',
      'Lave pincéis e esponjas toda semana.',
      'Não fique passando a mão no rosto nem esprema espinhas.',
      'Durma bem e beba água. Quando a pele arder, menos ativos e mais hidratação.',
    ],
  },
  {
    id: 's-mimo',
    title: 'Mimo de fim de semana',
    summary: 'Uma máscara calmante simples, opcional.',
    steps: [
      'Misture 5 colheres de chá de aveia bem fina com 2 de mel.',
      'Teste antes na parte de dentro do pulso e espere 24 horas.',
      'Aplique no rosto limpo, longe dos olhos, por 10 minutos.',
      'Remova com água morna, sem esfregar, e passe o hidratante.',
    ],
    avoid: ['Não coloque no rosto: limão, bicarbonato, açúcar, pasta de dente ou óleo essencial puro.'],
  },
]

const ESCOVA: Lesson[] = [
  {
    id: 's-escova',
    title: 'Escova facial: o que é e como usar',
    summary: 'Um acessório opcional para fazer a massagem com mais conforto.',
    steps: [
      'É uma escova curva, de cerdas macias, que ficou famosa como “escova de drenagem”.',
      'No FaceZen ela é opcional: um jeito gostoso de massagear, que ajuda a relaxar. Muita gente sente o rosto menos inchado logo depois, mas é passageiro.',
      'Use na pele limpa, com um pouco de hidratante ou óleo para deslizar.',
      'A ordem segue a drenagem: abra a clavícula com as mãos, passe a escova no pescoço, no rosto e na testa, e feche descendo da mandíbula até a clavícula.',
      'No rosto, sempre do centro para as orelhas. No pescoço, sempre de cima para baixo.',
      'A escova tem dois lados: as cerdas, para deslizar, e as bolinhas, para massagear com um pouco mais de firmeza, sem doer.',
      'Passe em linhas, sempre do centro para fora: testa de baixo para cima, embaixo dos olhos só sobre o osso, bochecha na diagonal até a orelha e mandíbula do queixo até a orelha.',
      'Pressão leve: as cerdas deslizam, não esfregam. Embaixo dos olhos, só as cerdas e nunca na pálpebra.',
      'Depois de usar, lave com água e sabonete neutro e deixe secar com as cerdas para baixo.',
    ],
    details: [
      'Escolha cerdas bem macias, sem cheiro forte e com cabo firme.',
      'É de uso pessoal: não compartilhe.',
      'Marcou que tem a escova? O bloco da escova (com a abertura e o fechamento da drenagem) entra nas suas sessões 2 a 3 vezes por semana, a partir da semana 3.',
    ],
    avoid: [
      'Espinha inflamada, rosácea, feridas ou pele irritada',
      'Logo depois de procedimento estético',
      'Pele sensível: o app não inclui a escova nas sessões; se quiser testar, comece numa área pequena',
      'Fazer força ou esfregar',
    ],
  },
]

const ACOMPANHAR: Lesson[] = [
  {
    id: 'a-foto',
    title: 'Foto de acompanhamento',
    summary: 'Uma vez por semana, sempre do mesmo jeito.',
    steps: [
      'Mesma luz: de frente para uma janela, de dia.',
      'Mesma distância: câmera na altura dos olhos.',
      'Sem maquiagem, sem filtro, cabelo preso.',
      'Quatro fotos: de frente relaxado, de frente sorrindo, perfil direito e perfil esquerdo.',
      'Compare a semana 1 com a 4 e a 8, não dia a dia. As fotos ficam só com você.',
    ],
  },
  {
    id: 'a-realista',
    title: 'O que é realista esperar',
    summary: 'Sem promessas: o que muitas pessoas relatam.',
    steps: [
      'Logo depois da sessão: rosto corado, menos inchado, sensação de relaxamento. É temporário.',
      'Em 1 a 3 semanas: mais consciência de quando você franze ou aperta os dentes.',
      'Em 4 a 8 semanas: algumas pessoas percebem diferença nas fotos. Varia muito.',
      'Depende de constância, idade, genética, sono, sol e skincare. Não há garantia.',
    ],
  },
  {
    id: 'a-erros',
    title: 'Os erros mais comuns',
    summary: 'O que atrapalha, para você não repetir.',
    steps: [
      'Fazer com a pele seca, que repuxa e marca.',
      'Trabalhar só a área que incomoda e esquecer o resto do rosto.',
      'Exagerar na força, nas repetições ou no tempo.',
      'Franzir a testa nos exercícios de olhos e boca.',
      'Pular o aquecimento ou o dia de descanso.',
      'Usar ferramenta com força: marca roxa não é sinal de que funcionou.',
      'Pular o protetor, usar pouco ou achar que pele oleosa não precisa de hidratante.',
      'Começar vários produtos novos na mesma semana.',
      'Desistir em uma semana, ou comparar fotos com luz diferente.',
    ],
  },
  {
    id: 'a-faq',
    title: 'Perguntas frequentes',
    summary: 'As dúvidas que mais aparecem, em uma frase cada.',
    steps: [
      'Funciona? Trabalha músculo, circulação, postura e relaxamento. Não substitui procedimentos e não tem resultado garantido.',
      'Pode causar ruga? Pode marcar se feito com exagero, com a pele seca ou franzindo. Por isso há doses e espelho.',
      'Todo dia? Sim, com um dia de descanso por semana.',
      'Grávida? Converse com o obstetra. Nada de retinol e nada de pescoço para trás.',
      'Tenho acne. Faça os exercícios sem toque e não passe as mãos sobre as espinhas inflamadas.',
      'Preciso de gua sha? Não. As mãos bastam.',
      'Qual o melhor protetor? O que você gosta de usar todo dia, na quantidade certa.',
    ],
  },
]

export const COURSE: CourseModule[] = [
  { id: 'comece', kind: 'teoria', title: 'Comece aqui', intro: 'Como funciona, as regras de ouro e o seu programa.', lessons: COMECE },
  { id: 'drenagem', kind: 'exercicios', title: 'Drenagem facial com as mãos', intro: 'A prática de toda sessão, passo a passo.', lessons: DRENAGEM, groups: ['aquecimento', 'drenagem'] },
  { id: 'testa-olhos', kind: 'exercicios', title: 'Extras: testa e olhos', intro: 'Testa sem franzir e olhos com toque leve.', groups: ['testa', 'olhos'] },
  { id: 'bochechas-boca', kind: 'exercicios', title: 'Extras: bochechas e boca', intro: 'Maçãs do rosto, bigode chinês e contorno da boca.', groups: ['bochechas', 'bigode', 'labios'] },
  { id: 'mandibula', kind: 'exercicios', title: 'Extras: mandíbula e pescoço', intro: 'Queixo, pescoço e mandíbula solta.', groups: ['mandibula', 'pescoco', 'relaxamento'] },
  { id: 'ferramentas', kind: 'exercicios', title: 'Exercícios com ferramentas', intro: 'Escova facial coreana e gua sha.', lessons: ESCOVA, groups: ['escova'] },
  { id: 'skin-basico', kind: 'skincare', title: 'Skincare: o básico', intro: 'Limpar, hidratar e proteger bem feito.', lessons: SKIN_BASICO },
  { id: 'skin-ativos', kind: 'skincare', title: 'Skincare: os ativos', intro: 'O que é cada ativo e quando usar.', lessons: SKIN_ATIVOS },
  { id: 'skin-rotina', kind: 'skincare', title: 'Skincare: a sua rotina', intro: 'Rotinas por tipo de pele, manchas e hábitos.', lessons: SKIN_ROTINA },
  { id: 'acompanhar', kind: 'teoria', title: 'Acompanhe a evolução', intro: 'Fotos, expectativas realistas e dúvidas.', lessons: ACOMPANHAR },
]

export const ALL_LESSONS: Lesson[] = COURSE.flatMap((m) => m.lessons ?? [])

export const lessonById = (id: string) => ALL_LESSONS.find((l) => l.id === id)

export const moduleOfLesson = (id: string) => COURSE.find((m) => m.lessons?.some((l) => l.id === id))
