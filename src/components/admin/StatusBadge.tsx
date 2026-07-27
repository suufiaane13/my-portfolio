import { Badge } from '@/components/ui/Badge'
import { useTranslation } from '@/i18n/LanguageProvider'
import type { ContactMessageStatus } from '@/types/admin'
import { cn } from '@/lib/utils'

const statusStyles: Record<ContactMessageStatus, string> = {
  new: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  read: 'border-border bg-muted text-muted-foreground',
  replied: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  spam: 'border-destructive/30 bg-destructive/10 text-destructive',
}

export function StatusBadge({ status }: { status: ContactMessageStatus }) {
  const { t } = useTranslation()

  return (
    <Badge className={cn('font-medium', statusStyles[status])}>
      {t.admin.messages.status[status]}
    </Badge>
  )
}
