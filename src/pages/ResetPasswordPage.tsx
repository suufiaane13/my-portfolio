import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useTranslation } from '@/i18n/LanguageProvider'
import { isSupabaseConfigured } from '@/lib/supabase'
import { getResetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validators'
import { AuthServiceError, updatePassword } from '@/services/auth'

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const schema = useMemo(() => getResetPasswordSchema(t), [t])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => {
    document.title = `${t.auth.resetPasswordTitle} — ${t.meta.siteName}`
  }, [t])

  const onSubmit = handleSubmit(async (values) => {
    if (!isSupabaseConfigured() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await updatePassword(values.password)
      toast.success(t.auth.passwordUpdated)
      navigate('/login', { replace: true })
    } catch (error) {
      if (error instanceof AuthServiceError && error.code === 'not_configured') {
        toast.error(t.auth.notConfigured)
      } else {
        toast.error(t.auth.passwordUpdateError)
      }
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="mx-auto mb-4 inline-flex rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t.auth.backToSite}
          >
            <BrandLogo size="lg" className="mx-auto" />
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {t.auth.resetPasswordTitle}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.auth.resetPasswordDescription}</p>
        </div>

        <Card className="p-6 sm:p-8">
          {!isSupabaseConfigured() ? (
            <p className="text-center text-sm text-muted-foreground">{t.auth.notConfigured}</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium">
                  {t.auth.newPassword}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    className="pl-10"
                    placeholder={t.auth.passwordPlaceholder}
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
                  {t.auth.confirmPassword}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className="pl-10"
                    placeholder={t.auth.passwordPlaceholder}
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.auth.updatingPassword}
                  </>
                ) : (
                  t.auth.updatePassword
                )}
              </Button>
            </form>
          )}
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">
            {t.auth.backToLogin}
          </Link>
        </p>
      </div>
    </div>
  )
}
