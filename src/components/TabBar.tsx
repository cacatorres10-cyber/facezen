import { ChartNoAxesColumn, Droplets, GraduationCap, Hand, Sunrise } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cx } from './ui'

const TABS: { to: string; label: string; icon: typeof Hand; end?: boolean; also?: string }[] = [
  { to: '/', label: 'Hoje', icon: Sunrise, end: true },
  { to: '/curso', label: 'Curso', icon: GraduationCap },
  // A rotina pronta; a lista de todos os exercícios fica dentro dela.
  { to: '/rotina', label: 'Rotina', icon: Hand, also: '/exercicios' },
  { to: '/skincare', label: 'Skincare', icon: Droplets },
  { to: '/jornada', label: 'Progresso', icon: ChartNoAxesColumn },
]

export function TabBar() {
  const { pathname } = useLocation()
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] border-t border-line bg-surface/92 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md"
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ to, label, icon: Icon, end, also }) => {
          const on = (isActive: boolean) => isActive || (!!also && pathname.startsWith(also))
          return (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cx('flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition', on(isActive) ? 'text-jade' : 'text-ink-faint')
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cx('grid h-7 w-12 place-items-center rounded-full transition', on(isActive) && 'bg-jade-soft')}>
                      <Icon className="size-[19px]" strokeWidth={on(isActive) ? 2.3 : 1.9} />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
