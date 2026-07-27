import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface SheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: ReactNode
  ariaLabel?: string
  className?: string
}

export function Sheet({ open, onClose, children, title, ariaLabel = 'Menu', className }: SheetProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[60] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === 'string' ? title : ariaLabel}
        >
          <motion.button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className={cn(
              'absolute right-0 top-0 flex h-full w-[min(20rem,88vw)] flex-col border-l border-border bg-background shadow-2xl',
              className,
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div
              className={cn(
                'flex items-center border-b border-border p-4',
                title ? 'justify-between' : 'justify-end',
              )}
            >
              {title ? <div className="font-display text-lg font-semibold">{title}</div> : null}
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
