import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initLocale, LanguageProvider } from '@/i18n/LanguageProvider'
import { initTheme } from '@/hooks/useTheme'
import App from './App.tsx'
import './index.css'

initTheme()
initLocale()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
