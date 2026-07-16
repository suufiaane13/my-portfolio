import { cn } from '@/lib/utils'

/** Groupe des actions navbar (jeu, langue, thème) — boutons séparés */
export const navActionGroupClass = 'flex items-center gap-2 sm:gap-2.5'

/** Cadre individuel par bouton */
export const navActionShellClass =
  'rounded-xl border border-border/80 bg-card/60 p-1 shadow-sm backdrop-blur-sm'

export function navActionClass({
  active = false,
  className,
}: {
  active?: boolean
  className?: string
} = {}) {
  return cn(
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
    active
      ? 'bg-primary/12 text-primary'
      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
    className,
  )
}

export const navActionIconClass = 'h-9 w-9 shrink-0'

export const navActionPillClass = 'h-9 gap-1.5 px-2.5 text-sm'
