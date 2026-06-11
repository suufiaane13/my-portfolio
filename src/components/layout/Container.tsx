import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'section'
}

export function Container({ children, className, as: Tag = 'div' }: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </Tag>
  )
}

interface SectionProps {
  id: string
  children: ReactNode
  className?: string
}

export function Section({ id, children, className }: SectionProps) {
  return (
    <section id={id} className={cn('py-16 md:py-20 lg:py-24', className)}>
      <Container>{children}</Container>
    </section>
  )
}

interface SectionHeadingProps {
  title: string
  description?: string
  className?: string
}

export function SectionHeading({ title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn('mb-10 text-center md:mb-12', className)}>
      <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          {description}
        </p>
      )}
    </div>
  )
}
