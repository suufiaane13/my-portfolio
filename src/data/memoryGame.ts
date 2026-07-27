export type CardId =
  | 'compass'
  | 'waves'
  | 'chess'
  | 'mountain'
  | 'moon'
  | 'palm'
  | 'camera'
  | 'coffee'
  | 'plane'
  | 'book'
  | 'music'
  | 'star'
  | 'sun'
  | 'anchor'
  | 'flower'
  | 'globe'
  | 'sparkles'
  | 'diamond'

export type GridSize = 4 | 6

export interface MemoryCardTheme {
  id: CardId
}

/** 8 paires — grille 4×4 */
export const coreCards: MemoryCardTheme[] = [
  { id: 'compass' },
  { id: 'waves' },
  { id: 'chess' },
  { id: 'mountain' },
  { id: 'moon' },
  { id: 'palm' },
  { id: 'camera' },
  { id: 'coffee' },
]

/** 10 paires supplémentaires — grille 6×6 */
export const extendedCards: MemoryCardTheme[] = [
  { id: 'plane' },
  { id: 'book' },
  { id: 'music' },
  { id: 'star' },
  { id: 'sun' },
  { id: 'anchor' },
  { id: 'flower' },
  { id: 'globe' },
  { id: 'sparkles' },
  { id: 'diamond' },
]

export function getCardsForGrid(size: GridSize): MemoryCardTheme[] {
  return size === 4 ? coreCards : [...coreCards, ...extendedCards]
}

export function getPairCount(size: GridSize) {
  return size === 4 ? 8 : 18
}

/** @deprecated alias */
export const coreSkills = coreCards
export const extendedSkills = extendedCards
export const getSkillsForGrid = getCardsForGrid
export type SkillId = CardId
