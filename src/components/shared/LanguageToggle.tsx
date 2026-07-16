import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useId, useRef } from 'react'
import { useNavOverlay } from '@/components/layout/NavOverlayContext'
import {
  navActionClass,
} from '@/components/layout/navActionStyles'
import { localeLabels } from '@/i18n'
import { useTranslation } from '@/i18n/LanguageProvider'
import type { Locale } from '@/i18n/types'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/services/analytics'

const LOCALES: Locale[] = ['fr', 'en']

export function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation()
  const { isLangOpen, openOverlay, closeOverlay } = useNavOverlay()
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const reduceMotion = useReducedMotion()

  const close = useCallback(() => closeOverlay(), [closeOverlay])

  const selectLocale = useCallback(
    (next: Locale) => {
      if (next === locale) {
        close()
        return
      }

      trackEvent({
        eventType: 'lang_switch',
        locale: next,
        metadata: { from: locale, to: next },
      })
      setLocale(next)
      close()
    },
    [close, locale, setLocale],
  )

  useEffect(() => {
    if (!isLangOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        close()
      }
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
  }, [close, isLangOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => (isLangOpen ? close() : openOverlay('lang'))}
        className={cn(
          navActionClass({ active: isLangOpen }),
          'h-9 shrink-0 gap-0.5 overflow-hidden px-2 font-mono text-[0.6875rem] font-bold tracking-wider',
        )}
        aria-label={t.language.toggle}
        aria-haspopup="listbox"
        aria-expanded={isLangOpen}
        aria-controls={listboxId}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={locale}
            initial={
              reduceMotion ? false : { opacity: 0, y: -4, scale: 0.9 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block"
          >
            {localeLabels[locale]}
          </motion.span>
        </AnimatePresence>
        <ChevronDown
          className={cn(
            'h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200',
            isLangOpen && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isLangOpen && (
          <motion.div
            id={listboxId}
            role="listbox"
            aria-label={t.language.toggle}
            initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+0.375rem)] z-[60] min-w-[10.5rem] overflow-hidden rounded-xl border border-border bg-card p-1 text-card-foreground shadow-lg"
          >
            {LOCALES.map((item) => {
              const isSelected = locale === item

              return (
                <button
                  key={item}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectLocale(item)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <span className="w-7 shrink-0 font-mono text-xs font-bold tracking-wider">
                    {localeLabels[item]}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{t.language[item]}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
