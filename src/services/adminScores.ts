import { getSupabase } from '@/lib/supabase'
import type { MemoryScoreRow } from '@/types/admin'

export async function fetchAllScores(limit = 100): Promise<MemoryScoreRow[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('memory_leaderboard')
    .select('id, player_name, grid_size, moves, seconds, locale, created_at, rank')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[admin] fetch scores failed:', error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    playerName: row.player_name,
    gridSize: row.grid_size,
    moves: row.moves,
    seconds: row.seconds,
    locale: row.locale,
    createdAt: row.created_at,
    rank: row.rank ?? null,
  }))
}

export async function deleteScore(id: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error } = await supabase.from('memory_scores').delete().eq('id', id)
  if (error) {
    console.error('[admin] delete score failed:', error.message)
    return false
  }

  return true
}

export async function countScores(): Promise<number> {
  const supabase = getSupabase()
  if (!supabase) return 0

  const { count, error } = await supabase
    .from('memory_scores')
    .select('*', { count: 'exact', head: true })

  if (error) return 0
  return count ?? 0
}
