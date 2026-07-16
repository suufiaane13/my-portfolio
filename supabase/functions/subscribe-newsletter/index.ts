import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubscribeBody {
  email?: string
  locale?: string
  source?: string
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

async function hashIp(ip: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405)
  }

  let body: SubscribeBody
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'validation' }, 400)
  }

  const email = body.email?.trim().toLowerCase() ?? ''
  const locale = body.locale === 'en' ? 'en' : 'fr'
  const source = ['portfolio', 'contact', 'game'].includes(body.source ?? '')
    ? body.source
    : 'portfolio'

  if (!isValidEmail(email) || email.length > 254) {
    return jsonResponse({ error: 'validation' }, 400)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const ipSalt = Deno.env.get('IP_HASH_SALT') ?? 'portfolio-newsletter'

  if (!supabaseUrl || !serviceKey) {
    console.error('[subscribe-newsletter] Missing Supabase env')
    return jsonResponse({ error: 'server_error' }, 500)
  }

  const supabase = createClient(supabaseUrl, serviceKey)
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const ipHash = await hashIp(clientIp, ipSalt)

  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id, unsubscribed_at')
    .eq('email', email)
    .maybeSingle()

  if (existing && !existing.unsubscribed_at) {
    return jsonResponse({ error: 'already_subscribed' }, 409)
  }

  if (existing?.unsubscribed_at) {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        locale,
        source,
        subscribed_at: new Date().toISOString(),
        unsubscribed_at: null,
        ip_hash: ipHash,
      })
      .eq('id', existing.id)

    if (error) {
      console.error('[subscribe-newsletter] resubscribe failed:', error.message)
      return jsonResponse({ error: 'server_error' }, 500)
    }

    return jsonResponse({ success: true })
  }

  const { error } = await supabase.from('newsletter_subscribers').insert({
    email,
    locale,
    source,
    ip_hash: ipHash,
  })

  if (error) {
    if (error.code === '23505') {
      return jsonResponse({ error: 'already_subscribed' }, 409)
    }
    console.error('[subscribe-newsletter] insert failed:', error.message)
    return jsonResponse({ error: 'server_error' }, 500)
  }

  return jsonResponse({ success: true })
})
