import { Moon, Sun } from 'lucide-react'
import { useTranslation } from '@/i18n/LanguageProvider'
import { navActionClass, navActionIconClass } from '@/components/layout/navActionStyles'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  isDark: boolean
  onToggle: () => void
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(navActionClass(), navActionIconClass)}
      aria-label={isDark ? t.theme.light : t.theme.dark}
    >
      {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
    </button>
  )
}
