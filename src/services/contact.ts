import { getSupabase } from '@/lib/supabase'
import { trackEvent } from '@/services/analytics'
import type { ContactFormValues } from '@/lib/validators'
import type { Locale } from '@/i18n/types'

export type ContactPayload = ContactFormValues & {
  locale: Locale
}

type ContactResponse = {
  success?: boolean
  error?: string
}

export type ContactErrorCode = 'not_configured' | 'rate_limit' | 'validation' | 'network' | 'unknown'

export class ContactServiceError extends Error {
  code: ContactErrorCode

  constructor(message: string, code: ContactErrorCode) {
    super(message)
    this.name = 'ContactServiceError'
    this.code = code
  }
}

export async function submitContactForm(payload: ContactPayload): Promise<void> {
  const supabase = getSupabase()

  if (!supabase) {
    throw new ContactServiceError('Supabase is not configured', 'not_configured')
  }

  const { data, error } = await supabase.functions.invoke<ContactResponse>('contact', {
    body: {
      name: payload.name.trim(),
      email: payload.email.trim(),
      message: payload.message.trim(),
      website: payload.website ?? '',
      locale: payload.locale,
    },
  })

  if (error) {
    throw new ContactServiceError(error.message, 'network')
  }

  if (data?.error === 'rate_limit') {
    throw new ContactServiceError('rate_limit', 'rate_limit')
  }

  if (data?.error === 'validation') {
    throw new ContactServiceError('validation', 'validation')
  }

  if (data?.error) {
    throw new ContactServiceError(data.error, 'unknown')
  }

  if (!data?.success) {
    throw new ContactServiceError('Unknown error', 'unknown')
  }

  trackEvent({
    eventType: 'contact_submit',
    path: '/',
    locale: payload.locale,
  })
}
