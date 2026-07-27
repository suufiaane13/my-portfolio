import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ContentSegmentItem {
  id: string
  label: string
}

interface ContentSegmentTabsProps {
  items: ContentSegmentItem[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function ContentSegmentTabs({ items, active, onChange, className }: ContentSegmentTabsProps) {
  return (
    <div
      className={cn(
        'flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/30 p-1',
        className,
      )}
      role="tablist"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={active === item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            'shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
            active === item.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

interface ContentSegmentPanelProps {
  id: string
  activeTab: string
  children: ReactNode
  className?: string
}

export function ContentSegmentPanel({ id, activeTab, children, className }: ContentSegmentPanelProps) {
  return (
    <div
      role="tabpanel"
      className={cn(
        activeTab === id ? 'block' : 'hidden',
        'md:block',
        className,
      )}
    >
      {children}
    </div>
  )
}
