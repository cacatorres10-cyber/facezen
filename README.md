# FaceZen

**Yoga facial e skincare consciente em 10 minutos, personalizado para cada pessoa.**
Mini app (PWA) feito a partir do ebook *Yoga Facial e Skincare Consciente*: funciona no navegador, pode ser instalado na tela inicial do celular e roda offline depois da primeira visita.

## O que o app faz

- **Onboarding**: nome, objetivos (como um quiz), tipo de pele, tempo por dia (5, 10 ou 15 min), dias da semana e perguntas de segurança.
- **Hoje**: a sessão do dia, a meta da semana, o skincare do dia e a próxima aula do curso.
- **Curso**: 12 módulos com tutoriais passo a passo (um passo por tela): teoria, cada exercício e cada tema de skincare. O progresso fica salvo no aparelho.
- **Exercícios**: 18 essenciais, com a drenagem do pescoço abrindo e fechando toda sessão (`src/content/library.ts`), cada um com desenho próprio (`art.ts`: dedos, setas e expressão), 3 passos simples, dose por nível e como conferir no espelho. Mais 3 opcionais com a escova facial, para quem marca que tem.
- **Sessão guiada**: cronômetro por exercício, dose do dia, aviso de troca de lado, voz guiada, modo espelho e botão "Senti desconforto".
- **Skincare**: o básico (limpar, hidratar, proteger) com os produtos que a pessoa já usa, recomendações e histórico.
- **Progresso**: calendário de 8 semanas e histórico.

### Personalização e segurança

O motor em `src/lib/plan.ts` monta cada sessão com as séries A/B e os módulos de foco do Guia Prático:

| Situação | O que muda |
| --- | --- |
| Semanas 1–2 (Adaptação) | Série A inteira, nível iniciante, sem foco |
| Semanas 3–5 (Construção) | Séries B/A alternadas, intermediário, + módulo do objetivo (o secundário alterna) |
| Semanas 6–8 (Intensificação) | Avançado; volta ao intermediário se houve incômodo nos últimos 7 dias |
| Manutenção | Séries alternadas, intermediário |
| 5 minutos | O rosto inteiro continua, com doses menores |
| ATM | Sem Balão e Peixinho |
| Cervical | Sem a meia-lua nem a língua ao canto; M1 com a cabeça reta |
| Pele em crise ou irritada hoje | Sessão suave, sem as mãos no rosto |
| Procedimento recente | Sessões em pausa até a liberação |
| Gravidez/amamentação | Retinoide fica fora da rotina de skincare |

## Dados de cada aparelho

Não há cadastro nem servidor. Tudo o que a pessoa escolhe e marca (perfil, sessões, diário, skincare, testes de contato) fica salvo no `localStorage` do próprio aparelho, com um identificador de aparelho gerado na primeira abertura. Em **Perfil → Seus dados** dá para exportar e importar um backup (JSON) para levar o histórico a outro aparelho.

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # testes da lógica de personalização
npm run build      # gera dist/
```

## Publicar (GitHub Pages)

O workflow `.github/workflows/deploy.yml` testa e gera o build em todo push. Ele publica automaticamente quando o push é na branch padrão do repositório.

1. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Faça um push (ou rode o workflow manualmente em **Actions → Testar e publicar → Run workflow**).
3. O app fica em `https://<usuário>.github.io/facezen/`.

## Estrutura

```
src/
  content/     conteúdo do ebook em dados (exercícios, rotina, programa, skincare, guia, fotos)
  lib/         lógica: plano/sessões, skincare, store (persistência), áudio, arquivos
  components/  UI: mapa do rosto, tutorial passo a passo, componentes base
  screens/     telas: Onboarding, Hoje, Sessão, Jornada, Exercícios, Skincare, Guia, Perfil
```

## Créditos

- Conteúdo: ebook *Yoga Facial e Skincare Consciente*, com as referências listadas no app (Guia → Referências).
- Fotos: [Pexels](https://www.pexels.com) (licença Pexels), salvas em `src/assets/fotos`.
- Exercícios e aulas: texto próprio do FaceZen. O app não usa vídeos de terceiros.

> O FaceZen é material de autocuidado e educação cosmética. Não substitui consulta com dermatologista, oftalmologista, dentista, fisioterapeuta, obstetra ou outro profissional habilitado.
