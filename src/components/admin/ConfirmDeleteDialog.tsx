import { Loader2, Trash2 } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/i18n/LanguageProvider'

interface ConfirmDeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  /** Optional override; defaults to shared admin delete title */
  title?: string
  description: string
  isLoading?: boolean
}

export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}: ConfirmDeleteDialogProps) {
  const { t } = useTranslation()

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Dialog
      open={open}
      onClose={isLoading ? () => undefined : onClose}
      title={title ?? t.admin.deleteDialog.title}
      className="sm:max-w-md"
    >
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          {t.admin.deleteDialog.cancel}
        </Button>
        <Button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={isLoading}
          className="border-destructive/30 bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.admin.deleteDialog.deleting}
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              {t.admin.deleteDialog.confirm}
            </>
          )}
        </Button>
      </div>
    </Dialog>
  )
}
