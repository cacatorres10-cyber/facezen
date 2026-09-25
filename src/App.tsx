import { useEffect, type ReactNode } from 'react'
import { HashRouter, MemoryRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { TabBar } from './components/TabBar'
import { useStore } from './lib/store'
import { Guide, GuideSection } from './screens/Guide'
import { Journey } from './screens/Journey'
import { Lessons } from './screens/Lessons'
import { ExerciseDetail, Library } from './screens/Library'
import { Onboarding } from './screens/Onboarding'
import { Profile } from './screens/Profile'
import { Session } from './screens/Session'
import { Skincare } from './screens/Skincare'
import { Today } from './screens/Today'

function useTheme() {
  const theme = useStore((s) => s.settings.theme)
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme
    const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0d1916' : '#1F5A4E')
  }, [theme])
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function WithTabs({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="min-h-full">{children}</main>
      <TabBar />
    </>
  )
}

function AppRoutes() {
  const onboarded = useStore((s) => s.onboarded && !!s.profile)
  if (!onboarded) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    )
  }
  return (
    <Routes>
      <Route path="/" element={<WithTabs><Today /></WithTabs>} />
      <Route path="/sessao" element={<Session />} />
      <Route path="/aulas" element={<WithTabs><Lessons /></WithTabs>} />
      <Route path="/jornada" element={<WithTabs><Journey /></WithTabs>} />
      <Route path="/exercicios" element={<WithTabs><Library /></WithTabs>} />
      <Route path="/exercicios/:id" element={<WithTabs><ExerciseDetail /></WithTabs>} />
      <Route path="/skincare" element={<WithTabs><Skincare /></WithTabs>} />
      <Route path="/guia" element={<WithTabs><Guide /></WithTabs>} />
      <Route path="/guia/:id" element={<WithTabs><GuideSection /></WithTabs>} />
      <Route path="/perfil" element={<WithTabs><Profile /></WithTabs>} />
      <Route path="/ajustar" element={<Onboarding />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Prévias embutidas (sem URL própria) usam rotas em memória.
const Router = import.meta.env.VITE_MEMORY_ROUTER ? MemoryRouter : HashRouter

export default function App() {
  useTheme()
  return (
    <Router>
      <ScrollToTop />
      <div className="mx-auto min-h-full max-w-[480px] bg-bg shadow-[0_0_80px_-30px_rgb(0_0_0/0.25)]">
        <AppRoutes />
      </div>
    </Router>
  )
}
