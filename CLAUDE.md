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

- Conteúdo do ebook: `src/content/` (texto fiel ao ebook; mudanças de conteúdo começam aqui).
- Montagem das sessões e regras do calendário: `src/lib/plan.ts` (+ testes em `plan.test.ts`).
- Rotina de skincare por tipo de pele: `src/lib/skincare.ts`.
- Estado salvo por aparelho: `src/lib/store.ts`. Ao mudar o formato, suba `version` no `persist` e escreva `migrate`.

## Regras de conteúdo e tom

- Nunca prometer lifting, fim de rugas, olheiras, papada ou rejuvenescimento. Benefícios são "alegações editoriais"; o foco é conforto, relaxamento e ritual.
- Segurança primeiro: respeitar as flags de `SafetyFlag` e os sinais para parar.
- Simplicidade: textos curtos e sem respiração guiada; o texto completo do ebook fica em "Mais detalhes".
- Linguagem neutra em gênero ("Que bom que você…", não "Obrigada"/"Pronta").
- Cores sempre por tokens (`bg-surface`, `text-ink`, `bg-jade`…), que já têm versão clara e escura.
