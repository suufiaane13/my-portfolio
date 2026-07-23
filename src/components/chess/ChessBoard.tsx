import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import type { Color, PieceSymbol, Square } from 'chess.js'
import type { Chess } from 'chess.js'
import {
  boardOrientationFiles,
  boardOrientationRanks,
  fileIndexOf,
  pieceUnicode,
  rankIndexOf,
  squareAt,
} from '@/lib/chess/chessRules'
import {
  boardImageUrl,
  boardThemeFromId,
  pieceAssetUrl,
  type ChessBoardThemeId,
  type ChessPieceSetId,
} from '@/lib/chess/themes'
import { QualityGlyph } from '@/components/chess/QualityGlyph'
import type { MoveQuality } from '@/lib/chess/moveQuality'
import { clearSkipMoveAnimation, markSkipMoveAnimation, shouldSkipMoveAnimation } from '@/lib/chess/moveAnimSkip'
import { cn } from '@/lib/utils'

const MOVE_ANIM_MS = 180

/** Survives React StrictMode remounts so the same move is not animated twice in dev. */
let lastPlayedMoveAnimKey = ''

export { markSkipMoveAnimation }

interface ChessBoardProps {
  chess: Chess
  orientation: Color
  selected: Square | null
  legalTargets: Square[]
  lastMove: { from: Square; to: Square } | null
  /** Stable id per ply (e.g. "12:e2e4") — preferred animation trigger. */
  moveAnimKey?: string | null
  /**
   * Explicit piece slide. When `reverse`, the piece glides to→from (history back).
   * Takes priority over animating `lastMove`.
   */
  slideAnim?: {
    from: Square
    to: Square
    reverse: boolean
    key: string
  } | null
  /** When false, mark the move as shown without sliding (drag & drop). */
  animateLastMove?: boolean
  hintSquare: Square | null
  premove?: { from: Square; to: Square } | null
  disabled?: boolean
  /** Non-interactive preview (setup screen). */
  preview?: boolean
  className?: string
  pieceSet: ChessPieceSetId
  boardTheme: ChessBoardThemeId
  /** Quality glyph on a square (destination of reviewed move). */
  qualityMarker?: { square: Square; quality: MoveQuality } | null
  onSquareClick?: (square: Square, opts?: { viaDrag?: boolean }) => void
  /** Select piece without toggle (pointer down / drag start). */
  onPieceSelect?: (square: Square) => void
}

function PieceImage({
  setId,
  color,
  type,
  className,
}: {
  setId: ChessPieceSetId
  color: Color
  type: PieceSymbol
  className?: string
}) {
  const targetSrc = pieceAssetUrl(setId, color, type)
  const [displaySrc, setDisplaySrc] = useState(targetSrc)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
    if (targetSrc === displaySrc) return

    let cancelled = false
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      if (!cancelled) setDisplaySrc(targetSrc)
    }
    img.onerror = () => {
      if (!cancelled) setFailed(true)
    }
    img.src = targetSrc

    return () => {
      cancelled = true
    }
  }, [targetSrc, displaySrc])

  if (failed) {
    return (
      <span
        className={cn(
          'pointer-events-none select-none text-[clamp(1.35rem,5vw,2.35rem)]',
          color === 'w' ? 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.65)]' : 'text-neutral-900',
          className,
        )}
      >
        {pieceUnicode(color, type)}
      </span>
    )
  }

  return (
    <img
      src={displaySrc}
      alt=""
      draggable={false}
      decoding="async"
      className={cn(
        'pointer-events-none h-[88%] w-[88%] select-none object-contain',
        className,
      )}
      onError={() => setFailed(true)}
    />
  )
}

/** Chess.com-style destination markers: soft dark disc / capture ring. */
function MoveHint({ capture }: { capture: boolean }) {
  if (capture) {
    return (
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(transparent 0%, transparent 79%, rgba(0,0,0,0.14) 80%)',
        }}
      />
    )
  }

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 m-auto aspect-square w-[33%] rounded-full bg-black/14"
    />
  )
}

function squarePercent(
  square: Square,
  orientation: Color,
): { left: number; top: number } {
  const files = boardOrientationFiles(orientation)
  const ranks = boardOrientationRanks(orientation)
  const col = files.indexOf(fileIndexOf(square))
  const row = ranks.indexOf(rankIndexOf(square))
  return {
    left: (Math.max(0, col) / 8) * 100,
    top: (Math.max(0, row) / 8) * 100,
  }
}

export function ChessBoard({
  chess,
  orientation,
  selected,
  legalTargets,
  lastMove,
  moveAnimKey = null,
  slideAnim = null,
  animateLastMove = true,
  hintSquare,
  premove = null,
  disabled,
  preview = false,
  className,
  pieceSet,
  boardTheme,
  qualityMarker = null,
  onSquareClick,
  onPieceSelect,
}: ChessBoardProps) {
  const ranks = boardOrientationRanks(orientation)
  const files = boardOrientationFiles(orientation)
  const boardRef = useRef<HTMLDivElement>(null)
  const chessRef = useRef(chess)
  chessRef.current = chess
  const theme = boardThemeFromId(boardTheme)
  const isImageBoard = theme.type === 'image'
  const interactive = !preview && !disabled && Boolean(onSquareClick)
  const [boardBgUrl, setBoardBgUrl] = useState<string | null>(null)

  const [dragFrom, setDragFrom] = useState<Square | null>(null)
  const [dragPiece, setDragPiece] = useState<{ color: Color; type: PieceSymbol } | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const [hoverSquare, setHoverSquare] = useState<Square | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const pointerIdRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)
  const dragOriginRef = useRef<{ x: number; y: number } | null>(null)
  const didDragRef = useRef(false)

  const [anim, setAnim] = useState<{
    from: Square
    to: Square
    reverse: boolean
    color: Color
    type: PieceSymbol
    fromPct: { left: number; top: number }
    toPct: { left: number; top: number }
    active: boolean
  } | null>(null)

  const resolvedAnimKey =
    slideAnim?.key ??
    moveAnimKey ??
    (lastMove ? `${lastMove.from}${lastMove.to}` : null)

  const slideFrom = slideAnim?.from ?? lastMove?.from ?? null
  const slideTo = slideAnim?.to ?? lastMove?.to ?? null
  const slideReverse = slideAnim?.reverse ?? false

  useEffect(() => {
    const resolved = boardThemeFromId(boardTheme)
    if (resolved.type !== 'image') {
      setBoardBgUrl(null)
      return
    }

    const url = boardImageUrl(resolved.path)
    let cancelled = false
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      if (!cancelled) setBoardBgUrl(url)
    }
    img.src = url

    return () => {
      cancelled = true
    }
  }, [boardTheme])

  // Run before paint so the piece never "pops" on the destination then slides (looks like a double anim).
  useLayoutEffect(() => {
    if (preview || !slideFrom || !slideTo || !resolvedAnimKey) return

    // Drag & drop: check skip BEFORE the "already played" guard. Do not clear the
    // flag until we record the key — StrictMode remount must still see skip=true
    // (or the key match) and never start a short slide.
    if (shouldSkipMoveAnimation() || !animateLastMove) {
      clearSkipMoveAnimation()
      lastPlayedMoveAnimKey = resolvedAnimKey
      setAnim(null)
      return
    }

    if (resolvedAnimKey === lastPlayedMoveAnimKey) return

    const preferReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (preferReduced) {
      lastPlayedMoveAnimKey = resolvedAnimKey
      return
    }

    const reverse = slideReverse
    // Forward: piece sits on `to`. Reverse (undo): piece sits on `from`.
    const pieceSquare = reverse ? slideFrom : slideTo
    const piece = chessRef.current.get(pieceSquare)
    if (!piece) return

    lastPlayedMoveAnimKey = resolvedAnimKey
    const fromPct = squarePercent(slideFrom, orientation)
    const toPct = squarePercent(slideTo, orientation)
    const from = slideFrom
    const to = slideTo

    setAnim({
      from,
      to,
      reverse,
      color: piece.color,
      type: piece.type as PieceSymbol,
      fromPct,
      toPct,
      active: false,
    })

    let finished = false
    let innerRaf = 0
    const outerRaf = window.requestAnimationFrame(() => {
      innerRaf = window.requestAnimationFrame(() => {
        setAnim((current) =>
          current && current.from === from && current.to === to && current.reverse === reverse
            ? { ...current, active: true }
            : current,
        )
      })
    })
    const done = window.setTimeout(() => {
      finished = true
      setAnim((current) =>
        current && current.from === from && current.to === to && current.reverse === reverse
          ? null
          : current,
      )
    }, MOVE_ANIM_MS + 40)

    return () => {
      window.cancelAnimationFrame(outerRaf)
      window.cancelAnimationFrame(innerRaf)
      window.clearTimeout(done)
      // StrictMode remount: allow the second mount to play the anim once
      if (!finished && lastPlayedMoveAnimKey === resolvedAnimKey) {
        lastPlayedMoveAnimKey = ''
      }
    }
  }, [animateLastMove, orientation, preview, resolvedAnimKey, slideFrom, slideReverse, slideTo])

  const squareFromPoint = (clientX: number, clientY: number): Square | null => {
    const board = boardRef.current
    if (!board) return null
    const rect = board.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return null
    const x = (clientX - rect.left) / rect.width
    const y = (clientY - rect.top) / rect.height
    if (x < 0 || x > 1 || y < 0 || y > 1) return null
    const col = Math.min(7, Math.max(0, Math.floor(x * 8)))
    const row = Math.min(7, Math.max(0, Math.floor(y * 8)))
    const fileIndex = files[col]
    const rankIndex = ranks[row]
    if (fileIndex === undefined || rankIndex === undefined) return null
    return squareAt(fileIndex, rankIndex)
  }

  const endDrag = (clientX: number, clientY: number) => {
    const from = dragFrom
    const moved = didDragRef.current
    pointerIdRef.current = null
    dragOriginRef.current = null
    didDragRef.current = false
    setDragFrom(null)
    setDragPiece(null)
    setDragPos(null)
    setHoverSquare(null)
    setIsDragging(false)

    // Always suppress the synthetic click after pointer interaction on a piece
    if (from) suppressClickRef.current = true

    if (!from || !onSquareClick) return
    if (!moved) return
    const target = squareFromPoint(clientX, clientY)
    if (target && target !== from) {
      markSkipMoveAnimation()
      onSquareClick(target, { viaDrag: true })
    }
  }

  useEffect(() => {
    if (!dragFrom) return

    const onMove = (event: PointerEvent) => {
      if (pointerIdRef.current !== null && event.pointerId !== pointerIdRef.current) return
      const origin = dragOriginRef.current
      const distance =
        origin != null ? Math.hypot(event.clientX - origin.x, event.clientY - origin.y) : 0
      if (distance > 6) {
        didDragRef.current = true
        setIsDragging(true)
        setDragPos({ x: event.clientX, y: event.clientY })
        setHoverSquare(squareFromPoint(event.clientX, event.clientY))
      }
    }

    const onUp = (event: PointerEvent) => {
      if (pointerIdRef.current !== null && event.pointerId !== pointerIdRef.current) return
      endDrag(event.clientX, event.clientY)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- layout helpers read latest board geometry
  }, [dragFrom, files, ranks, onSquareClick])

  const kingInCheck = (() => {
    if (preview || !chess.inCheck()) return undefined
    for (const row of chess.board()) {
      for (const piece of row) {
        if (piece && piece.type === 'k' && piece.color === chess.turn()) {
          return piece.square
        }
      }
    }
    return undefined
  })()

  return (
    <div
      ref={boardRef}
      className={cn(
        'relative mx-auto aspect-square w-full max-w-[min(100%,36rem)] overflow-hidden rounded-2xl border border-border shadow-lg touch-none',
        (disabled || preview) && 'pointer-events-none',
        disabled && !preview && 'opacity-90',
        className,
      )}
      style={
        isImageBoard && boardBgUrl
          ? {
              backgroundImage: `url(${boardBgUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
      role="grid"
      aria-label="Chess board"
      aria-hidden={preview || undefined}
    >
      {ranks.map((rankIndex) => (
        <div key={rankIndex} className="grid grid-cols-8" role="row">
          {files.map((fileIndex) => {
            const square = squareAt(fileIndex, rankIndex)
            const piece = chess.get(square)
            const isDark = (fileIndex + rankIndex) % 2 === 1
            const isSelected = !preview && (selected === square || dragFrom === square)
            const isTarget = !preview && legalTargets.includes(square)
            const isLast =
              !preview && (lastMove?.from === square || lastMove?.to === square)
            const isHint = !preview && hintSquare === square
            const isCheck = kingInCheck === square
            const isPremoveSq =
              !preview && premove && (premove.from === square || premove.to === square)
            const isDropHover =
              Boolean(dragFrom) && hoverSquare === square && (isTarget || square === dragFrom)
            const hideDraggedPiece = isDragging && dragFrom === square && Boolean(dragPiece)
            // Forward: hide dest. Reverse undo: hide origin (where the piece sits again).
            const hideAnimatingPiece =
              Boolean(anim) &&
              (anim?.reverse ? anim.from === square : anim?.to === square)

            const solidBg =
              theme.type === 'solid'
                ? isDark
                  ? theme.dark
                  : theme.light
                : undefined

            const Cell = interactive ? 'button' : 'div'

            return (
              <Cell
                key={square}
                {...(interactive ? { type: 'button' as const } : {})}
                role="gridcell"
                tabIndex={interactive ? 0 : -1}
                onPointerDown={(event: ReactPointerEvent<HTMLElement>) => {
                  if (!interactive || !piece) return
                  if (piece.color !== orientation) return
                  if (event.button !== 0) return
                  event.preventDefault()
                  try {
                    event.currentTarget.setPointerCapture(event.pointerId)
                  } catch {
                    // ignore
                  }
                  pointerIdRef.current = event.pointerId
                  didDragRef.current = false
                  dragOriginRef.current = { x: event.clientX, y: event.clientY }
                  setDragFrom(square)
                  setDragPiece({ color: piece.color, type: piece.type as PieceSymbol })
                  setDragPos({ x: event.clientX, y: event.clientY })
                  setIsDragging(false)
                  setHoverSquare(square)
                  // Select without toggle so hold/drag keeps the piece selected
                  ;(onPieceSelect ?? onSquareClick)?.(square)
                }}
                onClick={() => {
                  if (!interactive || !onSquareClick) return
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false
                    return
                  }
                  onSquareClick(square)
                }}
                className={cn(
                  'relative flex aspect-square items-center justify-center transition-colors',
                  isImageBoard && 'bg-transparent',
                  isImageBoard && isSelected && 'bg-[rgba(255,255,51,0.45)]',
                  isImageBoard && isLast && !isSelected && !isPremoveSq && 'bg-[rgba(155,199,0,0.41)]',
                  isImageBoard && isPremoveSq && 'bg-[rgba(51,102,204,0.45)]',
                  isImageBoard && isDropHover && isTarget && 'bg-[rgba(255,255,51,0.35)]',
                  isHint && 'ring-2 ring-inset ring-amber-400',
                  interactive &&
                    'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
                style={
                  !isImageBoard
                    ? {
                        backgroundColor: solidBg,
                        backgroundImage: isSelected
                          ? 'linear-gradient(rgba(255,255,51,0.45), rgba(255,255,51,0.45))'
                          : isPremoveSq
                            ? 'linear-gradient(rgba(51,102,204,0.45), rgba(51,102,204,0.45))'
                            : isDropHover && isTarget
                              ? 'linear-gradient(rgba(255,255,51,0.35), rgba(255,255,51,0.35))'
                              : isLast
                                ? 'linear-gradient(rgba(155,199,0,0.41), rgba(155,199,0,0.41))'
                                : undefined,
                      }
                    : undefined
                }
                aria-label={square}
              >
                {isCheck && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(235,67,55,0.92)_0%,rgba(235,67,55,0.55)_42%,transparent_72%)]"
                  />
                )}
                {piece && !hideDraggedPiece && !hideAnimatingPiece && (
                  <PieceImage
                    setId={pieceSet}
                    color={piece.color}
                    type={piece.type as PieceSymbol}
                  />
                )}
                {isTarget && <MoveHint capture={Boolean(piece)} />}
                {qualityMarker?.square === square && (
                  <span className="pointer-events-none absolute right-0 top-0 z-10 translate-x-[8%] -translate-y-[8%] sm:translate-x-[12%] sm:-translate-y-[12%]">
                    <QualityGlyph quality={qualityMarker.quality} size="board" />
                  </span>
                )}
              </Cell>
            )
          })}
        </div>
      ))}

      {anim && (
        <div
          className="pointer-events-none absolute z-20 flex items-center justify-center"
          style={{
            width: '12.5%',
            height: '12.5%',
            // Forward: from → to. Reverse (history back): to → from.
            left: `${(
              anim.active
                ? anim.reverse
                  ? anim.fromPct
                  : anim.toPct
                : anim.reverse
                  ? anim.toPct
                  : anim.fromPct
            ).left}%`,
            top: `${(
              anim.active
                ? anim.reverse
                  ? anim.fromPct
                  : anim.toPct
                : anim.reverse
                  ? anim.toPct
                  : anim.fromPct
            ).top}%`,
            transition: `left ${MOVE_ANIM_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1), top ${MOVE_ANIM_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
          }}
        >
          <PieceImage
            setId={pieceSet}
            color={anim.color}
            type={anim.type}
            className="h-full w-full drop-shadow-md"
          />
        </div>
      )}

      {isDragging &&
        dragPiece &&
        dragPos &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[300] h-[12.5vw] max-h-16 min-h-11 w-[12.5vw] max-w-16 min-w-11 -translate-x-1/2 -translate-y-1/2 sm:h-16 sm:w-16"
            style={{ left: dragPos.x, top: dragPos.y }}
          >
            <PieceImage
              setId={pieceSet}
              color={dragPiece.color}
              type={dragPiece.type}
              className="h-full w-full scale-110 drop-shadow-xl"
            />
          </div>,
          document.body,
        )}
    </div>
  )
}
