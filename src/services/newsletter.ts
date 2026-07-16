import { getSupabase } from '@/lib/supabase'
import { isTimeoutError, withTimeout } from '@/lib/withTimeout'
import type { Locale } from '@/i18n/types'

const INVOKE_TIMEOUT_MS = 15_000

export type NewsletterSource = 'portfolio' | 'contact' | 'game'

export interface SubscribeNewsletterPayload {
  email: string
  locale: Locale
  source?: NewsletterSource
}

type SubscribeResponse = {
  success?: boolean
  error?: string
}

export type NewsletterErrorCode =
  | 'not_configured'
  | 'validation'
  | 'already_subscribed'
  | 'network'
  | 'unknown'

export class NewsletterServiceError extends Error {
  code: NewsletterErrorCode

  constructor(message: string, code: NewsletterErrorCode) {
    super(message)
    this.name = 'NewsletterServiceError'
    this.code = code
  }
}

export async function subscribeNewsletter(payload: SubscribeNewsletterPayload): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) {
    throw new NewsletterServiceError('not_configured', 'not_configured')
  }

  let data: SubscribeResponse | null = null
  let invokeError: Error | null = null

  try {
    const result = await withTimeout(
      supabase.functions.invoke<SubscribeResponse>('subscribe-newsletter', {
        body: {
          email: payload.email.trim(),
          locale: payload.locale,
          source: payload.source ?? 'portfolio',
        },
      }),
      INVOKE_TIMEOUT_MS,
    )
    data = result.data
    invokeError = result.error
  } catch (error) {
    if (isTimeoutError(error)) {
      throw new NewsletterServiceError('network', 'network')
    }
    throw new NewsletterServiceError('network', 'network')
  }

  if (invokeError) {
    throw new NewsletterServiceError(invokeError.message, 'network')
  }

  if (data?.error === 'already_subscribed') {
    throw new NewsletterServiceError('already_subscribed', 'already_subscribed')
  }

  if (data?.error === 'validation') {
    throw new NewsletterServiceError('validation', 'validation')
  }

  if (data?.error) {
    throw new NewsletterServiceError(data.error, 'unknown')
  }

  if (!data?.success) {
    throw new NewsletterServiceError('unknown', 'unknown')
  }
}
