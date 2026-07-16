import { AnimatePresence, motion } from 'framer-motion'
import { Gamepad2, Sparkles, X } from 'lucide-react'
import { type ReactNode, useEffect } from 'react'
import { useNavOverlay } from '@/components/layout/NavOverlayContext'
import { useGameButtonHint } from '@/hooks/useGameButtonHint'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'
import './GameButtonHint.css'

interface GameButtonHintProps {
  enabled: boolean
  className?: string
  children: ReactNode
}

export function GameButtonHint({ enabled, className, children }: GameButtonHintProps) {
  const { t } = useTranslation()
  const { active, openOverlay, closeOverlay } = useNavOverlay()
  const { visible, dismiss } = useGameButtonHint(enabled)

  useEffect(() => {
    if (visible && active !== 'lang') {
      openOverlay('game-hint')
    }
  }, [active, openOverlay, visible])

  useEffect(() => {
    if (active === 'lang' && visible) {
      dismiss()
    }
  }, [active, dismiss, visible])

  useEffect(() => {
    if (!visible && active === 'game-hint') {
      closeOverlay()
    }
  }, [active, closeOverlay, visible])

  const handleDismiss = () => {
    dismiss()
    if (active === 'game-hint') {
      closeOverlay()
    }
  }

  return (
    <div className={cn('relative', className)}>
      {children}

      <AnimatePresence>
        {visible && active !== 'lang' && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'game-hint z-[60]',
              'max-sm:fixed max-sm:inset-x-4 max-sm:top-[4.25rem]',
              'sm:absolute sm:right-0 sm:top-[calc(100%+0.625rem)] sm:w-[min(18rem,calc(100vw-2rem))]',
            )}
          >
            <div
              className="game-hint__arrow pointer-events-none absolute -top-[7px] right-4 hidden h-3.5 w-3.5 rotate-45 border border-border border-b-0 border-r-0 bg-card sm:block"
              aria-hidden="true"
            />

            <div className="game-hint__panel overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xl">
              <div className="game-hint__header flex items-center gap-2 px-3 py-2.5">
                <span className="game-hint__icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
                  <Gamepad2 className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-semibold leading-none text-foreground">
                    {t.nav.game}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[0.6875rem] font-medium text-muted-foreground">
                    <Sparkles className="h-3 w-3 shrink-0 text-[var(--game-hint-accent)]" aria-hidden="true" />
                    {t.nav.gameHintBadge}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={t.nav.gameHintDismiss}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
