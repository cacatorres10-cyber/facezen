/** Fotos do Pexels (licença Pexels: uso livre). Baixadas para o app por `scripts/baixar_midia.py`. */
import espelho from '../assets/fotos/pexels-5137547.jpg'
import guaSha from '../assets/fotos/pexels-3865570.jpg'
import toque from '../assets/fotos/pexels-4672662.jpg'
import pescoco from '../assets/fotos/pexels-7321312.jpg'
import produtos from '../assets/fotos/pexels-8102135.jpg'
import protetor from '../assets/fotos/pexels-28112145.jpg'
import quartzo from '../assets/fotos/pexels-8015877.jpg'
import creme from '../assets/fotos/pexels-4960098.jpg'

export interface PhotoInfo {
  src: string
  alt: string
  page: string
}

const pexels = (src: string, id: number, alt: string): PhotoInfo => ({ src, alt, page: `https://www.pexels.com/photo/${id}/` })

export const PHOTOS = {
  toque: pexels(toque, 4672662, 'Mulher tocando o rosto depois do banho'),
  guaSha: pexels(guaSha, 3865570, 'Massagem no rosto com gua sha de quartzo rosa'),
  pescoco: pexels(pescoco, 7321312, 'Mulher fazendo massagem no pescoço em frente ao espelho'),
  espelho: pexels(espelho, 5137547, 'Mulher cuidando da pele em frente ao espelho'),
  produtos: pexels(produtos, 8102135, 'Frascos de sérum e gua sha'),
  protetor: pexels(protetor, 28112145, 'Mulher aplicando protetor no rosto'),
  quartzo: pexels(quartzo, 8015877, 'Rolo e gua sha de quartzo rosa'),
  creme: pexels(creme, 4960098, 'Mulher aplicando creme em frente ao espelho'),
} satisfies Record<string, PhotoInfo>

export type PhotoKey = keyof typeof PHOTOS
