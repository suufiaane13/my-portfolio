import type { Locale } from '@/i18n/types'

export type ChatIntent =
  | 'about'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'education'
  | 'contact'
  | 'social'
  | 'languages'
  | 'interests'
  | 'cv'
  | 'game'
  | 'unknown'

export interface ChatLink {
  label: string
  href: string
  external?: boolean
  /** If set, trigger a file download (same behavior as Hero CV button). */
  download?: string
}

export interface ChatChunk {
  id: string
  intent: ChatIntent
  title: string
  body: string
  links?: ChatLink[]
  sectionId?: string
}

export interface ChatKnowledge {
  locale: Locale
  chunks: ChatChunk[]
}

export interface ChatReplyAction {
  label: string
  type: 'link' | 'section'
  href?: string
  sectionId?: string
  download?: string
}

export interface ChatReply {
  text: string
  intent: ChatIntent
  confidence: number
  actions?: ChatReplyAction[]
  sectionId?: string
}
