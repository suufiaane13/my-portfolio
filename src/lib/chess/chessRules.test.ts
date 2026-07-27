import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { findCheckmateMove, gameStatus } from '@/lib/chess/chessRules'
import { OPENING_BOOK, pickBookMove } from '@/lib/chess/openingBook'
import { moveToUci, uciToMove } from '@/lib/chess/stockfishEngine'

describe('chess rules (FIDE via chess.js)', () => {
  it('allows kingside castling when legal', () => {
    const chess = new Chess('rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4')
    const move = chess.move('O-O')
    expect(move).toBeTruthy()
    expect(chess.get('g1')?.type).toBe('k')
    expect(chess.get('f1')?.type).toBe('r')
  })

  it('supports en passant capture', () => {
    const chess = new Chess('rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3')
    const move = chess.move({ from: 'e5', to: 'd6' })
    expect(move?.flags).toContain('e')
    expect(chess.get('d6')?.type).toBe('p')
    expect(chess.get('d5')).toBeUndefined()
  })

  it('supports promotion', () => {
    const chess = new Chess('8/4P3/8/8/8/8/8/4K2k w - - 0 1')
    const move = chess.move({ from: 'e7', to: 'e8', promotion: 'q' })
    expect(move?.promotion).toBe('q')
    expect(chess.get('e8')?.type).toBe('q')
  })

  it('detects stalemate as draw', () => {
    const chess = new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1')
    expect(chess.isStalemate()).toBe(true)
    expect(gameStatus(chess)).toBe('draw')
  })

  it('detects checkmate', () => {
    const chess = new Chess(
      'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4',
    )
    expect(chess.isCheckmate()).toBe(true)
    expect(gameStatus(chess)).toBe('checkmate')
  })

  it('finds a mate-in-one move', () => {
    const chess = new Chess(
      'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    )
    const mate = findCheckmateMove(chess)
    expect(mate).toEqual({ from: 'h5', to: 'f7', promotion: undefined })
  })
})

describe('opening book', () => {
  it('picks a weighted reply from the root', () => {
    const pick = pickBookMove(OPENING_BOOK, [])
    expect(pick?.move).toMatch(/^[a-h][1-8][a-h][1-8]$/)
  })
})

describe('uci helpers', () => {
  it('round-trips uci moves with promotion', () => {
    expect(moveToUci('e7', 'e8', 'q')).toBe('e7e8q')
    expect(uciToMove('e7e8q')).toEqual({ from: 'e7', to: 'e8', promotion: 'q' })
  })
})
