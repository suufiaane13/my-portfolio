import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'

const SIZE = 52
const STROKE = 3
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const SHOW_AFTER = 400

function getScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  if (maxScroll <= 0) return 0
  return Math.min(1, Math.max(0, window.scrollY / maxScroll))
}

export function ScrollToTop() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      setVisible(window.scrollY > SHOW_AFTER)
      setProgress(getScrollProgress())
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const offset = CIRCUMFERENCE * (1 - progress)

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t.common.scrollToTop}
      className={cn(
        'fixed bottom-6 right-6 z-40 flex items-center justify-center rounded-full',
        'border border-primary/25 bg-card/90 text-primary backdrop-blur-md',
        'shadow-lg shadow-primary/10',
        'transition-all duration-300 hover:scale-105 hover:border-primary/45 hover:bg-card hover:shadow-xl hover:shadow-primary/20',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        visible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
      style={{ width: SIZE, height: SIZE }}
    >
      <svg
        className="pointer-events-none absolute inset-0 -rotate-90"
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--primary)"
          strokeOpacity={0.18}
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-150 ease-out motion-reduce:transition-none"
        />
      </svg>
      <ArrowUp className="relative h-5 w-5 drop-shadow-sm" aria-hidden="true" />
    </button>
  )
}
