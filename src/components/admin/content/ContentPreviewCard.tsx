import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'

interface ProfilePreviewProps {
  avatarUrl: string
  name: string
  title: string
  tagline: string
  availability?: string
  githubHandle?: string
  githubUrl?: string
  published?: boolean
  className?: string
}

export function ProfilePreviewCard({
  avatarUrl,
  name,
  title,
  tagline,
  availability,
  githubHandle,
  githubUrl,
  published,
  className,
}: ProfilePreviewProps) {
  const { t } = useTranslation()
  const [imageLoaded, setImageLoaded] = useState(false)

  const githubChip =
    githubHandle &&
    (githubUrl ? (
      <a
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card/90 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
      >
        {githubHandle}
        <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
      </a>
    ) : (
      <span className="inline-flex items-center rounded-xl border border-border/80 bg-card/90 px-3 py-1.5 text-xs font-medium text-muted-foreground">
        {githubHandle}
      </span>
    ))

  return (
    <Card className={cn('overflow-hidden border-border/80 shadow-lg shadow-primary/5', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/20 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t.admin.content.preview}
        </p>
        {published !== undefined && (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              published
                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            )}
          >
            {published ? t.admin.content.published : t.admin.content.draft}
          </span>
        )}
      </div>

      <div className="relative overflow-hidden bg-gradient-to-b from-primary/[0.07] via-background to-background px-5 pb-6 pt-5">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-6 left-1/2 h-24 w-48 -translate-x-1/2 rounded-full bg-primary/5 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto mb-5 w-[8.5rem]">
          <div
            className={cn(
              'relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-primary/25 bg-muted/50 shadow-xl shadow-primary/10',
              imageLoaded && 'ring-1 ring-primary/10',
            )}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
            )}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className={cn(
                  'h-full w-full object-cover object-[center_12%] transition-opacity duration-500',
                  imageLoaded ? 'opacity-100' : 'opacity-0',
                )}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.currentTarget.src = '/favicon.svg'
                  setImageLoaded(true)
                }}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/50">
                <div className="h-12 w-12 rounded-full border-2 border-dashed border-current" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Photo</span>
              </div>
            )}
          </div>
        </div>

        <div className="relative text-center">
          <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
            {name || '—'}
          </h3>
          <p className="mt-1.5 text-sm font-medium text-primary">{title || '—'}</p>

          {availability && (
            <p className="mx-auto mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-[11px] font-medium text-green-700 dark:text-green-400">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-green-500" />
              <span className="truncate">{availability}</span>
            </p>
          )}

          <p className="mx-auto mt-4 max-w-[16rem] line-clamp-4 text-xs leading-relaxed text-muted-foreground">
            {tagline || '—'}
          </p>

          {githubChip && <div className="mt-4 flex justify-center">{githubChip}</div>}
        </div>
      </div>
    </Card>
  )
}

interface ProjectPreviewProps {
  imageUrl: string
  title: string
  description: string
  year: number
  featured: boolean
  className?: string
}

export function ProjectPreviewCard({
  imageUrl,
  title,
  description,
  year,
  featured,
  className,
}: ProjectPreviewProps) {
  const { t } = useTranslation()

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="border-b border-border/60 bg-muted/20 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t.admin.content.preview}
        </p>
      </div>
      <div className="p-4 pt-4">
        <div className="overflow-hidden rounded-xl border border-border">
          <img
            src={imageUrl || '/placeholder-project.svg'}
            alt=""
            className="h-32 w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-project.svg'
            }}
          />
        </div>
        <div className="mt-3 flex items-start justify-between gap-2">
          <p className="font-display font-semibold text-foreground">{title || '—'}</p>
          <span className="shrink-0 text-xs text-muted-foreground">{year}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{description || '—'}</p>
        {featured && (
          <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {t.common.featured}
          </span>
        )}
      </div>
    </Card>
  )
}
