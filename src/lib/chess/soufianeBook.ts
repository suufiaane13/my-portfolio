import { Chess } from 'chess.js'
import { SOUFIANE_BOOK, type SoufianeBookEntry } from './soufianeBook.generated'

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 }

/**
 * Pick a move from Soufiane's real-game repertoire for the current position.
 *
 * Uses weighted random selection based on how often Soufiane played each move
 * in this exact position across 1000+ Chess.com games (1000–1100 Elo).
 *
 * Applies a material safety filter: moves that immediately hang the queen
 * (opponent can capture it next move for free or at huge material loss)
 * are rejected unless the move delivers checkmate.
 *
 * @returns UCI move string or `null` if the position isn't in the book.
 */
export function pickSoufianeMove(
  fen: string,
  legalUciMoves: string[],
): string | null {
  const entries = SOUFIANE_BOOK[fen]
  if (!entries?.length) return null

  // Filter to only legal moves (book may contain moves from different contexts)
  const legal = entries.filter((e) => legalUciMoves.includes(e.move))
  if (!legal.length) return null

  // Try safe moves first, then fall back to all moves
  const safe = legal.filter((e) => isMoveSafe(fen, e.move))
  if (safe.length) return weightedRandom(safe)

  // If no safe book move exists, return null → fallback to Stockfish
  return null
}

/**
 * Check if a move is materially safe: the opponent cannot immediately
 * capture our queen for free (or at a loss > 3 points).
 */
function isMoveSafe(fen: string, uciMove: string): boolean {
  try {
    const chess = new Chess(fen)
    const from = uciMove.slice(0, 2)
    const to = uciMove.slice(2, 4)
    const promotion = uciMove.length > 4 ? uciMove[4] : undefined

    const move = chess.move({ from, to, promotion })
    if (!move) return false

    // If this move is checkmate, it's always safe
    if (chess.isCheckmate()) return true

    const myColor = move.color // the side that just moved

    // Check all opponent moves: can they capture our queen?
    const oppMoves = chess.moves({ verbose: true })
    for (const oppMove of oppMoves) {
      if (oppMove.captured === 'q') {
        // Simulate the opponent's capture and check material
        const testChess = new Chess(chess.fen())
        const oppCapture = testChess.move({ from: oppMove.from, to: oppMove.to })
        if (!oppCapture) continue

        // Check if the piece that was captured was our queen
        if (oppCapture.captured === 'q') {
          // Our queen was captured! Check material loss.
          const afterBoard = testChess.board()
          let myMaterial = 0
          let oppMaterial = 0
          for (const row of afterBoard) {
            for (const cell of row) {
              if (cell) {
                const val = PIECE_VALUES[cell.type] || 0
                if (cell.color === myColor) myMaterial += val
                else oppMaterial += val
              }
            }
          }
          const diff = myMaterial - oppMaterial
          // If losing the queen results in material diff < -3, it's unsafe
          if (diff < -3) return false
        }
      }
    }

    return true
  } catch {
    // If simulation fails, allow the move (book should be reliable)
    return true
  }
}

/** Weighted random pick from a list of book entries. */
function weightedRandom(entries: SoufianeBookEntry[]): string {
  const total = entries.reduce((sum, e) => sum + e.weight, 0)
  let roll = Math.random() * total
  for (const entry of entries) {
    roll -= entry.weight
    if (roll <= 0) return entry.move
  }
  return entries[entries.length - 1]!.move
}
