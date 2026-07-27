import type { Locale } from '@/i18n/types'
import { chunkIdForProject, chunkIdForTopic, type GuideTopicId } from '@/lib/portfolioChat/guideTopics'

export interface GuideAudioManifest {
  version: string
  generatedAt: string
  format: 'wav'
  voices: Record<Locale, string>
  files: Record<Locale, string[]>
  /** Chunks already synthesized with Gemini — skipped on next `guide:audio` without --force. */
  gemini?: Record<Locale, string[]>
  provider?: string
}

export const GUIDE_AUDIO_BASE = '/audio/guide'

export function guideAudioUrl(locale: Locale, chunkId: string): string {
  return `${GUIDE_AUDIO_BASE}/${locale}/${chunkId}.wav`
}

export function chunkIdForGuideTopic(topicId: GuideTopicId): string | null {
  return chunkIdForTopic(topicId)
}

export function chunkIdForGuideProject(slug: string): string {
  return chunkIdForProject(slug)
}

export function isGuideAudioAvailable(
  manifest: GuideAudioManifest | null,
  locale: Locale,
  chunkId: string,
): boolean {
  return Boolean(manifest?.files[locale]?.includes(chunkId))
}
