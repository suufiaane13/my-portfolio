import { AnimatePresence, motion } from 'framer-motion'
import { Gamepad2, X } from 'lucide-react'
import { type ReactNode, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useGameButtonHint } from '@/hooks/useGameButtonHint'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'

interface GameButtonHintProps {
  enabled: boolean
  className?: string
  children: ReactNode
}

export function GameButtonHint({ enabled, className, children }: GameButtonHintProps) {
  const { t } = useTranslation()
  const { visible, dismiss } = useGameButtonHint(enabled)

  const message = useMemo(() => {
    const messages = t.nav.gameHintMessages
    return messages[Math.floor(Math.random() * messages.length)] ?? messages[0]
  }, [visible, t.nav.gameHintMessages])

  return (
    <div className={cn('relative', className)}>
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'z-[60]',
              'max-sm:fixed max-sm:inset-x-4 max-sm:top-[4.25rem] max-sm:w-auto',
              'sm:absolute sm:right-0 sm:top-[calc(100%+0.5rem)] sm:w-[min(16.5rem,calc(100vw-2rem))]',
            )}
          >
            <div
              className="pointer-events-none absolute -top-1.5 right-3 hidden h-3 w-3 rotate-45 border-l border-t border-primary/25 bg-card sm:block"
              aria-hidden="true"
            />

            <div className="relative overflow-hidden rounded-xl border border-primary/25 bg-card p-3 shadow-lg shadow-primary/10">
              <button
                type="button"
                onClick={dismiss}
                className="absolute right-1.5 top-1.5 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={t.nav.gameHintDismiss}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              <div className="flex gap-2.5 pr-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                  <Gamepad2 className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-medium leading-snug text-foreground">{message}</p>
                  <Link
                    to="/game"
                    onClick={dismiss}
                    className="mt-1.5 inline-flex text-xs font-semibold text-primary transition-colors hover:underline"
                  >
                    {t.nav.gameHintCta} →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
