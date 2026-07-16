import type { Translations } from '@/i18n/types'
import type { PortfolioContent } from '@/types/portfolio'
import { detectIntentHints } from '@/lib/portfolioChat/synonyms'
import { scoreChunks } from '@/lib/portfolioChat/score'
import {
  buildFallbackReply,
  buildReplyFromChunk,
  CONFIDENCE_THRESHOLD,
  getDefaultSuggestions,
} from '@/lib/portfolioChat/templates'
import type { ChatEngineResult, ChatKnowledge } from '@/lib/portfolioChat/types'

export function askPortfolioChat(
  query: string,
  knowledge: ChatKnowledge,
  content: PortfolioContent,
  t: Translations,
): ChatEngineResult {
  const trimmed = query.trim()
  const suggestions = getDefaultSuggestions(t)

  if (!trimmed) {
    return {
      reply: buildFallbackReply(content, t),
      suggestions,
    }
  }

  const intentHints = detectIntentHints(trimmed)

  if (intentHints.includes('greeting')) {
    const greeting = knowledge.chunks.find((c) => c.intent === 'greeting')
    if (greeting) {
      return {
        reply: buildReplyFromChunk(greeting, 1, content, t),
        suggestions,
      }
    }
  }

  if (intentHints.includes('thanks')) {
    const thanks = knowledge.chunks.find((c) => c.intent === 'thanks')
    if (thanks) {
      return {
        reply: buildReplyFromChunk(thanks, 1, content, t),
        suggestions,
      }
    }
  }

  const scored = scoreChunks(trimmed, knowledge.chunks, intentHints)
  const best = scored[0]

  if (!best || best.score < CONFIDENCE_THRESHOLD) {
    return {
      reply: buildFallbackReply(content, t),
      suggestions,
    }
  }

  const confidence = Math.min(1, best.score)

  return {
    reply: buildReplyFromChunk(best.chunk, confidence, content, t),
    suggestions,
  }
}

export { buildChatKnowledge } from '@/lib/portfolioChat/knowledge'
