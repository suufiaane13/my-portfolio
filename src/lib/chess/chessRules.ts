import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js'

export type { Color, PieceSymbol, Square }

export function createChess(fen?: string) {
  return fen ? new Chess(fen) : new Chess()
}

export function pieceUnicode(color: Color, type: PieceSymbol): string {
  const white: Record<PieceSymbol, string> = {
    k: '♔',
    q: '♕',
    r: '♖',
    b: '♗',
    n: '♘',
    p: '♙',
  }
  const black: Record<PieceSymbol, string> = {
    k: '♚',
    q: '♛',
    r: '♜',
    b: '♝',
    n: '♞',
    p: '♟',
  }
  return color === 'w' ? white[type] : black[type]
}

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const

export function squareAt(fileIndex: number, rankIndex: number): Square {
  return `${FILES[fileIndex]}${RANKS[rankIndex]}` as Square
}

export function fileIndexOf(square: Square): number {
  return square.charCodeAt(0) - 97
}

export function rankIndexOf(square: Square): number {
  return Number(square[1]) - 1
}

/** Pseudo-legal destinations for a premove (force player's turn in FEN). */
export function premoveTargets(chess: Chess, square: Square, playerColor: Color): Square[] {
  const parts = chess.fen().split(' ')
  parts[1] = playerColor
  try {
    const probe = new Chess(parts.join(' '))
    return probe.moves({ square, verbose: true }).map((move) => move.to)
  } catch {
    return []
  }
}

export function boardOrientationRanks(orientation: Color): number[] {
  return orientation === 'w' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]
}

export function boardOrientationFiles(orientation: Color): number[] {
  return orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0]
}

export function gameStatus(chess: Chess): 'playing' | 'check' | 'checkmate' | 'draw' {
  if (chess.isCheckmate()) return 'checkmate'
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
    return 'draw'
  }
  if (chess.inCheck()) return 'check'
  return 'playing'
}

/** Prefer a move that delivers checkmate immediately (mate in 1). */
export function findCheckmateMove(
  chess: Chess,
): { from: Square; to: Square; promotion?: PieceSymbol } | null {
  for (const move of chess.moves({ verbose: true })) {
    const probe = new Chess(chess.fen())
    probe.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    })
    if (probe.isCheckmate()) {
      return {
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      }
    }
  }
  return null
}
