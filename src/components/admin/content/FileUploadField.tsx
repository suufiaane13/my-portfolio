import { ExternalLink, FileText, FileUp, ImageIcon, Loader2, User } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'
import {
  uploadPortfolioAsset,
  type PortfolioUploadError,
  type PortfolioUploadKind,
} from '@/services/admin/storage'

type FileUploadVariant = 'avatar' | 'document' | 'project' | 'logo'

interface FileUploadFieldProps {
  kind: PortfolioUploadKind
  variant: FileUploadVariant
  label: string
  accept: string
  value: string
  filename?: string
  storageKey?: string
  onUrlChange: (url: string) => void
  onFilenameChange?: (filename: string) => void
}

export function FileUploadField({
  kind,
  variant,
  label,
  accept,
  value,
  filename,
  storageKey,
  onUrlChange,
  onFilenameChange,
}: FileUploadFieldProps) {
  const { t } = useTranslation()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const hint =
    kind === 'cv'
      ? t.admin.content.uploadCvHint
      : kind === 'project'
        ? t.admin.content.uploadProjectHint
        : t.admin.content.uploadAvatarHint

  const needsSlug = kind === 'project'
  const slugReady = !needsSlug || Boolean(storageKey?.trim())

  const uploadErrorMessage = (error: PortfolioUploadError) => {
    switch (error) {
      case 'invalid_type':
        return t.admin.content.uploadInvalidType
      case 'too_large':
        return t.admin.content.uploadTooLarge
      case 'not_configured':
        return t.admin.content.uploadNotConfigured
      case 'missing_slug':
        return t.admin.content.uploadMissingSlug
      default:
        return t.admin.content.uploadError
    }
  }

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return
    if (!slugReady) {
      toast.error(t.admin.content.uploadMissingSlug)
      return
    }

    setIsUploading(true)
    const result = await uploadPortfolioAsset(kind, file, { storageKey })
    setIsUploading(false)

    if (typeof result === 'string') {
      toast.error(uploadErrorMessage(result))
      return
    }

    onUrlChange(result.publicUrl)
    onFilenameChange?.(result.filename)
    toast.success(t.admin.content.uploadSuccess)
  }

  const uploadButton = (
    <>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={isUploading || !slugReady}
        onChange={(e) => {
          const file = e.target.files?.[0]
          void handleFileChange(file)
          e.target.value = ''
        }}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isUploading || !slugReady}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileUp className="h-4 w-4" />
        )}
        {isUploading ? t.admin.content.uploading : t.admin.content.upload}
      </Button>
    </>
  )

  const urlField = (
    <div>
      <label
        htmlFor={`${inputId}-url`}
        className="mb-2 block text-xs font-medium text-muted-foreground"
      >
        {t.admin.content.orUploadUrl}
      </label>
      <Input
        id={`${inputId}-url`}
        value={value}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://"
      />
    </div>
  )

  if (variant === 'avatar' || variant === 'logo') {
    const sizeClass = variant === 'logo' ? 'h-20 w-20' : 'h-28 w-28'
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
        <p className="mb-4 text-sm font-medium text-foreground">{label}</p>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div
            className={cn(
              'relative mx-auto shrink-0 overflow-hidden rounded-2xl border-2 border-primary/20 bg-muted shadow-sm sm:mx-0',
              sizeClass,
            )}
          >
            {value ? (
              <img src={value} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                <User className="h-8 w-8 opacity-40" aria-hidden="true" />
                <span className="text-[10px] font-medium uppercase tracking-wider opacity-60">
                  {t.admin.content.noFileSelected}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-2 text-center sm:text-left">
              <p className="text-xs text-muted-foreground">{hint}</p>
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                {uploadButton}
              </div>
            </div>
            {urlField}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'project') {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
        <p className="mb-4 text-sm font-medium text-foreground">{label}</p>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            {value ? (
              <img src={value} alt="" className="aspect-video w-full object-cover" />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="h-10 w-10 opacity-40" aria-hidden="true" />
                <span className="text-xs">{t.admin.content.noFileSelected}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{hint}</p>
            {!slugReady && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {t.admin.content.uploadMissingSlug}
              </p>
            )}
            <div className="flex flex-wrap gap-2">{uploadButton}</div>
          </div>

          {urlField}
        </div>
      </div>
    )
  }

  const displayName = filename?.trim() || t.admin.content.noFileSelected

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
      <p className="mb-4 text-sm font-medium text-foreground">{label}</p>

      <div className="rounded-xl border border-dashed border-border/80 bg-background/60 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            {uploadButton}
            {value && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border-2 border-primary/50 px-3 text-sm font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground"
              >
                <ExternalLink className="h-4 w-4" />
                {t.admin.content.currentFile}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">{urlField}</div>
    </div>
  )
}
