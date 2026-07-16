import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'

interface AdminPaginationProps {
  page: number
  pageCount: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  className?: string
}

export function AdminPagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
  className,
}: AdminPaginationProps) {
  const { t } = useTranslation()

  if (total === 0 || pageCount <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-xs text-muted-foreground sm:text-sm">
        {t.admin.pagination.showing
          .replace('{{from}}', String(from))
          .replace('{{to}}', String(to))
          .replace('{{total}}', String(total))}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t.admin.pagination.previous}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t.admin.pagination.previous}</span>
        </Button>

        <span className="min-w-[7rem] text-center text-xs font-medium tabular-nums text-muted-foreground sm:text-sm">
          {t.admin.pagination.pageOf
            .replace('{{page}}', String(page))
            .replace('{{pages}}', String(pageCount))}
        </span>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label={t.admin.pagination.next}
        >
          <span className="hidden sm:inline">{t.admin.pagination.next}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
