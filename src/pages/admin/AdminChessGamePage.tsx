import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Clock,
  CalendarDays,
  List,
  Info,
  RotateCcw,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ChessBoard } from '@/components/chess/ChessBoard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DIFFICULTY_PRESETS } from '@/lib/chess/stockfishEngine'
import { useTranslation } from '@/i18n/LanguageProvider'
import { createChess, type Square } from '@/lib/chess/chessRules'
import { readStoredBoardTheme, readStoredPieceSet } from '@/lib/chess/themes'
import { uciToMove } from '@/lib/chess/stockfishEngine'
import { formatDateTime } from '@/lib/formatDate'
import { cn } from '@/lib/utils'
import { fetchChessGameById } from '@/services/adminScores'
import { formatLeaderboardTime } from '@/services/chessGame'
import type { ChessGameRow } from '@/types/admin'

const DIFFICULTY_META: Record<string, { badge: string }> = {
  beginner: { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  intermediate: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  expert: { badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  soufiane: { badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
}

export function AdminChessGamePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, locale } = useTranslation()
  const [game, setGame] = useState<ChessGameRow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPly, setCurrentPly] = useState(0)
  const [sidebarTab, setSidebarTab] = useState<'details' | 'moves'>('details')

  const pieceSet = readStoredPieceSet()
  const boardTheme = readStoredBoardTheme()

  useEffect(() => {
    if (!id) return
    void (async () => {
      setIsLoading(true)
      const row = await fetchChessGameById(id)
      setGame(row)
      setIsLoading(false)
      if (!row) {
        toast.error(t.admin.chess.deleteError)
        navigate('/admin/chess', { replace: true })
      }
    })()
  }, [id, navigate, t])

  const uciList = useMemo(() => {
    if (!game) return []
    return game.uciMoves
      .split(/\s+/)
      .filter(Boolean)
      .filter((token) => /^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(token))
  }, [game])

  const totalPlies = uciList.length
  const canGoPrev = currentPly > 0
  const canGoNext = currentPly < totalPlies

  const chess = useMemo(() => {
    const instance = createChess()
    for (let i = 0; i < currentPly; i++) {
      const uci = uciList[i]
      if (!uci) break
      const parsed = uciToMove(uci)
      instance.move({
        from: parsed.from,
        to: parsed.to,
        promotion: parsed.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
      })
    }
    return instance
  }, [uciList, currentPly])

  const lastMove = useMemo(() => {
    if (currentPly === 0 || !uciList[currentPly - 1]) return null
    const parsed = uciToMove(uciList[currentPly - 1])
    return { from: parsed.from as Square, to: parsed.to as Square }
  }, [uciList, currentPly])

  const goToStart = useCallback(() => setCurrentPly(0), [])
  const goToEnd = useCallback(() => setCurrentPly(totalPlies), [totalPlies])
  const goPrev = useCallback(() => setCurrentPly((p) => Math.max(0, p - 1)), [])
  const goNext = useCallback(
    () => setCurrentPly((p) => Math.min(totalPlies, p + 1)),
    [totalPlies],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'Home') {
        e.preventDefault()
        goToStart()
      } else if (e.key === 'End') {
        e.preventDefault()
        goToEnd()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext, goToStart, goToEnd])

  const resultLabel = (value: string) => {
    if (value === 'win') return t.admin.chess.results.win
    if (value === 'loss') return t.admin.chess.results.loss
    if (value === 'draw') return t.admin.chess.results.draw
    return value
  }

  const resultStyle = (value: string) => {
    if (value === 'win') return 'text-emerald-600 dark:text-emerald-400'
    if (value === 'loss') return 'text-rose-600 dark:text-rose-400'
    return 'text-muted-foreground'
  }

  const movePairs = useMemo(() => {
    const pairs: { num: number; white: string; black: string | null; whitePly: number; blackPly: number }[] = []
    for (let i = 0; i < uciList.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1
      pairs.push({
        num: moveNum,
        white: uciToSan(uciList[i]),
        black: uciList[i + 1] ? uciToSan(uciList[i + 1]) : null,
        whitePly: i + 1,
        blackPly: i + 2,
      })
    }
    return pairs
  }, [uciList])

  const statusLabel = game ? resultLabel(game.result) : ''

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-2 py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
          <p className="text-sm text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    )
  }

  if (!game) return null

  const diffMeta = DIFFICULTY_META[game.difficulty] ?? DIFFICULTY_META.beginner
  const botElo = DIFFICULTY_PRESETS[game.difficulty as keyof typeof DIFFICULTY_PRESETS]?.approxElo ?? 0

  const tabButtonClass = (active: boolean) =>
    cn(
      'flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
      active
        ? 'bg-background text-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground',
    )

  const matchInfo = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-sm font-semibold tracking-wide">
          {t.admin.chess.detail.title}
        </p>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate('/admin/chess')}
          className="h-8 gap-1 px-2 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t.admin.chess.detail.backToList}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted/30 p-0.5">
        <button
          type="button"
          onClick={() => setSidebarTab('details')}
          className={tabButtonClass(sidebarTab === 'details')}
        >
          <Info className="h-3.5 w-3.5" />
          {t.admin.chess.detail.tabDetails}
        </button>
        <button
          type="button"
          onClick={() => setSidebarTab('moves')}
          className={tabButtonClass(sidebarTab === 'moves')}
        >
          <List className="h-3.5 w-3.5" />
          {t.admin.chess.detail.tabMoves}
        </button>
      </div>

      {sidebarTab === 'details' ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative overflow-hidden rounded-xl border border-border bg-background px-2.5 py-2.5 text-center shadow-sm">
              <p className="max-w-full truncate px-0.5 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                {game.playerName}
              </p>
              <div className="mt-1.5 flex flex-col items-center gap-1">
                <span
                  className={cn(
                    'h-7 w-7 rounded-full border-2 shadow-inner',
                    game.playerColor === 'w'
                      ? 'border-neutral-300 bg-[#f8f5f0]'
                      : 'border-neutral-700 bg-neutral-900',
                  )}
                  aria-hidden
                />
                <p className="text-xs font-bold sm:text-sm">
                  {game.playerColor === 'w' ? t.chessGame.white : t.chessGame.black}
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-border bg-background px-2.5 py-2.5 text-center shadow-sm">
              <span
                className={cn(
                  'absolute top-0 right-0 z-10 rounded-bl-lg rounded-tr-[0.65rem] px-1.5 py-0.5 text-[0.6rem] font-bold tabular-nums shadow-sm',
                  diffMeta.badge,
                )}
              >
                ~{botElo}
              </span>
              <p className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                {game.difficulty === 'soufiane' ? 'Soufiane' : 'Stockfish'}
              </p>
              <div className="mt-1.5 flex flex-col items-center gap-1">
                <span
                  className={cn(
                    'h-7 w-7 rounded-full border-2 shadow-inner',
                    game.playerColor === 'b'
                      ? 'border-neutral-300 bg-[#f8f5f0]'
                      : 'border-neutral-700 bg-neutral-900',
                  )}
                  aria-hidden
                />
                <p className="text-xs font-bold sm:text-sm">
                  {game.playerColor === 'b' ? t.chessGame.white : t.chessGame.black}
                </p>
              </div>
            </div>
          </div>

          <dl className="space-y-2 rounded-xl border border-border/80 bg-muted/20 p-3 text-xs">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">{t.admin.chess.detail.result}</dt>
              <dd className={cn('font-bold', resultStyle(game.result))}>
                {resultLabel(game.result)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">{t.admin.chess.detail.plies}</dt>
              <dd className="font-medium tabular-nums">{game.plyCount}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                {t.admin.chess.detail.time}
              </dt>
              <dd className="font-mono font-medium tabular-nums">
                {formatLeaderboardTime(game.seconds)}
              </dd>
            </div>
            {game.openingName && (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">{t.admin.chess.detail.opening}</dt>
                <dd className="max-w-[140px] truncate text-right font-medium">
                  {game.openingName}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1 text-muted-foreground">
                <Lightbulb className="h-3 w-3" />
                {t.admin.chess.detail.hintsUsed}
              </dt>
              <dd className="font-medium tabular-nums">{game.hintsUsed}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border/70 pt-2">
              <dt className="flex items-center gap-1 text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {t.admin.chess.detail.date}
              </dt>
              <dd className="text-right">{formatDateTime(game.createdAt, locale)}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {movePairs.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
              {t.admin.chess.detail.noMoves}
            </p>
          ) : (
            <div className="max-h-[28rem] overflow-y-auto rounded-xl border border-border/80 bg-muted/20 sm:max-h-96">
              <ol className="py-1">
                {movePairs.map((pair, rowIdx) => {
                  const isWhiteActive = currentPly === pair.whitePly
                  const isBlackActive = currentPly === pair.blackPly
                  const isCurrentRow = isWhiteActive || isBlackActive
                  return (
                    <li
                      key={pair.num}
                      className={cn(
                        'grid grid-cols-[2.25rem_1fr_1fr] items-center transition-colors duration-150',
                        isCurrentRow && 'bg-primary/8 border-l-2 border-l-primary',
                        !isCurrentRow && rowIdx % 2 === 1 && 'bg-muted/30',
                      )}
                    >
                      <span
                        className={cn(
                          'pr-2 text-right font-mono text-[0.65rem] font-bold tabular-nums',
                          isCurrentRow ? 'text-primary' : 'text-muted-foreground/60',
                        )}
                      >
                        {pair.num}.
                      </span>
                      <div className="min-w-0 py-0.5 pr-1">
                        <button
                          type="button"
                          className={cn(
                            'flex min-w-0 items-center gap-1 rounded-md px-1.5 py-[3px] text-left font-mono text-sm tabular-nums transition-all duration-150',
                            isWhiteActive
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-foreground hover:bg-muted/70',
                          )}
                          onClick={() => setCurrentPly(pair.whitePly)}
                        >
                          <span className="truncate leading-none">{pair.white}</span>
                        </button>
                      </div>
                      <div className="min-w-0 py-0.5 pl-1">
                        {pair.black ? (
                          <button
                            type="button"
                            className={cn(
                              'flex min-w-0 items-center gap-1 rounded-md px-1.5 py-[3px] text-left font-mono text-sm tabular-nums transition-all duration-150',
                              isBlackActive
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-foreground hover:bg-muted/70',
                            )}
                            onClick={() => setCurrentPly(pair.blackPly)}
                          >
                            <span className="truncate leading-none">{pair.black}</span>
                          </button>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-start lg:gap-6">
      <div className="min-w-0 space-y-2.5 sm:space-y-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className={cn('font-display text-sm font-semibold sm:text-base', resultStyle(game.result))}>
              {statusLabel}
            </p>
            {game.openingName && (
              <p className="mt-0.5 truncate text-[0.7rem] text-muted-foreground sm:text-xs">
                {game.openingName}
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto aspect-square w-full max-w-[min(100%,36rem)] overflow-hidden rounded-2xl border border-border shadow-lg">
          <ChessBoard
            chess={chess}
            orientation={game.playerColor === 'b' ? 'b' : 'w'}
            selected={null}
            legalTargets={[]}
            lastMove={lastMove}
            hintSquare={null}
            disabled
            preview
            pieceSet={pieceSet}
            boardTheme={boardTheme}
          />
        </div>

        <div className="mx-auto flex w-full max-w-[min(100%,min(92vw,36rem))] items-center justify-center gap-1.5 sm:gap-2 md:max-w-[min(100%,34rem)] lg:max-w-[min(100%,36rem)]">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 sm:h-10 sm:w-10"
            onClick={goToStart}
            disabled={!canGoPrev}
            aria-label={t.admin.chess.detail.start}
          >
            <ChevronFirst className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 sm:h-10 sm:w-10"
            onClick={goPrev}
            disabled={!canGoPrev}
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-[4.75rem] rounded-xl border border-border bg-card px-2.5 py-1.5 text-center text-xs font-medium tabular-nums sm:min-w-[6.5rem] sm:px-3 sm:py-2">
            {currentPly} / {totalPlies}
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 sm:h-10 sm:w-10"
            onClick={goNext}
            disabled={!canGoNext}
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 sm:h-10 sm:w-10"
            onClick={goToEnd}
            disabled={!canGoNext}
            aria-label={t.admin.chess.detail.end}
          >
            <ChevronLast className="h-4 w-4" />
          </button>
        </div>

        <Card className="p-3 sm:p-3.5 lg:hidden">{matchInfo}</Card>
      </div>

      <Card className="hidden max-h-[calc(100vh-6.5rem)] overflow-y-auto p-3.5 lg:sticky lg:top-24 lg:block">
        {matchInfo}
      </Card>
    </div>
  )
}

function uciToSan(uci: string): string {
  if (!uci || uci.length < 4) return uci
  const from = uci.slice(0, 2)
  const to = uci.slice(2, 4)
  const promo = uci.length > 4 ? uci[4] : ''
  const files = 'abcdefgh'
  const fromFile = files[from.charCodeAt(0) - 97]
  const toFile = files[to.charCodeAt(0) - 97]
  const toRank = to[1]
  if (fromFile === toFile) {
    let san = `${toFile}${toRank}`
    if (promo) san += `=${promo.toUpperCase()}`
    return san
  }
  let san = `${fromFile}x${toFile}${toRank}`
  if (promo) san += `=${promo.toUpperCase()}`
  return san
}
