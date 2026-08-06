import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GuideChunkId } from '@/services/admin/guide'

interface GuideTopicCardProps {
  chunkId: GuideChunkId
  label: string
  hasFrAudio: boolean
  hasEnAudio: boolean
  isSelected: boolean
  onSelect: () => void
}

const CHUNK_ICONS: Record<string, string> = {
  'about-main': '👤',
  'about-availability': '💼',
  'skills-overview': '💻',
  'experience-list': '📋',
  'education-list': '🎓',
  'contact-main': '📧',
  'cv-download': '📄',
  'game-info': '🎮',
  'project-myfood': '📱',
  'project-pure-power-menu': '🍕',
  'project-world-explorer': '🌍',
  'project-sultan-kunafa': '🍰',
}

export function GuideTopicCard({
  chunkId,
  label,
  hasFrAudio,
  hasEnAudio,
  isSelected,
  onSelect,
}: GuideTopicCardProps) {
  const icon = CHUNK_ICONS[chunkId] ?? '📝'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
        isSelected
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-border hover:bg-muted/50',
      )}
    >
      <span className="text-xl">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {hasFrAudio ? (
              <Volume2 className="h-3 w-3 text-green-500" />
            ) : (
              <VolumeX className="h-3 w-3 text-muted-foreground/50" />
            )}
            FR
          </span>
          <span className="flex items-center gap-1">
            {hasEnAudio ? (
              <Volume2 className="h-3 w-3 text-green-500" />
            ) : (
              <VolumeX className="h-3 w-3 text-muted-foreground/50" />
            )}
            EN
          </span>
        </div>
      </div>
    </button>
  )
}
