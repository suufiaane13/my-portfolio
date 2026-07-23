/// <reference path="../deno-env.d.ts" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubmitChessBody {
  player_name?: string
  difficulty?: string
  player_color?: string
  result?: string
  ply_count?: number
  seconds?: number
  opening_name?: string | null
  uci_moves?: string
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

function validatePayload(body: SubmitChessBody) {
  const playerName = body.player_name?.trim() ?? ''
  const difficulty = body.difficulty
  const playerColor = body.player_color
  const result = body.result
  const plyCount = body.ply_count
  const seconds = body.seconds
  const locale = body.locale === 'en' ? 'en' : 'fr'
  const openingName = body.opening_name?.trim() || null
  const uciMoves = typeof body.uci_moves === 'string' ? body.uci_moves.trim() : ''

  if (!/^[a-zA-ZÀ-ÿ0-9 _.-]{2,20}$/.test(playerName)) return null
  if (difficulty !== 'beginner' && difficulty !== 'intermediate' && difficulty !== 'expert') {
    return null
  }
  if (playerColor !== 'w' && playerColor !== 'b') return null
  if (result !== 'win' && result !== 'loss' && result !== 'draw') return null
  if (typeof plyCount !== 'number' || !Number.isInteger(plyCount) || plyCount < 0 || plyCount > 600) {
    return null
  }
  if (typeof seconds !== 'number' || !Number.isInteger(seconds) || seconds < 0 || seconds > 7200) {
    return null
  }
  if (uciMoves.length > 4000) return null
  if (openingName && openingName.length > 120) return null

  const uciTokens = uciMoves ? uciMoves.split(/\s+/).filter(Boolean) : []
  if (uciTokens.length !== plyCount) return null
  if (uciTokens.some((token) => !/^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(token))) return null

  return {
    playerName,
    difficulty,
    playerColor,
    result,
    plyCount,
    seconds,
    openingName,
    uciMoves,
    locale,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405)
  }

  try {
    const body = (await req.json()) as SubmitChessBody

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
      console.error('[submit-chess-game] Missing Supabase environment variables')
      return jsonResponse({ error: 'server_misconfigured' }, 500)
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const forwardedFor = req.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() || req.headers.get('cf-connecting-ip') || 'unknown'
    const salt = Deno.env.get('IP_HASH_SALT') ?? 'portfolio-scores'
    const ipHash = await hashIp(ip, salt)

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const maxPerHour = Number.parseInt(Deno.env.get('SCORE_RATE_LIMIT_MAX') ?? '3', 10)

    const { count, error: countError } = await supabase
      .from('chess_games')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo)

    if (countError) {
      console.error('[submit-chess-game] Rate limit check failed:', countError)
      return jsonResponse({ error: 'database_error' }, 500)
    }

    if ((count ?? 0) >= maxPerHour) {
      return jsonResponse({ error: 'rate_limit' }, 429)
    }

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    const { count: recentCount, error: recentError } = await supabase
      .from('chess_games')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneMinuteAgo)

    if (recentError) {
      console.error('[submit-chess-game] Recent submit check failed:', recentError)
      return jsonResponse({ error: 'database_error' }, 500)
    }

    if ((recentCount ?? 0) >= 1) {
      return jsonResponse({ error: 'rate_limit' }, 429)
    }

    const { data: inserted, error: insertError } = await supabase
      .from('chess_games')
      .insert({
        player_name: payload.playerName,
        difficulty: payload.difficulty,
        player_color: payload.playerColor,
        result: payload.result,
        ply_count: payload.plyCount,
        opening_name: payload.openingName,
        uci_moves: payload.uciMoves,
        seconds: payload.seconds,
        locale: payload.locale,
        ip_hash: ipHash,
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      console.error('[submit-chess-game] Insert failed:', insertError)
      return jsonResponse({ error: 'database_error' }, 500)
    }

    let rank: number | null = null
    if (payload.result === 'win') {
      const { data: rankRow, error: rankError } = await supabase
        .from('chess_leaderboard')
        .select('rank')
        .eq('id', inserted.id)
        .single()

      if (rankError) {
        console.error('[submit-chess-game] Rank lookup failed:', rankError)
      } else {
        rank = rankRow?.rank ?? null
      }
    }

    return jsonResponse({
      success: true,
      id: inserted.id,
      rank,
    })
  } catch (error) {
    console.error('[submit-chess-game] Unexpected error:', error)
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})
