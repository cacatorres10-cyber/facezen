import escovaPoster from '../assets/videos/escova-coreana.jpg'
import escovaVideo from '../assets/videos/escova-coreana.mp4'
import guaShaPoster from '../assets/videos/gua-sha.jpg'
import guaShaVideo from '../assets/videos/gua-sha.mp4'

/** Vídeos de exercícios com ferramentas, com crédito para quem criou. */
export interface ToolVideo {
  id: string
  title: string
  tool: string
  summary: string
  /** O que observar no vídeo, em passos curtos. */
  watch: string[]
  src: string
  poster: string
  credit: { name: string; url: string }
}

export const TOOL_VIDEOS: ToolVideo[] = [
  {
    id: 'escova-coreana',
    title: 'Escova facial coreana',
    tool: 'Escova facial',
    summary: 'Como passar a escova em linhas, do centro do rosto para fora.',
    watch: [
      'Testa: da sobrancelha até o cabelo.',
      'Embaixo dos olhos: só sobre o osso, até a têmpora.',
      'Bochecha: na diagonal, do canto da boca até a orelha.',
      'Mandíbula: do queixo até a orelha.',
    ],
    src: escovaVideo,
    poster: escovaPoster,
    credit: { name: '@carolpetrelli', url: 'https://www.tiktok.com/@carolpetrelli' },
  },
  {
    id: 'gua-sha',
    title: 'Rotina com gua sha',
    tool: 'Gua sha',
    summary: 'Começa com as mãos no colo e no pescoço e depois passa a pedra pelo rosto.',
    watch: [
      'Mãos no colo e nas laterais do pescoço para começar.',
      'Gua sha no pescoço e na mandíbula, de dentro para fora.',
      'Embaixo do queixo e nas maçãs do rosto, até a orelha.',
      'Sobrancelhas e testa, terminando com as mãos.',
    ],
    src: guaShaVideo,
    poster: guaShaPoster,
    credit: { name: '@camilavannii', url: 'https://www.tiktok.com/@camilavannii' },
  },
]
