import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Trash2, RefreshCw, Loader2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/i18n/LanguageProvider'
import type { Locale } from '@/i18n/types'

interface GuideAudioManagerProps {
  chunkId: string
  locale: Locale
  isPresent: boolean
  audioUrl: string
  onRegenerate: () => Promise<boolean>
  onDelete: () => Promise<boolean>
}

export function GuideAudioManager({
  chunkId,
  locale,
  isPresent,
  audioUrl,
  onRegenerate,
  onDelete,
}: GuideAudioManagerProps) {
  const { t } = useTranslation()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const togglePlay = () => {
    if (!isPresent) return

    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      return
    }

    const audio = new Audio(audioUrl)
    audioRef.current = audio
    audio.onended = () => setIsPlaying(false)
    audio.onerror = () => setIsPlaying(false)
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    const ok = await onRegenerate()
    setIsRegenerating(false)
    return ok
  }

  const handleDelete = async () => {
    if (!window.confirm(t.admin.guide.audioDeleteConfirm)) return
    setIsDeleting(true)
    await onDelete()
    setIsDeleting(false)
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-mono text-muted-foreground">
          {chunkId}.wav
        </p>
        <p className="text-xs text-muted-foreground">
          {locale.toUpperCase()} —{' '}
          {isPresent ? (
            <span className="text-green-500">{t.admin.guide.audioPresent}</span>
          ) : (
            <span className="text-amber-500">{t.admin.guide.audioMissing}</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {isPresent && (
          <Button
            size="sm"
            variant="ghost"
            onClick={togglePlay}
            disabled={isRegenerating || isDeleting}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={handleRegenerate}
          disabled={isRegenerating || isDeleting}
        >
          {isRegenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>

        {isPresent && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={isRegenerating || isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-destructive" />
            )}
          </Button>
        )}

        {!isPresent && (
          <VolumeX className="h-4 w-4 text-muted-foreground/30" />
        )}
      </div>
    </div>
  )
}
