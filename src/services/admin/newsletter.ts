import { getSupabase } from '@/lib/supabase'

export interface NewsletterSubscriber {
  id: string
  email: string
  locale: string
  source: string
  subscribedAt: string
  unsubscribedAt: string | null
}

function mapSubscriber(row: Record<string, unknown>): NewsletterSubscriber {
  return {
    id: row.id as string,
    email: row.email as string,
    locale: row.locale as string,
    source: row.source as string,
    subscribedAt: row.subscribed_at as string,
    unsubscribedAt: (row.unsubscribed_at as string | null) ?? null,
  }
}

export async function fetchNewsletterSubscribers(limit = 200): Promise<NewsletterSubscriber[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, locale, source, subscribed_at, unsubscribed_at')
    .is('unsubscribed_at', null)
    .order('subscribed_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[admin] fetch newsletter failed:', error.message)
    return []
  }

  return (data ?? []).map(mapSubscriber)
}

export async function countNewsletterSubscribers(): Promise<number> {
  const supabase = getSupabase()
  if (!supabase) return 0

  const { count, error } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true })
    .is('unsubscribed_at', null)

  if (error) return 0
  return count ?? 0
}

export async function deleteNewsletterSubscriber(id: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id)
  if (error) {
    console.error('[admin] delete newsletter subscriber failed:', error.message)
    return false
  }
  return true
}
