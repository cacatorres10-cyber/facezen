/**
 * Fotos do Unsplash (licença Unsplash: uso livre, sem atribuição obrigatória — creditamos mesmo assim).
 * Carregadas sob demanda e guardadas em cache pelo service worker.
 * Se uma foto não carregar, o componente <Photo> mostra um degradê no lugar.
 */
export interface PhotoInfo {
  id: string
  alt: string
  credit: string
  page: string
}

const photo = (id: string, slug: string, alt: string, credit: string): PhotoInfo => ({
  id,
  alt,
  credit,
  page: `https://unsplash.com/photos/${slug}-${id}`,
})

export const PHOTOS = {
  boasVindas: photo('ce1dK0U1Cb4', 'a-woman-smiling-and-touching-her-face-with-her-hands', 'Mulher sorrindo com as mãos no rosto', 'ohlamour studio'),
  toque: photo('b7c1wTOfWoU', 'a-woman-smiling-and-touching-her-face-with-her-hand', 'Mulher sorrindo e tocando o rosto', 'Leandro Crespi'),
  guaSha: photo('iwfhAYd9sUI', 'woman-using-a-pink-gua-sha-tool-on-her-face', 'Mulher usando gua sha de quartzo rosa no rosto', 'Unsplash'),
  produtos: photo('dGd0yqp0QtA', 'amber-glass-cosmetic-bottles-set-and-eucalyptus-leaf-on-white-towel-spa-bathroom-natural-cosmetics-flat-lay-top-view', 'Frascos âmbar de cosméticos e folha de eucalipto sobre toalha branca', 'Unsplash'),
  serum: photo('j24HPh0Q84g', 'serum-is-being-poured-from-a-dropper-bottle', 'Sérum saindo de um frasco conta-gotas', 'Mona Jain'),
  bancada: photo('BCozEYDNmOQ', 'cosmetics-and-skincare-products-are-arranged-neatly', 'Produtos de skincare organizados', 'Unsplash'),
  respiro: photo('59nv16DYPzs', 'woman-with-eyes-closed-practicing-yoga', 'Mulher de olhos fechados praticando yoga ao ar livre', 'Unsplash'),
} satisfies Record<string, PhotoInfo>

export type PhotoKey = keyof typeof PHOTOS

export const photoUrl = (p: PhotoInfo, width = 1080) =>
  `https://unsplash.com/photos/${p.id}/download?force=true&w=${width}`
