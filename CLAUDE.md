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

- Conteúdo: `src/content/` — `library.ts` (15 exercícios essenciais + 3 opcionais com a escova facial, séries A/B e módulos de foco), `art.ts` (desenho de cada exercício), `course.ts` (aulas de teoria e skincare do Curso), `photos.ts` (fotos do Pexels em `src/assets/fotos`). Sem vídeos de terceiros.
- `npm run aulas` gera `docs/guia/FaceZen-Aulas-NotebookLM.md` a partir de `library.ts` e `course.ts` (o PDF é feito a partir desse arquivo).
- Fotos são baixadas pelo workflow "Atualizar fotos" (`scripts/baixar_midia.py`), que roda no GitHub.
- Acessórios: `profile.tools` (ex.: `'escova'`). A escova entra nas sessões a partir da semana 3, em sessões alternadas, e nunca com pele sensível ou em crise.
- Montagem das sessões (fases, séries, foco, nível) e regras do calendário: `src/lib/plan.ts` (+ testes em `plan.test.ts`). Programa de 8 semanas em `src/content/program.ts`.
- Skincare: rotina montada com os produtos que a pessoa marca (`products`), lógica dermatológica em `src/lib/skincare.ts` (base primeiro, um ativo por vez, sem conflitos); salvo por dia em `skincare[AAAA-MM-DD]`; histórico em `SkincareHistory`.
- Sem servidor nem banco de dados: tudo fica no aparelho (infoproduto).
- Estado salvo por aparelho: `src/lib/store.ts`. Ao mudar o formato, suba `version` no `persist` e escreva `migrate`.

## Regras de conteúdo e tom

- Nunca prometer lifting, fim de rugas, olheiras, papada ou rejuvenescimento. Benefícios são "alegações editoriais"; o foco é conforto, relaxamento e ritual.
- Segurança primeiro: respeitar as flags de `SafetyFlag` e os sinais para parar.
- Simplicidade: textos curtos e sem respiração guiada; o texto completo do ebook fica em "Mais detalhes".
- Linguagem neutra em gênero ("Que bom que você…", não "Obrigada"/"Pronta").
- Cores sempre por tokens (`bg-surface`, `text-ink`, `bg-jade`…), que já têm versão clara e escura.
