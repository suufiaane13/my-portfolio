import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Toaster } from 'sonner'
import { Footer } from '@/components/layout/Footer'
import { Navigation } from '@/components/layout/Navigation'
import { MemoryGame } from '@/components/sections/MemoryGame'
import { PortfolioChatWidget } from '@/components/chat/PortfolioChatWidget'
import { Analytics } from '@/components/shared/Analytics'
import { PortfolioAnalytics } from '@/components/shared/PortfolioAnalytics'
import { LanguageTransition } from '@/components/shared/LanguageTransition'
import { markGameVisited } from '@/hooks/useGameButtonHint'
import { useTheme } from '@/hooks/useTheme'
import { useTranslation } from '@/i18n/LanguageProvider'

export function GamePage() {
  const { isDark, toggleTheme } = useTheme()
  const { t } = useTranslation()

  useEffect(() => {
    document.title = `${t.memoryGame.title} — ${t.meta.siteName}`
    markGameVisited()
  }, [t])

  return (
    <>
      <Analytics />
      <PortfolioAnalytics />
      <Navigation isDark={isDark} onToggleTheme={toggleTheme} />

      <LanguageTransition className="min-h-screen">
        <main className="min-h-screen bg-background">
          <div className="border-b border-border/60 bg-card pt-20 pb-4">
            <div className="mx-auto flex w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <Link
                to="/"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.memoryGame.backToPortfolio}
              </Link>
            </div>
          </div>

          <MemoryGame />
          <Footer />
        </main>
      </LanguageTransition>

      <PortfolioChatWidget />
      <Toaster richColors closeButton position="top-right" />
    </>
  )
}
