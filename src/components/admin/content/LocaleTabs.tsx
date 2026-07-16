import type { Locale } from '@/i18n/types'
import { cn } from '@/lib/utils'

interface LocaleTabsProps {
  locale: Locale
  onChange: (locale: Locale) => void
  labels?: { fr: string; en: string }
}

export function LocaleTabs({
  locale,
  onChange,
  labels = { fr: 'FR', en: 'EN' },
}: LocaleTabsProps) {
  return (
    <div className="inline-flex rounded-xl border border-border p-1" role="tablist">
      {(['fr', 'en'] as const).map((key) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={locale === key}
          onClick={() => onChange(key)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
            locale === key
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {labels[key]}
        </button>
      ))}
    </div>
  )
}
