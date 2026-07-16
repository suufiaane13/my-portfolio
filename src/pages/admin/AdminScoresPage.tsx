import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useTranslation } from '@/i18n/LanguageProvider'
import { formatLeaderboardTime } from '@/services/memoryGame'
import { deleteScore, fetchAllScores } from '@/services/adminScores'
import type { MemoryScoreRow } from '@/types/admin'

export function AdminScoresPage() {
  const { t } = useTranslation()
  const [scores, setScores] = useState<MemoryScoreRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.admin.scores.confirmDelete)) return

    setDeletingId(id)
    const ok = await deleteScore(id)
    setDeletingId(null)

    if (!ok) {
      toast.error(t.admin.scores.deleteError)
      return
    }

    toast.success(t.admin.scores.deleteSuccess)
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
        <Card className="overflow-x-auto">
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
              {scores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    {t.admin.scores.empty}
                  </td>
                </tr>
              ) : (
                scores.map((score) => (
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
                        disabled={deletingId === score.id}
                        onClick={() => void handleDelete(score.id)}
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
        </Card>
      )}
    </div>
  )
}
