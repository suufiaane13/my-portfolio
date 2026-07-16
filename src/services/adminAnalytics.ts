import { getSupabase } from '@/lib/supabase'
import type { PortfolioEvent } from '@/types/admin'

function mapEvent(row: Record<string, unknown>): PortfolioEvent {
  return {
    id: row.id as string,
    eventType: row.event_type as string,
    path: (row.path as string | null) ?? null,
    sectionId: (row.section_id as string | null) ?? null,
    projectId: (row.project_id as string | null) ?? null,
    locale: (row.locale as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  }
}

export async function fetchPortfolioEvents(days = 30, limit = 200): Promise<PortfolioEvent[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('portfolio_events')
    .select('id, event_type, path, section_id, project_id, locale, metadata, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[admin] fetch events failed:', error.message)
    return []
  }

  return (data ?? []).map(mapEvent)
}

export async function countEventsSince(days: number): Promise<number> {
  const supabase = getSupabase()
  if (!supabase) return 0

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { count, error } = await supabase
    .from('portfolio_events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since)

  if (error) return 0
  return count ?? 0
}

export function aggregateEventsByDay(events: PortfolioEvent[]): { date: string; count: number }[] {
  const counts = new Map<string, number>()

  for (const event of events) {
    const date = event.createdAt.slice(0, 10)
    counts.set(date, (counts.get(date) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function aggregateEventTypes(events: PortfolioEvent[]): { eventType: string; count: number }[] {
  const counts = new Map<string, number>()

  for (const event of events) {
    counts.set(event.eventType, (counts.get(event.eventType) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([eventType, count]) => ({ eventType, count }))
    .sort((a, b) => b.count - a.count)
}
