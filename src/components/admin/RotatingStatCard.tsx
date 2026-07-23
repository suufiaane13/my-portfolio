import type { LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export interface RotatingStatSlide {
  label: string
  value: string | number
  icon: LucideIcon
}

interface RotatingStatCardProps {
  slides: RotatingStatSlide[]
  /** Auto-advance interval in ms */
  intervalMs?: number
  className?: string
}

export function RotatingStatCard({
  slides,
  intervalMs = 3500,
  className,
}: RotatingStatCardProps) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const safeSlides = slides.length > 0 ? slides : []
  const active = safeSlides[index] ?? safeSlides[0]

  useEffect(() => {
    if (safeSlides.length < 2) return

    const id = window.setInterval(() => {
      setVisible(false)
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % safeSlides.length)
        setVisible(true)
      }, 180)
    }, intervalMs)

    return () => window.clearInterval(id)
  }, [intervalMs, safeSlides.length])

  if (!active) return null

  const Icon = active.icon

  const goTo = (next: number) => {
    setVisible(false)
    window.setTimeout(() => {
      setIndex(next)
      setVisible(true)
    }, 120)
  }

  return (
    <Card className={cn('relative overflow-hidden p-4 sm:p-5', className)}>
      <div
        className={cn(
          'transition-opacity duration-200',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground sm:text-sm">{active.label}</p>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-9 sm:w-9">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
        <p className="font-display text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
          {active.value}
        </p>
      </div>
      {safeSlides.length > 1 && (
        <div className="mt-3 flex items-center gap-1.5">
          {safeSlides.map((slide, i) => (
            <button
              key={slide.label}
              type="button"
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30',
              )}
              onClick={() => goTo(i)}
              aria-label={slide.label}
              aria-current={i === index}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
