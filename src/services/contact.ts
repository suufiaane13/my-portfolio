import { getSupabase } from '@/lib/supabase'
import { isTimeoutError, withTimeout } from '@/lib/withTimeout'
import { trackEvent } from '@/services/analytics'
import type { ContactFormValues } from '@/lib/validators'
import type { Locale } from '@/i18n/types'

const INVOKE_TIMEOUT_MS = 15_000

export type ContactPayload = ContactFormValues & {
  locale: Locale
}

type ContactResponse = {
  success?: boolean
  error?: string
}

export type ContactErrorCode =
  | 'not_configured'
  | 'rate_limit'
  | 'validation'
  | 'network'
  | 'waking_up'
  | 'unknown'

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

  let data: ContactResponse | null = null
  let invokeError: Error | null = null

  try {
    const result = await withTimeout(
      supabase.functions.invoke<ContactResponse>('contact', {
        body: {
          name: payload.name.trim(),
          email: payload.email.trim(),
          message: payload.message.trim(),
          website: payload.website ?? '',
          locale: payload.locale,
        },
      }),
      INVOKE_TIMEOUT_MS,
    )
    data = result.data
    invokeError = result.error
  } catch (error) {
    if (isTimeoutError(error)) {
      throw new ContactServiceError('waking_up', 'waking_up')
    }
    throw new ContactServiceError('network', 'network')
  }

  if (invokeError) {
    const message = invokeError.message.toLowerCase()
    if (message.includes('timeout') || message.includes('fetch')) {
      throw new ContactServiceError('waking_up', 'waking_up')
    }
    throw new ContactServiceError(invokeError.message, 'network')
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
