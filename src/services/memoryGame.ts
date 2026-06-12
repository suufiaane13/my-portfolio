import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { GridSize } from '@/data/memoryGame'
import type { Locale } from '@/i18n/types'

export const LEADERBOARD_LIMIT = 5

export interface LeaderboardEntry {
  id: string
  playerName: string
  gridSize: GridSize
  moves: number
  seconds: number
  rank: number
  createdAt: string
}

export interface SubmitScorePayload {
  playerName: string
  gridSize: GridSize
  moves: number
  seconds: number
  locale: Locale
}

export type ScoreErrorCode = 'not_configured' | 'rate_limit' | 'validation' | 'network' | 'unknown'

export class ScoreServiceError extends Error {
  code: ScoreErrorCode

  constructor(message: string, code: ScoreErrorCode) {
    super(message)
    this.name = 'ScoreServiceError'
    this.code = code
  }
}

const PLAYER_NAME_KEY = 'susu-portfolio-player-name'

export function getSavedPlayerName(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(PLAYER_NAME_KEY) ?? ''
}

export function savePlayerName(name: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PLAYER_NAME_KEY, name.trim())
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function formatLeaderboardTime(seconds: number) {
  return formatTime(seconds)
}

export async function fetchLeaderboard(gridSize: GridSize): Promise<LeaderboardEntry[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('memory_leaderboard')
    .select('id, player_name, grid_size, moves, seconds, rank, created_at')
    .eq('grid_size', gridSize)
    .lte('rank', LEADERBOARD_LIMIT)
    .order('rank', { ascending: true })

  if (error) {
    console.warn('[memoryGame] Leaderboard fetch failed:', error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    playerName: row.player_name,
    gridSize: row.grid_size as GridSize,
    moves: row.moves,
    seconds: row.seconds,
    rank: row.rank,
    createdAt: row.created_at,
  }))
}

export async function submitScore(
  payload: SubmitScorePayload,
): Promise<{ rank: number | null }> {
  const supabase = getSupabase()

  if (!supabase) {
    throw new ScoreServiceError('Supabase is not configured', 'not_configured')
  }

  const { data, error } = await supabase.functions.invoke<{
    success?: boolean
    error?: string
    rank?: number | null
  }>('submit-score', {
    body: {
      player_name: payload.playerName.trim(),
      grid_size: payload.gridSize,
      moves: payload.moves,
      seconds: payload.seconds,
      locale: payload.locale,
      website: '',
    },
  })

  if (error) {
    throw new ScoreServiceError(error.message, 'network')
  }

  if (data?.error === 'rate_limit') {
    throw new ScoreServiceError('rate_limit', 'rate_limit')
  }

  if (data?.error === 'validation') {
    throw new ScoreServiceError('validation', 'validation')
  }

  if (data?.error) {
    throw new ScoreServiceError(data.error, 'unknown')
  }

  if (!data?.success) {
    throw new ScoreServiceError('Unknown error', 'unknown')
  }

  savePlayerName(payload.playerName)
  return { rank: data.rank ?? null }
}

export function isLeaderboardEnabled(): boolean {
  return isSupabaseConfigured()
}
