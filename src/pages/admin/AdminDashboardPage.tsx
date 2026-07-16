import { BarChart3, Mail, MousePointerClick, Newspaper, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '@/components/admin/StatCard'
import { Card } from '@/components/ui/Card'
import { useTranslation } from '@/i18n/LanguageProvider'
import { fetchDashboardStats } from '@/services/adminDashboard'
import type { AdminDashboardStats } from '@/types/admin'

export function AdminDashboardPage() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.title = `${t.admin.nav.dashboard} — ${t.admin.title}`
  }, [t])

  useEffect(() => {
    let cancelled = false

    void fetchDashboardStats().then((data) => {
      if (cancelled) return
      setStats(data)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          {t.admin.dashboard.welcome}
        </h1>
        <p className="mt-2 text-muted-foreground">{t.admin.dashboard.subtitle}</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label={t.admin.dashboard.unreadMessages}
              value={stats.unreadMessages}
              icon={Mail}
            />
            <StatCard
              label={t.admin.dashboard.newsletterSubscribers}
              value={stats.newsletterSubscribers}
              icon={Newspaper}
            />
            <StatCard
              label={t.admin.dashboard.events7d}
              value={stats.eventsLast7Days}
              icon={MousePointerClick}
            />
            <StatCard
              label={t.admin.dashboard.events30d}
              value={stats.eventsLast30Days}
              icon={BarChart3}
            />
            <StatCard
              label={t.admin.dashboard.totalScores}
              value={stats.totalScores}
              icon={Trophy}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-4 font-display text-lg font-semibold">{t.admin.dashboard.quickLinks}</h2>
              <div className="space-y-2">
                <Link
                  to="/admin/content"
                  className="block rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  {t.admin.nav.content}
                </Link>
                <Link
                  to="/admin/messages"
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  <span>{t.admin.nav.messages}</span>
                  <span className="font-semibold text-primary">{stats.unreadMessages}</span>
                </Link>
                <Link
                  to="/admin/newsletter"
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  <span>{t.admin.nav.newsletter}</span>
                  <span className="font-semibold text-primary">{stats.newsletterSubscribers}</span>
                </Link>
                <Link
                  to="/admin/analytics"
                  className="block rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  {t.admin.nav.analytics}
                </Link>
                <Link
                  to="/admin/scores"
                  className="block rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  {t.admin.nav.scores}
                </Link>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="mb-4 font-display text-lg font-semibold">
                {t.admin.dashboard.topEvents}
              </h2>
              {stats.topEventTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.admin.dashboard.noEvents}</p>
              ) : (
                <ul className="space-y-2">
                  {stats.topEventTypes.map((item) => (
                    <li
                      key={item.eventType}
                      className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-2.5 text-sm"
                    >
                      <span className="font-medium">
                        {t.admin.analytics.eventTypes[item.eventType as keyof typeof t.admin.analytics.eventTypes] ??
                          item.eventType}
                      </span>
                      <span className="tabular-nums text-muted-foreground">{item.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}
