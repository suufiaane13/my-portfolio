import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { Card } from '@/components/ui/Card'
import { ADMIN_PAGE_SIZE, useClientPagination } from '@/hooks/useClientPagination'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'

export interface ContentListItem {
  id: string
  title: string
  subtitle?: string
  published: boolean
  meta?: string
}

interface ContentMasterDetailProps {
  items: ContentListItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onBack?: () => void
  isLoading?: boolean
  listHeader?: ReactNode
  children: ReactNode
  emptyMessage?: string
}

export function ContentMasterDetail({
  items,
  selectedId,
  onSelect,
  isLoading,
  listHeader,
  children,
  emptyMessage,
}: ContentMasterDetailProps) {
  const { t } = useTranslation()
  const showEditor = selectedId !== null
  const { page, setPage, pageCount, pageItems, total, pageSize } = useClientPagination(
    items,
    ADMIN_PAGE_SIZE,
  )

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t.common.loading}</p>
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-6">
      {/* Liste — masquée sur mobile quand un item est sélectionné */}
      <div className={cn('space-y-2', showEditor && 'hidden lg:block')}>
        {listHeader}
        {items.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            {emptyMessage ?? t.admin.content.empty}
          </Card>
        ) : (
          <>
            <div className="space-y-2">
              {pageItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                    selectedId === item.id
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border bg-card hover:border-primary/30 hover:bg-muted/40',
                  )}
                >
                  <span
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full',
                      item.published ? 'bg-emerald-500' : 'bg-amber-500',
                    )}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{item.title}</p>
                    {(item.subtitle || item.meta) && (
                      <p className="truncate text-xs text-muted-foreground">
                        {[item.subtitle, item.meta].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground lg:hidden" />
                </button>
              ))}
            </div>
            {pageCount > 1 && (
              <Card className="overflow-hidden">
                <AdminPagination
                  page={page}
                  pageCount={pageCount}
                  total={total}
                  pageSize={pageSize}
                  onPageChange={setPage}
                />
              </Card>
            )}
          </>
        )}
      </div>

      {/* Éditeur — plein écran sur mobile */}
      <div className={cn(!showEditor && 'hidden lg:block')}>
        {showEditor ? (
          <div className="min-h-[20rem]">{children}</div>
        ) : (
          <Card className="hidden items-center justify-center p-12 text-center text-sm text-muted-foreground lg:flex">
            {t.admin.content.selectItem}
          </Card>
        )}
      </div>
    </div>
  )
}

export function ContentMasterDetailBack({
  label,
  onBack,
}: {
  label: string
  onBack: () => void
}) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden"
    >
      <ChevronRight className="h-4 w-4 rotate-180" />
      {label}
    </button>
  )
}
