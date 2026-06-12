import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALLOWED_EVENTS = new Set([
  'page_view',
  'section_view',
  'project_click',
  'cv_download',
  'contact_submit',
  'game_win',
  'game_score_submit',
  'lang_switch',
  'theme_switch',
])

interface TrackEventBody {
  event_type?: string
  path?: string
  section_id?: string
  project_id?: string
  locale?: string
  metadata?: Record<string, unknown>
  session_id?: string
  website?: string
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function hashValue(value: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${value}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function hashIp(ip: string, salt: string) {
  return hashValue(ip, salt)
}

function sanitizeText(value: string | undefined, maxLength: number) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return null
  return trimmed.slice(0, maxLength)
}

function validatePayload(body: TrackEventBody) {
  const eventType = body.event_type?.trim() ?? ''
  if (!ALLOWED_EVENTS.has(eventType)) return null

  const locale = body.locale === 'en' || body.locale === 'fr' ? body.locale : null
  const path = sanitizeText(body.path, 200)
  const sectionId = sanitizeText(body.section_id, 80)
  const projectId = sanitizeText(body.project_id, 80)
  const sessionId = sanitizeText(body.session_id, 64)

  let metadata: Record<string, unknown> = {}
  if (body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)) {
    metadata = body.metadata
  }

  return { eventType, locale, path, sectionId, projectId, sessionId, metadata }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405)
  }

  try {
    const body = (await req.json()) as TrackEventBody

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
      console.error('[track-event] Missing Supabase environment variables')
      return jsonResponse({ error: 'server_misconfigured' }, 500)
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const salt = Deno.env.get('IP_HASH_SALT') ?? 'portfolio-events'

    const forwardedFor = req.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() || req.headers.get('cf-connecting-ip') || 'unknown'
    const ipHash = await hashIp(ip, salt)
    const sessionHash = payload.sessionId ? await hashValue(payload.sessionId, salt) : null

    if (sessionHash) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const maxPerHour = Number.parseInt(Deno.env.get('EVENT_RATE_LIMIT_MAX') ?? '120', 10)

      const { count, error: countError } = await supabase
        .from('portfolio_events')
        .select('*', { count: 'exact', head: true })
        .eq('session_hash', sessionHash)
        .gte('created_at', oneHourAgo)

      if (countError) {
        console.error('[track-event] Rate limit check failed:', countError)
        return jsonResponse({ error: 'database_error' }, 500)
      }

      if ((count ?? 0) >= maxPerHour) {
        return jsonResponse({ success: true, skipped: 'rate_limit' })
      }
    }

    const userAgent = req.headers.get('user-agent')

    const { error: insertError } = await supabase.from('portfolio_events').insert({
      event_type: payload.eventType,
      path: payload.path,
      section_id: payload.sectionId,
      project_id: payload.projectId,
      locale: payload.locale,
      metadata: payload.metadata,
      session_hash: sessionHash,
      ip_hash: ipHash,
      user_agent: userAgent?.slice(0, 500) ?? null,
    })

    if (insertError) {
      console.error('[track-event] Insert failed:', insertError)
      return jsonResponse({ error: 'database_error' }, 500)
    }

    return jsonResponse({ success: true })
  } catch (error) {
    console.error('[track-event] Unexpected error:', error)
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})
