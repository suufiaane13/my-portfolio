import { fuzzyTokenMatch, tokenize } from '@/lib/portfolioChat/normalize'
import { expandSynonyms } from '@/lib/portfolioChat/synonyms'
import type { ChatChunk, ChatIntent } from '@/lib/portfolioChat/types'

const INTENT_BOOST: Partial<Record<ChatIntent, number>> = {
  greeting: 0.35,
  thanks: 0.35,
  about: 0.1,
  skills: 0.1,
  projects: 0.1,
  contact: 0.12,
  cv: 0.15,
  game: 0.12,
}

export interface ScoredChunk {
  chunk: ChatChunk
  score: number
}

export function scoreChunks(query: string, chunks: ChatChunk[], intentHints: string[]): ScoredChunk[] {
  const tokens = expandSynonyms(tokenize(query))
  if (tokens.length === 0) return []

  return chunks
    .map((chunk) => {
      let score = 0
      const keywordSet = chunk.keywords.map((k) => k.toLowerCase())

      for (const token of tokens) {
        for (const keyword of keywordSet) {
          if (token === keyword) score += 1.2
          else if (fuzzyTokenMatch(token, keyword)) score += 0.7
        }
      }

      if (chunk.title && tokens.some((t) => chunk.title.toLowerCase().includes(t))) {
        score += 0.8
      }

      if (intentHints.includes(chunk.intent)) {
        score += INTENT_BOOST[chunk.intent] ?? 0.08
      }

      const normalizedQuery = query.toLowerCase()
      if (chunk.id.includes('project-') && keywordSet.some((k) => normalizedQuery.includes(k))) {
        score += 1.5
      }

      return { chunk, score: score / Math.max(tokens.length, 1) }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
}
