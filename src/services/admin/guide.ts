import { getSupabase } from '@/lib/supabase'
import type { Locale } from '@/i18n/types'
import type { GuideAudioManifest } from '@/lib/portfolioChat/guideAudio'

export interface GuideScript {
  chunkId: string
  locale: Locale
  speechText: string
}

export interface GuideVoicePrefs {
  fr: string
  en: string
}

export const GEMINI_VOICES = [
  'Zephyr',
  'Puck',
  'Charon',
  'Kore',
  'Fenrir',
  'Aoede',
  'Leda',
  'Orus',
  'Zola',
  'Callirrhoe',
  'Autonoe',
  'Enceladus',
  'Iapetus',
  'Umbriel',
  'Algieba',
  'Despina',
  'Erinome',
  'Sulafat',
  'Vindemiatrix',
  'Achernar',
  'Acubens',
  'Sadachbia',
  'Schedar',
] as const

export const DEFAULT_VOICES: GuideVoicePrefs = {
  fr: 'Charon',
  en: 'Orus',
}

export const GUIDE_CHUNK_IDS = [
  'about-main',
  'about-availability',
  'skills-overview',
  'experience-list',
  'education-list',
  'contact-main',
  'cv-download',
  'game-info',
  'project-myfood',
  'project-pure-power-menu',
  'project-world-explorer',
  'project-sultan-kunafa',
] as const

export type GuideChunkId = (typeof GUIDE_CHUNK_IDS)[number]

// ── Fetch all scripts ───────────────────────────────────────────────────────

export async function fetchGuideScripts(): Promise<GuideScript[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('guide_scripts')
    .select('chunk_id, locale, speech_text')
    .order('chunk_id')

  if (error || !data) return []

  return data.map((row) => ({
    chunkId: row.chunk_id as string,
    locale: row.locale as Locale,
    speechText: row.speech_text as string,
  }))
}

// ── Save a single script ────────────────────────────────────────────────────

export async function saveGuideScript(
  chunkId: string,
  locale: Locale,
  speechText: string,
): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error } = await supabase.from('guide_scripts').upsert(
    { chunk_id: chunkId, locale, speech_text: speechText },
    { onConflict: 'chunk_id,locale' },
  )

  if (error) {
    console.error('[admin] save guide script failed', error)
    return false
  }
  return true
}

// ── Delete a script ─────────────────────────────────────────────────────────

export async function deleteGuideScript(
  chunkId: string,
  locale: Locale,
): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error } = await supabase
    .from('guide_scripts')
    .delete()
    .eq('chunk_id', chunkId)
    .eq('locale', locale)

  if (error) {
    console.error('[admin] delete guide script failed', error)
    return false
  }
  return true
}

// ── Manifest ────────────────────────────────────────────────────────────────

let cachedManifest: GuideAudioManifest | null = null

export async function fetchGuideManifest(): Promise<GuideAudioManifest | null> {
  if (cachedManifest) return cachedManifest

  try {
    const res = await fetch('/audio/guide/manifest.json')
    if (!res.ok) return null
    const data: GuideAudioManifest = await res.json()
    cachedManifest = data
    return data
  } catch {
    return null
  }
}

export function invalidateManifestCache(): void {
  cachedManifest = null
}

// ── Audio info ──────────────────────────────────────────────────────────────

export function getGuideAudioUrl(chunkId: string, locale: Locale): string {
  return `/audio/guide/${locale}/${chunkId}.wav`
}

export function isAudioPresent(
  manifest: GuideAudioManifest | null,
  chunkId: string,
  locale: Locale,
): boolean {
  return Boolean(manifest?.files[locale]?.includes(chunkId))
}

// ── Regenerate audio via edge function ──────────────────────────────────────

export async function regenerateGuideAudio(
  chunkId: string,
  locale: Locale,
  speechText: string,
  voice?: string,
): Promise<{ url: string; size: number } | null> {
  try {
    const res = await fetch('/api/guide-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chunkId, locale, text: speechText, voice }),
    })

    if (!res.ok) return null
    const data = await res.json()
    invalidateManifestCache()
    return { url: data.url as string, size: data.size as number }
  } catch {
    return null
  }
}

// ── Delete audio file via edge function ─────────────────────────────────────

export async function deleteGuideAudioFile(
  chunkId: string,
  locale: Locale,
): Promise<boolean> {
  try {
    const res = await fetch(`/api/guide-tts?chunkId=${chunkId}&locale=${locale}`, {
      method: 'DELETE',
    })
    invalidateManifestCache()
    return res.ok
  } catch {
    return false
  }
}

// ── Voice preferences ────────────────────────────────────────────────────────

export async function fetchGuideVoicePrefs(): Promise<GuideVoicePrefs> {
  const supabase = getSupabase()
  if (!supabase) return { ...DEFAULT_VOICES }

  const { data } = await supabase
    .from('guide_scripts')
    .select('locale')
    .limit(1)

  // Voice prefs are stored in a simple key-value approach via edge function
  // For now, return defaults; can be extended with a guide_config table
  void data
  return { ...DEFAULT_VOICES }
}

export async function saveGuideVoicePrefs(prefs: GuideVoicePrefs): Promise<boolean> {
  // Store via edge function or localStorage for now
  try {
    localStorage.setItem('guide_voice_prefs', JSON.stringify(prefs))
    return true
  } catch {
    return false
  }
}

export function loadGuideVoicePrefs(): GuideVoicePrefs {
  try {
    const raw = localStorage.getItem('guide_voice_prefs')
    if (raw) return JSON.parse(raw) as GuideVoicePrefs
  } catch { /* ignore */ }
  return { ...DEFAULT_VOICES }
}
