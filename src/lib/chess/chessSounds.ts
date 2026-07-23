/**
 * Chess sounds from Lichess (open-source).
 * - move / capture / select / confirmation / error → standard
 * - check → woodland Check
 * - checkmate → woodland Explosion (Lichess Checkmate ≈ Check; Victory kept for wins only)
 * - victory / defeat / draw → woodland
 * Chess.com sounds are proprietary and not used.
 * Upstream: https://github.com/lichess-org/lila/tree/master/public/sound
 */

export type ChessSoundName =
  | 'move'
  | 'capture'
  | 'check'
  | 'checkmate'
  | 'victory'
  | 'defeat'
  | 'draw'
  | 'select'
  | 'confirmation'
  | 'error'

const SOUND_FILES: Record<ChessSoundName, string> = {
  move: '/chess/sounds/move.mp3',
  capture: '/chess/sounds/capture.mp3',
  check: '/chess/sounds/check.mp3',
  checkmate: '/chess/sounds/checkmate.mp3',
  victory: '/chess/sounds/victory.mp3',
  defeat: '/chess/sounds/defeat.mp3',
  draw: '/chess/sounds/draw.mp3',
  select: '/chess/sounds/select.mp3',
  confirmation: '/chess/sounds/confirmation.mp3',
  error: '/chess/sounds/error.mp3',
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

/** Same priority as Lichess sound.move(san). */
export function chessSoundFromSan(san: string): ChessSoundName {
  if (san.includes('#')) return 'checkmate'
  if (san.includes('+')) return 'check'
  if (san.includes('x')) return 'capture'
  return 'move'
}

export function chessSoundFromOutcome(outcome: 'win' | 'loss' | 'draw'): ChessSoundName {
  if (outcome === 'win') return 'victory'
  if (outcome === 'loss') return 'defeat'
  return 'draw'
}
