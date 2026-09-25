import { useState } from 'react'
import { PHOTOS, photoUrl, type PhotoKey } from '../content/photos'
import { cx } from './ui'

/** Foto do Unsplash com degradê de jade e quartzo no lugar, se não carregar (ou offline). */
export function Photo({ k, className, width = 1080, eager }: { k: PhotoKey; className?: string; width?: number; eager?: boolean }) {
  const p = PHOTOS[k]
  const [failed, setFailed] = useState(false)
  return (
    <div
      className={cx('relative overflow-hidden bg-surface-2', className)}
      style={{
        backgroundImage:
          'radial-gradient(120% 90% at 20% 10%, var(--quartz-soft) 0%, transparent 60%), radial-gradient(100% 80% at 90% 90%, var(--jade-soft) 0%, transparent 65%)',
      }}
    >
      {!failed && (
        <img
          src={photoUrl(p, width)}
          alt={p.alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </div>
  )
}
