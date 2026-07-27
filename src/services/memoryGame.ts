import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isTimeoutError, withTimeout } from '@/lib/withTimeout'

const FETCH_TIMEOUT_MS = 12_000
const INVOKE_TIMEOUT_MS = 15_000
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

export type ScoreErrorCode =
  | 'not_configured'
  | 'rate_limit'
  | 'validation'
  | 'network'
  | 'waking_up'
  | 'unknown'

export class ScoreServiceError extends Error {
  code: ScoreErrorCode

  constructor(message: string, code: ScoreErrorCode) {
    super(message)
    this.name = 'ScoreServiceError'
    this.code = code
  }
}

const PLAYER_NAME_KEY = 'susu-portfolio-player-name'
const PERSONAL_BEST_KEY = 'susu-portfolio-memory-best'

export interface PersonalBest {
  moves: number
  seconds: number
}

function isBetterScore(
  moves: number,
  seconds: number,
  current: PersonalBest | null,
): boolean {
  if (!current) return true
  if (moves < current.moves) return true
  if (moves > current.moves) return false
  return seconds < current.seconds
}

export function getPersonalBest(gridSize: GridSize): PersonalBest | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(PERSONAL_BEST_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Record<GridSize, PersonalBest>>
    const entry = parsed[gridSize]
    if (!entry || typeof entry.moves !== 'number' || typeof entry.seconds !== 'number') {
      return null
    }
    return entry
  } catch {
    return null
  }
}

export function savePersonalBestIfBetter(
  gridSize: GridSize,
  moves: number,
  seconds: number,
): { isNewRecord: boolean; previous: PersonalBest | null } {
  if (typeof window === 'undefined') {
    return { isNewRecord: false, previous: null }
  }

  const previous = getPersonalBest(gridSize)
  if (!isBetterScore(moves, seconds, previous)) {
    return { isNewRecord: false, previous }
  }

  try {
    const raw = localStorage.getItem(PERSONAL_BEST_KEY)
    const parsed = raw ? (JSON.parse(raw) as Partial<Record<GridSize, PersonalBest>>) : {}
    parsed[gridSize] = { moves, seconds }
    localStorage.setItem(PERSONAL_BEST_KEY, JSON.stringify(parsed))
  } catch {
    return { isNewRecord: false, previous }
  }

  return { isNewRecord: true, previous }
}

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

  try {
    const { data, error } = await withTimeout(
      Promise.resolve(
        supabase
          .from('memory_leaderboard')
          .select('id, player_name, grid_size, moves, seconds, rank, created_at')
          .eq('grid_size', gridSize)
          .lte('rank', LEADERBOARD_LIMIT)
          .order('rank', { ascending: true }),
      ),
      FETCH_TIMEOUT_MS,
    )

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
  } catch {
    console.warn('[memoryGame] Leaderboard fetch timed out')
    return []
  }
}

export async function submitScore(
  payload: SubmitScorePayload,
): Promise<{ rank: number | null }> {
  const supabase = getSupabase()

  if (!supabase) {
    throw new ScoreServiceError('Supabase is not configured', 'not_configured')
  }

  let data: { success?: boolean; error?: string; rank?: number | null } | null = null
  let invokeError: Error | null = null

  try {
    const result = await withTimeout(
      supabase.functions.invoke<{
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
      }),
      INVOKE_TIMEOUT_MS,
    )
    data = result.data
    invokeError = result.error
  } catch (error) {
    if (isTimeoutError(error)) {
      throw new ScoreServiceError('waking_up', 'waking_up')
    }
    throw new ScoreServiceError('network', 'network')
  }

  if (invokeError) {
    const message = invokeError.message.toLowerCase()
    if (message.includes('timeout') || message.includes('fetch')) {
      throw new ScoreServiceError('waking_up', 'waking_up')
    }
    throw new ScoreServiceError(invokeError.message, 'network')
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
