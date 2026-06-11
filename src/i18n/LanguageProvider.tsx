import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { dictionaries, defaultLocale } from '@/i18n'
import type { Locale, Translations } from '@/i18n/types'

const STORAGE_KEY = 'susu-portfolio-lang'

function getPreferredLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'fr' || stored === 'en') return stored

  return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

function applyLocale(locale: Locale) {
  document.documentElement.lang = locale
}

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getPreferredLocale())

  useEffect(() => {
    applyLocale(locale)
    localStorage.setItem(STORAGE_KEY, locale)
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
  }, [])

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => (current === 'fr' ? 'en' : 'fr'))
  }, [])

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: dictionaries[locale],
    }),
    [locale, setLocale, toggleLocale],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider')
  }
  return context
}

export function initLocale() {
  applyLocale(getPreferredLocale())
}
