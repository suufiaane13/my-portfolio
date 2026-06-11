import { useEffect, useState } from 'react'

const STORAGE_KEY = 'portfolio-game-hint-shown'
const SHOW_CHANCE = 0.38
const MIN_DELAY_MS = 4_500
const MAX_DELAY_MS = 11_000
const AUTO_DISMISS_MS = 7_500

export function useGameButtonHint(enabled: boolean) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setVisible(false)
      return
    }

    if (sessionStorage.getItem(STORAGE_KEY) === '1') return
    if (Math.random() > SHOW_CHANCE) return

    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
    const showTimer = window.setTimeout(() => {
      setVisible(true)
      sessionStorage.setItem(STORAGE_KEY, '1')
    }, delay)

    return () => window.clearTimeout(showTimer)
  }, [enabled])

  useEffect(() => {
    if (!visible) return

    const hideTimer = window.setTimeout(() => setVisible(false), AUTO_DISMISS_MS)
    return () => window.clearTimeout(hideTimer)
  }, [visible])

  const dismiss = () => setVisible(false)

  return { visible, dismiss }
}
