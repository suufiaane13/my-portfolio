import { useEffect, useMemo, useState } from 'react'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { Card } from '@/components/ui/Card'
import { ADMIN_PAGE_SIZE, useClientPagination } from '@/hooks/useClientPagination'
import { useTranslation } from '@/i18n/LanguageProvider'
import { formatDateOnly, formatDateTime } from '@/lib/formatDate'
import {
  aggregateEventsByDay,
  aggregateEventTypes,
  fetchPortfolioEvents,
} from '@/services/adminAnalytics'
import type { PortfolioEvent } from '@/types/admin'

export function AdminAnalyticsPage() {
  const { t, locale } = useTranslation()
  const [days, setDays] = useState(30)
  const [events, setEvents] = useState<PortfolioEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.title = `${t.admin.nav.analytics} — ${t.admin.title}`
  }, [t])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    void fetchPortfolioEvents(days, 1000).then((data) => {
      if (cancelled) return
      setEvents(data)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [days])

  const summary = useMemo(() => aggregateEventTypes(events), [events])
  const daily = useMemo(() => aggregateEventsByDay(events), [events])
  const maxDaily = useMemo(() => Math.max(1, ...daily.map((d) => d.count)), [daily])
  const { page, setPage, pageCount, pageItems, total, pageSize } = useClientPagination(
    events,
    ADMIN_PAGE_SIZE,
  )

  const eventLabel = (type: string) =>
    t.admin.analytics.eventTypes[type as keyof typeof t.admin.analytics.eventTypes] ?? type

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold sm:text-2xl">{t.admin.nav.analytics}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.admin.analytics.subtitle}</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          {[7, 30].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDays(value)}
              className={
                days === value
                  ? 'rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
                  : 'rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground'
              }
            >
              {value}j
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {summary.map((item) => (
              <Card key={item.eventType} className="p-3 sm:p-4">
                <p className="text-xs text-muted-foreground sm:text-sm">{eventLabel(item.eventType)}</p>
                <p className="mt-1 font-display text-xl font-bold tabular-nums sm:text-2xl">
                  {item.count}
                </p>
              </Card>
            ))}
          </div>

          {daily.length > 0 && (
            <Card className="p-4 sm:p-6">
              <h2 className="font-display text-base font-semibold sm:text-lg">
                {t.admin.analytics.dailyChart}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.admin.analytics.dailyChartDesc}</p>
              <div className="-mx-1 mt-6 flex items-end gap-1 overflow-x-auto px-1 pb-2 sm:gap-1.5">
                {daily.map((item) => (
                  <div key={item.date} className="flex min-w-[1.75rem] flex-col items-center gap-2 sm:min-w-[2rem]">
                    <span className="text-[10px] font-medium tabular-nums text-muted-foreground sm:text-xs">
                      {item.count}
                    </span>
                    <div
                      className="w-full min-w-[1rem] rounded-t-md bg-primary/80 transition-all sm:min-w-[1.25rem]"
                      style={{ height: `${Math.max(8, (item.count / maxDaily) * 120)}px` }}
                      title={`${formatDateOnly(item.date, locale)}: ${item.count}`}
                    />
                    <span className="text-[9px] text-muted-foreground sm:text-[10px]">
                      {formatDateOnly(item.date, locale).split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="overflow-hidden">
            {total === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                {t.admin.analytics.empty}
              </p>
            ) : (
              <>
                {/* Mobile cards */}
                <ul className="divide-y divide-border md:hidden">
                  {pageItems.map((event) => (
                    <li key={event.id} className="space-y-2 p-4">
                      <p className="font-semibold text-foreground">{eventLabel(event.eventType)}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="truncate font-mono">{event.path ?? '—'}</span>
                        <span>·</span>
                        <span className="truncate">
                          {event.sectionId ?? event.projectId ?? '—'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(event.createdAt, locale)}
                      </p>
                    </li>
                  ))}
                </ul>

                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="px-4 py-3 font-medium">{t.admin.analytics.columns.type}</th>
                        <th className="px-4 py-3 font-medium">{t.admin.analytics.columns.path}</th>
                        <th className="px-4 py-3 font-medium">{t.admin.analytics.columns.detail}</th>
                        <th className="px-4 py-3 font-medium">{t.admin.analytics.columns.date}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((event) => (
                        <tr key={event.id} className="border-b border-border/70">
                          <td className="px-4 py-3 font-medium">{eventLabel(event.eventType)}</td>
                          <td className="px-4 py-3 text-muted-foreground">{event.path ?? '—'}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {event.sectionId ?? event.projectId ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDateTime(event.createdAt, locale)}
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
        </>
      )}
    </div>
  )
}
