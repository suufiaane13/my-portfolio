import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ADMIN_PAGE_SIZE, useClientPagination } from '@/hooks/useClientPagination'
import { useTranslation } from '@/i18n/LanguageProvider'
import { formatLeaderboardTime } from '@/services/memoryGame'
import { deleteScore, fetchAllScores } from '@/services/adminScores'
import type { MemoryScoreRow } from '@/types/admin'

export function AdminScoresPage() {
  const { t } = useTranslation()
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
        <h1 className="font-display text-2xl font-bold">{t.admin.nav.scores}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.admin.scores.subtitle}</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
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
                {total === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      {t.admin.scores.empty}
                    </td>
                  </tr>
                ) : (
                  pageItems.map((score) => (
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
                        {new Date(score.createdAt).toLocaleString()}
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
                  ))
                )}
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
