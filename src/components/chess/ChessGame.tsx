import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Flag,
  Lightbulb,
  Loader2,
  RotateCcw,
  Shuffle,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ChessBoard } from '@/components/chess/ChessBoard'
import { QualityGlyph } from '@/components/chess/QualityGlyph'
import { useChessGame } from '@/hooks/useChessGame'
import {
  chessSoundFromOutcome,
  chessSoundFromSan,
  playChessSound,
  preloadChessSounds,
} from '@/lib/chess/chessSounds'
import { useTranslation } from '@/i18n/LanguageProvider'
import { createChess, type Color, type PieceSymbol, type Square } from '@/lib/chess/chessRules'
import { MOVE_QUALITY_STYLE, type ClassifiedMove, type MoveQuality } from '@/lib/chess/moveQuality'
import {
  DIFFICULTY_PRESETS,
  type ChessDifficulty,
} from '@/lib/chess/stockfishEngine'
import {
  CHESS_BOARD_THEME_IDS,
  CHESS_PIECE_SET_IDS,
  DEFAULT_CHESS_BOARD_THEME,
  DEFAULT_CHESS_PIECE_SET,
  boardImageUrl,
  boardEvalColors,
  boardThemeFromId,
  formatThemeLabel,
  pieceAssetUrl,
  preloadBoardTheme,
  preloadPieceSet,
  readStoredBoardTheme,
  readStoredPieceSet,
  storeBoardTheme,
  storePieceSet,
  type ChessBoardThemeId,
  type ChessPieceSetId,
} from '@/lib/chess/themes'
import {
  checkClientRateLimit,
  GAME_SCORE_RATE_LIMIT,
  recordClientRateLimitAttempt,
} from '@/lib/clientRateLimit'
import { trackEvent } from '@/services/analytics'
import {
  ChessScoreServiceError,
  fetchChessLeaderboard,
  formatLeaderboardTime,
  getSavedPlayerName,
  isChessLeaderboardEnabled,
  savePlayerName,
  submitChessGame,
  type ChessLeaderboardEntry,
} from '@/services/chessGame'
import { cn } from '@/lib/utils'

const PROMOTION_PIECES: PieceSymbol[] = ['q', 'r', 'b', 'n']
const DIFFICULTIES: ChessDifficulty[] = ['beginner', 'intermediate', 'expert']

const DIFFICULTY_META: Record<
  ChessDifficulty,
  { bars: number; accent: string; active: string; barActive: string; badge: string }
> = {
  beginner: {
    bars: 1,
    accent: 'text-emerald-600 dark:text-emerald-400',
    active:
      'border-emerald-500 bg-emerald-500/10 text-emerald-700 shadow-sm shadow-emerald-500/10 dark:text-emerald-400',
    barActive: 'bg-emerald-500',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  },
  intermediate: {
    bars: 2,
    accent: 'text-amber-600 dark:text-amber-400',
    active:
      'border-amber-500 bg-amber-500/10 text-amber-700 shadow-sm shadow-amber-500/10 dark:text-amber-400',
    barActive: 'bg-amber-500',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  },
  expert: {
    bars: 3,
    accent: 'text-rose-600 dark:text-rose-400',
    active:
      'border-rose-500 bg-rose-500/10 text-rose-700 shadow-sm shadow-rose-500/10 dark:text-rose-400',
    barActive: 'bg-rose-500',
    badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
  },
}

function DifficultyBars({
  level,
  active,
  barActiveClass,
}: {
  level: ChessDifficulty
  active: boolean
  barActiveClass: string
}) {
  const bars = DIFFICULTY_META[level].bars
  return (
    <div className="flex items-end justify-center gap-0.5" aria-hidden>
      {[1, 2, 3].map((bar) => (
        <span
          key={bar}
          className={cn(
            'w-1 rounded-full transition-colors',
            bar === 1 && 'h-2',
            bar === 2 && 'h-3',
            bar === 3 && 'h-4',
            bar <= bars
              ? active
                ? barActiveClass
                : 'bg-current'
              : 'bg-border',
          )}
        />
      ))}
    </div>
  )
}

function BotThinkingIndicator() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-2 flex justify-center sm:top-3"
      aria-hidden
    >
      <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/90 px-2.5 py-1.5 shadow-sm backdrop-blur">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70"
            style={{ animationDelay: `${dot * 120}ms` }}
          />
        ))}
      </span>
    </div>
  )
}

function EvalBar({
  evaluation,
  boardTheme,
  horizontal = false,
  fillHeight = false,
}: {
  evaluation: { type: 'cp' | 'mate'; value: number } | null
  boardTheme: ChessBoardThemeId
  horizontal?: boolean
  fillHeight?: boolean
}) {
  const { light, dark } = boardEvalColors(boardTheme)
  let whitePct = 50
  if (evaluation?.type === 'mate') {
    whitePct = evaluation.value > 0 ? 98 : 2
  } else if (evaluation?.type === 'cp') {
    const clamped = Math.max(-800, Math.min(800, evaluation.value))
    whitePct = 50 + (clamped / 800) * 50
  }

  if (horizontal) {
    return (
      <div className="flex h-2.5 w-full overflow-hidden rounded-full border border-border/60 sm:h-3">
        <div
          className="transition-[width] duration-500 ease-out"
          style={{ width: `${whitePct}%`, backgroundColor: light }}
        />
        <div
          className="transition-[width] duration-500 ease-out"
          style={{ width: `${100 - whitePct}%`, backgroundColor: dark }}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex w-3.5 overflow-hidden rounded-full border border-border/60 sm:w-4',
        fillHeight ? 'h-full min-h-0' : 'h-full min-h-[12rem]',
      )}
    >
      <div className="flex h-full w-full flex-col-reverse">
        <div
          className="transition-[height] duration-500 ease-out"
          style={{ height: `${whitePct}%`, backgroundColor: light }}
        />
        <div
          className="transition-[height] duration-500 ease-out"
          style={{ height: `${100 - whitePct}%`, backgroundColor: dark }}
        />
      </div>
    </div>
  )
}

function ThemeStepper({
  label,
  indexLabel,
  value,
  options,
  onChange,
  prevLabel,
  nextLabel,
  preview,
  preloadKind,
}: {
  label: string
  indexLabel: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  prevLabel: string
  nextLabel: string
  preview: ReactNode
  preloadKind?: 'piece' | 'board'
}) {
  const index = Math.max(0, options.indexOf(value))
  const total = options.length

  const step = (direction: -1 | 1) => {
    if (total === 0) return
    const nextIndex = (index + direction + total) % total
    const nextValue = options[nextIndex]!
    if (preloadKind === 'piece') preloadPieceSet(nextValue as ChessPieceSetId)
    if (preloadKind === 'board') preloadBoardTheme(nextValue as ChessBoardThemeId)
    onChange(nextValue)
  }

  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="truncate text-xs font-semibold text-primary">{formatThemeLabel(value)}</p>
        </div>
        <p className="shrink-0 text-xs text-muted-foreground tabular-nums">{indexLabel}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={prevLabel}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-xl border border-border bg-card px-3 py-2.5">
          {preview}
        </div>
        <button
          type="button"
          onClick={() => step(1)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={nextLabel}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

function PieceSetPreview({ setId }: { setId: ChessPieceSetId }) {
  // Light / dark squares so both colors stay readable in light and dark UI themes
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-md shadow-inner"
        style={{ backgroundColor: '#2563eb' }}
        aria-hidden
      >
        <img
          src={pieceAssetUrl(setId, 'w', 'k')}
          alt=""
          width={28}
          height={28}
          decoding="async"
          className="h-7 w-7 object-contain drop-shadow-sm"
          draggable={false}
        />
      </span>
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-md shadow-inner"
        style={{ backgroundColor: '#dbeafe' }}
        aria-hidden
      >
        <img
          src={pieceAssetUrl(setId, 'b', 'q')}
          alt=""
          width={28}
          height={28}
          decoding="async"
          className="h-7 w-7 object-contain drop-shadow-sm"
          draggable={false}
        />
      </span>
    </div>
  )
}

function BoardThemePreview({ themeId }: { themeId: ChessBoardThemeId }) {
  const theme = boardThemeFromId(themeId)

  if (theme.type === 'solid') {
    return (
      <div className="flex items-center justify-center gap-2">
        <span
          className="h-8 w-8 rounded-md border border-border"
          style={{ backgroundColor: theme.light }}
          aria-hidden
        />
        <span
          className="h-8 w-8 rounded-md border border-border"
          style={{ backgroundColor: theme.dark }}
          aria-hidden
        />
      </div>
    )
  }

  // Crop two adjacent board squares from the texture (light + dark)
  const url = boardImageUrl(theme.path)
  return (
    <div className="flex items-center justify-center gap-2">
      <span
        className="h-8 w-8 rounded-md border border-border"
        style={{
          backgroundImage: `url(${url})`,
          backgroundSize: '800% 800%',
          backgroundPosition: '0% 100%',
        }}
        aria-hidden
      />
      <span
        className="h-8 w-8 rounded-md border border-border"
        style={{
          backgroundImage: `url(${url})`,
          backgroundSize: '800% 800%',
          backgroundPosition: '14.2857% 100%',
        }}
        aria-hidden
      />
    </div>
  )
}

function MoveNotationList({
  moves,
  viewPly,
  onGoToPly,
  emptyLabel,
  title,
  showQualities = false,
  analyzing = false,
  analyzingLabel,
}: {
  moves: ClassifiedMove[]
  viewPly: number
  onGoToPly: (ply: number) => void
  emptyLabel: string
  title: string
  showQualities?: boolean
  analyzing?: boolean
  analyzingLabel?: string
}) {
  const { t } = useTranslation()
  const rows = useMemo(() => {
    const pairs: { number: number; white?: ClassifiedMove; black?: ClassifiedMove; whitePly: number; blackPly: number }[] =
      []
    for (let i = 0; i < moves.length; i += 2) {
      pairs.push({
        number: Math.floor(i / 2) + 1,
        white: moves[i],
        black: moves[i + 1],
        whitePly: i + 1,
        blackPly: i + 2,
      })
    }
    return pairs
  }, [moves])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2">
        <p className="text-center text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </p>
        {analyzing && analyzingLabel ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            {analyzingLabel}
          </span>
        ) : null}
      </div>
      {moves.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <div className="max-h-28 overflow-y-auto rounded-xl border border-border/80 bg-muted/20 p-1.5 sm:max-h-40 lg:max-h-48">
          <ol className="space-y-0.5">
            {rows.map((row) => (
              <li key={row.number} className="grid grid-cols-[1.75rem_1fr_1fr] items-center gap-1 text-sm">
                <span className="text-right text-xs tabular-nums text-muted-foreground">{row.number}.</span>
                {row.white ? (
                  <NotationMoveButton
                    move={row.white}
                    active={viewPly === row.whitePly}
                    label={t.chessGame.moveQuality}
                    showQuality={showQualities}
                    onClick={() => onGoToPly(row.whitePly)}
                  />
                ) : (
                  <span />
                )}
                {row.black ? (
                  <NotationMoveButton
                    move={row.black}
                    active={viewPly === row.blackPly}
                    label={t.chessGame.moveQuality}
                    showQuality={showQualities}
                    onClick={() => onGoToPly(row.blackPly)}
                  />
                ) : (
                  <span />
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

function NotationMoveButton({
  move,
  active,
  onClick,
  label,
  showQuality,
}: {
  move: ClassifiedMove
  active: boolean
  onClick: () => void
  label: Record<MoveQuality, string>
  showQuality: boolean
}) {
  const quality = showQuality ? move.quality : undefined
  const title = quality ? `${move.san} — ${label[quality]}` : move.san

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'flex min-w-0 items-center gap-1 rounded-lg px-1.5 py-1 text-left font-medium tabular-nums transition-colors',
        active ? 'bg-primary/15 text-primary' : 'text-foreground hover:bg-muted',
      )}
    >
      <span className="truncate">{move.san}</span>
      {quality ? <QualityGlyph quality={quality} size="sm" /> : null}
    </button>
  )
}

function ChessGamePlaying({
  playerColor,
  difficulty,
  pieceSet,
  boardTheme,
  playerName,
  onExitSetup,
}: {
  playerColor: Color
  difficulty: ChessDifficulty
  pieceSet: ChessPieceSetId
  boardTheme: ChessBoardThemeId
  playerName: string
  onExitSetup: () => void
}) {
  const { t, locale } = useTranslation()
  const game = useChessGame({ playerColor, difficulty })
  const [soundOn, setSoundOn] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scoreSubmitted, setScoreSubmitted] = useState(false)
  const [leaderboard, setLeaderboard] = useState<ChessLeaderboardEntry[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0)
  const prevMoveCount = useRef(0)
  const prevViewPly = useRef(game.viewPly)
  const skipNavSound = useRef(false)
  const prevOutcome = useRef(game.outcome)
  const startedAtRef = useRef(0)
  const submitAttempted = useRef(false)
  const boardAnchorRef = useRef<HTMLDivElement>(null)
  const botColor = playerColor === 'w' ? 'b' : 'w'
  const leaderboardEnabled = isChessLeaderboardEnabled()

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  useEffect(() => {
    const node = boardAnchorRef.current
    if (!node) return
    const frame = window.requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    preloadChessSounds()
  }, [])

  useEffect(() => {
    if (!leaderboardEnabled) return
    let cancelled = false
    setLeaderboardLoading(true)
    void fetchChessLeaderboard(difficulty).then((entries) => {
      if (cancelled) return
      setLeaderboard(entries)
      setLeaderboardLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [difficulty, leaderboardEnabled, leaderboardRefreshKey])

  useEffect(() => {
    if (!game.outcome) return
    if (game.outcome === 'win') {
      trackEvent({ eventType: 'game_chess_win', path: '/game/chess', locale })
    } else if (game.outcome === 'draw') {
      trackEvent({ eventType: 'game_chess_draw', path: '/game/chess', locale })
    }
  }, [game.outcome, locale])

  useEffect(() => {
    if (game.moves.length > prevMoveCount.current) {
      skipNavSound.current = true
      const last = game.moves[game.moves.length - 1]
      if (last) playChessSound(chessSoundFromSan(last.san), soundOn)
    }
    prevMoveCount.current = game.moves.length
  }, [game.moves, soundOn])

  // Replay / scrub: play the move sound for the ply we land on
  useEffect(() => {
    if (game.viewPly === prevViewPly.current) return
    prevViewPly.current = game.viewPly
    if (skipNavSound.current) {
      skipNavSound.current = false
      return
    }
    if (game.viewPly <= 0) return
    const move = game.moves[game.viewPly - 1]
    if (move) playChessSound(chessSoundFromSan(move.san), soundOn)
  }, [game.viewPly, game.moves, soundOn])

  useEffect(() => {
    if (game.outcome && game.outcome !== prevOutcome.current) {
      const last = game.moves[game.moves.length - 1]
      // Mate already played the checkmate (Victory) cue — avoid double sound
      if (!(last?.san.includes('#') && (game.outcome === 'win' || game.outcome === 'loss'))) {
        playChessSound(chessSoundFromOutcome(game.outcome), soundOn)
      }
    }
    prevOutcome.current = game.outcome
  }, [game.outcome, game.moves, soundOn])

  useEffect(() => {
    const goPrev = game.goPrev
    const goNext = game.goNext
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [game.goPrev, game.goNext])

  const handleSubmitGame = async () => {
    if (!game.outcome || scoreSubmitted || isSubmitting) return
    const trimmedName = playerName.trim()
    if (!/^[a-zA-ZÀ-ÿ0-9 _.-]{2,20}$/.test(trimmedName)) {
      return
    }

    const rate = checkClientRateLimit(
      GAME_SCORE_RATE_LIMIT.key,
      GAME_SCORE_RATE_LIMIT.maxAttempts,
      GAME_SCORE_RATE_LIMIT.windowMs,
    )
    if (!rate.allowed) {
      const minutes = Math.max(1, Math.ceil((rate.retryAfterMs ?? 3_600_000) / 60_000))
      toast.error(t.chessGame.leaderboard.rateLimit.replace('{{minutes}}', String(minutes)))
      return
    }

    setIsSubmitting(true)
    const seconds = Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000))

    try {
      await submitChessGame({
        playerName: trimmedName,
        difficulty,
        playerColor,
        result: game.outcome,
        plyCount: game.moves.length,
        seconds,
        openingName: game.openingName,
        uciMoves: game.moves.map((move) => move.uci).join(' '),
        locale,
      })
      recordClientRateLimitAttempt(
        GAME_SCORE_RATE_LIMIT.key,
        GAME_SCORE_RATE_LIMIT.maxAttempts,
        GAME_SCORE_RATE_LIMIT.windowMs,
      )
      setScoreSubmitted(true)
      setLeaderboardRefreshKey((value) => value + 1)
      trackEvent({
        eventType: 'game_score_submit',
        path: '/game/chess',
        locale,
        metadata: { game: 'chess', result: game.outcome, difficulty },
      })
    } catch (error) {
      submitAttempted.current = false
      if (error instanceof ChessScoreServiceError) {
        if (error.code === 'rate_limit') {
          toast.error(t.chessGame.leaderboard.rateLimit.replace('{{minutes}}', '60'))
        } else if (error.code === 'waking_up') {
          toast.error(t.chessGame.leaderboard.wakingUp)
        } else {
          toast.error(t.chessGame.leaderboard.submitError)
        }
      } else {
        toast.error(t.chessGame.leaderboard.submitError)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!leaderboardEnabled || !game.outcome || scoreSubmitted || submitAttempted.current) return
    submitAttempted.current = true
    void handleSubmitGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- submit once when outcome is set
  }, [game.outcome, leaderboardEnabled, scoreSubmitted])

  const statusLabel =
    game.outcome === 'win'
      ? t.chessGame.youWin
      : game.outcome === 'loss'
        ? t.chessGame.youLose
        : game.outcome === 'draw'
          ? t.chessGame.draw
          : !game.atLive
            ? t.chessGame.reviewing
            : game.thinking
              ? t.chessGame.botTurn
              : game.status === 'check'
                ? t.chessGame.check
                : game.isPlayerTurn
                  ? t.chessGame.yourTurn
                  : t.chessGame.botTurn

  const viewedQuality = game.outcome
    ? (game.viewedMove?.quality as MoveQuality | undefined)
    : undefined
  const qualityStyle = viewedQuality ? MOVE_QUALITY_STYLE[viewedQuality] : null
  const difficultyMeta = DIFFICULTY_META[difficulty]
  const botElo = DIFFICULTY_PRESETS[difficulty].approxElo
  const turnSide = game.outcome
    ? null
    : game.liveChess.turn() === playerColor
      ? 'player'
      : 'bot'
  const boardQualityMarker =
    game.outcome && game.viewedMove?.quality
      ? {
          square: game.viewedMove.to as Square,
          quality: game.viewedMove.quality,
        }
      : null

  const matchInfo = (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-sm font-semibold tracking-wide">{t.chessGame.sidePanelTitle}</p>
        <button
          type="button"
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:inline-flex"
          aria-label={soundOn ? t.chessGame.soundOff : t.chessGame.soundOn}
          aria-pressed={soundOn}
          onClick={() => setSoundOn((value) => !value)}
        >
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div
          className={cn(
            'relative overflow-hidden rounded-xl border bg-background px-2.5 py-2.5 text-center shadow-sm transition-colors',
            turnSide === 'player'
              ? 'border-primary ring-2 ring-primary/25'
              : 'border-border',
          )}
        >
          <p className="max-w-full truncate px-0.5 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            {playerName || t.chessGame.you}
          </p>
          <div className="mt-1.5 flex flex-col items-center gap-1">
            <span
              className={cn(
                'h-7 w-7 rounded-full border-2 shadow-inner',
                playerColor === 'w'
                  ? 'border-neutral-300 bg-[#f8f5f0]'
                  : 'border-neutral-700 bg-neutral-900',
              )}
              aria-hidden
            />
            <p className="text-xs font-bold sm:text-sm">
              {playerColor === 'w' ? t.chessGame.white : t.chessGame.black}
            </p>
          </div>
        </div>
        <div
          className={cn(
            'relative overflow-hidden rounded-xl border bg-background px-2.5 py-2.5 text-center shadow-sm transition-colors',
            turnSide === 'bot'
              ? 'border-primary ring-2 ring-primary/25'
              : 'border-border',
          )}
        >
          <span
            className={cn(
              'absolute top-0 right-0 z-10 rounded-bl-lg rounded-tr-[0.65rem] px-1.5 py-0.5 text-[0.6rem] font-bold tabular-nums shadow-sm',
              difficultyMeta.badge,
            )}
          >
            ~{botElo}
          </span>
          <p className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            {t.chessGame.bot}
          </p>
          <div className="mt-1.5 flex flex-col items-center gap-1">
            <span
              className={cn(
                'h-7 w-7 rounded-full border-2 shadow-inner',
                botColor === 'w'
                  ? 'border-neutral-300 bg-[#f8f5f0]'
                  : 'border-neutral-700 bg-neutral-900',
              )}
              aria-hidden
            />
            <p className="text-xs font-bold sm:text-sm">
              {botColor === 'w' ? t.chessGame.white : t.chessGame.black}
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-[0.65rem] leading-relaxed text-muted-foreground sm:text-[0.7rem]">
        {t.chessGame.engineNote}
      </p>

      <MoveNotationList
        moves={game.moves}
        viewPly={game.viewPly}
        onGoToPly={game.goToPly}
        title={t.chessGame.moves}
        emptyLabel={t.chessGame.noMovesYet}
        showQualities={Boolean(game.outcome)}
        analyzing={Boolean(game.outcome && game.analyzing)}
        analyzingLabel={t.chessGame.analyzingMoves}
      />

      {leaderboardEnabled && (
        <div className="space-y-1.5">
          <p className="text-center text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            {t.chessGame.leaderboard.title}
          </p>
          {leaderboardLoading ? (
            <p className="text-center text-xs text-muted-foreground">{t.chessGame.leaderboard.loading}</p>
          ) : leaderboard.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-3 py-2.5 text-center text-xs text-muted-foreground">
              {game.outcome === 'win' && (!scoreSubmitted || isSubmitting)
                ? t.chessGame.leaderboard.emptyAfterWin
                : game.outcome && game.outcome !== 'win'
                  ? t.chessGame.leaderboard.emptyWinsOnly
                  : t.chessGame.leaderboard.empty}
            </p>
          ) : (
            <ol className="space-y-1 rounded-xl border border-border/80 bg-muted/20 p-1.5">
              {leaderboard.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs"
                >
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-primary/10 px-1 font-bold tabular-nums text-primary">
                    {entry.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{entry.playerName}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {entry.plyCount} · {formatLeaderboardTime(entry.seconds)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-3 sm:gap-4 lg:grid-cols-[auto_minmax(0,1fr)_minmax(15rem,17rem)] lg:items-start lg:gap-5">
      <div className="hidden self-stretch lg:flex lg:min-h-[min(70vh,36rem)]">
        <EvalBar evaluation={game.displayEval} boardTheme={boardTheme} fillHeight />
      </div>

      <div className="min-w-0 space-y-2.5 sm:space-y-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-semibold sm:text-base">{statusLabel}</p>
            {game.openingName && (
              <p className="mt-0.5 truncate text-[0.7rem] text-muted-foreground sm:text-xs">
                {game.openingName}
              </p>
            )}
            {viewedQuality && qualityStyle && (
              <p
                className={cn(
                  'mt-1 inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold sm:text-xs',
                  qualityStyle.bg,
                  qualityStyle.color,
                )}
              >
                <QualityGlyph quality={viewedQuality} size="sm" />
                <span className="truncate">
                  {t.chessGame.moveQuality[viewedQuality]}
                  {game.viewedMove?.san ? ` · ${game.viewedMove.san}` : ''}
                </span>
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
              aria-label={soundOn ? t.chessGame.soundOff : t.chessGame.soundOn}
              aria-pressed={soundOn}
              onClick={() => setSoundOn((value) => !value)}
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 sm:hidden"
              aria-label={t.chessGame.hint}
              disabled={!game.isPlayerTurn || game.thinking || Boolean(game.outcome)}
              onClick={() => void game.requestHint()}
            >
              <Lightbulb className="h-4 w-4 text-amber-500" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 sm:hidden"
              aria-label={t.chessGame.resign}
              disabled={Boolean(game.outcome)}
              onClick={game.resign}
            >
              <Flag className="h-4 w-4 text-rose-500" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
              aria-label={t.chessGame.newGame}
              onClick={onExitSetup}
            >
              <RotateCcw className="h-4 w-4 text-primary" />
            </button>
          </div>
        </div>

        <div className="hidden grid-cols-3 gap-2 sm:grid">
          <Button
            size="sm"
            variant="outline"
            className="h-9 min-w-0 gap-1.5 rounded-xl border-border bg-card px-2 text-foreground shadow-sm hover:bg-muted hover:text-foreground sm:px-3"
            onClick={() => void game.requestHint()}
            disabled={!game.isPlayerTurn || game.thinking || Boolean(game.outcome)}
          >
            <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="truncate text-xs font-semibold sm:text-sm">{t.chessGame.hint}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 min-w-0 gap-1.5 rounded-xl border-border bg-card px-2 text-foreground shadow-sm hover:bg-muted hover:text-foreground sm:px-3"
            onClick={game.resign}
            disabled={Boolean(game.outcome)}
          >
            <Flag className="h-4 w-4 shrink-0 text-rose-500" />
            <span className="truncate text-xs font-semibold sm:text-sm">{t.chessGame.resign}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 min-w-0 gap-1.5 rounded-xl border-border bg-card px-2 text-foreground shadow-sm hover:bg-muted hover:text-foreground sm:px-3"
            onClick={onExitSetup}
          >
            <RotateCcw className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate text-xs font-semibold sm:text-sm">{t.chessGame.newGame}</span>
          </Button>
        </div>

        <div
          ref={boardAnchorRef}
          id="chess-play-board"
          className="mx-auto flex w-full max-w-[min(100%,min(92vw,36rem))] scroll-mt-20 items-stretch justify-center gap-2 sm:scroll-mt-24 md:max-w-[min(100%,34rem)] lg:max-w-[min(100%,36rem)]"
        >
          <div className="flex shrink-0 self-stretch lg:hidden">
            <EvalBar evaluation={game.displayEval} boardTheme={boardTheme} fillHeight />
          </div>
          <div className="relative min-w-0 flex-1">
            <ChessBoard
              chess={game.chess}
              orientation={playerColor}
              selected={game.selected}
              legalTargets={game.legalTargets}
              lastMove={game.lastMove}
              slideAnim={game.slideAnim}
              moveAnimKey={
                game.slideAnim?.key ??
                (game.lastMove
                  ? `${game.viewPly}:${game.lastMove.from}${game.lastMove.to}`
                  : null)
              }
              animateLastMove={game.animateLastMove}
              hintSquare={game.hintSquare}
              premove={game.premove}
              pieceSet={pieceSet}
              boardTheme={boardTheme}
              qualityMarker={boardQualityMarker}
              disabled={
                Boolean(game.outcome) ||
                !game.atLive ||
                Boolean(game.pendingPromotion) ||
                (game.isPlayerTurn ? game.thinking : !game.canPremove)
              }
              onSquareClick={game.selectSquare}
              onPieceSelect={game.selectPiece}
              className="max-w-none"
            />

            {game.thinking && <BotThinkingIndicator />}

            {game.pendingPromotion && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-4">
                <div className="rounded-2xl border border-border bg-card p-3 shadow-xl sm:p-4">
                  <p className="mb-3 text-center text-sm font-medium">{t.chessGame.promote}</p>
                  <div className="flex justify-center gap-2">
                    {PROMOTION_PIECES.map((piece) => (
                      <button
                        key={piece}
                        type="button"
                        onClick={() => game.confirmPromotion(piece)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-border hover:bg-primary/10 sm:h-12 sm:w-12"
                      >
                        <img
                          src={pieceAssetUrl(pieceSet, playerColor, piece)}
                          alt={piece}
                          className="h-8 w-8 object-contain sm:h-9 sm:w-9"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[min(100%,min(92vw,36rem))] items-center justify-center gap-1.5 sm:gap-2 md:max-w-[min(100%,34rem)] lg:max-w-[min(100%,36rem)]">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 sm:h-10 sm:w-10"
            onClick={game.goStart}
            disabled={!game.canGoPrev}
            aria-label={t.chessGame.firstMove}
          >
            <ChevronFirst className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 sm:h-10 sm:w-10"
            onClick={game.goPrev}
            disabled={!game.canGoPrev}
            aria-label={t.chessGame.prevMove}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-[4.75rem] rounded-xl border border-border bg-card px-2.5 py-1.5 text-center text-xs font-medium tabular-nums sm:min-w-[6.5rem] sm:px-3 sm:py-2">
            {game.viewPly} / {game.moves.length}
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 sm:h-10 sm:w-10"
            onClick={game.goNext}
            disabled={!game.canGoNext}
            aria-label={t.chessGame.nextMove}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 sm:h-10 sm:w-10"
            onClick={game.goEnd}
            disabled={!game.canGoNext}
            aria-label={t.chessGame.lastMove}
          >
            <ChevronLast className="h-4 w-4" />
          </button>
        </div>

        {game.engineError && (
          <p className="text-center text-sm text-amber-600 dark:text-amber-400">
            {t.chessGame.engineFallback}
          </p>
        )}

        <Card className="p-3 sm:p-3.5 lg:hidden">{matchInfo}</Card>
      </div>

      <Card className="hidden max-h-[calc(100vh-6.5rem)] overflow-y-auto p-3.5 lg:sticky lg:top-24 lg:block">
        {matchInfo}
      </Card>
    </div>
  )
}

function ChessSetup({
  difficulty,
  playerColor,
  colorMode,
  pieceSet,
  boardTheme,
  playerName,
  onPlayerName,
  onDifficulty,
  onColorMode,
  onPieceSet,
  onBoardTheme,
  onStart,
}: {
  difficulty: ChessDifficulty
  playerColor: Color
  colorMode: 'w' | 'b' | 'random'
  pieceSet: ChessPieceSetId
  boardTheme: ChessBoardThemeId
  playerName: string
  onPlayerName: (value: string) => void
  onDifficulty: (value: ChessDifficulty) => void
  onColorMode: (value: 'w' | 'b' | 'random') => void
  onPieceSet: (value: ChessPieceSetId) => void
  onBoardTheme: (value: ChessBoardThemeId) => void
  onStart: () => void
}) {
  const { t } = useTranslation()
  const previewChess = useMemo(() => createChess(), [])
  const [previewExpanded, setPreviewExpanded] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const leaderboardEnabled = isChessLeaderboardEnabled()

  useEffect(() => {
    preloadPieceSet(pieceSet)
    preloadBoardTheme(boardTheme)
  }, [pieceSet, boardTheme])

  useEffect(() => {
    if (!previewExpanded) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewExpanded(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [previewExpanded])

  const nameValid = !leaderboardEnabled || /^[a-zA-ZÀ-ÿ0-9 _.-]{2,20}$/.test(playerName.trim())

  const tryStart = () => {
    if (!nameValid) {
      setNameError(t.chessGame.leaderboard.nameError)
      return
    }
    setNameError(null)
    onStart()
  }

  const startButton = (
    <Button size="lg" className="w-full" onClick={tryStart} disabled={!nameValid}>
      {t.chessGame.startGame}
    </Button>
  )

  const previewBoard = (
    <ChessBoard
      chess={previewChess}
      orientation={playerColor}
      selected={null}
      legalTargets={[]}
      lastMove={null}
      hintSquare={null}
      pieceSet={pieceSet}
      boardTheme={boardTheme}
      preview
      className="max-w-none shadow-md"
    />
  )

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-4 text-center lg:hidden">
        <h2 className="font-display text-xl font-bold">{t.chessGame.setupTitle}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{t.chessGame.setupDescription}</p>
      </div>

      {/* One column flow on mobile so sticky preview stays visible while scrolling options */}
      <div className="flex flex-col gap-4 sm:gap-5 lg:grid lg:grid-cols-[minmax(20rem,28rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <aside
          className={cn(
            'sticky top-16 z-30 -mx-3 border-b border-border/70 bg-background/95 px-3 py-2.5 backdrop-blur-md',
            'sm:-mx-6 sm:px-6',
            'lg:top-24 lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none',
          )}
        >
          <button
            type="button"
            onClick={() => setPreviewExpanded(true)}
            aria-expanded={previewExpanded}
            aria-label={t.chessGame.preview}
            className={cn(
              'mx-auto block w-full max-w-[10.75rem] rounded-2xl border border-border/80 bg-card/80 p-2 shadow-sm transition-colors',
              'hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'sm:max-w-[12.5rem] lg:max-w-none lg:bg-card/60 lg:p-5 lg:shadow-none',
            )}
          >
            <p className="mb-1.5 text-center text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase sm:mb-2 sm:text-[0.7rem]">
              {t.chessGame.preview}
            </p>
            {/* Board uses non-button cells in preview — avoid nested <button> */}
            <div className="pointer-events-none">{previewBoard}</div>
          </button>
        </aside>

        <div className="min-w-0 space-y-4 sm:space-y-5">
          <div className="hidden text-left lg:block">
            <h2 className="font-display text-2xl font-bold">{t.chessGame.setupTitle}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{t.chessGame.setupDescription}</p>
          </div>

          {/* Match: difficulty + color */}
          <section className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
            <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
              {t.chessGame.setupMatch}
            </h3>

            {leaderboardEnabled && (
              <div className="mx-auto w-full max-w-[14rem] text-center sm:max-w-[16rem]">
                <label
                  htmlFor="chess-setup-player-name"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  {t.chessGame.leaderboard.nameLabel}
                </label>
                <Input
                  id="chess-setup-player-name"
                  value={playerName}
                  onChange={(event) => {
                    onPlayerName(event.target.value)
                    if (nameError) setNameError(null)
                  }}
                  placeholder={t.chessGame.leaderboard.namePlaceholder}
                  maxLength={20}
                  autoComplete="nickname"
                  className="mx-auto h-9 text-center text-sm"
                />
                {nameError && (
                  <p className="mt-1.5 text-xs text-destructive" role="alert">
                    {nameError}
                  </p>
                )}
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">{t.chessGame.difficulty}</p>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((level) => {
                  const elo = DIFFICULTY_PRESETS[level].approxElo
                  const selected = difficulty === level
                  const meta = DIFFICULTY_META[level]
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => onDifficulty(level)}
                      className={cn(
                        'relative flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-center transition-all sm:px-3',
                        selected
                          ? meta.active
                          : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50',
                      )}
                    >
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold tabular-nums sm:text-xs',
                          selected ? meta.badge : cn('bg-muted', meta.accent),
                        )}
                      >
                        <span
                          className={cn(
                            'h-2 w-2 rounded-full',
                            level === 'beginner' && 'bg-emerald-500',
                            level === 'intermediate' && 'bg-amber-500',
                            level === 'expert' && 'bg-rose-500',
                          )}
                          aria-hidden
                        />
                        ~{elo} {t.chessGame.elo}
                      </span>
                      <span className={cn(!selected && meta.accent, selected && meta.accent)}>
                        <DifficultyBars
                          level={level}
                          active={selected}
                          barActiveClass={meta.barActive}
                        />
                      </span>
                      <span className="block text-xs font-semibold sm:text-sm">
                        {t.chessGame.levels[level]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">{t.chessGame.yourColor}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onColorMode('w')}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all',
                    colorMode === 'w'
                      ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10'
                      : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50',
                  )}
                >
                  <span
                    className="h-7 w-7 rounded-full border border-neutral-300 bg-[#f8f5f0] shadow-inner"
                    aria-hidden
                  />
                  <span>{t.chessGame.white}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onColorMode('b')}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all',
                    colorMode === 'b'
                      ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10'
                      : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50',
                  )}
                >
                  <span
                    className="h-7 w-7 rounded-full border border-neutral-700 bg-neutral-900 shadow-inner"
                    aria-hidden
                  />
                  <span>{t.chessGame.black}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onColorMode('random')}
                  className={cn(
                    'col-span-2 flex items-center justify-center gap-2.5 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all',
                    colorMode === 'random'
                      ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10'
                      : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50',
                  )}
                >
                  <span className="relative flex h-6 w-6 overflow-hidden rounded-full border border-border shadow-inner">
                    <span className="h-full w-1/2 bg-[#f8f5f0]" />
                    <span className="h-full w-1/2 bg-neutral-900" />
                  </span>
                  <Shuffle className="h-4 w-4" aria-hidden />
                  {t.chessGame.randomColor}
                </button>
              </div>
            </div>
          </section>

          {/* Look: pieces + board */}
          <section className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
            <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
              {t.chessGame.setupLook}
            </h3>

            <div className="space-y-4">
              <ThemeStepper
                label={t.chessGame.pieceSet}
                indexLabel={`${Math.max(1, CHESS_PIECE_SET_IDS.indexOf(pieceSet) + 1)} / ${CHESS_PIECE_SET_IDS.length}`}
                value={pieceSet}
                options={CHESS_PIECE_SET_IDS}
                onChange={(value) => onPieceSet(value as ChessPieceSetId)}
                prevLabel={t.chessGame.prevTheme}
                nextLabel={t.chessGame.nextTheme}
                preview={<PieceSetPreview setId={pieceSet} />}
                preloadKind="piece"
              />
              <ThemeStepper
                label={t.chessGame.boardTheme}
                indexLabel={`${Math.max(1, CHESS_BOARD_THEME_IDS.indexOf(boardTheme) + 1)} / ${CHESS_BOARD_THEME_IDS.length}`}
                value={boardTheme}
                options={CHESS_BOARD_THEME_IDS}
                onChange={(value) => onBoardTheme(value as ChessBoardThemeId)}
                prevLabel={t.chessGame.prevTheme}
                nextLabel={t.chessGame.nextTheme}
                preview={<BoardThemePreview themeId={boardTheme} />}
                preloadKind="board"
              />
            </div>
          </section>

          <div className="pt-1 sm:pt-2">{startButton}</div>
        </div>
      </div>

      {previewExpanded &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={t.chessGame.preview}
            onClick={() => setPreviewExpanded(false)}
          >
            <div
              className="relative w-full max-w-[min(92vw,24rem,calc(100dvh-6rem))] rounded-2xl border border-border bg-card p-3 shadow-2xl sm:p-4 lg:max-w-[min(90vw,36rem,calc(100dvh-5rem))] lg:p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={t.chessGame.closePreview}
                onClick={() => setPreviewExpanded(false)}
              >
                <X className="h-4 w-4" />
              </button>
              <p className="mb-2 pr-8 text-center text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                {t.chessGame.preview}
              </p>
              {previewBoard}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

export function ChessGame({
  onPlayingChange,
}: {
  onPlayingChange?: (playing: boolean) => void
} = {}) {
  const { locale } = useTranslation()
  const [playerColor, setPlayerColor] = useState<Color>('w')
  const [colorMode, setColorMode] = useState<'w' | 'b' | 'random'>('w')
  const [difficulty, setDifficulty] = useState<ChessDifficulty>('expert')
  const [pieceSet, setPieceSet] = useState<ChessPieceSetId>(DEFAULT_CHESS_PIECE_SET)
  const [boardTheme, setBoardTheme] = useState<ChessBoardThemeId>(DEFAULT_CHESS_BOARD_THEME)
  const [playerName, setPlayerName] = useState(() => getSavedPlayerName())
  const [started, setStarted] = useState(false)
  const [gameKey, setGameKey] = useState(0)

  useEffect(() => {
    setPieceSet(readStoredPieceSet())
    setBoardTheme(readStoredBoardTheme())
  }, [])

  useEffect(() => {
    onPlayingChange?.(started)
  }, [started, onPlayingChange])

  const updatePieceSet = (id: ChessPieceSetId) => {
    preloadPieceSet(id)
    setPieceSet(id)
    storePieceSet(id)
  }

  const updateBoardTheme = (id: ChessBoardThemeId) => {
    preloadBoardTheme(id)
    setBoardTheme(id)
    storeBoardTheme(id)
  }

  const updateColorMode = (mode: 'w' | 'b' | 'random') => {
    setColorMode(mode)
    if (mode === 'random') {
      setPlayerColor(Math.random() < 0.5 ? 'w' : 'b')
      return
    }
    setPlayerColor(mode)
  }

  const startGame = () => {
    const trimmed = playerName.trim()
    if (trimmed) savePlayerName(trimmed)
    const color =
      colorMode === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : colorMode
    setPlayerColor(color)
    setGameKey((value) => value + 1)
    setStarted(true)
    trackEvent({
      eventType: 'game_chess_start',
      path: '/game/chess',
      locale,
      metadata: { color, colorMode, difficulty, pieceSet, boardTheme },
    })
  }

  if (!started) {
    return (
      <ChessSetup
        difficulty={difficulty}
        playerColor={playerColor}
        colorMode={colorMode}
        pieceSet={pieceSet}
        boardTheme={boardTheme}
        playerName={playerName}
        onPlayerName={setPlayerName}
        onDifficulty={setDifficulty}
        onColorMode={updateColorMode}
        onPieceSet={updatePieceSet}
        onBoardTheme={updateBoardTheme}
        onStart={startGame}
      />
    )
  }

  return (
    <ChessGamePlaying
      key={gameKey}
      playerColor={playerColor}
      difficulty={difficulty}
      pieceSet={pieceSet}
      boardTheme={boardTheme}
      playerName={playerName.trim()}
      onExitSetup={() => setStarted(false)}
    />
  )
}
