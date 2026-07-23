import type { Translations } from '@/i18n/types'
import type { PortfolioContent } from '@/types/portfolio'
import type { ChatChunk, ChatReply, ChatReplyAction } from '@/lib/portfolioChat/types'

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
      download: link.download,
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

export function buildReplyFromChunk(
  chunk: ChatChunk,
  confidence: number,
  content: PortfolioContent,
  t: Translations,
): ChatReply {
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
        ...(content.profile.cvUrl
          ? [
              {
                label: t.hero.downloadCv,
                type: 'link' as const,
                href: content.profile.cvUrl,
                download: content.profile.cvFilename || 'CV_Soufiane_HAJJI.pdf',
              },
            ]
          : []),
      ],
    }
  }

  if (chunk.intent === 'contact' && chunk.id === 'contact-main') {
    return {
      ...formatChunkReply(chunk, t),
      confidence,
      actions: [
        ...chunkToActions(chunk, t),
        ...(content.profile.cvUrl
          ? [
              {
                label: t.hero.downloadCv,
                type: 'link' as const,
                href: content.profile.cvUrl,
                download: content.profile.cvFilename || 'CV_Soufiane_HAJJI.pdf',
              },
            ]
          : []),
      ],
    }
  }

  return { ...formatChunkReply(chunk, t), confidence }
}
