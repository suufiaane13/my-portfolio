import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, MapPin, Send } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Section, SectionHeading } from '@/components/layout/Container'
import { SectionReveal } from '@/components/shared/SectionReveal'
import { WhatsAppIcon } from '@/components/shared/SocialIcons'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { contactValues, whatsapp } from '@/data/contact'
import { useTranslation } from '@/i18n/LanguageProvider'
import { isSupabaseConfigured } from '@/lib/supabase'
import { getContactSchema, type ContactFormValues } from '@/lib/validators'
import { ContactServiceError, submitContactForm } from '@/services/contact'

const contactIcons = [Mail, WhatsAppIcon, MapPin]

export function Contact() {
  const { t, locale } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isFormEnabled = isSupabaseConfigured()
  const schema = useMemo(() => getContactSchema(t), [t])

  const contactEntries = useMemo(
    () => [
      {
        label: t.contact.labels.email,
        value: contactValues.email,
        href: `mailto:${contactValues.email}`,
      },
      {
        label: t.contact.labels.whatsapp,
        value: whatsapp.value,
        href: whatsapp.href,
      },
      {
        label: t.contact.labels.address,
        value: contactValues.address,
        href: '#contact',
      },
    ],
    [t],
  )

  const spokenLanguages = useMemo(
    () => [
      { flag: '🇲🇦', ...t.contact.spoken.ar },
      { flag: '🇫🇷', ...t.contact.spoken.fr },
      { flag: '🇬🇧', ...t.contact.spoken.en },
    ],
    [t],
  )

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
      website: '',
    },
  })

  useEffect(() => {
    reset()
  }, [locale, reset])

  const onSubmit = handleSubmit(async (values) => {
    if (!isFormEnabled || isSubmitting) return

    setIsSubmitting(true)
    const toastId = toast.loading(t.toast.sending)

    try {
      await submitContactForm({ ...values, locale })
      reset()
      toast.success(t.toast.success, {
        id: toastId,
        description: t.toast.successDescription,
      })
    } catch (error) {
      if (error instanceof ContactServiceError && error.code === 'rate_limit') {
        toast.error(t.toast.rateLimit, {
          id: toastId,
          description: t.toast.rateLimitDescription,
        })
        return
      }

      toast.error(t.toast.error, {
        id: toastId,
        description: t.toast.errorDescription,
      })
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <Section id="contact">
      <SectionHeading title={t.contact.title} description={t.contact.description} />

      <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
        <SectionReveal className="space-y-6 lg:col-span-1">
          <div>
            <h3 className="mb-4 font-display text-xl font-semibold">{t.contact.info}</h3>
            <div className="space-y-3">
              {contactEntries.map((info, index) => {
                const Icon = contactIcons[index] ?? Mail

                return (
                  <Card
                    key={info.label}
                    className="border-border p-4 transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{info.label}</p>
                        <a
                          href={info.href}
                          {...(info.href.startsWith('http')
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                          className="mt-1 block text-sm font-medium break-words transition-colors hover:text-primary"
                        >
                          {info.value}
                        </a>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-display text-xl font-semibold">
              {t.contact.spokenLanguages}
            </h3>
            <Card className="border-border p-4">
              <div className="space-y-3">
                {spokenLanguages.map((lang) => (
                  <div key={lang.name} className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden="true">
                      {lang.flag}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{lang.name}</p>
                      <p className="text-xs text-muted-foreground">{lang.level}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1} className="lg:col-span-2">
          <Card className="border-border p-5 md:p-6 lg:p-8">
            <div className="mb-6">
              <h3 className="font-display text-xl font-semibold">{t.contact.formTitle}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {isFormEnabled ? t.contact.formDescription : t.contact.formUnavailable}
              </p>
            </div>

            <form className="space-y-5" noValidate onSubmit={onSubmit}>
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
                disabled={!isFormEnabled}
                {...register('website')}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium">
                    {t.contact.name}
                  </label>
                  <Input
                    id="name"
                    placeholder={t.contact.namePlaceholder}
                    disabled={!isFormEnabled || isSubmitting}
                    aria-invalid={Boolean(errors.name)}
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-500" role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    {t.contact.email}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.contact.emailPlaceholder}
                    disabled={!isFormEnabled || isSubmitting}
                    aria-invalid={Boolean(errors.email)}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium">
                  {t.contact.message}
                </label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder={t.contact.messagePlaceholder}
                  disabled={!isFormEnabled || isSubmitting}
                  aria-invalid={Boolean(errors.message)}
                  {...register('message')}
                />
                {errors.message && (
                  <p className="mt-1.5 text-xs text-red-500" role="alert">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={!isFormEnabled || isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                {isSubmitting ? t.contact.submitting : t.contact.submit}
              </Button>
            </form>
          </Card>
        </SectionReveal>
      </div>
    </Section>
  )
}
