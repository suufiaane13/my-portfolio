/**
 * Chess sounds from Lichess woodland set (`public/chess/sounds/default/`).
 * Upstream: https://github.com/lichess-org/lila/tree/master/public/sound
 * Chess.com sounds are proprietary and not used.
 */

export type ChessSoundName =
  | 'moveSelf'
  | 'moveOpponent'
  | 'capture'
  | 'check'
  | 'checkmate'
  | 'castle'
  | 'promote'
  | 'victory'
  | 'defeat'
  | 'draw'
  | 'gameStart'
  | 'gameEnd'
  | 'illegal'

const SOUND_FILES: Record<ChessSoundName, string> = {
  moveSelf: '/chess/sounds/default/move-self.mp3',
  moveOpponent: '/chess/sounds/default/move-opponent.mp3',
  capture: '/chess/sounds/default/capture.mp3',
  check: '/chess/sounds/default/move-check.mp3',
  checkmate: '/chess/sounds/default/game-end.mp3',
  castle: '/chess/sounds/default/castle.mp3',
  promote: '/chess/sounds/default/promote.mp3',
  victory: '/chess/sounds/default/game-win.mp3',
  defeat: '/chess/sounds/default/game-end.mp3',
  draw: '/chess/sounds/default/game-draw.mp3',
  gameStart: '/chess/sounds/default/game-start.mp3',
  gameEnd: '/chess/sounds/default/game-end.mp3',
  illegal: '/chess/sounds/default/illegal.mp3',
}

const cache = new Map<ChessSoundName, HTMLAudioElement>()

function getAudio(name: ChessSoundName): HTMLAudioElement | null {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return null
  const cached = cache.get(name)
  if (cached) return cached
  const audio = new Audio(SOUND_FILES[name])
  audio.preload = 'auto'
  cache.set(name, audio)
  return audio
}

export function preloadChessSounds() {
  for (const name of Object.keys(SOUND_FILES) as ChessSoundName[]) {
    getAudio(name)?.load()
  }
}

export function playChessSound(name: ChessSoundName, enabled = true) {
  if (!enabled) return
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const base = getAudio(name)
  if (!base) return

  const audio = base.cloneNode(true) as HTMLAudioElement
  audio.volume = 0.9
  void audio.play().catch(() => {})
}

/** Priority: checkmate > check > capture > castle > promote > move */
export function chessSoundFromSan(san: string, isPlayerMove: boolean): ChessSoundName {
  if (san.includes('#')) return 'checkmate'
  if (san.includes('+')) return 'check'
  if (san.includes('x')) return 'capture'
  if (san === 'O-O' || san === 'O-O-O') return 'castle'
  if (san.includes('=')) return 'promote'
  return isPlayerMove ? 'moveSelf' : 'moveOpponent'
}

export function chessSoundFromOutcome(outcome: 'win' | 'loss' | 'draw'): ChessSoundName {
  if (outcome === 'win') return 'victory'
  if (outcome === 'loss') return 'defeat'
  return 'draw'
}
