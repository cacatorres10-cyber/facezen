# FaceZen

**Yoga facial e skincare consciente em 10 minutos, personalizado para cada pessoa.**
Mini app (PWA) feito a partir do ebook *Yoga Facial e Skincare Consciente*: funciona no navegador, pode ser instalado na tela inicial do celular e roda offline depois da primeira visita.

## O que o app faz

- **Onboarding personalizado**: nome, intenção, mapa do rosto interativo (regiões de foco), tipo de pele, experiência, dias e horário da prática e perguntas de segurança (cervical, ATM, olhos, procedimento recente, gravidez/amamentação, pele em crise).
- **Hoje**: a sessão do dia montada automaticamente para a semana do programa, o check-in de "uma hora depois", a meta semanal, o skincare do dia e um lembrete.
- **Sessão guiada**: checklist "antes", escala de conforto e tensão, sequência editável, cronômetro por passo com preparação de 5 s, orbe de respiração 4–6, aviso de troca de lado, voz guiada (pt-BR), sino suave, vibração, **modo espelho** com a câmera frontal (nada é gravado) e botão "Senti desconforto".
- **Jornada**: calendário de 8 semanas (regras de cada semana, avançar ou repetir), gráfico de tensão antes × depois, marcos, revisão semanal e diário completo de cada sessão.
- **Exercícios**: as 14 fichas por região, com objetivo, posição, execução, respiração, repetições, frequência, sensação esperada e sinais para parar. Favoritos, prática avulsa com cronômetro e avisos quando uma ficha pede liberação profissional.
- **Skincare**: rotina da manhã e da noite ajustada ao tipo de pele e aos produtos escolhidos (noites de retinoide ou esfoliante), reaplicação do protetor, receitas do capítulo 8 e **teste de contato** de 10 dias.
- **Guia**: aviso de responsabilidade, princípios, preparação, rotina minuto a minuto, tipos de pele, ingredientes, ordem de aplicação, erros e irritação, checklist, perguntas frequentes com busca, vídeos recomendados e as 52 referências.

### Personalização e segurança

O motor em `src/lib/plan.ts` monta cada sessão a partir de: semana do programa, quantas sessões já foram feitas na semana, regiões de foco, tempo preferido (5 ou 10 min) e as respostas de segurança. Exemplos:

| Situação | O que muda |
| --- | --- |
| Semana 1 | 5 min, só testa, olhos com toque leve, mandíbula manual e pescoço; dias não consecutivos |
| Semana 2 | Transferência de ar nas bochechas em apenas 2 das 4 sessões |
| Semana 5 | Foco alternado: testa/mandíbula, bochechas/bigode chinês, pescoço/papada |
| ATM | Sem massagem na articulação nem transferência de ar; entra "soltar a mandíbula" sem toque |
| Sintomas nos olhos | Toques e rastreamento viram descanso de olhos fechados |
| Cervical | Sem extensão da cabeça; queixo só com apoio dos dedos |
| Procedimento recente | Só respiração e postura, sem tocar o rosto |
| Pele em crise ou irritada hoje | Respiração e cinco toques leves no pescoço |
| Gravidez/amamentação | Retinoide e esfoliantes ficam indisponíveis na rotina |

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
  components/  UI: mapa do rosto, orbe de respiração, gráfico, componentes base
  screens/     telas: Onboarding, Hoje, Sessão, Jornada, Exercícios, Skincare, Guia, Perfil
```

## Créditos

- Conteúdo: ebook *Yoga Facial e Skincare Consciente*, com as referências listadas no app (Guia → Referências).
- Fotos: [Unsplash](https://unsplash.com) (créditos no app). Se uma foto não carregar, o app mostra um degradê no lugar.
- Vídeos recomendados: canais Longevidade Yoga e Face Yoga Paula Sá (apenas links e resumo editorial).

> O FaceZen é material de autocuidado e educação cosmética. Não substitui consulta com dermatologista, oftalmologista, dentista, fisioterapeuta, obstetra ou outro profissional habilitado.
