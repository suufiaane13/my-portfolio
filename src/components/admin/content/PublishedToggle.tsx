import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'

interface PublishedToggleProps {
  published: boolean
  onChange: (published: boolean) => void
  disabled?: boolean
}

export function PublishedToggle({ published, onChange, disabled }: PublishedToggleProps) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!published)}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        published
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span
        className={cn('h-2 w-2 rounded-full', published ? 'bg-emerald-500' : 'bg-amber-500')}
        aria-hidden="true"
      />
      {published ? t.admin.content.published : t.admin.content.draft}
    </button>
  )
}
