import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface AdminContentHeaderProps {
  title: string
  description?: string
  backTo?: string
  backLabel?: string
}

export function AdminContentHeader({
  title,
  description,
  backTo = '/admin/content',
  backLabel,
}: AdminContentHeaderProps) {
  return (
    <div className="mb-8">
      {backLabel && (
        <Link
          to={backTo}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      )}
      <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}
