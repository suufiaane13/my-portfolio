import { useEffect, useState } from 'react'

const MIN_DISPLAY_MS = 650
const EXIT_MS = 480

type LoadPhase = 'loading' | 'exiting' | 'done'

/** Attend le prochain frame paint pour garantir le layout */
function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

export function useAppReady() {
  const [phase, setPhase] = useState<LoadPhase>('loading')

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const minDelay = reduceMotion ? 0 : MIN_DISPLAY_MS

    let cancelled = false

    const prepare = async () => {
      const fontsReady =
        typeof document !== 'undefined' && 'fonts' in document
          ? document.fonts.ready.catch(() => undefined)
          : Promise.resolve()

      await Promise.all([
        fontsReady,
        waitForPaint(),
        new Promise((resolve) => setTimeout(resolve, minDelay)),
      ])

      if (cancelled) return

      document.documentElement.dataset.appReady = 'true'

      if (reduceMotion) {
        setPhase('done')
        return
      }

      setPhase('exiting')
    }

    prepare()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (phase !== 'exiting') return

    const timer = window.setTimeout(() => setPhase('done'), EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [phase])

  return {
    isLoading: phase === 'loading',
    isExiting: phase === 'exiting',
    isReady: phase === 'done',
  }
}

export function removeStaticLoader() {
  document.getElementById('app-loader')?.remove()
}
