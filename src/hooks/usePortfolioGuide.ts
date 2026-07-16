import { useCallback, useMemo, useState } from 'react'
import { buildChatKnowledge } from '@/lib/portfolioChat/engine'
import { getGuideReplyForProject, getGuideReplyForTopic } from '@/lib/portfolioChat/guide'
import { chunkIdForProject, chunkIdForTopic, GUIDE_TOPIC_IDS, type GuideTopicId } from '@/lib/portfolioChat/guideTopics'
import type { ChatReply } from '@/lib/portfolioChat/types'
import { usePortfolioContent } from '@/hooks/PortfolioContentProvider'
import { useTranslation } from '@/i18n/LanguageProvider'
import { trackEvent } from '@/services/analytics'

export type GuideView = 'menu' | 'projects' | 'answer'

export interface GuideAnswerPayload {
  chunkId: string
  title: string
  text: string
}

export function usePortfolioGuide() {
  const { content } = usePortfolioContent()
  const { locale, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<GuideView>('menu')
  const [reply, setReply] = useState<ChatReply | null>(null)
  const [answerTitle, setAnswerTitle] = useState('')
  const [answerChunkId, setAnswerChunkId] = useState('')
  const [answerSource, setAnswerSource] = useState<'menu' | 'projects'>('menu')

  const knowledge = useMemo(
    () => buildChatKnowledge(content, locale, t),
    [content, locale, t],
  )

  const topicLabels = useMemo(
    () =>
      Object.fromEntries(
        GUIDE_TOPIC_IDS.map((id) => [id, t.chatbot.menu[id]]),
      ) as Record<GuideTopicId, string>,
    [t.chatbot.menu],
  )

  const trackTopic = useCallback(
    (topicId: string, projectSlug?: string) => {
      trackEvent({
        eventType: 'guide_topic',
        path: window.location.pathname,
        locale,
        metadata: {
          topicId,
          ...(projectSlug ? { projectSlug } : {}),
        },
      })
    },
    [locale],
  )

  const selectTopic = useCallback(
    (topicId: GuideTopicId): GuideAnswerPayload | null => {
      trackTopic(topicId)

      if (topicId === 'projects') {
        setView('projects')
        setReply(null)
        return null
      }

      const chunkId = chunkIdForTopic(topicId)
      if (!chunkId) return null

      const nextReply = getGuideReplyForTopic(topicId, knowledge, content, t)
      if (!nextReply) return null

      const title = topicLabels[topicId]
      setAnswerTitle(title)
      setAnswerChunkId(chunkId)
      setReply(nextReply)
      setAnswerSource('menu')
      setView('answer')
      return { chunkId, title, text: nextReply.text }
    },
    [content, knowledge, t, topicLabels, trackTopic],
  )

  const selectProject = useCallback(
    (slug: string, title: string): GuideAnswerPayload | null => {
      trackTopic('projects', slug)

      const nextReply = getGuideReplyForProject(slug, knowledge, content, t)
      if (!nextReply) return null

      const chunkId = chunkIdForProject(slug)
      setAnswerTitle(title)
      setAnswerChunkId(chunkId)
      setReply(nextReply)
      setAnswerSource('projects')
      setView('answer')
      return { chunkId, title, text: nextReply.text }
    },
    [content, knowledge, t, trackTopic],
  )

  const backToMenu = useCallback(() => {
    setView('menu')
    setReply(null)
    setAnswerTitle('')
    setAnswerChunkId('')
  }, [])

  const backFromAnswer = useCallback(() => {
    if (answerSource === 'projects') {
      setView('projects')
      setReply(null)
      setAnswerTitle('')
      setAnswerChunkId('')
      return
    }
    backToMenu()
  }, [answerSource, backToMenu])

  const toggle = useCallback(() => {
    setIsOpen((open) => !open)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setView('menu')
    setReply(null)
    setAnswerTitle('')
    setAnswerChunkId('')
    setAnswerSource('menu')
  }, [])

  return {
    isOpen,
    toggle,
    close,
    view,
    reply,
    answerTitle,
    answerChunkId,
    selectTopic,
    selectProject,
    backToMenu,
    backFromAnswer,
    topicLabels,
    projects: content.projects,
    profile: content.profile,
    intro: t.chatbot.templates.intro.replace('{{name}}', content.profile.name),
  }
}
