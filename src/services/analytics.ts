import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Locale } from '@/i18n/types'

export type PortfolioEventType =
  | 'page_view'
  | 'section_view'
  | 'project_click'
  | 'cv_download'
  | 'contact_submit'
  | 'game_win'
  | 'game_score_submit'
  | 'lang_switch'
  | 'theme_switch'
  | 'chat_query'
  | 'guide_topic'

export interface TrackEventPayload {
  eventType: PortfolioEventType
  path?: string
  sectionId?: string
  projectId?: string
  locale?: Locale
  metadata?: Record<string, unknown>
}

const SESSION_KEY = 'susu-portfolio-session'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, sessionId)
  }

  return sessionId
}

export function isAnalyticsEnabled(): boolean {
  return isSupabaseConfigured()
}

export function trackEvent(payload: TrackEventPayload): void {
  if (!isAnalyticsEnabled()) return

  const supabase = getSupabase()
  if (!supabase) return

  void supabase.functions
    .invoke('track-event', {
      body: {
        event_type: payload.eventType,
        path: payload.path ?? window.location.pathname,
        section_id: payload.sectionId,
        project_id: payload.projectId,
        locale: payload.locale,
        metadata: payload.metadata ?? {},
        session_id: getSessionId(),
        website: '',
      },
    })
    .catch((error: unknown) => {
      console.warn('[analytics] track-event failed:', error)
    })
}
