export type ChessDifficulty = 'beginner' | 'intermediate' | 'expert'

export interface DifficultyPreset {
  id: ChessDifficulty
  /** UCI Skill Level 0–20 */
  skillLevel: number
  movetimeMs: number
  depth?: number
}

export interface SearchOptions {
  /** Skip `ucinewgame` so the hash table carries across analysis plies. */
  keepHash?: boolean
  /** Restrict root search to these UCI moves (space-separated). */
  searchMoves?: string
}

export const DIFFICULTY_PRESETS: Record<ChessDifficulty, DifficultyPreset & { approxElo: number }> = {
  beginner: { id: 'beginner', skillLevel: 3, movetimeMs: 250, approxElo: 1000 },
  intermediate: { id: 'intermediate', skillLevel: 10, movetimeMs: 800, approxElo: 1600 },
  expert: { id: 'expert', skillLevel: 20, movetimeMs: 3500, depth: 16, approxElo: 2400 },
}

/** Shorter Expert think time on small screens (plan: mobile perf). */
export function resolveDifficultyPreset(difficulty: ChessDifficulty): DifficultyPreset {
  const preset = DIFFICULTY_PRESETS[difficulty]
  if (difficulty !== 'expert') return preset
  if (typeof window === 'undefined') return preset
  const mobile = window.matchMedia('(max-width: 768px)').matches
  return mobile ? { ...preset, movetimeMs: 2200, depth: 14 } : preset
}

export type EngineEval =
  | { type: 'cp'; value: number }
  | { type: 'mate'; value: number }

export interface EngineSearchResult {
  bestMove: string
  ponder?: string
  evaluation?: EngineEval
}

type Listener = (line: string) => void

/**
 * Stockfish UCI wrapper (lite-single WASM via Worker).
 * Lazy-loads `/chess/stockfish-18-lite-single.js`.
 */
export class StockfishEngine {
  private worker: Worker | null = null
  private ready = false
  private listeners = new Set<Listener>()
  private initPromise: Promise<void> | null = null
  /** Serialize UCI searches — concurrent go commands corrupt bestmove pairing. */
  private searchTail: Promise<unknown> = Promise.resolve()
  private lastSkillLevel: number | null = null
  private limitStrengthOff = false

  async init(): Promise<void> {
    if (this.ready) return
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise<void>((resolve, reject) => {
      try {
        this.worker = new Worker('/chess/stockfish-18-lite-single.js')
      } catch (error) {
        reject(error)
        return
      }

      const onMessage = (event: MessageEvent<string>) => {
        const line = typeof event.data === 'string' ? event.data : String(event.data)
        for (const listener of this.listeners) listener(line)
        if (line === 'uciok' || line.startsWith('uciok')) {
          this.send('isready')
        }
        if (line === 'readyok' || line.startsWith('readyok')) {
          this.ready = true
          this.worker?.removeEventListener('message', onMessage)
          this.worker?.addEventListener('message', (e: MessageEvent<string>) => {
            const text = typeof e.data === 'string' ? e.data : String(e.data)
            for (const listener of this.listeners) listener(text)
          })
          resolve()
        }
      }

      this.worker.addEventListener('message', onMessage)
      this.worker.addEventListener('error', (err) => reject(err))
      this.send('uci')
    })

    return this.initPromise
  }

  private send(command: string) {
    this.worker?.postMessage(command)
  }

  private onLine(listener: Listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  async setDifficulty(preset: DifficultyPreset): Promise<void> {
    await this.init()
    if (this.lastSkillLevel !== preset.skillLevel) {
      this.send(`setoption name Skill Level value ${preset.skillLevel}`)
      this.lastSkillLevel = preset.skillLevel
    }
    if (preset.id === 'expert' && !this.limitStrengthOff) {
      this.send('setoption name UCI_LimitStrength value false')
      this.send('setoption name Contempt value 0')
      this.limitStrengthOff = true
    }
  }

  async getBestMove(
    fen: string,
    preset: DifficultyPreset,
    options?: SearchOptions,
  ): Promise<EngineSearchResult> {
    await this.init()

    const run = async (): Promise<EngineSearchResult> => {
      await this.setDifficulty(preset)
      // Abort any leftover search before starting a new one
      this.send('stop')

      return new Promise((resolve, reject) => {
        let evaluation: EngineEval | undefined
        let settled = false

        const timeout = window.setTimeout(() => {
          if (settled) return
          settled = true
          unsubscribe()
          this.send('stop')
          reject(new Error('Stockfish search timed out'))
        }, Math.max(12000, preset.movetimeMs + 8000))

        const unsubscribe = this.onLine((line) => {
          if (line.startsWith('info ') && line.includes(' score ')) {
            const mateMatch = line.match(/\bscore mate (-?\d+)/)
            const cpMatch = line.match(/\bscore cp (-?\d+)/)
            if (mateMatch) {
              evaluation = { type: 'mate', value: Number(mateMatch[1]) }
            } else if (cpMatch) {
              evaluation = { type: 'cp', value: Number(cpMatch[1]) }
            }
          }

          if (line.startsWith('bestmove ')) {
            if (settled) return
            settled = true
            window.clearTimeout(timeout)
            unsubscribe()
            const parts = line.split(/\s+/)
            const bestMove = parts[1]
            if (!bestMove || bestMove === '(none)') {
              reject(new Error('No legal move from engine'))
              return
            }
            const ponder = parts[2] === 'ponder' ? parts[3] : undefined
            resolve({ bestMove, ponder, evaluation })
          }
        })

        if (!options?.keepHash) {
          this.send('ucinewgame')
        }
        this.send(`position fen ${fen}`)
        const searchMoves = options?.searchMoves?.trim()
        if (preset.depth) {
          this.send(
            searchMoves
              ? `go depth ${preset.depth} searchmoves ${searchMoves}`
              : `go depth ${preset.depth}`,
          )
        } else {
          this.send(
            searchMoves
              ? `go movetime ${preset.movetimeMs} searchmoves ${searchMoves}`
              : `go movetime ${preset.movetimeMs}`,
          )
        }
      })
    }

    const result = this.searchTail.then(run, run)
    this.searchTail = result.then(
      () => undefined,
      () => undefined,
    )
    return result
  }

  async evaluate(fen: string, movetimeMs = 400): Promise<EngineEval | null> {
    try {
      const result = await this.getBestMove(fen, {
        id: 'intermediate',
        skillLevel: 20,
        movetimeMs,
      })
      return result.evaluation ?? null
    } catch {
      return null
    }
  }

  dispose() {
    this.worker?.terminate()
    this.worker = null
    this.ready = false
    this.initPromise = null
    this.listeners.clear()
    this.lastSkillLevel = null
    this.limitStrengthOff = false
  }
}

export function uciToMove(uci: string): { from: string; to: string; promotion?: string } {
  const from = uci.slice(0, 2)
  const to = uci.slice(2, 4)
  const promotion = uci.length > 4 ? uci[4] : undefined
  return { from, to, promotion }
}

export function moveToUci(from: string, to: string, promotion?: string | null): string {
  return `${from}${to}${promotion ?? ''}`
}
