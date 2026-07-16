import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '@/hooks/AuthProvider'
import { initLocale, LanguageProvider } from '@/i18n/LanguageProvider'
import { initTheme, ThemeProvider } from '@/hooks/useTheme'
import App from './App.tsx'
import './index.css'

initTheme()
initLocale()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
