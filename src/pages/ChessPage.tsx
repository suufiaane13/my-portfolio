import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Toaster } from 'sonner'
import { Footer } from '@/components/layout/Footer'
import { Navigation } from '@/components/layout/Navigation'
import { ChessGame } from '@/components/chess/ChessGame'
import { Analytics } from '@/components/shared/Analytics'
import { PortfolioAnalytics } from '@/components/shared/PortfolioAnalytics'
import { LanguageTransition } from '@/components/shared/LanguageTransition'
import { markGameVisited } from '@/hooks/useGameButtonHint'
import { useTheme } from '@/hooks/useTheme'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'

export function ChessPage() {
  const { isDark, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    document.title = `${t.chessGame.title} — ${t.meta.siteName}`
    markGameVisited()
  }, [t])

  return (
    <>
      <Analytics />
      <PortfolioAnalytics />
      <Navigation isDark={isDark} onToggleTheme={toggleTheme} />

      <LanguageTransition className="min-h-screen">
        <main className="min-h-screen bg-background">
          <div
            className={cn(
              'border-b border-border/60 bg-card pt-20',
              playing ? 'pb-2 sm:pb-3' : 'pb-3 sm:pb-4',
            )}
          >
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-1.5 px-4 sm:gap-2 sm:px-6 lg:px-8">
              <Link
                to="/"
                className="inline-flex h-8 w-fit items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:h-9 sm:px-3"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.chessGame.backToPortfolio}
              </Link>
              <div>
                <h1
                  className={cn(
                    'font-display font-bold',
                    playing ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl md:text-3xl',
                  )}
                >
                  {t.chessGame.title}
                </h1>
                {!playing && (
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    {t.chessGame.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
            <ChessGame onPlayingChange={setPlaying} />
          </div>
          <Footer />
        </main>
      </LanguageTransition>

      <Toaster richColors closeButton position="top-right" />
    </>
  )
}
