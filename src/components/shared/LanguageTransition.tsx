import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { useTranslation } from '@/i18n/LanguageProvider'
import type { Locale } from '@/i18n/types'
import { cn } from '@/lib/utils'

const SLIDE_PX = 8
const EASE = [0.22, 1, 0.36, 1] as const

function getDirection(to: Locale): number {
  return to === 'en' ? 1 : -1
}

interface LanguageTransitionProps {
  children: ReactNode
  className?: string
}

export function LanguageTransition({ children, className }: LanguageTransitionProps) {
  const { locale } = useTranslation()
  const reduceMotion = useReducedMotion()
  const prevLocale = useRef(locale)
  const direction = useRef(1)

  if (locale !== prevLocale.current) {
    direction.current = getDirection(locale)
    prevLocale.current = locale
  }

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  const dir = direction.current

  return (
    <div className={cn('overflow-x-clip', className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={locale}
          initial={{ opacity: 0, x: dir * SLIDE_PX, filter: 'blur(4px)' }}
          animate={{
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.25, ease: EASE },
          }}
          exit={{
            opacity: 0,
            x: dir * -SLIDE_PX,
            filter: 'blur(4px)',
            transition: { duration: 0.2, ease: EASE },
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
