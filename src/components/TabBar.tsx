import { BookOpen, Droplets, Hand, Route, Sunrise } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cx } from './ui'

const TABS = [
  { to: '/', label: 'Hoje', icon: Sunrise, end: true },
  { to: '/jornada', label: 'Jornada', icon: Route },
  { to: '/exercicios', label: 'Exercícios', icon: Hand },
  { to: '/skincare', label: 'Skincare', icon: Droplets },
  { to: '/guia', label: 'Guia', icon: BookOpen },
]

export function TabBar() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] border-t border-line bg-surface/92 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md"
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cx('flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition', isActive ? 'text-jade' : 'text-ink-faint')
              }
            >
              {({ isActive }) => (
                <>
                  <span className={cx('grid h-7 w-12 place-items-center rounded-full transition', isActive && 'bg-jade-soft')}>
                    <Icon className="size-[19px]" strokeWidth={isActive ? 2.3 : 1.9} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
