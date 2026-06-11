import { useLayoutEffect } from 'react'
import { profile } from '@/data/profile'
import { cn } from '@/lib/utils'
import { removeStaticLoader } from '@/hooks/useAppReady'
import { useTranslation } from '@/i18n/LanguageProvider'
import './PageLoader.css'

interface PageLoaderProps {
  exiting?: boolean
}

export function PageLoader({ exiting = false }: PageLoaderProps) {
  const { t } = useTranslation()

  useLayoutEffect(() => {
    removeStaticLoader()
  }, [])

  return (
    <div
      className={cn(
        'page-loader fixed inset-0 z-[99999] flex flex-col items-center justify-center',
        exiting && 'page-loader--exit',
      )}
      role="status"
      aria-live="polite"
      aria-label={t.common.loading}
    >
      <div className="page-loader__spinner-wrap">
        <div className="page-loader__ring" aria-hidden="true" />
        <img
          src={profile.logo}
          alt=""
          className="page-loader__logo"
          width={56}
          height={56}
          decoding="async"
        />
      </div>

      <p className="page-loader__text mt-8 font-display text-sm font-medium tracking-wide">
        {t.common.loading}
        <span className="page-loader__dots" aria-hidden="true">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
    </div>
  )
}
