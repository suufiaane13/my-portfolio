import { Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
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

  const handleDelete = async (subscriber: NewsletterSubscriber) => {
    if (!window.confirm(t.admin.newsletter.confirmDelete)) return

    const ok = await deleteNewsletterSubscriber(subscriber.id)
    if (!ok) {
      toast.error(t.admin.newsletter.deleteError)
      return
    }
    toast.success(t.admin.newsletter.deleteSuccess)
    await load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">{t.admin.nav.newsletter}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.admin.newsletter.subtitle}</p>
      </div>

      <Card className="overflow-x-auto">
        {isLoading ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">{t.common.loading}</p>
        ) : subscribers.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {t.admin.newsletter.empty}
          </p>
        ) : (
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
              {subscribers.map((subscriber) => (
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
                      onClick={() => void handleDelete(subscriber)}
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
        )}
      </Card>
    </div>
  )
}
