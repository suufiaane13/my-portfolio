export type ContactMessageStatus = 'new' | 'read' | 'replied' | 'spam'

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  locale: string
  status: ContactMessageStatus
  readAt: string | null
  repliedAt: string | null
  createdAt: string
}

export interface PortfolioEvent {
  id: string
  eventType: string
  path: string | null
  sectionId: string | null
  projectId: string | null
  locale: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export interface MemoryScoreRow {
  id: string
  playerName: string
  gridSize: number
  moves: number
  seconds: number
  locale: string
  createdAt: string
  rank: number | null
}

export interface AdminDashboardStats {
  unreadMessages: number
  totalMessages: number
  eventsLast7Days: number
  eventsLast30Days: number
  totalScores: number
  newsletterSubscribers: number
  topEventTypes: { eventType: string; count: number }[]
}
