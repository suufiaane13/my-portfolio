import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock, Mail } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/AuthProvider'
import { usePortfolioContent } from '@/hooks/PortfolioContentProvider'
import { useTranslation } from '@/i18n/LanguageProvider'
import { isSupabaseConfigured } from '@/lib/supabase'
import { getLoginSchema, type LoginFormValues } from '@/lib/validators'
import { AuthServiceError, signInWithPassword } from '@/services/auth'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { session, isLoading } = useAuth()
  const { content } = usePortfolioContent()
  const { profile } = content
  const [isSubmitting, setIsSubmitting] = useState(false)
  const schema = useMemo(() => getLoginSchema(t), [t])

  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    document.title = `${t.auth.loginTitle} — ${t.meta.siteName}`
  }, [t])

  if (!isLoading && session) {
    return <Navigate to={from} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!isSupabaseConfigured() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await signInWithPassword(values.email, values.password)
      toast.success(t.auth.loginSuccess)
      navigate(from, { replace: true })
    } catch (error) {
      if (error instanceof AuthServiceError) {
        if (error.code === 'not_admin') {
          toast.error(t.auth.notAdmin)
        } else if (error.code === 'invalid_credentials') {
          toast.error(t.auth.invalidCredentials)
        } else if (error.code === 'not_configured') {
          toast.error(t.auth.notConfigured)
        } else {
          toast.error(t.auth.loginError)
        }
      } else {
        toast.error(t.auth.loginError)
      }
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src={profile.logoUrl}
            alt=""
            className="mx-auto mb-4 h-14 w-14 rounded-xl object-contain"
          />
          <h1 className="font-display text-2xl font-bold text-foreground">{t.auth.loginTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.auth.loginDescription}</p>
        </div>

        <Card className="p-6 sm:p-8">
          {!isSupabaseConfigured() ? (
            <p className="text-center text-sm text-muted-foreground">{t.auth.notConfigured}</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  {t.auth.email}
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="pl-10"
                    placeholder={t.auth.emailPlaceholder}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium">
                  {t.auth.password}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className="pl-10"
                    placeholder={t.auth.passwordPlaceholder}
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="text-right">
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  {t.auth.forgotPassword}
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.auth.signingIn}
                  </>
                ) : (
                  t.auth.signIn
                )}
              </Button>
            </form>
          )}
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="font-medium text-primary hover:underline">
            {t.auth.backToSite}
          </Link>
        </p>
      </div>
      <Toaster richColors closeButton position="top-right" />
    </div>
  )
}
