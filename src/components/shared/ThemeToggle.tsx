import { Moon, Sun } from 'lucide-react'
import { useTranslation } from '@/i18n/LanguageProvider'
import { trackEvent } from '@/services/analytics'
import { navActionClass, navActionIconClass } from '@/components/layout/navActionStyles'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  isDark: boolean
  onToggle: () => void
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  const { t, locale } = useTranslation()

  return (
    <button
      type="button"
      onClick={() => {
        const nextTheme = isDark ? 'light' : 'dark'
        trackEvent({
          eventType: 'theme_switch',
          locale,
          metadata: { theme: nextTheme },
        })
        onToggle()
      }}
      className={cn(navActionClass(), navActionIconClass)}
      aria-label={isDark ? t.theme.light : t.theme.dark}
    >
      {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
    </button>
  )
}
