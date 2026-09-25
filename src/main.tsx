import '@fontsource-variable/newsreader'
import '@fontsource-variable/newsreader/wght-italic.css'
import '@fontsource-variable/manrope'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { listenForInstall } from './lib/install'

listenForInstall()

// Pede ao navegador para não apagar os dados salvos deste aparelho.
try {
  void navigator.storage?.persist?.()
} catch {
  /* sem suporte */
}

if (import.meta.env.PROD && !import.meta.env.VITE_NO_SW) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => registerSW({ immediate: true }))
    .catch(() => {})
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
