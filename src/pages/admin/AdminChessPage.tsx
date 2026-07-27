import { CalendarDays, ChessKnight, Percent, RotateCcw, Search, Trash2, Trophy } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog'
import { StatCard } from '@/components/admin/StatCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ADMIN_PAGE_SIZE, useClientPagination } from '@/hooks/useClientPagination'
import { useTranslation } from '@/i18n/LanguageProvider'
import { formatDateTime } from '@/lib/formatDate'
import { cn } from '@/lib/utils'
import { deleteChessGame, fetchAllChessGames } from '@/services/adminScores'
import { formatLeaderboardTime } from '@/services/chessGame'
import type { ChessGameRow } from '@/types/admin'

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'expert'
type ResultFilter = 'all' | 'win' | 'loss' | 'draw'

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function FilterSegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: ReadonlyArray<{ value: T; label: string }>
  onChange: (value: T) => void
}) {
  return (
    <div className="min-w-0 space-y-2">
      <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <div
        role="radiogroup"
        aria-label={label}
        className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="inline-flex min-w-full gap-1 rounded-xl border border-border/70 bg-muted/50 p-1 sm:min-w-0">
          {options.map((option) => {
            const active = value === option.value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(option.value)}
                className={cn(
                  'shrink-0 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-all sm:px-3.5 sm:text-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border/60'
                    : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function AdminChessPage() {
  const { t, locale } = useTranslation()
  const [games, setGames] = useState<ChessGameRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState<ChessGameRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const [result, setResult] = useState<ResultFilter>('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    document.title = `${t.admin.nav.chess} — ${t.admin.title}`
  }, [t])

  const loadGames = async () => {
    setIsLoading(true)
    const rows = await fetchAllChessGames(200)
    setGames(rows)
    setIsLoading(false)
  }

  useEffect(() => {
    void loadGames()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return games.filter((game) => {
      if (difficulty !== 'all' && game.difficulty !== difficulty) return false
      if (result !== 'all' && game.result !== result) return false
      if (q && !game.playerName.toLowerCase().includes(q)) return false
      return true
    })
  }, [difficulty, games, query, result])

  const pagination = useClientPagination(filtered, ADMIN_PAGE_SIZE)
  const filtersActive = difficulty !== 'all' || result !== 'all' || query.trim().length > 0

  const difficultyOptions = useMemo(
    () =>
      [
        { value: 'all' as const, label: t.admin.chess.filters.all },
        { value: 'beginner' as const, label: t.chessGame.levels.beginner },
        { value: 'intermediate' as const, label: t.chessGame.levels.intermediate },
        { value: 'expert' as const, label: t.chessGame.levels.expert },
      ] as const,
    [t],
  )

  const resultOptions = useMemo(
    () =>
      [
        { value: 'all' as const, label: t.admin.chess.filters.all },
        { value: 'win' as const, label: t.admin.chess.results.win },
        { value: 'loss' as const, label: t.admin.chess.results.loss },
        { value: 'draw' as const, label: t.admin.chess.results.draw },
      ] as const,
    [t],
  )

  const stats = useMemo(() => {
    const since7d = daysAgoIso(7)
    const wins = games.filter((game) => game.result === 'win')
    const winsByDifficulty = {
      beginner: wins.filter((game) => game.difficulty === 'beginner').length,
      intermediate: wins.filter((game) => game.difficulty === 'intermediate').length,
      expert: wins.filter((game) => game.difficulty === 'expert').length,
    }
    const openings = new Map<string, number>()
    for (const game of games) {
      const name = game.openingName?.trim()
      if (!name) continue
      openings.set(name, (openings.get(name) ?? 0) + 1)
    }
    const topOpening =
      [...openings.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? t.admin.chess.noOpening

    return {
      total: games.length,
      wins: wins.length,
      last7d: games.filter((game) => game.createdAt >= since7d).length,
      winRate: games.length === 0 ? 0 : Math.round((wins.length / games.length) * 100),
      winsByDifficulty,
      topOpening,
    }
  }, [games, t.admin.chess.noOpening])

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    setIsDeleting(true)
    const ok = await deleteChessGame(pendingDelete.id)
    setIsDeleting(false)

    if (!ok) {
      toast.error(t.admin.chess.deleteError)
      return
    }

    toast.success(t.admin.chess.deleteSuccess)
    setPendingDelete(null)
    await loadGames()
  }

  const clearFilters = () => {
    setDifficulty('all')
    setResult('all')
    setQuery('')
  }

  const resultLabel = (value: string) => {
    if (value === 'win') return t.admin.chess.results.win
    if (value === 'loss') return t.admin.chess.results.loss
    if (value === 'draw') return t.admin.chess.results.draw
    return value
  }

  const difficultyLabel = (value: string) => {
    if (value === 'beginner') return t.chessGame.levels.beginner
    if (value === 'intermediate') return t.chessGame.levels.intermediate
    if (value === 'expert') return t.chessGame.levels.expert
    return value
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold sm:text-2xl">{t.admin.nav.chess}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.admin.chess.subtitle}</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard label={t.admin.chess.stats.total} value={stats.total} icon={ChessKnight} />
            <StatCard label={t.admin.chess.stats.wins} value={stats.wins} icon={Trophy} />
            <StatCard label={t.admin.chess.stats.last7d} value={stats.last7d} icon={CalendarDays} />
            <StatCard
              label={t.admin.chess.stats.winRate}
              value={`${stats.winRate}%`}
              icon={Percent}
            />
          </div>

          <Card className="p-5">
            <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-8">
              <div>
                <p className="mb-2 text-sm text-muted-foreground">{t.admin.chess.stats.winsByLevel}</p>
                <dl className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">{t.chessGame.levels.beginner}</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">
                      {stats.winsByDifficulty.beginner}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t.chessGame.levels.intermediate}</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">
                      {stats.winsByDifficulty.intermediate}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t.chessGame.levels.expert}</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">
                      {stats.winsByDifficulty.expert}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="min-w-0 border-t border-border/70 pt-4 sm:max-w-xs sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {t.admin.chess.stats.topOpening}
                </p>
                <p className="mt-1 text-sm font-medium break-words text-foreground">
                  {stats.topOpening}
                </p>
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t.admin.chess.searchPlaceholder}
                  className="pl-9"
                  aria-label={t.admin.chess.searchPlaceholder}
                />
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <p className="text-xs text-muted-foreground tabular-nums sm:text-sm">
                  {t.admin.chess.filters.matching.replace(
                    '{{count}}',
                    String(pagination.total),
                  )}
                </p>
                {filtersActive && (
                  <Button size="sm" variant="outline" onClick={clearFilters}>
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    {t.admin.chess.filters.clear}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 border-t border-border/70 pt-4 lg:grid-cols-2">
              <FilterSegmentedControl
                label={t.admin.chess.columns.difficulty}
                value={difficulty}
                options={difficultyOptions}
                onChange={setDifficulty}
              />
              <FilterSegmentedControl
                label={t.admin.chess.columns.result}
                value={result}
                options={resultOptions}
                onChange={setResult}
              />
            </div>
          </Card>

          {pagination.total === 0 ? (
            <Card className="px-4 py-10 text-center text-sm text-muted-foreground">
              {t.admin.chess.empty}
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-border md:hidden">
                {pagination.pageItems.map((game) => (
                  <li key={game.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">{game.playerName}</p>
                        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                          <div>
                            <dt className="text-muted-foreground">{t.admin.chess.columns.difficulty}</dt>
                            <dd className="mt-0.5 font-medium text-foreground">
                              {difficultyLabel(game.difficulty)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">{t.admin.chess.columns.result}</dt>
                            <dd
                              className={cn(
                                'mt-0.5 font-medium',
                                game.result === 'win' && 'text-emerald-600 dark:text-emerald-400',
                                game.result === 'loss' && 'text-rose-600 dark:text-rose-400',
                              )}
                            >
                              {resultLabel(game.result)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">{t.admin.chess.columns.plies}</dt>
                            <dd className="mt-0.5 font-medium tabular-nums text-foreground">
                              {game.plyCount}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">{t.admin.chess.columns.time}</dt>
                            <dd className="mt-0.5 font-mono font-medium tabular-nums text-foreground">
                              {formatLeaderboardTime(game.seconds)}
                            </dd>
                          </div>
                          <div className="col-span-2 min-w-0">
                            <dt className="text-muted-foreground">{t.admin.chess.columns.opening}</dt>
                            <dd className="mt-0.5 truncate text-foreground">
                              {game.openingName || '—'}
                            </dd>
                          </div>
                          <div className="col-span-2 min-w-0">
                            <dt className="text-muted-foreground">{t.admin.chess.columns.date}</dt>
                            <dd className="mt-0.5 overflow-x-auto whitespace-nowrap text-foreground">
                              {formatDateTime(game.createdAt, locale)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => setPendingDelete(game)}
                        aria-label={t.admin.chess.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">{t.admin.chess.columns.player}</th>
                      <th className="px-4 py-3 font-medium">{t.admin.chess.columns.difficulty}</th>
                      <th className="px-4 py-3 font-medium">{t.admin.chess.columns.result}</th>
                      <th className="px-4 py-3 font-medium">{t.admin.chess.columns.color}</th>
                      <th className="px-4 py-3 font-medium">{t.admin.chess.columns.plies}</th>
                      <th className="px-4 py-3 font-medium">{t.admin.chess.columns.time}</th>
                      <th className="px-4 py-3 font-medium">{t.admin.chess.columns.opening}</th>
                      <th className="px-4 py-3 font-medium">{t.admin.chess.columns.date}</th>
                      <th className="px-4 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {pagination.pageItems.map((game) => (
                      <tr key={game.id} className="border-b border-border/70">
                        <td className="px-4 py-3 font-medium">{game.playerName}</td>
                        <td className="px-4 py-3">{difficultyLabel(game.difficulty)}</td>
                        <td
                          className={cn(
                            'px-4 py-3 font-medium',
                            game.result === 'win' && 'text-emerald-600 dark:text-emerald-400',
                            game.result === 'loss' && 'text-rose-600 dark:text-rose-400',
                          )}
                        >
                          {resultLabel(game.result)}
                        </td>
                        <td className="px-4 py-3 uppercase">{game.playerColor}</td>
                        <td className="px-4 py-3 tabular-nums">{game.plyCount}</td>
                        <td className="px-4 py-3 font-mono tabular-nums">
                          {formatLeaderboardTime(game.seconds)}
                        </td>
                        <td className="max-w-[10rem] truncate px-4 py-3 text-muted-foreground">
                          {game.openingName || '—'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDateTime(game.createdAt, locale)}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPendingDelete(game)}
                            aria-label={t.admin.chess.delete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <AdminPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onPageChange={pagination.setPage}
              />
            </Card>
          )}
        </>
      )}

      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        description={t.admin.chess.confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
