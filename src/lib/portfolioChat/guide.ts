import type { Translations } from '@/i18n/types'
import type { PortfolioContent } from '@/types/portfolio'
import { buildReplyFromChunk } from '@/lib/portfolioChat/templates'
import type { ChatKnowledge, ChatReply } from '@/lib/portfolioChat/types'
import {
  chunkIdForProject,
  chunkIdForTopic,
  type GuideTopicId,
} from '@/lib/portfolioChat/guideTopics'

export function getGuideReplyForTopic(
  topicId: GuideTopicId,
  knowledge: ChatKnowledge,
  content: PortfolioContent,
  t: Translations,
): ChatReply | null {
  const chunkId = chunkIdForTopic(topicId)
  if (!chunkId) return null

  const chunk = knowledge.chunks.find((item) => item.id === chunkId)
  if (!chunk) return null

  return buildReplyFromChunk(chunk, 1, content, t)
}

export function getGuideReplyForProject(
  slug: string,
  knowledge: ChatKnowledge,
  content: PortfolioContent,
  t: Translations,
): ChatReply | null {
  const chunk = knowledge.chunks.find((item) => item.id === chunkIdForProject(slug))
  if (!chunk) return null

  return buildReplyFromChunk(chunk, 1, content, t)
}
