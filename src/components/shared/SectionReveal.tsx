import { motion, useInView, type HTMLMotionProps } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionRevealProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  className?: string
  delay?: number
}

export function SectionReveal({
  children,
  className,
  delay = 0,
  ...props
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.12, margin: '0px 0px -24px 0px' })
  const [forceShow, setForceShow] = useState(false)

  // Sécurité : ne jamais laisser une section invisible trop longtemps
  useEffect(() => {
    const timer = window.setTimeout(() => setForceShow(true), 1200)
    return () => window.clearTimeout(timer)
  }, [])

  const visible = isInView || forceShow

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay: visible ? delay : 0, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
}
