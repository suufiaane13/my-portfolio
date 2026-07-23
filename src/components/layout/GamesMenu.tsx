import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronDown, Gamepad2, Puzzle } from 'lucide-react'
import { useCallback, useEffect, useId, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useNavOverlay } from '@/components/layout/NavOverlayContext'
import { navActionClass, navActionIconClass, navActionPillClass } from '@/components/layout/navActionStyles'
import { GameButtonHint } from '@/components/shared/GameButtonHint'
import { markGameVisited } from '@/hooks/useGameButtonHint'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'

const GAMES = [
  { to: '/game', labelKey: 'memory' as const, icon: Puzzle },
  { to: '/game/chess', labelKey: 'chess' as const, icon: Gamepad2 },
]

export function GamesMenu({ showHint }: { showHint: boolean }) {
  const { t } = useTranslation()
  const location = useLocation()
  const { isGamesOpen, openOverlay, closeOverlay } = useNavOverlay()
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const reduceMotion = useReducedMotion()

  const isGamesArea = location.pathname === '/game' || location.pathname.startsWith('/game/')

  const close = useCallback(() => closeOverlay(), [closeOverlay])

  useEffect(() => {
    if (!isGamesOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [close, isGamesOpen])

  return (
    <div ref={containerRef} className="relative">
      <GameButtonHint enabled={showHint && !isGamesArea}>
        <button
          type="button"
          onClick={() => (isGamesOpen ? close() : openOverlay('games'))}
          className={cn(
            navActionClass({ active: isGamesOpen || isGamesArea }),
            navActionPillClass,
            'hidden sm:inline-flex',
          )}
          aria-label={t.nav.games}
          aria-haspopup="menu"
          aria-expanded={isGamesOpen}
          aria-controls={listboxId}
        >
          <Gamepad2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t.nav.games}
          <ChevronDown
            className={cn(
              'h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200',
              isGamesOpen && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          onClick={() => (isGamesOpen ? close() : openOverlay('games'))}
          className={cn(
            navActionClass({ active: isGamesOpen || isGamesArea }),
            navActionIconClass,
            'sm:hidden',
          )}
          aria-label={t.nav.games}
          aria-haspopup="menu"
          aria-expanded={isGamesOpen}
          aria-controls={listboxId}
        >
          <Gamepad2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </GameButtonHint>

      <AnimatePresence>
        {isGamesOpen && (
          <motion.div
            id={listboxId}
            role="menu"
            aria-label={t.nav.games}
            initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+0.375rem)] z-[60] min-w-[12.5rem] overflow-hidden rounded-xl border border-border bg-card p-1 text-card-foreground shadow-lg"
          >
            {GAMES.map(({ to, labelKey, icon: Icon }) => {
              const active =
                to === '/game'
                  ? location.pathname === '/game'
                  : location.pathname.startsWith(to)

              return (
                <Link
                  key={to}
                  to={to}
                  role="menuitem"
                  onClick={() => {
                    markGameVisited()
                    close()
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{t.nav.gameItems[labelKey]}</span>
                  {active && <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />}
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
