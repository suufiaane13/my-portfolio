import { ArrowLeft, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { LocaleTabs } from '@/components/admin/content/LocaleTabs'
import { PublishedToggle } from '@/components/admin/content/PublishedToggle'
import type { Locale } from '@/i18n/types'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'

/** Side panels / previews that stick below the content editor toolbar (desktop) */
export const stickyBelowToolbarClass = 'z-10 lg:sticky lg:top-[5.25rem]'

interface ContentEditorToolbarProps {
  title: string
  backTo: string
  backLabel: string
  locale?: Locale
  onLocaleChange?: (locale: Locale) => void
  showLocale?: boolean
  published?: boolean
  onPublishedChange?: (published: boolean) => void
  showPublished?: boolean
  onSave?: () => void
  isSaving?: boolean
  className?: string
}

export function ContentEditorToolbar({
  title,
  backTo,
  backLabel,
  locale = 'fr',
  onLocaleChange,
  showLocale = true,
  published,
  onPublishedChange,
  showPublished = false,
  onSave,
  isSaving = false,
  className,
}: ContentEditorToolbarProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'content-editor-toolbar sticky top-0 z-20 -mx-4 mb-6 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-0',
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to={backTo}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={backLabel}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-semibold text-foreground sm:text-lg">
              {title}
            </p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">{backLabel}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {showLocale && onLocaleChange && (
            <>
              <div className="hidden sm:block">
                <LocaleTabs locale={locale} onChange={onLocaleChange} />
              </div>
              <div className="sm:hidden">
                <LocaleTabs locale={locale} onChange={onLocaleChange} />
              </div>
            </>
          )}
          {showPublished && onPublishedChange !== undefined && published !== undefined && (
            <PublishedToggle published={published} onChange={onPublishedChange} />
          )}
          {onSave && (
            <Button
              size="sm"
              className="w-full sm:w-auto lg:w-auto"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t.admin.content.save}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
