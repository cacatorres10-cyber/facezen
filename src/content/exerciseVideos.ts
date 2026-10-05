/**
 * Vídeos dos exercícios (gerados com IA para o FaceZen), um por exercício.
 * Para adicionar: salve `src/assets/videos/exercicios/<ID>.mp4` e `<ID>.jpg` (capa), com o código do exercício.
 */
const videos = import.meta.glob('../assets/videos/exercicios/*.mp4', { eager: true, import: 'default' }) as Record<string, string>
const posters = import.meta.glob('../assets/videos/exercicios/*.jpg', { eager: true, import: 'default' }) as Record<string, string>

export function exerciseVideo(id: string): { src: string; poster?: string } | undefined {
  const src = videos[`../assets/videos/exercicios/${id}.mp4`]
  return src ? { src, poster: posters[`../assets/videos/exercicios/${id}.jpg`] } : undefined
}
