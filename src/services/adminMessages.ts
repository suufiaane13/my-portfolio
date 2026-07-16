import { getSupabase } from '@/lib/supabase'
import type { ContactMessage, ContactMessageStatus } from '@/types/admin'

function mapMessage(row: Record<string, unknown>): ContactMessage {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    message: row.message as string,
    locale: row.locale as string,
    status: row.status as ContactMessageStatus,
    readAt: (row.read_at as string | null) ?? null,
    repliedAt: (row.replied_at as string | null) ?? null,
    createdAt: row.created_at as string,
  }
}

export async function fetchContactMessages(status?: ContactMessageStatus): Promise<ContactMessage[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  let query = supabase
    .from('contact_messages')
    .select('id, name, email, message, locale, status, read_at, replied_at, created_at')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) {
    console.error('[admin] fetch messages failed:', error.message)
    return []
  }

  return (data ?? []).map(mapMessage)
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus,
): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const now = new Date().toISOString()
  const patch: Record<string, unknown> = { status }

  if (status === 'read' || status === 'replied') {
    patch.read_at = now
  }
  if (status === 'replied') {
    patch.replied_at = now
  }

  const { error } = await supabase.from('contact_messages').update(patch).eq('id', id)
  if (error) {
    console.error('[admin] update message failed:', error.message)
    return false
  }

  return true
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error } = await supabase.from('contact_messages').delete().eq('id', id)
  if (error) {
    console.error('[admin] delete message failed:', error.message)
    return false
  }

  return true
}

export async function countUnreadMessages(): Promise<number> {
  const supabase = getSupabase()
  if (!supabase) return 0

  const { count, error } = await supabase
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  if (error) return 0
  return count ?? 0
}
