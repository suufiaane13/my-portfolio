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
  | 'greeting'
  | 'thanks'
  | 'unknown'

export interface ChatLink {
  label: string
  href: string
  external?: boolean
}

export interface ChatChunk {
  id: string
  intent: ChatIntent
  keywords: string[]
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
  type: 'link' | 'section' | 'quick'
  href?: string
  sectionId?: string
  query?: string
}

export interface ChatReply {
  text: string
  intent: ChatIntent
  confidence: number
  actions?: ChatReplyAction[]
  sectionId?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  intent?: ChatIntent
  actions?: ChatReplyAction[]
  timestamp: number
}

export interface ChatEngineResult {
  reply: ChatReply
  suggestions: string[]
}
