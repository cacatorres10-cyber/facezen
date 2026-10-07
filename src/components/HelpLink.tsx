import { CircleHelp, ExternalLink } from 'lucide-react'
import { HELP_VIDEO_URL } from '../content/help'
import { cx } from './ui'

/** "Não entendeu?" → massagem guiada em tempo real no YouTube. */
export function HelpLink({ className }: { className?: string }) {
  return (
    <a href={HELP_VIDEO_URL} target="_blank" rel="noreferrer" className={cx('flex items-center gap-3 rounded-2xl bg-quartz-soft p-4 text-ink', className)}>
      <CircleHelp className="size-6 shrink-0 text-rose-ink" />
      <span className="min-w-0 flex-1 text-sm">
        <span className="block font-semibold">Não entendeu?</span>
        Faça uma massagem guiada em tempo real.
      </span>
      <ExternalLink className="size-4 shrink-0 text-rose-ink" />
    </a>
  )
}
