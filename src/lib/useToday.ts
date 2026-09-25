import { useEffect, useState } from 'react'
import { dayKey } from './dates'

/** Dia de hoje que se atualiza sozinho à meia-noite e quando o app volta a ficar visível. */
export function useToday(): string {
  const [today, setToday] = useState(dayKey())
  useEffect(() => {
    const check = () => setToday((prev) => (prev === dayKey() ? prev : dayKey()))
    const t = setInterval(check, 30_000)
    document.addEventListener('visibilitychange', check)
    window.addEventListener('focus', check)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', check)
      window.removeEventListener('focus', check)
    }
  }, [])
  return today
}
