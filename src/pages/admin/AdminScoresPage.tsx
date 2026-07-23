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
import { deleteScore, fetchAllScores } from '@/services/adminScores'
import type { MemoryScoreRow } from '@/types/admin'

export function AdminScoresPage() {
  const { t, locale } = useTranslation()
  const [scores, setScores] = useState<MemoryScoreRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState<MemoryScoreRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { page, setPage, pageCount, pageItems, total, pageSize } = useClientPagination(
    scores,
    ADMIN_PAGE_SIZE,
  )

  useEffect(() => {
    document.title = `${t.admin.nav.scores} — ${t.admin.title}`
  }, [t])

  const loadScores = async () => {
    setIsLoading(true)
    const data = await fetchAllScores()
    setScores(data)
    setIsLoading(false)
  }

  useEffect(() => {
    void loadScores()
  }, [])

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    setIsDeleting(true)
    const ok = await deleteScore(pendingDelete.id)
    setIsDeleting(false)

    if (!ok) {
      toast.error(t.admin.scores.deleteError)
      return
    }

    toast.success(t.admin.scores.deleteSuccess)
    setPendingDelete(null)
    await loadScores()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold sm:text-2xl">{t.admin.nav.scores}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.admin.scores.subtitle}</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : total === 0 ? (
        <Card className="px-4 py-10 text-center text-sm text-muted-foreground">
          {t.admin.scores.empty}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* Mobile cards */}
          <ul className="divide-y divide-border md:hidden">
            {pageItems.map((score) => (
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
                        <dd className="mt-0.5 font-medium tabular-nums text-foreground">{score.moves}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{t.admin.scores.columns.time}</dt>
                        <dd className="mt-0.5 font-mono font-medium tabular-nums text-foreground">
                          {formatLeaderboardTime(score.seconds)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{t.admin.scores.columns.date}</dt>
                        <dd className="mt-0.5 text-foreground">
                          {formatDateTime(score.createdAt, locale)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => setPendingDelete(score)}
                    aria-label={t.admin.scores.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
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
                {pageItems.map((score) => (
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
                        onClick={() => setPendingDelete(score)}
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
            page={page}
            pageCount={pageCount}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </Card>
      )}

      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        description={t.admin.scores.confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
