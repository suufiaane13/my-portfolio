import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { getCorsHeaders, jsonResponse } from '../_shared/cors.ts'

const VOICES: Record<string, string> = {
  fr: 'Charon',
  en: 'Orus',
}

const TTS_MODELS = [
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
]

function pcmToWav(pcm: Uint8Array, sampleRate = 24000, channels = 1, bitDepth = 16): Uint8Array {
  const byteRate = (sampleRate * channels * bitDepth) / 8
  const blockAlign = (channels * bitDepth) / 8
  const header = new Uint8Array(44)

  const view = new DataView(header.buffer)
  // RIFF header
  header.set(new TextEncoder().encode('RIFF'), 0)
  view.setUint32(4, 36 + pcm.length, true)
  header.set(new TextEncoder().encode('WAVE'), 8)
  // fmt chunk
  header.set(new TextEncoder().encode('fmt '), 12)
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  // data chunk
  header.set(new TextEncoder().encode('data'), 36)
  view.setUint32(40, pcm.length, true)

  const wav = new Uint8Array(44 + pcm.length)
  wav.set(header)
  wav.set(pcm, 44)
  return wav
}

async function callGeminiTts(
  apiKey: string,
  text: string,
  locale: string,
  voiceOverride?: string,
): Promise<Uint8Array> {
  const voice = voiceOverride ?? VOICES[locale] ?? 'Charon'
  const prompt =
    locale === 'fr'
      ? `Speak in French, professionally and warmly:\n${text}`
      : `Speak in English, professionally and warmly:\n${text}`

  let lastError: unknown
  for (const model of TTS_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voice },
                },
              },
            },
          }),
        },
      )

      if (!res.ok) {
        const err = await res.text()
        throw new Error(`Gemini ${model}: ${res.status} ${err}`)
      }

      const data = await res.json()
      const part = data.candidates?.[0]?.content?.parts?.find(
        (p: { inlineData?: { data?: string } }) => p.inlineData?.data,
      )
      if (!part?.inlineData?.data) {
        throw new Error('Gemini TTS: empty audio payload')
      }

      const raw = atob(part.inlineData.data)
      const pcm = new Uint8Array(raw.length)
      for (let i = 0; i < raw.length; i++) {
        pcm[i] = raw.charCodeAt(i)
      }
      return pcm
    } catch (error) {
      lastError = error
      const msg = error instanceof Error ? error.message : String(error)
      const isQuota = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')
      if (!isQuota) throw error
      // else try next model
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) })
  }

  // ── DELETE audio ────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const url = new URL(req.url)
    const chunkId = url.searchParams.get('chunkId')
    const locale = url.searchParams.get('locale')

    if (!chunkId || !locale || !['fr', 'en'].includes(locale)) {
      return jsonResponse({ error: 'validation' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return jsonResponse({ error: 'server_misconfigured' }, 500)
    }

    // Verify admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return jsonResponse({ error: 'unauthorized' }, 401)

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) return jsonResponse({ error: 'unauthorized' }, 401)

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const path = `${locale}/${chunkId}.wav`

    const { error } = await supabase.storage.from('guide-audio').remove([path])
    if (error) {
      console.error('[guide-tts] delete failed:', error)
      return jsonResponse({ error: 'storage_error' }, 500)
    }

    return jsonResponse({ success: true })
  }

  // ── POST generate audio ─────────────────────────────────────────────────────
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405)
  }

  try {
    const body = await req.json() as { chunkId?: string; locale?: string; text?: string; voice?: string }
    const { chunkId, locale, text, voice } = body ?? {}

    if (!chunkId || !locale || !text || !['fr', 'en'].includes(locale)) {
      return jsonResponse({ error: 'validation' }, 400)
    }

    if (text.length > 2000) {
      return jsonResponse({ error: 'text_too_long' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const geminiKey = Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY')

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return jsonResponse({ error: 'server_misconfigured' }, 500)
    }

    if (!geminiKey) {
      return jsonResponse({ error: 'gemini_api_key_missing' }, 500)
    }

    // Verify admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return jsonResponse({ error: 'unauthorized' }, 401)

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) return jsonResponse({ error: 'unauthorized' }, 401)

    // Generate audio
    const pcm = await callGeminiTts(geminiKey, text, locale, voice)
    const wav = pcmToWav(pcm)

    // Upload to storage
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const path = `${locale}/${chunkId}.wav`

    const { error: uploadError } = await supabase.storage
      .from('guide-audio')
      .upload(path, wav, {
        contentType: 'audio/wav',
        upsert: true,
      })

    if (uploadError) {
      console.error('[guide-tts] upload failed:', uploadError)
      return jsonResponse({ error: 'storage_error' }, 500)
    }

    const { data: publicUrl } = supabase.storage
      .from('guide-audio')
      .getPublicUrl(path)

    return jsonResponse({
      success: true,
      url: publicUrl.publicUrl,
      size: wav.length,
    })
  } catch (error) {
    console.error('[guide-tts] Unexpected error:', error)
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})
