import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ADMIN_PAGE_SIZE, useClientPagination } from '@/hooks/useClientPagination'
import { useTranslation } from '@/i18n/LanguageProvider'
import { formatDateTime } from '@/lib/formatDate'
import { formatLeaderboardTime } from '@/services/memoryGame'
import {
  deleteChessGame,
  deleteScore,
  fetchAllChessGames,
  fetchAllScores,
} from '@/services/adminScores'
import type { ChessGameRow, MemoryScoreRow } from '@/types/admin'

type ScoresTab = 'memory' | 'chess'

export function AdminScoresPage() {
  const { t, locale } = useTranslation()
  const [tab, setTab] = useState<ScoresTab>('memory')
  const [scores, setScores] = useState<MemoryScoreRow[]>([])
  const [chessGames, setChessGames] = useState<ChessGameRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pendingDeleteMemory, setPendingDeleteMemory] = useState<MemoryScoreRow | null>(null)
  const [pendingDeleteChess, setPendingDeleteChess] = useState<ChessGameRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const memoryPagination = useClientPagination(scores, ADMIN_PAGE_SIZE)
  const chessPagination = useClientPagination(chessGames, ADMIN_PAGE_SIZE)

  useEffect(() => {
    document.title = `${t.admin.nav.scores} — ${t.admin.title}`
  }, [t])

  const loadScores = async () => {
    setIsLoading(true)
    const [memory, chess] = await Promise.all([fetchAllScores(), fetchAllChessGames()])
    setScores(memory)
    setChessGames(chess)
    setIsLoading(false)
  }

  useEffect(() => {
    void loadScores()
  }, [])

  const handleConfirmDeleteMemory = async () => {
    if (!pendingDeleteMemory) return
    setIsDeleting(true)
    const ok = await deleteScore(pendingDeleteMemory.id)
    setIsDeleting(false)

    if (!ok) {
      toast.error(t.admin.scores.deleteError)
      return
    }

    toast.success(t.admin.scores.deleteSuccess)
    setPendingDeleteMemory(null)
    await loadScores()
  }

  const handleConfirmDeleteChess = async () => {
    if (!pendingDeleteChess) return
    setIsDeleting(true)
    const ok = await deleteChessGame(pendingDeleteChess.id)
    setIsDeleting(false)

    if (!ok) {
      toast.error(t.admin.scores.deleteError)
      return
    }

    toast.success(t.admin.scores.deleteSuccess)
    setPendingDeleteChess(null)
    await loadScores()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold sm:text-2xl">{t.admin.nav.scores}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.admin.scores.subtitle}</p>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={tab === 'memory' ? 'primary' : 'outline'}
          onClick={() => setTab('memory')}
        >
          {t.admin.scores.tabMemory}
        </Button>
        <Button
          size="sm"
          variant={tab === 'chess' ? 'primary' : 'outline'}
          onClick={() => setTab('chess')}
        >
          {t.admin.scores.tabChess}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : tab === 'memory' ? (
        memoryPagination.total === 0 ? (
          <Card className="px-4 py-10 text-center text-sm text-muted-foreground">
            {t.admin.scores.empty}
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <ul className="divide-y divide-border md:hidden">
              {memoryPagination.pageItems.map((score) => (
                <li key={score.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-primary/10 px-2 text-xs font-bold tabular-nums text-primary">
                          #{score.rank ?? '—'}
                        </span>
                        <p className="truncate font-semibold text-foreground">{score.playerName}</p>
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                        <div>
                          <dt className="text-muted-foreground">{t.admin.scores.columns.grid}</dt>
                          <dd className="mt-0.5 font-medium text-foreground">
                            {score.gridSize}×{score.gridSize}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">{t.admin.scores.columns.moves}</dt>
                          <dd className="mt-0.5 font-medium tabular-nums text-foreground">
                            {score.moves}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">{t.admin.scores.columns.time}</dt>
                          <dd className="mt-0.5 font-mono font-medium tabular-nums text-foreground">
                            {formatLeaderboardTime(score.seconds)}
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-muted-foreground">{t.admin.scores.columns.date}</dt>
                          <dd className="mt-0.5 overflow-x-auto whitespace-nowrap text-foreground">
                            {formatDateTime(score.createdAt, locale)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => setPendingDeleteMemory(score)}
                      aria-label={t.admin.scores.delete}
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
                    <th className="px-4 py-3 font-medium">{t.admin.scores.columns.rank}</th>
                    <th className="px-4 py-3 font-medium">{t.admin.scores.columns.player}</th>
                    <th className="px-4 py-3 font-medium">{t.admin.scores.columns.grid}</th>
                    <th className="px-4 py-3 font-medium">{t.admin.scores.columns.moves}</th>
                    <th className="px-4 py-3 font-medium">{t.admin.scores.columns.time}</th>
                    <th className="px-4 py-3 font-medium">{t.admin.scores.columns.date}</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {memoryPagination.pageItems.map((score) => (
                    <tr key={score.id} className="border-b border-border/70">
                      <td className="px-4 py-3 tabular-nums">{score.rank ?? '—'}</td>
                      <td className="px-4 py-3 font-medium">{score.playerName}</td>
                      <td className="px-4 py-3">
                        {score.gridSize}×{score.gridSize}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{score.moves}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">
                        {formatLeaderboardTime(score.seconds)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDateTime(score.createdAt, locale)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPendingDeleteMemory(score)}
                          aria-label={t.admin.scores.delete}
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
              page={memoryPagination.page}
              pageCount={memoryPagination.pageCount}
              total={memoryPagination.total}
              pageSize={memoryPagination.pageSize}
              onPageChange={memoryPagination.setPage}
            />
          </Card>
        )
      ) : chessPagination.total === 0 ? (
        <Card className="px-4 py-10 text-center text-sm text-muted-foreground">
          {t.admin.scores.chessEmpty}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-border md:hidden">
            {chessPagination.pageItems.map((game) => (
              <li key={game.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{game.playerName}</p>
                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                      <div>
                        <dt className="text-muted-foreground">{t.admin.scores.columns.difficulty}</dt>
                        <dd className="mt-0.5 font-medium capitalize text-foreground">
                          {game.difficulty}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{t.admin.scores.columns.result}</dt>
                        <dd className="mt-0.5 font-medium capitalize text-foreground">{game.result}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{t.admin.scores.columns.plies}</dt>
                        <dd className="mt-0.5 font-medium tabular-nums text-foreground">
                          {game.plyCount}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{t.admin.scores.columns.time}</dt>
                        <dd className="mt-0.5 font-mono font-medium tabular-nums text-foreground">
                          {formatLeaderboardTime(game.seconds)}
                        </dd>
                      </div>
                      <div className="col-span-2 min-w-0">
                        <dt className="text-muted-foreground">{t.admin.scores.columns.date}</dt>
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
                    onClick={() => setPendingDeleteChess(game)}
                    aria-label={t.admin.scores.delete}
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
                  <th className="px-4 py-3 font-medium">{t.admin.scores.columns.player}</th>
                  <th className="px-4 py-3 font-medium">{t.admin.scores.columns.difficulty}</th>
                  <th className="px-4 py-3 font-medium">{t.admin.scores.columns.result}</th>
                  <th className="px-4 py-3 font-medium">{t.admin.scores.columns.color}</th>
                  <th className="px-4 py-3 font-medium">{t.admin.scores.columns.plies}</th>
                  <th className="px-4 py-3 font-medium">{t.admin.scores.columns.time}</th>
                  <th className="px-4 py-3 font-medium">{t.admin.scores.columns.date}</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {chessPagination.pageItems.map((game) => (
                  <tr key={game.id} className="border-b border-border/70">
                    <td className="px-4 py-3 font-medium">{game.playerName}</td>
                    <td className="px-4 py-3 capitalize">{game.difficulty}</td>
                    <td className="px-4 py-3 capitalize">{game.result}</td>
                    <td className="px-4 py-3 uppercase">{game.playerColor}</td>
                    <td className="px-4 py-3 tabular-nums">{game.plyCount}</td>
                    <td className="px-4 py-3 font-mono tabular-nums">
                      {formatLeaderboardTime(game.seconds)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(game.createdAt, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPendingDeleteChess(game)}
                        aria-label={t.admin.scores.delete}
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
            page={chessPagination.page}
            pageCount={chessPagination.pageCount}
            total={chessPagination.total}
            pageSize={chessPagination.pageSize}
            onPageChange={chessPagination.setPage}
          />
        </Card>
      )}

      <ConfirmDeleteDialog
        open={Boolean(pendingDeleteMemory)}
        onClose={() => setPendingDeleteMemory(null)}
        onConfirm={handleConfirmDeleteMemory}
        description={t.admin.scores.confirmDelete}
        isLoading={isDeleting}
      />
      <ConfirmDeleteDialog
        open={Boolean(pendingDeleteChess)}
        onClose={() => setPendingDeleteChess(null)}
        onConfirm={handleConfirmDeleteChess}
        description={t.admin.scores.chessConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
