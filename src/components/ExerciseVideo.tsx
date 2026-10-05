import { exerciseVideo } from '../content/exerciseVideos'
import { cx } from './ui'

/** Vídeo curto do exercício, em loop e sem som, como um GIF. */
export function ExerciseVideo({ id, title, className }: { id: string; title: string; className?: string }) {
  const v = exerciseVideo(id)
  if (!v) return null
  return (
    <video
      key={v.src}
      src={v.src}
      poster={v.poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-label={`Vídeo: ${title}`}
      className={cx('aspect-[9/16] max-w-full rounded-3xl bg-surface-2 object-cover', className)}
    />
  )
}
