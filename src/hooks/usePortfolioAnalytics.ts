import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from '@/i18n/LanguageProvider'
import { isAnalyticsEnabled, trackEvent } from '@/services/analytics'

export function usePortfolioAnalytics() {
  const location = useLocation()
  const { locale } = useTranslation()
  const trackedSections = useRef(new Set<string>())

  useEffect(() => {
    if (!isAnalyticsEnabled()) return

    trackEvent({
      eventType: 'page_view',
      path: location.pathname,
      locale,
    })
    trackedSections.current.clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- page views only on route change
  }, [location.pathname])

  useEffect(() => {
    if (!isAnalyticsEnabled()) return

    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'))
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue

          const sectionId = entry.target.id
          if (!sectionId || trackedSections.current.has(sectionId)) continue

          trackedSections.current.add(sectionId)
          trackEvent({
            eventType: 'section_view',
            sectionId,
            path: location.pathname,
            locale,
          })
        }
      },
      { threshold: 0.35, rootMargin: '-10% 0px -10% 0px' },
    )

    for (const section of sections) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [location.pathname, locale])
}
