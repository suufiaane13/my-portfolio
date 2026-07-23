/// <reference path="../deno-env.d.ts" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubmitScoreBody {
  player_name?: string
  grid_size?: number
  moves?: number
  seconds?: number
  locale?: string
  website?: string
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function hashIp(ip: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function validatePayload(body: SubmitScoreBody) {
  const playerName = body.player_name?.trim() ?? ''
  const gridSize = body.grid_size
  const moves = body.moves
  const seconds = body.seconds
  const locale = body.locale === 'en' ? 'en' : 'fr'

  if (!/^[a-zA-ZÀ-ÿ0-9 _.-]{2,20}$/.test(playerName)) return null
  if (gridSize !== 4 && gridSize !== 6) return null
  if (typeof moves !== 'number' || !Number.isInteger(moves) || moves <= 0) return null
  if (typeof seconds !== 'number' || !Number.isInteger(seconds) || seconds < 0) return null

  const minMoves = gridSize === 4 ? 8 : 18
  if (moves < minMoves) return null
  if (seconds > 3600) return null

  return { playerName, gridSize, moves, seconds, locale }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405)
  }

  try {
    const body = (await req.json()) as SubmitScoreBody

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
      console.error('[submit-score] Missing Supabase environment variables')
      return jsonResponse({ error: 'server_misconfigured' }, 500)
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const forwardedFor = req.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() || req.headers.get('cf-connecting-ip') || 'unknown'
    const salt = Deno.env.get('IP_HASH_SALT') ?? 'portfolio-scores'
    const ipHash = await hashIp(ip, salt)

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    // Play is unlimited; only score registration is capped (default 3 / hour / IP).
    const maxPerHour = Number.parseInt(Deno.env.get('SCORE_RATE_LIMIT_MAX') ?? '3', 10)

    const { count, error: countError } = await supabase
      .from('memory_scores')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo)

    if (countError) {
      console.error('[submit-score] Rate limit check failed:', countError)
      return jsonResponse({ error: 'database_error' }, 500)
    }

    if ((count ?? 0) >= maxPerHour) {
      return jsonResponse({ error: 'rate_limit' }, 429)
    }

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    const { count: recentCount, error: recentError } = await supabase
      .from('memory_scores')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneMinuteAgo)

    if (recentError) {
      console.error('[submit-score] Recent submit check failed:', recentError)
      return jsonResponse({ error: 'database_error' }, 500)
    }

    if ((recentCount ?? 0) >= 1) {
      return jsonResponse({ error: 'rate_limit' }, 429)
    }

    const { data: inserted, error: insertError } = await supabase
      .from('memory_scores')
      .insert({
        player_name: payload.playerName,
        grid_size: payload.gridSize,
        moves: payload.moves,
        seconds: payload.seconds,
        locale: payload.locale,
        ip_hash: ipHash,
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      console.error('[submit-score] Insert failed:', insertError)
      return jsonResponse({ error: 'database_error' }, 500)
    }

    const { data: rankRow, error: rankError } = await supabase
      .from('memory_leaderboard')
      .select('rank')
      .eq('id', inserted.id)
      .single()

    if (rankError) {
      console.error('[submit-score] Rank lookup failed:', rankError)
    }

    return jsonResponse({
      success: true,
      id: inserted.id,
      rank: rankRow?.rank ?? null,
    })
  } catch (error) {
    console.error('[submit-score] Unexpected error:', error)
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})
