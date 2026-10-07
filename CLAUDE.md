# FaceZen — notas para o Claude Code

App PWA em português do Brasil, feito a partir do ebook *Yoga Facial e Skincare Consciente*.

## Comandos

- `npm run dev` — servidor local
- `npm run typecheck` — TypeScript
- `npm test` — Vitest (lógica em `src/lib/*.test.ts`)
- `npm run build` — build de produção (use `BASE_PATH=/facezen/` para simular o GitHub Pages)

Rode `typecheck` e `test` antes de cada commit.

## Stack

Vite + React 19 + TypeScript, Tailwind CSS v4 (tokens em `src/index.css`), React Router (HashRouter; MemoryRouter com VITE_MEMORY_ROUTER), Zustand com `persist` em `localStorage` (chave `facezen:v1`), `vite-plugin-pwa`, ícones `lucide-react`, fontes Newsreader (títulos) e Manrope (texto) via Fontsource.

## Onde fica cada coisa

- Conteúdo: `src/content/` — `library.ts` (a sessão é a drenagem facial com as mãos: `ROUTINE` abre na clavícula, drena o rosto de baixo para cima e fecha na clavícula; `FOCUS` dá mais repetições à região do objetivo + 1 exercício com as mãos; exercícios musculares ficam como extras; 4 com a escova coreana), `art.ts` (desenho de cada exercício; `STEP_POSES` = um desenho por passo, mostrado ao lado de "Passo 1:", "Passo 2:"…, com `view` para dar zoom), `course.ts` (aulas de teoria e skincare do Curso), `photos.ts` (fotos do Pexels em `src/assets/fotos`). Vídeos: só os de "Exercícios com ferramentas" (`toolVideos.ts`, arquivos em `src/assets/videos`), sempre com crédito de quem criou; a autorização das criadoras fica por conta da dona do produto.
- Vídeos dos exercícios (feitos com IA para o FaceZen): salve `src/assets/videos/exercicios/<ID>.mp4` + `<ID>.jpg` (capa), comprimidos (480p, sem áudio). Aparecem sozinhos na página do exercício e na sessão, no lugar do desenho (`exerciseVideos.ts`).
- No app, o Curso mostra só os módulos em vídeo e o skincare em texto (`COURSE_MODULES` em `lib/course.ts`); as outras aulas em texto seguem só no PDF do NotebookLM.
- Aulas em vídeo do Curso (NotebookLM, no YouTube como "Não listado"): adicione título + link em `src/content/videoLessons.ts`, na ordem. O módulo "Aulas em vídeo" só aparece quando a lista tem aulas; o progresso usa `lessonsDone` (`v-<id>`). Use o título provisório `Aula NN`: o workflow "Atualizar títulos das aulas" (`scripts/titulos_aulas.py`) troca pelo título do YouTube.
- `npm run aulas` gera `docs/guia/FaceZen-Aulas-NotebookLM.md` a partir de `library.ts` e `course.ts` (o PDF é feito a partir desse arquivo).
- Fotos são baixadas pelo workflow "Atualizar fotos" (`scripts/baixar_midia.py`), que roda no GitHub.
- Acessórios: `profile.tools` (ex.: `'escova'`). O bloco da escova (abre a clavícula, escova, fecha da mandíbula à clavícula) entra a partir da semana 3, em sessões alternadas, e nunca com pele sensível ou em crise.
- Montagem das sessões (fases, séries, foco, nível) e regras do calendário: `src/lib/plan.ts` (+ testes em `plan.test.ts`). Programa de 8 semanas em `src/content/program.ts`.
- Skincare: rotina montada com os produtos que a pessoa marca (`products`), lógica dermatológica em `src/lib/skincare.ts` (base primeiro, um ativo por vez, sem conflitos); salvo por dia em `skincare[AAAA-MM-DD]`; histórico em `SkincareHistory`.
- "Não entendeu?": link para a massagem guiada em tempo real (`content/help.ts`), em todos os exercícios, aulas em vídeo e na sessão.
- Sem servidor nem banco de dados: tudo fica no aparelho (infoproduto).
- Estado salvo por aparelho: `src/lib/store.ts`. Ao mudar o formato, suba `version` no `persist` e escreva `migrate`.

## Regras de conteúdo e tom

- Nunca prometer lifting, fim de rugas, olheiras, papada ou rejuvenescimento. Benefícios são "alegações editoriais"; o foco é conforto, relaxamento e ritual.
- Segurança primeiro: respeitar as flags de `SafetyFlag` e os sinais para parar.
- Simplicidade: textos curtos e sem respiração guiada; o texto completo do ebook fica em "Mais detalhes".
- Linguagem neutra em gênero ("Que bom que você…", não "Obrigada"/"Pronta").
- Cores sempre por tokens (`bg-surface`, `text-ink`, `bg-jade`…), que já têm versão clara e escura.
