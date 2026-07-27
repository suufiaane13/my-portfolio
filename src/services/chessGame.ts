import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { isTimeoutError, withTimeout } from '@/lib/withTimeout'
import type { Locale } from '@/i18n/types'
import type { ChessDifficulty } from '@/lib/chess/stockfishEngine'
import { getSavedPlayerName, savePlayerName } from '@/services/memoryGame'

const FETCH_TIMEOUT_MS = 12_000
const INVOKE_TIMEOUT_MS = 15_000

export const CHESS_LEADERBOARD_LIMIT = 5

export type ChessGameResult = 'win' | 'loss' | 'draw'

export interface ChessLeaderboardEntry {
  id: string
  playerName: string
  difficulty: ChessDifficulty
  playerColor: 'w' | 'b'
  plyCount: number
  seconds: number
  openingName: string | null
  rank: number
  createdAt: string
}

export interface SubmitChessGamePayload {
  playerName: string
  difficulty: ChessDifficulty
  playerColor: 'w' | 'b'
  result: ChessGameResult
  plyCount: number
  seconds: number
  openingName?: string | null
  uciMoves: string
  locale: Locale
}

export type ChessScoreErrorCode =
  | 'not_configured'
  | 'rate_limit'
  | 'validation'
  | 'network'
  | 'waking_up'
  | 'unknown'

export class ChessScoreServiceError extends Error {
  code: ChessScoreErrorCode

  constructor(message: string, code: ChessScoreErrorCode) {
    super(message)
    this.name = 'ChessScoreServiceError'
    this.code = code
  }
}

export { getSavedPlayerName, savePlayerName }

export function formatLeaderboardTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export async function fetchChessLeaderboard(
  difficulty: ChessDifficulty,
): Promise<ChessLeaderboardEntry[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  try {
    const { data, error } = await withTimeout(
      Promise.resolve(
        supabase
          .from('chess_leaderboard')
          .select(
            'id, player_name, difficulty, player_color, ply_count, seconds, opening_name, rank, created_at',
          )
          .eq('difficulty', difficulty)
          .lte('rank', CHESS_LEADERBOARD_LIMIT)
          .order('rank', { ascending: true }),
      ),
      FETCH_TIMEOUT_MS,
    )

    if (error) {
      console.warn('[chessGame] Leaderboard fetch failed:', error.message)
      return []
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      playerName: row.player_name,
      difficulty: row.difficulty as ChessDifficulty,
      playerColor: row.player_color as 'w' | 'b',
      plyCount: row.ply_count,
      seconds: row.seconds,
      openingName: row.opening_name ?? null,
      rank: row.rank,
      createdAt: row.created_at,
    }))
  } catch {
    console.warn('[chessGame] Leaderboard fetch timed out')
    return []
  }
}

export async function submitChessGame(
  payload: SubmitChessGamePayload,
): Promise<{ rank: number | null }> {
  const supabase = getSupabase()

  if (!supabase) {
    throw new ChessScoreServiceError('Supabase is not configured', 'not_configured')
  }

  let data: { success?: boolean; error?: string; rank?: number | null } | null = null
  let invokeError: Error | null = null

  try {
    const result = await withTimeout(
      supabase.functions.invoke<{
        success?: boolean
        error?: string
        rank?: number | null
      }>('submit-chess-game', {
        body: {
          player_name: payload.playerName.trim(),
          difficulty: payload.difficulty,
          player_color: payload.playerColor,
          result: payload.result,
          ply_count: payload.plyCount,
          seconds: payload.seconds,
          opening_name: payload.openingName ?? null,
          uci_moves: payload.uciMoves,
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
      throw new ChessScoreServiceError('waking_up', 'waking_up')
    }
    throw new ChessScoreServiceError('network', 'network')
  }

  if (invokeError) {
    const message = invokeError.message.toLowerCase()
    if (message.includes('timeout') || message.includes('fetch')) {
      throw new ChessScoreServiceError('waking_up', 'waking_up')
    }
    throw new ChessScoreServiceError(invokeError.message, 'network')
  }

  if (data?.error === 'rate_limit') {
    throw new ChessScoreServiceError('rate_limit', 'rate_limit')
  }

  if (data?.error === 'validation') {
    throw new ChessScoreServiceError('validation', 'validation')
  }

  if (data?.error) {
    throw new ChessScoreServiceError(data.error, 'unknown')
  }

  if (!data?.success) {
    throw new ChessScoreServiceError('Unknown error', 'unknown')
  }

  savePlayerName(payload.playerName)
  return { rank: data.rank ?? null }
}

export function isChessLeaderboardEnabled(): boolean {
  return isSupabaseConfigured()
}
