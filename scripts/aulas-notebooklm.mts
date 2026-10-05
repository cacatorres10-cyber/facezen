// Gera docs/guia/FaceZen-Aulas-NotebookLM.md a partir do conteúdo do app
// (src/content/library.ts e src/content/course.ts): uma aula por exercício e por tema de skincare.
// Uso: npm run aulas
import fs from 'node:fs'
import { exerciseSvg } from '../src/content/art.ts'
import { COURSE, type Lesson } from '../src/content/course.ts'
import { EXERCISES, FOCUS, groupById, LEVEL_LABEL, ROUTINE, SERIES, type Exercise, type Level } from '../src/content/library.ts'

const FLAG_TEXT: Record<string, string> = {
  cervical: 'dor ou histórico no pescoço (cervical)',
  atm: 'dor, estalo ou disfunção na mandíbula (ATM)',
  olhos: 'olho seco, olhos sensíveis ou lentes de contato',
  procedimento: 'procedimento estético recente sem liberação',
  gestante: 'gravidez ou amamentação',
  peleCrise: 'pele em crise (acne inflamada, rosácea, eczema, feridas)',
}
const LEVELS: Level[] = ['ini', 'int', 'ava']
const byId = (id: string) => EXERCISES.find((e) => e.id === id)!
const names = (ids: string[]) => ids.map((id) => `${id} ${byId(id).title}`).join(' → ')

const DRAW_DIR = 'docs/guia/desenhos'
fs.rmSync(DRAW_DIR, { recursive: true, force: true })
fs.mkdirSync(DRAW_DIR, { recursive: true })

const out: string[] = []
const w = (...lines: string[]) => out.push(...lines)
let n = 0

const TOM = [
  'Português do Brasil, tom acolhedor e direto, frases curtas.',
  'Linguagem neutra em gênero (“que bom que você chegou”, nunca “obrigada” ou “pronta”).',
  'Sem promessas: não prometa lifting, fim de rugas, de olheiras ou de papada, nem rejuvenescimento. Fale em conforto, relaxamento, consciência e ritual.',
  'Segurança primeiro: diga sempre quando pular o exercício e os sinais para parar.',
  'Sem meditação nem respiração guiada.',
]

function videoPrompt(title: string, focus: string, extra: string[] = []) {
  w(
    '',
    '> **Para o NotebookLM (Visão geral em vídeo → Personalizar):**',
    `> Crie um vídeo curto, de 2 a 4 minutos, só sobre a aula “${title}” do FaceZen. ${focus}`,
    ...extra.map((e) => `> ${e}`),
    '> Siga o tom do FaceZen: frases curtas, linguagem neutra em gênero, nenhuma promessa de resultado, e termine lembrando quando parar.',
    '',
  )
}

function textLesson(l: Lesson) {
  n++
  w(`## Aula ${n} · ${l.title}`, '', `*${l.summary}*`, '', '**Passo a passo**', '')
  l.steps.forEach((s, i) => w(`${i + 1}. ${s}`))
  if (l.table) {
    w('', `| ${l.table.head[0]} | ${l.table.head[1]} |`, '|---|---|', ...l.table.rows.map(([a, b]) => `| ${a} | ${b} |`))
  }
  if (l.details) w('', '**Mais detalhes**', '', ...l.details.map((d) => `- ${d}`))
  if (l.avoid) w('', '**Evite**', '', ...l.avoid.map((d) => `- ${d}`))
  videoPrompt(l.title, 'Explique um ponto por vez, na ordem do passo a passo, com um exemplo prático do dia a dia.')
}

function exerciseLesson(e: Exercise) {
  n++
  const g = groupById(e.group)
  w(`## Aula ${n} · ${e.id} ${e.title}`, '', `*${e.forWhat}*`, '')
  w(`- **Região:** ${g.title}`)
  w(`- **Dose:** ${LEVELS.map((l) => `${LEVEL_LABEL[l]} ${e.dose[l]}`).join(' · ')}`)
  if (e.sided) w('- **Lados:** faça de um lado e depois do outro.')
  if (e.anywhere) w('- **Onde:** dá para fazer em qualquer lugar, sem as mãos no rosto.')
  if (e.tool === 'escova') w('- **Material:** escova facial de cerdas macias (opcional).')
  const svg = exerciseSvg(e.id, `Desenho: ${e.title}`)
  if (svg) {
    fs.writeFileSync(`${DRAW_DIR}/${e.id}.svg`, svg)
    w('', `![Desenho do exercício ${e.id} ${e.title}: dedos em rosa, setas verdes mostram o movimento, pontos verdes são onde tocar](desenhos/${e.id}.svg)`)
  }
  w('', '**Passo a passo**', '')
  e.steps.forEach((s, i) => w(`${i + 1}. ${s}`))
  w('', `**Confira no espelho:** ${e.check}`)
  if (e.skip) w('', `**Pule se:** ${e.skip}`)
  if (e.avoidIf.length) w('', `**Fica fora do plano de quem tem:** ${e.avoidIf.map((f) => FLAG_TEXT[f]).join('; ')}.`)
  const adapt = Object.entries(e.adapt ?? {})
  if (adapt.length) w('', `**Adaptação:** ${adapt.map(([f, t]) => `com ${FLAG_TEXT[f]}: ${t}`).join(' ')}`)
  videoPrompt(`${e.id} ${e.title}`, 'Mostre o exercício como um tutorial: para que serve, os 3 passos com calma, a dose de cada nível e como conferir no espelho.', [
    'Use o desenho da aula como imagem principal: explique onde ficam os dedos (em rosa) e o movimento das setas verdes.',
    'Use comparações do dia a dia, como no texto. A pessoa vai imitar o que ouvir.',
  ])
}

// ———————————————————————————————— Cabeçalho
w(
  '# FaceZen — Aulas para o NotebookLM',
  '',
  '*Todo o conteúdo do FaceZen organizado em aulas curtas: uma para cada um dos 15 exercícios essenciais, com desenho, e uma para cada tema de skincare.*',
  '',
  '## Como usar este arquivo',
  '',
  '1. No NotebookLM, crie um notebook e envie este PDF como fonte.',
  '2. Para cada aula, abra **Visão geral em vídeo**, clique em **Personalizar** e cole o bloco “Para o NotebookLM” da aula.',
  '3. Gere um vídeo por aula. As aulas estão na mesma ordem do curso no app.',
  '',
  '**Regras de tom para todos os vídeos**',
  '',
  ...TOM.map((t) => `- ${t}`),
  '',
)

// ———————————————————————————————— Módulos
COURSE.forEach((m, i) => {
  w(`# Módulo ${i + 1} · ${m.title}`, '', m.intro, '')
  if (m.lessons) {
    for (const l of m.lessons) {
      textLesson(l)
      if (l.id === 'c-programa') {
        n++
        w(`## Aula ${n} · A ordem da sessão, séries e foco`, '', '*O que entra em cada sessão.*', '')
        w('**A ordem de toda sessão**', '')
        w(`1. **Abrir:** ${names(ROUTINE.open)}`, `2. **Aquecer:** ${names(ROUTINE.warm)}`, '3. **Exercícios do rosto:** Série A ou B (abaixo)', '4. **Seu foco:** o módulo do seu objetivo (a partir da semana 3)', `5. **Fechar:** ${names(ROUTINE.close)}`, '')
        w(`- **Série A:** ${names(SERIES.A)}`, `- **Série B:** ${names(SERIES.B)}`, '')
        w('**Módulos de foco** (entram a partir da semana 3, antes do relaxamento)', '')
        for (const [id, f] of Object.entries(FOCUS)) w(`- **${id} · ${f.title}:** ${names(f.ids)}`)
        w('', 'Com 5 minutos por dia, as doses ficam no nível iniciante para caber o rosto inteiro. Com 10 ou 15 minutos, seguem a fase do programa.')
        videoPrompt('Séries e módulos de foco', 'Explique a ordem da sessão (abrir com drenagem, aquecer, exercícios, foco, fechar com drenagem), que as séries A e B se alternam e que o foco é escolhido pelo objetivo da pessoa.')
      }
    }
  }
  {
    const groups = m.groups ?? []
    for (const gid of groups) {
      const g = groupById(gid)
      if (groups.length > 1) w(`### ${g.title}`, '')
      w(`*${g.intro}*`, '')
      for (const e of EXERCISES.filter((x) => x.group === gid)) exerciseLesson(e)
    }
  }
})

w('---', '', `*Total: ${n} aulas. Conteúdo próprio do FaceZen, gerado a partir do app. Não substitui avaliação médica, dermatológica ou fisioterapêutica.*`, '')

const file = 'docs/guia/FaceZen-Aulas-NotebookLM.md'
fs.writeFileSync(file, out.join('\n'))
console.log(`${file}: ${n} aulas`)
