/**
 * Compact opening book keyed by UCI move history from the start position.
 * Values are weighted reply moves (UCI). Derived from common master lines (not a full DB).
 */
export type OpeningBook = Record<string, Array<{ move: string; weight: number; name?: string }>>

export const OPENING_BOOK: OpeningBook = {
  '': [
    { move: 'e2e4', weight: 40, name: 'King’s Pawn' },
    { move: 'd2d4', weight: 35, name: 'Queen’s Pawn' },
    { move: 'c2c4', weight: 12, name: 'English' },
    { move: 'g1f3', weight: 13, name: 'Réti / Nf3' },
  ],
  e2e4: [
    { move: 'e7e5', weight: 45, name: 'Open Game' },
    { move: 'c7c5', weight: 35, name: 'Sicilian' },
    { move: 'e7e6', weight: 12, name: 'French' },
    { move: 'c7c6', weight: 8, name: 'Caro-Kann' },
  ],
  'e2e4 e7e5': [
    { move: 'g1f3', weight: 70, name: 'Open Game' },
    { move: 'f2f4', weight: 10, name: 'King’s Gambit' },
    { move: 'b1c3', weight: 20, name: 'Vienna' },
  ],
  'e2e4 e7e5 g1f3': [
    { move: 'b8c6', weight: 75, name: 'Open Game' },
    { move: 'g8f6', weight: 25, name: 'Petrov' },
  ],
  'e2e4 e7e5 g1f3 b8c6': [
    { move: 'f1b5', weight: 40, name: 'Ruy Lopez' },
    { move: 'f1c4', weight: 30, name: 'Italian' },
    { move: 'd2d4', weight: 20, name: 'Scotch' },
    { move: 'b1c3', weight: 10, name: 'Three Knights' },
  ],
  'e2e4 c7c5': [
    { move: 'g1f3', weight: 80, name: 'Open Sicilian' },
    { move: 'b1c3', weight: 12, name: 'Closed Sicilian' },
    { move: 'c2c3', weight: 8, name: 'Alapin' },
  ],
  'e2e4 c7c5 g1f3': [
    { move: 'd7d6', weight: 45, name: 'Sicilian Najdorf/Scheveningen' },
    { move: 'b8c6', weight: 35, name: 'Sicilian Classical' },
    { move: 'e7e6', weight: 20, name: 'Sicilian Kan/Taimanov' },
  ],
  'e2e4 c7c5 g1f3 d7d6': [
    { move: 'd2d4', weight: 90, name: 'Open Sicilian' },
    { move: 'f1b5', weight: 10, name: 'Moscow' },
  ],
  'e2e4 e7e6': [
    { move: 'd2d4', weight: 85, name: 'French' },
    { move: 'b1c3', weight: 15 },
  ],
  'e2e4 e7e6 d2d4': [
    { move: 'd7d5', weight: 95, name: 'French Defence' },
  ],
  'e2e4 c7c6': [
    { move: 'd2d4', weight: 85, name: 'Caro-Kann' },
    { move: 'b1c3', weight: 15 },
  ],
  d2d4: [
    { move: 'd7d5', weight: 40, name: 'Queen’s Gambit Declined lines' },
    { move: 'g8f6', weight: 45, name: 'Indian Defence' },
    { move: 'f7f5', weight: 8, name: 'Dutch' },
    { move: 'e7e6', weight: 7 },
  ],
  'd2d4 d7d5': [
    { move: 'c2c4', weight: 70, name: 'Queen’s Gambit' },
    { move: 'g1f3', weight: 30 },
  ],
  'd2d4 d7d5 c2c4': [
    { move: 'e7e6', weight: 50, name: 'QGD' },
    { move: 'c7c6', weight: 35, name: 'Slav' },
    { move: 'd5c4', weight: 15, name: 'QGA' },
  ],
  'd2d4 g8f6': [
    { move: 'c2c4', weight: 70, name: 'Indian systems' },
    { move: 'g1f3', weight: 30 },
  ],
  'd2d4 g8f6 c2c4': [
    { move: 'e7e6', weight: 40, name: 'Nimzo/Queen’s Indian' },
    { move: 'g7g6', weight: 35, name: 'King’s Indian / Grünfeld' },
    { move: 'c7c5', weight: 15, name: 'Benoni' },
    { move: 'e7e5', weight: 10, name: 'Budapest' },
  ],
  c2c4: [
    { move: 'e7e5', weight: 40, name: 'Reversed Sicilian' },
    { move: 'g8f6', weight: 35 },
    { move: 'c7c5', weight: 15, name: 'Symmetrical' },
    { move: 'e7e6', weight: 10 },
  ],
  g1f3: [
    { move: 'd7d5', weight: 40 },
    { move: 'g8f6', weight: 40 },
    { move: 'c7c5', weight: 20 },
  ],
}

export function bookKeyFromHistory(uciMoves: string[]): string {
  return uciMoves.join(' ')
}

export function pickBookMove(
  book: OpeningBook,
  uciMoves: string[],
): { move: string; name?: string } | null {
  const entries = book[bookKeyFromHistory(uciMoves)]
  if (!entries?.length) return null

  const total = entries.reduce((sum, item) => sum + item.weight, 0)
  let roll = Math.random() * total
  for (const entry of entries) {
    roll -= entry.weight
    if (roll <= 0) return { move: entry.move, name: entry.name }
  }
  const last = entries[entries.length - 1]!
  return { move: last.move, name: last.name }
}

export function openingNameForHistory(book: OpeningBook, uciMoves: string[]): string | null {
  for (let i = uciMoves.length; i >= 0; i -= 1) {
    const key = bookKeyFromHistory(uciMoves.slice(0, i))
    const entries = book[key]
    if (!entries?.length) continue
    const named = entries.find((item) => item.name)
    if (named?.name) return named.name
  }
  return null
}
