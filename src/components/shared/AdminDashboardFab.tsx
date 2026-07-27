import { motion, useReducedMotion } from 'framer-motion'
import { LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/AuthProvider'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'

const SIZE = 52
const snappySpring = { type: 'spring' as const, stiffness: 520, damping: 32, mass: 0.65 }

/** Floating admin shortcut — sits above the guide FAB (left stack). */
export function AdminDashboardFab({ visible = true }: { visible?: boolean }) {
  const { session } = useAuth()
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()

  if (!session || !visible) return null

  return (
    <motion.div
      className="pointer-events-auto"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.85, y: 8 }}
      transition={reduceMotion ? { duration: 0.12 } : snappySpring}
      whileHover={reduceMotion ? undefined : { scale: 1.08, y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
      style={{ width: SIZE, height: SIZE }}
    >
      <Link
        to="/admin"
        aria-label={t.nav.admin}
        title={t.nav.admin}
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full',
          'border border-primary/25 bg-card/90 text-primary backdrop-blur-md',
          'shadow-lg shadow-primary/10',
          'transition-colors hover:border-primary/45 hover:bg-card hover:shadow-xl hover:shadow-primary/20',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
      >
        <motion.span
          className="inline-flex"
          animate={
            reduceMotion ? undefined : { y: [0, -1.5, 0], rotate: [0, -4, 0, 4, 0] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <LayoutDashboard className="h-5 w-5 drop-shadow-sm" aria-hidden="true" />
        </motion.span>
      </Link>
    </motion.div>
  )
}
