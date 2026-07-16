import { countEventsSince, fetchPortfolioEvents, aggregateEventTypes } from '@/services/adminAnalytics'
import { countUnreadMessages, fetchContactMessages } from '@/services/adminMessages'
import { countNewsletterSubscribers } from '@/services/admin/newsletter'
import { countScores } from '@/services/adminScores'
import type { AdminDashboardStats } from '@/types/admin'

export async function fetchDashboardStats(): Promise<AdminDashboardStats> {
  const [unreadMessages, messages, events7, events30, totalScores, newsletterSubscribers, recentEvents] =
    await Promise.all([
    countUnreadMessages(),
    fetchContactMessages(),
    countEventsSince(7),
    countEventsSince(30),
    countScores(),
    countNewsletterSubscribers(),
    fetchPortfolioEvents(30, 500),
  ])

  return {
    unreadMessages,
    totalMessages: messages.length,
    eventsLast7Days: events7,
    eventsLast30Days: events30,
    totalScores,
    newsletterSubscribers,
    topEventTypes: aggregateEventTypes(recentEvents).slice(0, 5),
  }
}
