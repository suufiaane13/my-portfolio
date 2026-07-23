import {
  BarChart3,
  FileText,
  Mail,
  MousePointerClick,
  Newspaper,
  Trophy,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RotatingStatCard } from '@/components/admin/RotatingStatCard'
import { StatCard } from '@/components/admin/StatCard'
import { Card } from '@/components/ui/Card'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'
import { fetchDashboardStats } from '@/services/adminDashboard'
import type { AdminDashboardStats } from '@/types/admin'

const QUICK_LINKS = [
  { to: '/admin/content', labelKey: 'content' as const, icon: FileText, badgeKey: null },
  {
    to: '/admin/messages',
    labelKey: 'messages' as const,
    icon: Mail,
    badgeKey: 'unreadMessages' as const,
  },
  {
    to: '/admin/newsletter',
    labelKey: 'newsletter' as const,
    icon: Newspaper,
    badgeKey: 'newsletterSubscribers' as const,
  },
  { to: '/admin/analytics', labelKey: 'analytics' as const, icon: BarChart3, badgeKey: null },
  { to: '/admin/scores', labelKey: 'scores' as const, icon: Trophy, badgeKey: null },
]

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

  const maxEventCount = useMemo(
    () => Math.max(1, ...(stats?.topEventTypes.map((item) => item.count) ?? [1])),
    [stats],
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
          {t.admin.dashboard.welcome}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{t.admin.dashboard.subtitle}</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label={t.admin.dashboard.unreadMessages}
              value={stats.unreadMessages}
              icon={Mail}
              className="p-4 sm:p-5"
            />
            <StatCard
              label={t.admin.dashboard.newsletterSubscribers}
              value={stats.newsletterSubscribers}
              icon={Newspaper}
              className="p-4 sm:p-5"
            />
            <RotatingStatCard
              slides={[
                {
                  label: t.admin.dashboard.events7d,
                  value: stats.eventsLast7Days,
                  icon: MousePointerClick,
                },
                {
                  label: t.admin.dashboard.events30d,
                  value: stats.eventsLast30Days,
                  icon: BarChart3,
                },
              ]}
            />
            <StatCard
              label={t.admin.dashboard.totalScores}
              value={stats.totalScores}
              icon={Trophy}
              className="p-4 sm:p-5"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MousePointerClick className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="font-display text-base font-semibold sm:text-lg">
                  {t.admin.dashboard.quickLinks}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {QUICK_LINKS.map(({ to, labelKey, icon: Icon, badgeKey }) => {
                  const badge =
                    badgeKey === 'unreadMessages'
                      ? stats.unreadMessages
                      : badgeKey === 'newsletterSubscribers'
                        ? stats.newsletterSubscribers
                        : null

                  return (
                    <Link
                      key={to}
                      to={to}
                      className={cn(
                        'group flex items-center gap-3 rounded-xl border border-border/80 bg-muted/30 px-3 py-3 transition-all',
                        'hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      )}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                        {t.admin.nav[labelKey]}
                      </span>
                      {badge !== null && (
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
                          {badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </Card>

            <Card className="overflow-hidden p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="font-display text-base font-semibold sm:text-lg">
                  {t.admin.dashboard.topEvents}
                </h2>
              </div>
              {stats.topEventTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.admin.dashboard.noEvents}</p>
              ) : (
                <ul className="space-y-3">
                  {stats.topEventTypes.map((item, index) => {
                    const label =
                      t.admin.analytics.eventTypes[
                        item.eventType as keyof typeof t.admin.analytics.eventTypes
                      ] ?? item.eventType
                    const width = Math.max(8, (item.count / maxEventCount) * 100)

                    return (
                      <li key={item.eventType} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold tabular-nums text-muted-foreground">
                              {index + 1}
                            </span>
                            <span className="truncate">{label}</span>
                          </span>
                          <span className="shrink-0 tabular-nums text-muted-foreground">
                            {item.count}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary/80 transition-all"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}
