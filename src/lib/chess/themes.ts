import {
  CHESS_BOARD_THEME_IDS,
  CHESS_PIECE_SET_IDS,
  DEFAULT_CHESS_BOARD_THEME,
  DEFAULT_CHESS_PIECE_SET,
  type ChessBoardThemeId,
  type ChessPieceSetId,
} from '@/lib/chess/themeCatalog.generated'
import type { Color, PieceSymbol } from '@/lib/chess/chessRules'

export type { ChessBoardThemeId, ChessPieceSetId }
export {
  CHESS_BOARD_THEME_IDS,
  CHESS_PIECE_SET_IDS,
  DEFAULT_CHESS_BOARD_THEME,
  DEFAULT_CHESS_PIECE_SET,
}

const PIECE_CODE: Record<PieceSymbol, string> = {
  k: 'K',
  q: 'Q',
  r: 'R',
  b: 'B',
  n: 'N',
  p: 'P',
}

const STORAGE_PIECE = 'susu-chess-piece-set'
const STORAGE_BOARD = 'susu-chess-board-theme'

export interface SolidBoardTheme {
  id: ChessBoardThemeId
  type: 'solid'
  light: string
  dark: string
  label: string
}

export interface ImageBoardTheme {
  id: ChessBoardThemeId
  type: 'image'
  path: string
  label: string
}

export type BoardTheme = SolidBoardTheme | ImageBoardTheme

const SOLID_BOARDS: Record<string, Omit<SolidBoardTheme, 'id'>> = {
  'portfolio-blue': { type: 'solid', light: '#dbeafe', dark: '#2563eb', label: 'Portfolio Blue' },
  'brown-solid': { type: 'solid', light: '#f0d9b5', dark: '#b58863', label: 'Brown' },
  'green-solid': { type: 'solid', light: '#eeeed2', dark: '#769656', label: 'Green' },
  'blue-solid': { type: 'solid', light: '#dee3e6', dark: '#8ca2ad', label: 'Blue' },
  'purple-solid': { type: 'solid', light: '#e8d5e8', dark: '#8f6b8f', label: 'Purple' },
  'ic-solid': { type: 'solid', light: '#ececec', dark: '#c1c18e', label: 'IC' },
  'red-solid': { type: 'solid', light: '#f5d5d5', dark: '#b04545', label: 'Red' },
  'teal-solid': { type: 'solid', light: '#d7ece8', dark: '#3d8b7a', label: 'Teal' },
  'grey-solid': { type: 'solid', light: '#e8e8e8', dark: '#7a7a7a', label: 'Grey' },
  'orange-solid': { type: 'solid', light: '#f5e0c8', dark: '#c47a3a', label: 'Orange' },
  'navy-solid': { type: 'solid', light: '#d9e2f0', dark: '#3a4f6f', label: 'Navy' },
  'rose-solid': { type: 'solid', light: '#f3d6e2', dark: '#a85575', label: 'Rose' },
  'walnut-solid': { type: 'solid', light: '#e8d5b5', dark: '#6b4423', label: 'Walnut' },
  'slate-solid': { type: 'solid', light: '#e2e8f0', dark: '#475569', label: 'Slate' },
}

export function pieceAssetUrl(setId: ChessPieceSetId, color: Color, type: PieceSymbol): string {
  // Lichess "mono" ships colorless SVGs: K.svg, Q.svg, …
  if (setId === 'mono') {
    return `/chess/themes/pieces/mono/${PIECE_CODE[type]}.svg`
  }
  const file = `${color}${PIECE_CODE[type]}.svg`
  return `/chess/themes/pieces/${setId}/${file}`
}

export function boardImageUrl(path: string): string {
  return `/chess/themes/${path.replace(/^\//, '')}`
}

/** Prefer exact extension from known image board ids when possible. */
export function boardThemeFromId(id: ChessBoardThemeId): BoardTheme {
  const solid = SOLID_BOARDS[id]
  if (solid) return { id, ...solid }

  // Common Lichess board extensions
  const pngIds = new Set([
    'blue',
    'brown',
    'green',
    'green-plastic',
    'ic',
    'pink-pyramid',
    'purple',
    'purple-diag',
    'ncf-board',
  ])
  const svgIds = new Set(['newspaper'])
  const ext = svgIds.has(id) ? 'svg' : pngIds.has(id) ? 'png' : 'jpg'
  return {
    id,
    type: 'image',
    path: `boards/${id}.${ext}`,
    label: id,
  }
}

export function readStoredPieceSet(): ChessPieceSetId {
  if (typeof window === 'undefined') return DEFAULT_CHESS_PIECE_SET
  const value = window.localStorage.getItem(STORAGE_PIECE)
  if (value && (CHESS_PIECE_SET_IDS as readonly string[]).includes(value)) {
    return value as ChessPieceSetId
  }
  return DEFAULT_CHESS_PIECE_SET
}

export function readStoredBoardTheme(): ChessBoardThemeId {
  if (typeof window === 'undefined') return DEFAULT_CHESS_BOARD_THEME
  const value = window.localStorage.getItem(STORAGE_BOARD)
  if (value && (CHESS_BOARD_THEME_IDS as readonly string[]).includes(value)) {
    return value as ChessBoardThemeId
  }
  return DEFAULT_CHESS_BOARD_THEME
}

export function storePieceSet(id: ChessPieceSetId) {
  window.localStorage.setItem(STORAGE_PIECE, id)
}

export function storeBoardTheme(id: ChessBoardThemeId) {
  window.localStorage.setItem(STORAGE_BOARD, id)
}

export function formatThemeLabel(id: string): string {
  return id
    .replace(/-solid$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/** Light/dark square colors for the evaluation bar (matches solid boards; approximates image boards). */
export function boardEvalColors(id: ChessBoardThemeId): { light: string; dark: string } {
  const theme = boardThemeFromId(id)
  if (theme.type === 'solid') return { light: theme.light, dark: theme.dark }

  const approx: Partial<Record<string, { light: string; dark: string }>> = {
    blue: { light: '#dee3e6', dark: '#8ca2ad' },
    blue2: { light: '#c7d4e0', dark: '#5a7a9a' },
    blue3: { light: '#d0dceb', dark: '#4a6b8a' },
    'blue-marble': { light: '#d5dde8', dark: '#5c6f8a' },
    brown: { light: '#f0d9b5', dark: '#b58863' },
    canvas2: { light: '#e8dcc8', dark: '#8a7355' },
    green: { light: '#eeeed2', dark: '#769656' },
    'green-plastic': { light: '#f0f0c8', dark: '#6d9b45' },
    grey: { light: '#e0e0e0', dark: '#7a7a7a' },
    horsey: { light: '#e8d4b8', dark: '#8b5a2b' },
    ic: { light: '#ececec', dark: '#c1c18e' },
    leather: { light: '#e6d0b0', dark: '#8b6914' },
    maple: { light: '#e8d5a8', dark: '#b5884e' },
    maple2: { light: '#edd9a8', dark: '#a67c4a' },
    marble: { light: '#e0ddd5', dark: '#7a7570' },
    metal: { light: '#d8dce0', dark: '#6a7380' },
    'ncf-board': { light: '#e8e4d8', dark: '#6b7c4a' },
    olive: { light: '#e4e0c8', dark: '#7a8a4a' },
    'pink-pyramid': { light: '#f0d8e0', dark: '#b06a8a' },
    purple: { light: '#e8d5e8', dark: '#8f6b8f' },
    'purple-diag': { light: '#e6d4e8', dark: '#7d5a8a' },
    wood: { light: '#e8c99b', dark: '#b58863' },
    wood2: { light: '#e3c090', dark: '#9e6b40' },
    wood3: { light: '#e6c9a0', dark: '#8b5a2b' },
    wood4: { light: '#ecd2a8', dark: '#a07040' },
    newspaper: { light: '#f2f0e8', dark: '#8a8a82' },
  }
  return approx[id] ?? { light: '#f0d9b5', dark: '#b58863' }
}

export function preloadBoardTheme(id: ChessBoardThemeId) {
  const theme = boardThemeFromId(id)
  if (theme.type !== 'image') return
  const img = new Image()
  img.decoding = 'async'
  img.src = boardImageUrl(theme.path)
}

export function preloadPieceSet(setId: ChessPieceSetId) {
  const types: PieceSymbol[] = ['k', 'q', 'r', 'b', 'n', 'p']
  for (const color of ['w', 'b'] as const) {
    for (const type of types) {
      const img = new Image()
      img.decoding = 'async'
      img.src = pieceAssetUrl(setId, color, type)
    }
  }
}
