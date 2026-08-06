import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryInner extends Component<
  ErrorBoundaryProps & { title: string; message: string; retry: string },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center',
            this.props.className,
          )}
        >
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              {this.props.title}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {this.state.error?.message ?? this.props.message}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={this.handleReset}>
            <RefreshCw className="h-4 w-4" />
            {this.props.retry}
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  const { t } = useTranslation()

  return (
    <ErrorBoundaryInner
      {...props}
      title={t.errorBoundary.title}
      message={t.errorBoundary.message}
      retry={t.errorBoundary.retry}
    />
  )
}
