/**
 * Réécrit les scripts TTS du guide via Gemini (Google AI Studio).
 *
 * Usage : npm run guide:scripts
 * Prérequis : GOOGLE_GENERATIVE_AI_API_KEY dans .env
 */

import { config as loadEnv } from 'dotenv'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { GoogleGenAI } from '@google/genai'
import { GUIDE_SPEECH_SCRIPTS_SOURCE } from './guide-speech-scripts-source'

loadEnv({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') })

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outPath = join(root, 'src', 'lib', 'portfolioChat', 'guideSpeechScripts.ts')

const MODEL = process.env.GUIDE_SCRIPT_MODEL ?? 'gemini-flash-latest'

function requireApiKey() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
  if (!key) {
    throw new Error(
      'GOOGLE_GENERATIVE_AI_API_KEY manquant. Ajoute-la dans .env (Google AI Studio).',
    )
  }
  return key
}

function buildPrompt(locale: 'fr' | 'en', scripts: Record<string, string>) {
  const lang = locale === 'fr' ? 'French' : 'English'
  return `You rewrite portfolio guide TTS narration scripts for Soufiane HAJJI (full-stack developer & UI/UX, Oujda, Morocco).

Language: ${lang} only.
Tone: professional, warm, confident — like a polished portfolio narrator speaking to recruiters.
Keep factual content accurate (skills, schools, projects, contact). Do not invent employers or degrees.

Rules:
- Natural spoken sentences (not a CV bullet list).
- Spell tech names the way a speaker would say them (HTML, CSS, React, Laravel, Kotlin, Supabase as "Superbase", TypeScript, etc.).
- For email/phone, keep phonetic clarity suitable for TTS.
- Length: roughly similar to the original (±20%).
- Return ONLY valid JSON object mapping chunkId -> rewritten script string. No markdown fences.

Original scripts JSON:
${JSON.stringify(scripts, null, 2)}`
}

async function rewriteLocale(
  ai: GoogleGenAI,
  locale: 'fr' | 'en',
  scripts: Record<string, string>,
): Promise<Record<string, string>> {
  console.log(`✍️  Réécriture scripts ${locale.toUpperCase()} (${MODEL})…`)

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildPrompt(locale, scripts),
    config: {
      temperature: 0.55,
      responseMimeType: 'application/json',
    },
  })

  const text = response.text?.trim()
  if (!text) throw new Error(`Réponse vide pour ${locale}`)

  const parsed = JSON.parse(text) as Record<string, string>
  const keys = Object.keys(scripts)
  for (const key of keys) {
    if (!parsed[key]?.trim()) {
      throw new Error(`Chunk manquant dans la réponse ${locale}: ${key}`)
    }
  }
  return Object.fromEntries(keys.map((key) => [key, parsed[key].trim()]))
}

function escapeTsString(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, '\\n')
}

function renderTsFile(fr: Record<string, string>, en: Record<string, string>) {
  const renderLocale = (scripts: Record<string, string>) =>
    Object.entries(scripts)
      .map(([id, text]) => `    '${id}':\n      '${escapeTsString(text)}',`)
      .join('\n\n')

  return `import type { Locale } from '@/i18n/types'
import { buildGuideSpeechText, prepareGuideSpeechText } from '@/lib/guideSpeechText'

/**
 * Curated TTS scripts per guide chunk (rewritten for natural narration).
 * Regenerate with: npm run guide:scripts
 */
const GUIDE_SPEECH_SCRIPTS: Record<Locale, Record<string, string>> = {
  fr: {
${renderLocale(fr)}
  },

  en: {
${renderLocale(en)}
  },
}

export function getGuideSpeechScript(chunkId: string, locale: Locale): string | null {
  const script = GUIDE_SPEECH_SCRIPTS[locale][chunkId]
  return script?.trim() ? script : null
}

/** Prefer curated script; otherwise build from display title + body. */
export function resolveGuideSpeechText(
  chunkId: string,
  title: string,
  body: string,
  locale: Locale,
): string {
  const script = getGuideSpeechScript(chunkId, locale)
  if (script) {
    return prepareGuideSpeechText(script, locale)
  }
  return buildGuideSpeechText(title, body, locale)
}
`
}

async function main() {
  const apiKey = requireApiKey()
  const ai = new GoogleGenAI({ apiKey })

  const fr = await rewriteLocale(ai, 'fr', GUIDE_SPEECH_SCRIPTS_SOURCE.fr)
  const en = await rewriteLocale(ai, 'en', GUIDE_SPEECH_SCRIPTS_SOURCE.en)

  writeFileSync(outPath, renderTsFile(fr, en), 'utf8')
  console.log(`\n✅ Scripts mis à jour → src/lib/portfolioChat/guideSpeechScripts.ts`)
}

main().catch((error: unknown) => {
  console.error('\n❌', error instanceof Error ? error.message : error)
  process.exit(1)
})
