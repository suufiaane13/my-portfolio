import type { Chess } from 'chess.js'
import { createChess } from '@/lib/chess/chessRules'
import type { EngineEval, StockfishEngine } from '@/lib/chess/stockfishEngine'
import { uciToMove } from '@/lib/chess/stockfishEngine'

export type MoveQuality =
  | 'brilliant'
  | 'great'
  | 'best'
  | 'excellent'
  | 'good'
  | 'book'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'

export interface ClassifiedMove {
  uci: string
  san: string
  from: string
  to: string
  fenBefore: string
  isBook?: boolean
  quality?: MoveQuality
  /** Centipawn loss vs best (approx). */
  cpl?: number
}

const PIECE_VALUE: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
}

/** Post-game analysis depth — same depth for best + played (avoids false blunders). */
const ANALYSIS_DEPTH = 14

const ANALYSIS_PRESET = {
  id: 'expert' as const,
  skillLevel: 20,
  depth: ANALYSIS_DEPTH,
  movetimeMs: 2500,
}

/** Moves within this CPL of the engine best are still treated as "best". */
const BEST_CPL_TOLERANCE = 20

export function materialScore(chess: Chess, color: 'w' | 'b'): number {
  let total = 0
  for (const row of chess.board()) {
    for (const piece of row) {
      if (piece && piece.color === color) {
        total += PIECE_VALUE[piece.type] ?? 0
      }
    }
  }
  return total
}

/** Stockfish score → comparable centipawns from the side to move. */
export function evalToSideCp(evaluation: EngineEval): number {
  if (evaluation.type === 'mate') {
    return evaluation.value > 0
      ? 10_000 - evaluation.value * 10
      : -10_000 - evaluation.value * 10
  }
  return evaluation.value
}

export function evalToWhitePov(evaluation: EngineEval, sideToMove: 'w' | 'b'): number {
  const raw = evalToSideCp(evaluation)
  return sideToMove === 'w' ? raw : -raw
}

export function classifyByCpl(
  cpl: number,
  isBest: boolean,
  opts?: { brilliant?: boolean; great?: boolean },
): MoveQuality {
  if (opts?.brilliant) return 'brilliant'
  if (opts?.great) return 'great'
  if (isBest || cpl <= BEST_CPL_TOLERANCE) return 'best'
  if (cpl <= 40) return 'excellent'
  if (cpl <= 80) return 'good'
  if (cpl <= 150) return 'inaccuracy'
  if (cpl <= 300) return 'mistake'
  return 'blunder'
}

function sameUci(a: string, b: string): boolean {
  const left = a.toLowerCase()
  const right = b.toLowerCase()
  if (left === right) return true
  // Compare from+to; accept missing/extra promotion when one side omits it
  return left.slice(0, 4) === right.slice(0, 4) && (left.length === 4 || right.length === 4)
}

export function replayToPly(moves: readonly ClassifiedMove[], ply: number): Chess {
  const chess = createChess()
  const limit = Math.max(0, Math.min(ply, moves.length))
  for (let i = 0; i < limit; i++) {
    const move = moves[i]!
    const parsed = uciToMove(move.uci)
    chess.move({
      from: parsed.from,
      to: parsed.to,
      promotion: parsed.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    })
  }
  return chess
}

/**
 * Classify one played move vs Stockfish.
 *
 * Method (Lichess-style root comparison):
 * 1. Search fenBefore → best move + score (side-to-move)
 * 2. If not best, re-search same fen with `searchmoves <played>` at the SAME depth
 * 3. CPL = max(0, scoreBest − scorePlayed) — both from the same root, same depth
 *
 * This avoids the classic false-blunder bug of comparing shallow / mismatched depths
 * on before vs after positions.
 */
export async function analyzePlayedMove(
  engine: StockfishEngine,
  move: ClassifiedMove,
): Promise<Pick<ClassifiedMove, 'quality' | 'cpl'>> {
  if (move.isBook) return { quality: 'book', cpl: 0 }

  const before = createChess(move.fenBefore)
  const side = before.turn()
  const materialBefore = materialScore(before, side)

  const best = await engine.getBestMove(move.fenBefore, ANALYSIS_PRESET, { keepHash: true })
  const bestScore = best.evaluation ? evalToSideCp(best.evaluation) : 0
  const isEngineBest = sameUci(move.uci, best.bestMove)

  let playedScore = bestScore
  let cpl = 0

  if (!isEngineBest) {
    try {
      const playedRoot = await engine.getBestMove(move.fenBefore, ANALYSIS_PRESET, {
        keepHash: true,
        searchMoves: move.uci,
      })
      if (playedRoot.evaluation) {
        playedScore = evalToSideCp(playedRoot.evaluation)
        cpl = Math.max(0, Math.round(bestScore - playedScore))
      } else {
        // Fallback: evaluate resulting position at the same depth
        cpl = await cplFromAfterPosition(engine, move, bestScore)
      }
    } catch {
      cpl = await cplFromAfterPosition(engine, move, bestScore)
    }
  }

  const played = createChess(move.fenBefore)
  const parsed = uciToMove(move.uci)
  played.move({
    from: parsed.from,
    to: parsed.to,
    promotion: parsed.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
  })
  const materialAfter = materialScore(played, side)

  // Brilliant / great need a sense of eval swing after the move
  let evalAfterWhite = evalToWhitePov(
    best.evaluation ?? { type: 'cp', value: 0 },
    side,
  )
  if (cpl <= BEST_CPL_TOLERANCE || isEngineBest) {
    try {
      const afterSearch = await engine.getBestMove(played.fen(), ANALYSIS_PRESET, {
        keepHash: true,
      })
      if (afterSearch.evaluation) {
        evalAfterWhite = evalToWhitePov(afterSearch.evaluation, played.turn())
      }
    } catch {
      // keep approx
    }
  } else {
    // Approximate after eval from root played score (opponent to move → flip)
    evalAfterWhite = side === 'w' ? -playedScore : playedScore
  }

  const evalBeforeWhite = best.evaluation
    ? evalToWhitePov(best.evaluation, side)
    : side === 'w'
      ? bestScore
      : -bestScore

  const sacrificed = materialAfter < materialBefore - 0.5
  const swing = side === 'w' ? evalAfterWhite - evalBeforeWhite : evalBeforeWhite - evalAfterWhite
  const isBest = isEngineBest || cpl <= BEST_CPL_TOLERANCE
  const brilliant = Boolean(isBest && sacrificed && swing > -80 && cpl <= 30)
  const great = Boolean(isBest && !brilliant && (swing >= 100 || (isEngineBest && cpl <= 5)))

  return {
    quality: classifyByCpl(cpl, isBest, { brilliant, great }),
    cpl,
  }
}

async function cplFromAfterPosition(
  engine: StockfishEngine,
  move: ClassifiedMove,
  bestScoreStm: number,
): Promise<number> {
  const played = createChess(move.fenBefore)
  const parsed = uciToMove(move.uci)
  played.move({
    from: parsed.from,
    to: parsed.to,
    promotion: parsed.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
  })
  const after = await engine.getBestMove(played.fen(), ANALYSIS_PRESET, { keepHash: true })
  if (!after.evaluation) return 0
  // after.evaluation is opponent STM; convert to original side STM by flipping
  const afterForPlayer = -evalToSideCp(after.evaluation)
  return Math.max(0, Math.round(bestScoreStm - afterForPlayer))
}

/** Chess.com classification colors + Lichess-style symbols. */
export const MOVE_QUALITY_STYLE: Record<
  MoveQuality,
  { color: string; bg: string; symbol: string }
> = {
  brilliant: { color: 'text-[#1baca6]', bg: 'bg-[#1baca6]/15', symbol: '!!' },
  great: { color: 'text-[#749900]', bg: 'bg-[#749900]/15', symbol: '!' },
  best: { color: 'text-[#749900]', bg: 'bg-[#749900]/15', symbol: '✓' },
  excellent: { color: 'text-[#749900]', bg: 'bg-[#749900]/15', symbol: '!' },
  good: { color: 'text-[#629924]', bg: 'bg-[#629924]/15', symbol: '!' },
  book: { color: 'text-[#a88865]', bg: 'bg-[#a88865]/15', symbol: 'N' },
  inaccuracy: { color: 'text-[#e69d00]', bg: 'bg-[#e69d00]/15', symbol: '?!' },
  mistake: { color: 'text-[#e6912c]', bg: 'bg-[#e6912c]/15', symbol: '?' },
  blunder: { color: 'text-[#cc3333]', bg: 'bg-[#cc3333]/15', symbol: '??' },
}
