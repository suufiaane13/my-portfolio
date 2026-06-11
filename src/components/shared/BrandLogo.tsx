import { profile } from '@/data/profile'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'

type BrandLogoSize = 'xs' | 'sm' | 'md' | 'lg'

const sizeClasses: Record<BrandLogoSize, string> = {
  xs: 'h-9 w-9',
  sm: 'h-11 w-11',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

interface BrandLogoProps {
  size?: BrandLogoSize
  className?: string
  /** Cadre avec bordure — désactivé par défaut (navbar, footer) */
  framed?: boolean
}

export function BrandLogo({ size = 'sm', className, framed = false }: BrandLogoProps) {
  if (!framed) {
    return (
      <img
        src={profile.logo}
        alt={`Logo ${profile.name}`}
        className={cn('shrink-0 object-contain', sizeClasses[size], className)}
        width={64}
        height={64}
        decoding="async"
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/30 bg-black shadow-sm shadow-primary/15',
        sizeClasses[size],
        className,
      )}
    >
      <img
        src={profile.logo}
        alt={`Logo ${profile.name}`}
        className="h-full w-full object-contain"
        width={64}
        height={64}
        decoding="async"
      />
    </div>
  )
}

interface BrandLockupProps {
  logoSize?: BrandLogoSize
  showSubtitle?: boolean
  className?: string
  titleClassName?: string
}

export function BrandLockup({
  logoSize = 'sm',
  showSubtitle = true,
  className,
  titleClassName,
}: BrandLockupProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <BrandLogo size={logoSize} />
      <div className="min-w-0">
        <p className={cn('font-display font-semibold leading-tight', titleClassName)}>
          {profile.name}
        </p>
        {showSubtitle && (
          <p className="text-sm text-muted-foreground">{t.profile.title}</p>
        )}
      </div>
    </div>
  )
}
