import type { Translations } from '@/i18n/types'
import type { PortfolioContent } from '@/types/portfolio'
import type { ChatChunk, ChatReply, ChatReplyAction } from '@/lib/portfolioChat/types'

const CONFIDENCE_THRESHOLD = 0.35

function chunkToActions(chunk: ChatChunk, t: Translations): ChatReplyAction[] {
  const actions: ChatReplyAction[] = []

  if (chunk.sectionId) {
    actions.push({
      label: t.chatbot.actions.viewSection,
      type: 'section',
      sectionId: chunk.sectionId,
    })
  }

  for (const link of chunk.links ?? []) {
    actions.push({
      label: link.label,
      type: 'link',
      href: link.href,
    })
  }

  return actions
}

function formatChunkReply(chunk: ChatChunk, t: Translations): ChatReply {
  return {
    text: chunk.body,
    intent: chunk.intent,
    confidence: 1,
    sectionId: chunk.sectionId,
    actions: chunkToActions(chunk, t),
  }
}

export function buildFallbackReply(content: PortfolioContent, t: Translations): ChatReply {
  return {
    text: t.chatbot.templates.fallback.replace('{{name}}', content.profile.name),
    intent: 'unknown',
    confidence: 0,
    actions: [
      { label: t.chatbot.quickReplies.contact, type: 'quick', query: t.chatbot.quickReplies.contact },
      { label: t.chatbot.quickReplies.projects, type: 'quick', query: t.chatbot.quickReplies.projects },
      { label: t.chatbot.quickReplies.skills, type: 'quick', query: t.chatbot.quickReplies.skills },
    ],
  }
}

export function buildReplyFromChunk(
  chunk: ChatChunk,
  confidence: number,
  content: PortfolioContent,
  t: Translations,
): ChatReply {
  if (chunk.intent === 'greeting') {
    return {
      ...formatChunkReply(chunk, t),
      confidence,
      text: t.chatbot.templates.greeting.replace('{{name}}', content.profile.name),
    }
  }

  if (chunk.intent === 'thanks') {
    return { ...formatChunkReply(chunk, t), confidence }
  }

  if (chunk.intent === 'projects' && chunk.id.startsWith('project-')) {
    const prefix = t.chatbot.templates.projectPrefix.replace('{{title}}', chunk.title)
    return {
      text: `${prefix}\n\n${chunk.body}`,
      intent: chunk.intent,
      confidence,
      sectionId: chunk.sectionId,
      actions: chunkToActions(chunk, t),
    }
  }

  if (chunk.intent === 'about' && chunk.id === 'about-availability') {
    return {
      text: `${content.profile.availability}\n\n${content.profile.tagline}`,
      intent: 'about',
      confidence,
      sectionId: 'about',
      actions: [
        { label: t.chatbot.actions.viewSection, type: 'section', sectionId: 'about' },
        { label: t.nav.contact, type: 'section', sectionId: 'contact' },
      ],
    }
  }

  return { ...formatChunkReply(chunk, t), confidence }
}

export function getDefaultSuggestions(t: Translations): string[] {
  return [
    t.chatbot.quickReplies.skills,
    t.chatbot.quickReplies.projects,
    t.chatbot.quickReplies.freelance,
    t.chatbot.quickReplies.contact,
    t.chatbot.quickReplies.cv,
    t.chatbot.quickReplies.game,
  ]
}

export { CONFIDENCE_THRESHOLD }
