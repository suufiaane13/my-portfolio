import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Chess, Square } from 'chess.js'
import {
  createChess,
  findCheckmateMove,
  gameStatus,
  premoveTargets,
  type Color,
  type PieceSymbol,
} from '@/lib/chess/chessRules'
import {
  analyzePlayedMove,
  replayToPly,
  type ClassifiedMove,
  type MoveQuality,
} from '@/lib/chess/moveQuality'
import { markSkipMoveAnimation } from '@/lib/chess/moveAnimSkip'
import { OPENING_BOOK, openingNameForHistory, pickBookMove } from '@/lib/chess/openingBook'
import {
  StockfishEngine,
  moveToUci,
  resolveDifficultyPreset,
  uciToMove,
  type ChessDifficulty,
  type EngineEval,
} from '@/lib/chess/stockfishEngine'

export type ChessOutcome = 'win' | 'loss' | 'draw' | null

interface UseChessGameOptions {
  playerColor: Color
  difficulty: ChessDifficulty
}

export function useChessGame({ playerColor, difficulty }: UseChessGameOptions) {
  const [liveChess] = useState(() => createChess())
  const [, setTick] = useState(0)
  const [selected, setSelected] = useState<Square | null>(null)
  const [legalTargets, setLegalTargets] = useState<Square[]>([])
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null)
  const [animateLastMove, setAnimateLastMove] = useState(true)
  /** Explicit slide for history scrub (supports reverse when going backward). */
  const [slideAnim, setSlideAnim] = useState<{
    from: Square
    to: Square
    reverse: boolean
    key: string
  } | null>(null)
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square
    to: Square
  } | null>(null)
  const [thinking, setThinking] = useState(false)
  const [engineReady, setEngineReady] = useState(false)
  const [engineError, setEngineError] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<EngineEval | null>(null)
  const [reviewEval, setReviewEval] = useState<EngineEval | null>(null)
  const [moves, setMoves] = useState<ClassifiedMove[]>([])
  const [viewPly, setViewPly] = useState(0)
  const [resigned, setResigned] = useState(false)
  const [hintSquare, setHintSquare] = useState<Square | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [premove, setPremove] = useState<{ from: Square; to: Square } | null>(null)
  const premoveViaDragRef = useRef(false)
  const pendingPromoViaDragRef = useRef(false)

  const engineRef = useRef<StockfishEngine | null>(null)
  const botBusy = useRef(false)
  const analyzeBusy = useRef(false)
  const followLive = useRef(true)
  const reviewEvalGen = useRef(0)
  const viewPlyRef = useRef(viewPly)
  viewPlyRef.current = viewPly
  const movesRef = useRef(moves)
  movesRef.current = moves

  const refresh = useCallback(() => setTick((value) => value + 1), [])

  const uciHistory = useMemo(() => moves.map((move) => move.uci), [moves])
  const atLive = viewPly >= moves.length

  const status = resigned ? 'draw' : gameStatus(liveChess)
  const turn = liveChess.turn()
  const isPlayerTurn =
    !resigned && status !== 'checkmate' && status !== 'draw' && turn === playerColor && atLive

  const outcome: ChessOutcome = useMemo(() => {
    if (resigned) return 'loss'
    if (status === 'checkmate') {
      return turn === playerColor ? 'loss' : 'win'
    }
    if (status === 'draw') return 'draw'
    return null
  }, [playerColor, resigned, status, turn])

  const openingName = useMemo(
    () => openingNameForHistory(OPENING_BOOK, uciHistory),
    [uciHistory],
  )

  const displayChess = useMemo(() => {
    if (atLive) return liveChess
    return replayToPly(moves, viewPly)
  }, [atLive, liveChess, moves, viewPly])

  const displayLastMove = useMemo(() => {
    if (viewPly <= 0) return null
    const move = moves[viewPly - 1]
    if (!move) return null
    return { from: move.from as Square, to: move.to as Square }
  }, [moves, viewPly])

  const viewedMove = viewPly > 0 ? moves[viewPly - 1] ?? null : null

  // Keep eval bar in sync with the displayed position (arrows / notation / live)
  useEffect(() => {
    if (!engineReady || analyzing || thinking) return
    const engine = engineRef.current
    if (!engine) return

    const gen = ++reviewEvalGen.current
    const fen = displayChess.fen()
    const sideToMove = displayChess.turn()

    void engine.evaluate(fen, 160).then((result) => {
      if (gen !== reviewEvalGen.current || !result) return
      const flip = sideToMove === 'b' ? -1 : 1
      setReviewEval({
        type: result.type,
        value: result.value * flip,
      })
    })
  }, [analyzing, displayChess, engineReady, thinking, viewPly])

  useEffect(() => {
    const engine = new StockfishEngine()
    engineRef.current = engine
    void engine
      .init()
      .then(() => setEngineReady(true))
      .catch(() => setEngineError('engine'))
    return () => engine.dispose()
  }, [])

  const applyMove = useCallback(
    (
      from: Square,
      to: Square,
      promotion?: PieceSymbol,
      meta?: { isBook?: boolean; animate?: boolean },
    ) => {
      const fenBefore = liveChess.fen()
      const move = liveChess.move({ from, to, promotion })
      if (!move) return false
      const uci = moveToUci(from, to, promotion)
      const entry: ClassifiedMove = {
        uci,
        san: move.san,
        from,
        to,
        fenBefore,
        isBook: meta?.isBook,
        quality: meta?.isBook ? 'book' : undefined,
      }
      setMoves((history) => {
        const next = [...history, entry]
        if (followLive.current) setViewPly(next.length)
        return next
      })
      setLastMove({ from, to })
      const shouldAnimate = meta?.animate !== false
      if (!shouldAnimate) markSkipMoveAnimation()
      setAnimateLastMove(shouldAnimate)
      // Live move uses lastMove slide (forward) — clear history scrub anim
      setSlideAnim(
        shouldAnimate
          ? {
              from,
              to,
              reverse: false,
              key: `live:${uci}:${Date.now()}`,
            }
          : null,
      )
      setSelected(null)
      setLegalTargets([])
      setPendingPromotion(null)
      setHintSquare(null)
      refresh()
      return true
    },
    [liveChess, refresh],
  )

  useEffect(() => {
    if (followLive.current) setViewPly(moves.length)
  }, [moves.length])

  const playBotMove = useCallback(async () => {
    if (botBusy.current || resigned) return
    if (gameStatus(liveChess) === 'checkmate' || gameStatus(liveChess) === 'draw') return
    if (liveChess.turn() === playerColor) return

    botBusy.current = true
    setThinking(true)
    setEngineError(null)
    const thinkStarted = Date.now()
    const preset = resolveDifficultyPreset(difficulty)
    /** Even book replies wait a bit so opening moves don't feel instant. */
    const minThinkMs = Math.max(450, Math.min(900, Math.round(preset.movetimeMs * 0.45)))

    const waitMinThink = async () => {
      const elapsed = Date.now() - thinkStarted
      if (elapsed < minThinkMs) {
        await new Promise((resolve) => window.setTimeout(resolve, minThinkMs - elapsed))
      }
    }

    try {
      // Never miss a mate in 1 (book / weak search can otherwise skip it)
      const mateMove = findCheckmateMove(liveChess)
      if (mateMove) {
        await waitMinThink()
        applyMove(mateMove.from, mateMove.to, mateMove.promotion)
        setEvaluation({ type: 'mate', value: 1 })
        return
      }

      // Expert skips the opening book — play full strength from move 1
      const useBook = difficulty !== 'expert'
      const bookPick = useBook ? pickBookMove(OPENING_BOOK, uciHistory) : null
      if (
        bookPick &&
        liveChess
          .moves({ verbose: true })
          .some((m) => moveToUci(m.from, m.to, m.promotion) === bookPick.move)
      ) {
        await waitMinThink()
        const parsed = uciToMove(bookPick.move)
        applyMove(
          parsed.from as Square,
          parsed.to as Square,
          parsed.promotion as PieceSymbol | undefined,
          { isBook: true },
        )
        return
      }

      const engine = engineRef.current
      if (!engine) throw new Error('no engine')
      const sideToMove = liveChess.turn()
      const result = await engine.getBestMove(liveChess.fen(), preset)
      await waitMinThink()
      if (result.evaluation) {
        const flip = sideToMove === 'b' ? -1 : 1
        setEvaluation({
          type: result.evaluation.type,
          value: result.evaluation.value * flip,
        })
      }
      const parsed = uciToMove(result.bestMove)
      applyMove(
        parsed.from as Square,
        parsed.to as Square,
        parsed.promotion as PieceSymbol | undefined,
      )
    } catch {
      await waitMinThink()
      const legal = liveChess.moves({ verbose: true })
      const pick = legal[Math.floor(Math.random() * legal.length)]
      if (pick) applyMove(pick.from, pick.to, pick.promotion)
      else setEngineError('engine')
    } finally {
      setThinking(false)
      botBusy.current = false
    }
  }, [applyMove, difficulty, liveChess, playerColor, resigned, uciHistory])

  useEffect(() => {
    if (!engineReady || resigned) return
    const current = gameStatus(liveChess)
    if (current === 'checkmate' || current === 'draw') return
    if (liveChess.turn() === playerColor) return
    void playBotMove()
  }, [engineReady, liveChess, playBotMove, playerColor, resigned, uciHistory.length])

  useEffect(() => {
    if (!engineReady || resigned) return
    if (playerColor !== 'b') return
    if (uciHistory.length !== 0) return
    if (liveChess.turn() !== 'w') return
    void playBotMove()
  }, [engineReady, liveChess, playBotMove, playerColor, resigned, uciHistory.length])

  // Full post-game analysis — reveal glyphs progressively as each move is classified
  useEffect(() => {
    if (!outcome || !engineReady || analyzeBusy.current) return
    if (moves.length === 0) return
    if (moves.every((move) => move.quality)) return

    const engine = engineRef.current
    if (!engine) return

    const snapshot = moves
    let cancelled = false
    analyzeBusy.current = true
    setAnalyzing(true)

    void (async () => {
      try {
        // Player moves first so glyphs + Elo appear sooner; bot moves fill in after
        const order = [
          ...snapshot
            .map((move, index) => ({ move, index }))
            .filter(({ move }) => move.fenBefore.includes(' ' + playerColor + ' ')),
          ...snapshot
            .map((move, index) => ({ move, index }))
            .filter(({ move }) => !move.fenBefore.includes(' ' + playerColor + ' ')),
        ]

        for (const { move: current, index } of order) {
          if (cancelled) return
          if (current.quality) continue
          // Re-read in case a progressive update already filled this index
          // (snapshot is frozen; quality check uses snapshot — skip if already set there)
          if (snapshot[index]?.quality) continue

          let result: Pick<ClassifiedMove, 'quality' | 'cpl'>
          try {
            result = await analyzePlayedMove(engine, current)
          } catch {
            result = { quality: 'good' as MoveQuality, cpl: 0 }
          }
          if (cancelled) return

          snapshot[index] = { ...current, ...result }
          setMoves((history) =>
            history.map((move, i) => (i === index ? { ...move, ...result } : move)),
          )
        }
      } finally {
        analyzeBusy.current = false
        if (!cancelled) setAnalyzing(false)
      }
    })()

    return () => {
      cancelled = true
      analyzeBusy.current = false
    }
    // Only re-run when a new game ends — not on each progressive quality update
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot taken once per outcome
  }, [engineReady, outcome, moves.length, playerColor])

  const canPremove =
    atLive &&
    !resigned &&
    !outcome &&
    !pendingPromotion &&
    !isPlayerTurn &&
    liveChess.turn() !== playerColor

  /** Select piece without toggle — used when starting a drag/hold. */
  const selectPiece = useCallback(
    (square: Square) => {
      if (pendingPromotion || resigned || !atLive || outcome) return
      const piece = liveChess.get(square)
      if (!piece || piece.color !== playerColor) return

      if (isPlayerTurn && !thinking) {
        setSelected(square)
        setLegalTargets(liveChess.moves({ square, verbose: true }).map((move) => move.to))
        return
      }

      if (canPremove) {
        setSelected(square)
        setLegalTargets(premoveTargets(liveChess, square, playerColor))
        setPremove(null)
      }
    },
    [
      atLive,
      canPremove,
      isPlayerTurn,
      liveChess,
      outcome,
      pendingPromotion,
      playerColor,
      resigned,
      thinking,
    ],
  )

  const selectSquare = useCallback(
    (square: Square, opts?: { viaDrag?: boolean }) => {
      if (pendingPromotion || resigned || !atLive || outcome) return
      const viaDrag = Boolean(opts?.viaDrag)

      // Premoves while the bot is thinking / to move
      if (!isPlayerTurn || thinking) {
        if (!canPremove) return
        const piece = liveChess.get(square)

        if (selected) {
          if (selected === square) {
            setSelected(null)
            setLegalTargets([])
            setPremove(null)
            premoveViaDragRef.current = false
            return
          }

          if (legalTargets.includes(square)) {
            setPremove({ from: selected, to: square })
            premoveViaDragRef.current = viaDrag
            setSelected(null)
            setLegalTargets([])
            return
          }

          if (piece && piece.color === playerColor) {
            setSelected(square)
            setLegalTargets(premoveTargets(liveChess, square, playerColor))
            setPremove(null)
            premoveViaDragRef.current = false
            return
          }

          setSelected(null)
          setLegalTargets([])
          return
        }

        if (piece && piece.color === playerColor) {
          setSelected(square)
          setLegalTargets(premoveTargets(liveChess, square, playerColor))
          setPremove(null)
          premoveViaDragRef.current = false
        } else if (premove && (premove.from === square || premove.to === square)) {
          setPremove(null)
          premoveViaDragRef.current = false
        }
        return
      }

      const piece = liveChess.get(square)
      if (selected) {
        if (selected === square) {
          setSelected(null)
          setLegalTargets([])
          return
        }

        const legal = liveChess
          .moves({ square: selected, verbose: true })
          .find((move) => move.to === square)

        if (legal) {
          setPremove(null)
          premoveViaDragRef.current = false
          if (legal.promotion) {
            pendingPromoViaDragRef.current = viaDrag
            setPendingPromotion({ from: selected, to: square })
            return
          }
          applyMove(selected, square, undefined, { animate: !viaDrag })
          return
        }

        if (piece && piece.color === playerColor) {
          setSelected(square)
          setLegalTargets(
            liveChess.moves({ square, verbose: true }).map((move) => move.to),
          )
          return
        }

        setSelected(null)
        setLegalTargets([])
        return
      }

      if (piece && piece.color === playerColor) {
        setSelected(square)
        setLegalTargets(liveChess.moves({ square, verbose: true }).map((move) => move.to))
      }
    },
    [
      applyMove,
      atLive,
      canPremove,
      isPlayerTurn,
      legalTargets,
      liveChess,
      outcome,
      pendingPromotion,
      playerColor,
      premove,
      resigned,
      selected,
      thinking,
    ],
  )

  // Execute queued premove once it becomes the player's turn
  useEffect(() => {
    if (!isPlayerTurn || thinking || pendingPromotion || !premove || !atLive || outcome) return

    const legal = liveChess
      .moves({ square: premove.from, verbose: true })
      .find((move) => move.to === premove.to)

    if (!legal) {
      setPremove(null)
      premoveViaDragRef.current = false
      return
    }

    const { from, to } = premove
    const viaDrag = premoveViaDragRef.current
    setPremove(null)
    premoveViaDragRef.current = false
    if (legal.promotion) {
      pendingPromoViaDragRef.current = viaDrag
      setPendingPromotion({ from, to })
      return
    }
    applyMove(from, to, undefined, { animate: !viaDrag })
  }, [
    applyMove,
    atLive,
    isPlayerTurn,
    liveChess,
    outcome,
    pendingPromotion,
    premove,
    thinking,
  ])

  const confirmPromotion = useCallback(
    (piece: PieceSymbol) => {
      if (!pendingPromotion) return
      const viaDrag = pendingPromoViaDragRef.current
      pendingPromoViaDragRef.current = false
      setPremove(null)
      applyMove(pendingPromotion.from, pendingPromotion.to, piece, { animate: !viaDrag })
    },
    [applyMove, pendingPromotion],
  )

  const resign = useCallback(() => {
    setResigned(true)
    setSelected(null)
    setLegalTargets([])
    setPremove(null)
  }, [])

  const reset = useCallback(() => {
    liveChess.reset()
    setSelected(null)
    setLegalTargets([])
    setLastMove(null)
    setSlideAnim(null)
    setPendingPromotion(null)
    setPremove(null)
    setMoves([])
    setViewPly(0)
    followLive.current = true
    setResigned(false)
    setEvaluation(null)
    setReviewEval(null)
    setHintSquare(null)
    setEngineError(null)
    refresh()
  }, [liveChess, refresh])

  const requestHint = useCallback(async () => {
    if (!isPlayerTurn || thinking) return
    try {
      const engine = engineRef.current
      if (!engine) return
      setThinking(true)
      const result = await engine.getBestMove(liveChess.fen(), {
        id: 'beginner',
        skillLevel: 8,
        movetimeMs: 400,
      })
      const parsed = uciToMove(result.bestMove)
      setHintSquare(parsed.to as Square)
      setSelected(parsed.from as Square)
      setLegalTargets(
        liveChess
          .moves({ square: parsed.from as Square, verbose: true })
          .map((move) => move.to),
      )
    } catch {
      setEngineError('engine')
    } finally {
      setThinking(false)
    }
  }, [isPlayerTurn, liveChess, thinking])

  const goPrev = useCallback(() => {
    const ply = viewPlyRef.current
    if (ply <= 0) return
    const undone = movesRef.current[ply - 1]
    followLive.current = false
    if (undone) {
      setSlideAnim({
        from: undone.from as Square,
        to: undone.to as Square,
        reverse: true,
        key: `rev:${ply}:${undone.uci}`,
      })
      setAnimateLastMove(true)
    }
    setViewPly(ply - 1)
    setSelected(null)
    setLegalTargets([])
  }, [])

  const goNext = useCallback(() => {
    const ply = viewPlyRef.current
    const history = movesRef.current
    if (ply >= history.length) return
    const applied = history[ply]
    const next = ply + 1
    followLive.current = next >= history.length
    if (applied) {
      setSlideAnim({
        from: applied.from as Square,
        to: applied.to as Square,
        reverse: false,
        key: `fwd:${next}:${applied.uci}`,
      })
      setAnimateLastMove(true)
    }
    setViewPly(next)
    setSelected(null)
    setLegalTargets([])
  }, [])

  const goStart = useCallback(() => {
    followLive.current = false
    markSkipMoveAnimation()
    setSlideAnim(null)
    setAnimateLastMove(false)
    setViewPly(0)
    setSelected(null)
    setLegalTargets([])
  }, [])

  const goEnd = useCallback(() => {
    followLive.current = true
    markSkipMoveAnimation()
    setSlideAnim(null)
    setAnimateLastMove(false)
    setViewPly(movesRef.current.length)
    setSelected(null)
    setLegalTargets([])
  }, [])

  const goToPly = useCallback((ply: number) => {
    const history = movesRef.current
    const current = viewPlyRef.current
    const next = Math.max(0, Math.min(history.length, ply))
    followLive.current = next >= history.length

    if (next === current) return

    if (next === current - 1) {
      const undone = history[current - 1]
      if (undone) {
        setSlideAnim({
          from: undone.from as Square,
          to: undone.to as Square,
          reverse: true,
          key: `rev:${current}:${undone.uci}`,
        })
        setAnimateLastMove(true)
      }
    } else if (next === current + 1) {
      const applied = history[current]
      if (applied) {
        setSlideAnim({
          from: applied.from as Square,
          to: applied.to as Square,
          reverse: false,
          key: `fwd:${next}:${applied.uci}`,
        })
        setAnimateLastMove(true)
      }
    } else {
      // Jump of several plies — snap without a misleading single-step slide
      markSkipMoveAnimation()
      setSlideAnim(null)
      setAnimateLastMove(false)
    }

    setViewPly(next)
    setSelected(null)
    setLegalTargets([])
  }, [])

  const clearPremove = useCallback(() => setPremove(null), [])

  return {
    chess: displayChess as Chess,
    liveChess: liveChess as Chess,
    selected: atLive ? selected : null,
    legalTargets: atLive ? legalTargets : [],
    lastMove: displayLastMove ?? (atLive ? lastMove : null),
    slideAnim,
    animateLastMove,
    pendingPromotion: atLive ? pendingPromotion : null,
    premove: atLive ? premove : null,
    thinking,
    engineReady,
    engineError,
    status,
    outcome,
    isPlayerTurn,
    canPremove,
    openingName,
    displayEval: reviewEval ?? evaluation,
    hintSquare: atLive ? hintSquare : null,
    moves,
    viewPly,
    atLive,
    viewedMove,
    analyzing,
    canGoPrev: viewPly > 0,
    canGoNext: viewPly < moves.length,
    goPrev,
    goNext,
    goStart,
    goEnd,
    goToPly,
    selectSquare,
    selectPiece,
    clearPremove,
    confirmPromotion,
    resign,
    reset,
    requestHint,
  }
}
