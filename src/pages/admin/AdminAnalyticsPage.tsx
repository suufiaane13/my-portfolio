import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { useTranslation } from '@/i18n/LanguageProvider'
import {
  aggregateEventsByDay,
  aggregateEventTypes,
  fetchPortfolioEvents,
} from '@/services/adminAnalytics'
import type { PortfolioEvent } from '@/types/admin'

export function AdminAnalyticsPage() {
  const { t } = useTranslation()
  const [days, setDays] = useState(30)
  const [events, setEvents] = useState<PortfolioEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.title = `${t.admin.nav.analytics} — ${t.admin.title}`
  }, [t])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    void fetchPortfolioEvents(days).then((data) => {
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

  const eventLabel = (type: string) =>
    t.admin.analytics.eventTypes[type as keyof typeof t.admin.analytics.eventTypes] ?? type

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{t.admin.nav.analytics}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.admin.analytics.subtitle}</p>
        </div>
        <div className="flex gap-2">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summary.map((item) => (
              <Card key={item.eventType} className="p-4">
                <p className="text-sm text-muted-foreground">{eventLabel(item.eventType)}</p>
                <p className="mt-1 font-display text-2xl font-bold tabular-nums">{item.count}</p>
              </Card>
            ))}
          </div>

          {daily.length > 0 && (
            <Card className="p-4 sm:p-6">
              <h2 className="font-display text-lg font-semibold">{t.admin.analytics.dailyChart}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.admin.analytics.dailyChartDesc}</p>
              <div className="mt-6 flex items-end gap-1.5 overflow-x-auto pb-2">
                {daily.map((item) => (
                  <div key={item.date} className="flex min-w-[2rem] flex-col items-center gap-2">
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                      {item.count}
                    </span>
                    <div
                      className="w-full min-w-[1.25rem] rounded-t-md bg-primary/80 transition-all"
                      style={{ height: `${Math.max(8, (item.count / maxDaily) * 120)}px` }}
                      title={`${item.date}: ${item.count}`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {item.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="overflow-x-auto">
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
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      {t.admin.analytics.empty}
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="border-b border-border/70">
                      <td className="px-4 py-3 font-medium">{eventLabel(event.eventType)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{event.path ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {event.sectionId ?? event.projectId ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}
