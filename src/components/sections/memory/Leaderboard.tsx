import { Medal, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { GridSize } from '@/data/memoryGame'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'
import {
  fetchLeaderboard,
  formatLeaderboardTime,
  isLeaderboardEnabled,
  type LeaderboardEntry,
} from '@/services/memoryGame'

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return <Medal className="h-4 w-4 text-amber-400" aria-hidden="true" />
  }
  if (rank === 2) {
    return <Medal className="h-4 w-4 text-slate-300" aria-hidden="true" />
  }
  if (rank === 3) {
    return <Medal className="h-4 w-4 text-amber-700" aria-hidden="true" />
  }

  return (
    <span className="inline-flex h-5 w-5 items-center justify-center text-xs font-semibold text-muted-foreground">
      {rank}
    </span>
  )
}

interface LeaderboardProps {
  gridSize: GridSize
  refreshKey?: number
}

export function Leaderboard({ gridSize, refreshKey = 0 }: LeaderboardProps) {
  const { t } = useTranslation()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isLeaderboardEnabled()) {
      setEntries([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    void fetchLeaderboard(gridSize).then((data) => {
      if (cancelled) return
      setEntries(data)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [gridSize, refreshKey])

  if (!isLeaderboardEnabled()) return null

  return (
    <div className="memory-leaderboard mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-[var(--memory-blue)]" aria-hidden="true" />
        <h3 className="font-display text-lg font-semibold text-foreground">
          {t.memoryGame.leaderboard.title}
        </h3>
        <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {gridSize}×{gridSize}
        </span>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t.memoryGame.leaderboard.loading}</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.memoryGame.leaderboard.empty}</p>
      ) : (
        <ol className="space-y-2" aria-label={t.memoryGame.leaderboard.title}>
          {entries.map((entry) => (
            <li
              key={entry.id}
              className={cn(
                'memory-leaderboard__row flex items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-2.5',
                entry.rank <= 3 && 'memory-leaderboard__row--top',
              )}
            >
              <div className="flex w-6 shrink-0 justify-center">
                <RankBadge rank={entry.rank} />
              </div>
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                {entry.playerName}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {entry.moves} {t.memoryGame.moves.toLowerCase()}
              </span>
              <span className="shrink-0 font-mono text-sm tabular-nums text-foreground">
                {formatLeaderboardTime(entry.seconds)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
