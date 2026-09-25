import { PHOTOS, type PhotoKey } from '../content/photos'
import { cx } from './ui'

export function Photo({ k, className, eager, position }: { k: PhotoKey; className?: string; eager?: boolean; position?: string }) {
  const p = PHOTOS[k]
  return (
    <div className={cx(!className?.includes('absolute') && 'relative', 'overflow-hidden bg-surface-2', className)}>
      <img src={p.src} alt={p.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className="absolute inset-0 size-full object-cover" style={{ objectPosition: position }} />
    </div>
  )
}
