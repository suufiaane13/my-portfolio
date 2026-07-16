import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'

const SIZE = 52
const STROKE = 3
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const SHOW_AFTER = 400

export function ScrollToTop() {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(
    () => typeof window !== 'undefined' && window.scrollY > SHOW_AFTER,
  )
  const { scrollYProgress, scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setVisible(latest > SHOW_AFTER)
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: reduceMotion ? 1000 : 70,
    damping: reduceMotion ? 100 : 22,
    mass: 0.35,
    restDelta: 0.0005,
  })

  const offset = useTransform(smoothProgress, (progress) => CIRCUMFERENCE * (1 - progress))

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
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          style={{
            strokeDasharray: CIRCUMFERENCE,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <ArrowUp className="relative h-5 w-5 drop-shadow-sm" aria-hidden="true" />
    </button>
  )
}
