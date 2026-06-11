import { localeLabels } from '@/i18n'
import { useTranslation } from '@/i18n/LanguageProvider'
import {
  navActionClass,
  navActionIconClass,
} from '@/components/layout/navActionStyles'
import { cn } from '@/lib/utils'

export function LanguageToggle() {
  const { locale, toggleLocale, t } = useTranslation()
  const nextLocale = locale === 'fr' ? 'en' : 'fr'

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className={cn(
        navActionClass(),
        navActionIconClass,
        'font-mono text-[0.6875rem] font-bold tracking-wider',
      )}
      aria-label={`${t.language.toggle}: ${t.language[nextLocale]}`}
    >
      {localeLabels[nextLocale]}
    </button>
  )
}
