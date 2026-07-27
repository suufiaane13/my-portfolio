import { useEffect, useState } from 'react'

export function useScrollSpy(sectionIds: string[], offset = 100) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? 'hero')

  useEffect(() => {
    const handleScroll = () => {
      const current = [...sectionIds]
        .reverse()
        .find((id) => {
          const element = document.getElementById(id)
          if (!element) return false
          return element.getBoundingClientRect().top <= offset
        })

      if (current) setActiveSection(current)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sectionIds, offset])

  return activeSection
}

export function useScrolled(threshold = 50) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > threshold)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return isScrolled
}
