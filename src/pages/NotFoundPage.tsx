import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { useTranslation } from '@/i18n/LanguageProvider'
import { Footer } from '@/components/layout/Footer'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="font-display text-8xl font-bold tracking-tighter text-muted-foreground/30">
          404
        </p>
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {t.notFound.title}
        </h1>
        <p className="max-w-md text-muted-foreground">
          {t.notFound.description}
        </p>
        <div className="flex gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.notFound.backHome}
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Home className="h-4 w-4" />
            {t.notFound.home}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
