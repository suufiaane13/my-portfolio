import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import {
  buildConfirmationEmail,
  buildConfirmationEmailText,
  buildOwnerEmail,
  buildOwnerEmailText,
  confirmationEmailSubject,
  formatFromAddress,
  ownerEmailSubject,
} from './email-templates.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactBody {
  name?: string
  email?: string
  message?: string
  website?: string
  locale?: string
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validatePayload(body: ContactBody) {
  const name = body.name?.trim() ?? ''
  const email = body.email?.trim() ?? ''
  const message = body.message?.trim() ?? ''
  const locale = body.locale === 'en' ? 'en' : 'fr'

  if (name.length < 2 || name.length > 80) return null
  if (!isValidEmail(email)) return null
  if (message.length < 10 || message.length > 2000) return null

  return { name, email, message, locale }
}

async function hashIp(ip: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function sendResendEmail(payload: Record<string, unknown>, label: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    console.error(`[contact] ${label}: RESEND_API_KEY is not set in Supabase secrets`)
    return false
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error(`[contact] ${label} failed (${response.status}):`, errorBody)
    return false
  }

  console.log(`[contact] ${label} sent successfully`)
  return true
}

async function sendOwnerEmail(params: {
  name: string
  email: string
  message: string
  locale: string
}) {
  const toEmail = Deno.env.get('CONTACT_TO_EMAIL')
  const fromEmail = Deno.env.get('CONTACT_FROM_EMAIL') ?? 'onboarding@resend.dev'

  if (!toEmail) {
    console.error('[contact] owner email: CONTACT_TO_EMAIL is not set in Supabase secrets')
    return false
  }

  return sendResendEmail(
    {
      from: formatFromAddress(fromEmail),
      to: [toEmail],
      reply_to: params.email,
      subject: ownerEmailSubject(params.name, params.locale),
      html: buildOwnerEmail(params),
      text: buildOwnerEmailText(params),
    },
    'owner notification',
  )
}

async function sendConfirmationEmail(params: {
  name: string
  email: string
  message: string
  locale: string
}) {
  const fromEmail = Deno.env.get('CONTACT_FROM_EMAIL') ?? 'onboarding@resend.dev'

  return sendResendEmail(
    {
      from: formatFromAddress(fromEmail),
      to: [params.email],
      reply_to: Deno.env.get('CONTACT_TO_EMAIL') ?? undefined,
      subject: confirmationEmailSubject(params.locale),
      html: buildConfirmationEmail(params),
      text: buildConfirmationEmailText(params),
    },
    'visitor confirmation',
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405)
  }

  try {
    const body = (await req.json()) as ContactBody

    if (body.website?.trim()) {
      return jsonResponse({ success: true })
    }

    const payload = validatePayload(body)
    if (!payload) {
      return jsonResponse({ error: 'validation' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase environment variables')
      return jsonResponse({ error: 'server_misconfigured' }, 500)
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const forwardedFor = req.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() || req.headers.get('cf-connecting-ip') || 'unknown'
    const salt = Deno.env.get('IP_HASH_SALT') ?? 'portfolio-contact'
    const ipHash = await hashIp(ip, salt)

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const maxPerHour = Number.parseInt(Deno.env.get('RATE_LIMIT_MAX') ?? '3', 10)

    const { count, error: countError } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo)

    if (countError) {
      console.error('Rate limit check failed:', countError)
      return jsonResponse({ error: 'database_error' }, 500)
    }

    if ((count ?? 0) >= maxPerHour) {
      return jsonResponse({ error: 'rate_limit' }, 429)
    }

    const userAgent = req.headers.get('user-agent')

    const { error: insertError } = await supabase.from('contact_messages').insert({
      name: payload.name,
      email: payload.email,
      message: payload.message,
      locale: payload.locale,
      ip_hash: ipHash,
      user_agent: userAgent,
    })

    if (insertError) {
      console.error('Insert failed:', insertError)
      return jsonResponse({ error: 'database_error' }, 500)
    }

    const [ownerResult, confirmationResult] = await Promise.allSettled([
      sendOwnerEmail(payload),
      sendConfirmationEmail(payload),
    ])

    const ownerSent = ownerResult.status === 'fulfilled' && ownerResult.value === true
    const confirmationSent =
      confirmationResult.status === 'fulfilled' && confirmationResult.value === true

    if (!ownerSent) {
      console.warn('[contact] Message saved to DB but owner email was not sent — check Resend secrets/logs')
    }

    return jsonResponse({
      success: true,
      email: {
        owner: ownerSent,
        confirmation: confirmationSent,
      },
    })
  } catch (error) {
    console.error('Contact function error:', error)
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})
