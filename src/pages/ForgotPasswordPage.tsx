import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { usePortfolioContent } from '@/hooks/PortfolioContentProvider'
import { useTranslation } from '@/i18n/LanguageProvider'
import { isSupabaseConfigured } from '@/lib/supabase'
import { getForgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validators'
import { AuthServiceError, requestPasswordReset } from '@/services/auth'

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const { content } = usePortfolioContent()
  const { profile } = content
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const schema = useMemo(() => getForgotPasswordSchema(t), [t])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  useEffect(() => {
    document.title = `${t.auth.forgotPasswordTitle} — ${t.meta.siteName}`
  }, [t])

  const onSubmit = handleSubmit(async (values) => {
    if (!isSupabaseConfigured() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await requestPasswordReset(values.email)
      setSent(true)
      toast.success(t.auth.resetEmailSent)
    } catch (error) {
      if (error instanceof AuthServiceError && error.code === 'not_configured') {
        toast.error(t.auth.notConfigured)
      } else {
        toast.error(t.auth.resetEmailError)
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
          <h1 className="font-display text-2xl font-bold text-foreground">
            {t.auth.forgotPasswordTitle}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.auth.forgotPasswordDescription}</p>
        </div>

        <Card className="p-6 sm:p-8">
          {!isSupabaseConfigured() ? (
            <p className="text-center text-sm text-muted-foreground">{t.auth.notConfigured}</p>
          ) : sent ? (
            <p className="text-center text-sm text-muted-foreground">{t.auth.resetEmailSent}</p>
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.auth.sendingReset}
                  </>
                ) : (
                  t.auth.sendResetLink
                )}
              </Button>
            </form>
          )}
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.auth.backToLogin}
          </Link>
        </p>
      </div>
    </div>
  )
}
