import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'portfolio-game-hint-shown'
const GAME_VISITED_KEY = 'portfolio-game-visited'

/** ~40 % des sessions — pas intrusif */
const SHOW_CHANCE = 0.4
/** 5 à 8 s après chargement — le visiteur a vu le hero */
const MIN_DELAY_MS = 5_000
const MAX_DELAY_MS = 8_000
/** Fermeture auto après 8 s */
const AUTO_DISMISS_MS = 8_000

export function markGameVisited() {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(GAME_VISITED_KEY, '1')
}

export function useGameButtonHint(enabled: boolean) {
  const [visible, setVisible] = useState(false)

  const dismiss = useCallback(() => {
    setVisible(false)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, '1')
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setVisible(false)
      return
    }

    if (sessionStorage.getItem(STORAGE_KEY) === '1') return
    if (sessionStorage.getItem(GAME_VISITED_KEY) === '1') return
    if (Math.random() > SHOW_CHANCE) return

    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
    const showTimer = window.setTimeout(() => {
      setVisible(true)
    }, delay)

    return () => window.clearTimeout(showTimer)
  }, [enabled])

  useEffect(() => {
    if (!visible) return

    const hideTimer = window.setTimeout(() => dismiss(), AUTO_DISMISS_MS)
    return () => window.clearTimeout(hideTimer)
  }, [dismiss, visible])

  const show = useCallback(() => setVisible(true), [])

  return { visible, dismiss, show }
}
