import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { buildStaticPortfolio } from '@/lib/staticPortfolio'
import { fetchPortfolioContent } from '@/services/portfolio'
import { useTranslation } from '@/i18n/LanguageProvider'
import type { PortfolioContent } from '@/types/portfolio'

interface PortfolioContentContextValue {
  content: PortfolioContent
  isLoading: boolean
}

const PortfolioContentContext = createContext<PortfolioContentContextValue | null>(null)

export function PortfolioContentProvider({ children }: { children: ReactNode }) {
  const { locale, t } = useTranslation()
  const staticContent = useMemo(() => buildStaticPortfolio(locale, t), [locale, t])
  const [content, setContent] = useState<PortfolioContent>(staticContent)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      const fromSupabase = await fetchPortfolioContent(locale)

      if (cancelled) return

      setContent(fromSupabase ?? staticContent)
      setIsLoading(false)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [locale, staticContent])

  const value = useMemo(
    () => ({
      content,
      isLoading,
    }),
    [content, isLoading],
  )

  return (
    <PortfolioContentContext.Provider value={value}>{children}</PortfolioContentContext.Provider>
  )
}

export function usePortfolioContent() {
  const context = useContext(PortfolioContentContext)
  if (!context) {
    throw new Error('usePortfolioContent must be used within PortfolioContentProvider')
  }
  return context
}
