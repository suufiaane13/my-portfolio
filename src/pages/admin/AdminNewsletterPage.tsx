import { Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog'
import { Card } from '@/components/ui/Card'
import { ADMIN_PAGE_SIZE, useClientPagination } from '@/hooks/useClientPagination'
import { useTranslation } from '@/i18n/LanguageProvider'
import {
  deleteNewsletterSubscriber,
  fetchNewsletterSubscribers,
  type NewsletterSubscriber,
} from '@/services/admin/newsletter'

export function AdminNewsletterPage() {
  const { t } = useTranslation()
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState<NewsletterSubscriber | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { page, setPage, pageCount, pageItems, total, pageSize } = useClientPagination(
    subscribers,
    ADMIN_PAGE_SIZE,
  )

  const load = useCallback(async () => {
    setIsLoading(true)
    const data = await fetchNewsletterSubscribers()
    setSubscribers(data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    document.title = `${t.admin.nav.newsletter} — ${t.admin.title}`
    void load()
  }, [t, load])

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    setIsDeleting(true)
    const ok = await deleteNewsletterSubscriber(pendingDelete.id)
    setIsDeleting(false)

    if (!ok) {
      toast.error(t.admin.newsletter.deleteError)
      return
    }
    toast.success(t.admin.newsletter.deleteSuccess)
    setPendingDelete(null)
    await load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold sm:text-2xl">{t.admin.nav.newsletter}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.admin.newsletter.subtitle}</p>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">{t.common.loading}</p>
        ) : total === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {t.admin.newsletter.empty}
          </p>
        ) : (
          <>
            {/* Mobile cards */}
            <ul className="divide-y divide-border md:hidden">
              {pageItems.map((subscriber) => (
                <li key={subscriber.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{subscriber.email}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-md bg-muted px-2 py-0.5 font-medium uppercase tracking-wide text-foreground">
                          {subscriber.locale}
                        </span>
                        <span className="rounded-md border border-border px-2 py-0.5">
                          {subscriber.source}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(subscriber.subscribedAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(subscriber)}
                      className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-destructive transition-colors hover:bg-destructive/10"
                      aria-label={t.admin.newsletter.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">{t.admin.newsletter.columns.email}</th>
                    <th className="px-4 py-3 font-medium">{t.admin.newsletter.columns.locale}</th>
                    <th className="px-4 py-3 font-medium">{t.admin.newsletter.columns.source}</th>
                    <th className="px-4 py-3 font-medium">{t.admin.newsletter.columns.date}</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((subscriber) => (
                    <tr key={subscriber.id} className="border-b border-border/70">
                      <td className="px-4 py-3 font-medium">{subscriber.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{subscriber.locale}</td>
                      <td className="px-4 py-3 text-muted-foreground">{subscriber.source}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(subscriber.subscribedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setPendingDelete(subscriber)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t.admin.newsletter.delete}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AdminPagination
              page={page}
              pageCount={pageCount}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        description={t.admin.newsletter.confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
