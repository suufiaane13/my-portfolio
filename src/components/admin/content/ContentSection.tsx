import { ChevronDown, type LucideIcon } from 'lucide-react'
import {
  createContext,
  useContext,
  useId,
  useState,
  type ReactNode,
} from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'

interface ContentSectionGroupContextValue {
  openId: string | null
  setOpenId: (id: string | null) => void
}

const ContentSectionGroupContext = createContext<ContentSectionGroupContextValue | null>(
  null,
)

export function ContentSectionGroup({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <ContentSectionGroupContext.Provider value={{ openId, setOpenId }}>
      {children}
    </ContentSectionGroupContext.Provider>
  )
}

interface ContentSectionProps {
  sectionId: string
  icon: LucideIcon
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function ContentSection({
  sectionId,
  icon: Icon,
  title,
  description,
  children,
  className,
}: ContentSectionProps) {
  const { t } = useTranslation()
  const contentId = useId()
  const group = useContext(ContentSectionGroupContext)
  const open = group ? group.openId === sectionId : false

  const handleToggle = () => {
    if (!group) return
    group.setOpenId(open ? null : sectionId)
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader
        className={cn(
          'bg-muted/20 p-0',
          open ? 'border-b border-border/60' : 'border-b border-transparent',
        )}
      >
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={open}
          aria-controls={contentId}
          className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/30"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <ChevronDown
            className={cn(
              'mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
              open && 'rotate-180',
            )}
            aria-hidden="true"
          />
          <span className="sr-only">
            {open ? t.admin.content.collapseSection : t.admin.content.expandSection}
          </span>
        </button>
      </CardHeader>

      <div
        id={contentId}
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <CardContent className="space-y-4 pt-5">{children}</CardContent>
        </div>
      </div>
    </Card>
  )
}

export function ContentFieldGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', className)}>{children}</div>
  )
}
