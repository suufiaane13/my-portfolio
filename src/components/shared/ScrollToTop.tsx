import {
  AnimatePresence,
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

const softSpring = { type: 'spring' as const, stiffness: 420, damping: 28, mass: 0.75 }

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
    <div
      className="pointer-events-none fixed right-6 z-40"
      style={{
        bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
        width: SIZE,
        height: SIZE,
      }}
    >
      <AnimatePresence>
        {visible && (
          <motion.button
            key="scroll-top"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label={t.common.scrollToTop}
            className={cn(
              'pointer-events-auto absolute bottom-0 right-0 flex items-center justify-center rounded-full',
              'border border-primary/25 bg-card/90 text-primary backdrop-blur-md',
              'shadow-lg shadow-primary/10',
              'hover:border-primary/45 hover:bg-card hover:shadow-xl hover:shadow-primary/20',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
            style={{ width: SIZE, height: SIZE }}
            initial={
              reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7, y: 24 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.78, y: 16 }}
            transition={reduceMotion ? { duration: 0.12 } : softSpring}
            whileHover={reduceMotion ? undefined : { scale: 1.08, y: -3 }}
            whileTap={reduceMotion ? undefined : { scale: 0.92, y: 1 }}
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
            <motion.span
              className="relative inline-flex"
              animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 1.35, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <ArrowUp className="h-5 w-5 drop-shadow-sm" aria-hidden="true" />
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
