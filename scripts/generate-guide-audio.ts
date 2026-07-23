/**
 * Génère les fichiers audio du guide via Gemini TTS (Google AI Studio).
 * Fallback : Piper local si GEMINI TTS indisponible / quota.
 *
 * Usage :
 *   npm run guide:audio              # ne régénère QUE le manquant / non-Gemini
 *   npm run guide:audio:force        # tout écraser
 *   npm run guide:audio -- --limit=8
 *
 * Les chunks déjà listés dans manifest.gemini sont ignorés (sauf --force).
 * Prérequis Gemini : GOOGLE_GENERATIVE_AI_API_KEY dans .env
 */

import { config as loadEnv } from 'dotenv'
import { spawnSync } from 'node:child_process'
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import { GoogleGenAI } from '@google/genai'
import { fr } from '../src/i18n/locales/fr'
import { en } from '../src/i18n/locales/en'
import { buildStaticPortfolio } from '../src/lib/staticPortfolio'
import { buildChatKnowledge } from '../src/lib/portfolioChat/knowledge'
import { getGuideReplyForTopic } from '../src/lib/portfolioChat/guide'
import { resolveGuideSpeechText } from '../src/lib/portfolioChat/guideSpeechScripts'
import { chunkIdForProject, chunkIdForTopic } from '../src/lib/portfolioChat/guideTopics'
import type { Locale } from '../src/i18n/types'
import type { GuideTopicId } from '../src/lib/portfolioChat/guideTopics'

loadEnv({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') })

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const toolsDir = join(root, 'scripts', '.tools')
const piperDir = join(toolsDir, 'piper')
const voicesDir = join(toolsDir, 'piper-voices')
const outputDir = join(root, 'public', 'audio', 'guide')

const TTS_MODELS = [
  process.env.GUIDE_TTS_MODEL ?? 'gemini-3.1-flash-tts-preview',
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
].filter((model, index, all) => all.indexOf(model) === index)

const VOICES: Record<Locale, string> = {
  fr: process.env.GUIDE_TTS_VOICE_FR ?? 'Charon',
  en: process.env.GUIDE_TTS_VOICE_EN ?? 'Orus',
}

const PIPER_RELEASE = '2023.11.14-2'
const PIPER_ARCHIVE = `piper_windows_amd64.zip`
const PIPER_URL = `https://github.com/rhasspy/piper/releases/download/${PIPER_RELEASE}/${PIPER_ARCHIVE}`

const VOICE_PACKS: Record<Locale, { id: string; onnx: string; config: string }> = {
  fr: {
    id: 'fr_FR-tom-medium',
    onnx: 'https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx',
    config:
      'https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx.json',
  },
  en: {
    id: 'en_US-ryan-medium',
    onnx: 'https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx',
    config:
      'https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx.json',
  },
}

const GUIDE_TOPIC_IDS: GuideTopicId[] = [
  'about',
  'freelance',
  'skills',
  'experience',
  'education',
  'contact',
  'cv',
  'game',
]

interface GuideAudioEntry {
  locale: Locale
  chunkId: string
  title: string
  text: string
  speechText: string
}

function parseLimit() {
  const arg = process.argv.find((item) => item.startsWith('--limit='))
  if (!arg) return Number.POSITIVE_INFINITY
  const value = Number.parseInt(arg.slice('--limit='.length), 10)
  return Number.isFinite(value) && value > 0 ? value : Number.POSITIVE_INFINITY
}

function pcmToWav(pcm: Buffer, sampleRate = 24000, channels = 1, bitDepth = 16) {
  const byteRate = (sampleRate * channels * bitDepth) / 8
  const blockAlign = (channels * bitDepth) / 8
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + pcm.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(channels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(byteRate, 28)
  header.writeUInt16LE(blockAlign, 32)
  header.writeUInt16LE(bitDepth, 34)
  header.write('data', 36)
  header.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([header, pcm])
}

async function downloadFile(url: string, destination: string, force = false) {
  if (!force && existsSync(destination) && statSync(destination).size > 0) return
  mkdirSync(dirname(destination), { recursive: true })
  const response = await fetch(url)
  if (!response.ok || !response.body) {
    throw new Error(`Download failed (${response.status}): ${url}`)
  }
  await pipeline(response.body, createWriteStream(destination))
}

function findPiperExecutable(): string | null {
  const candidates = [
    join(piperDir, 'piper.exe'),
    join(piperDir, 'piper', 'piper.exe'),
    join(toolsDir, 'piper.exe'),
  ]
  return candidates.find((path) => existsSync(path)) ?? null
}

async function ensurePiper() {
  if (findPiperExecutable()) return
  mkdirSync(toolsDir, { recursive: true })
  const zipPath = join(toolsDir, PIPER_ARCHIVE)
  console.log('⬇️  Téléchargement Piper TTS (fallback)…')
  await downloadFile(PIPER_URL, zipPath)
  mkdirSync(piperDir, { recursive: true })
  spawnSync('tar', ['-xf', zipPath, '-C', piperDir], { stdio: 'inherit' })
}

async function ensurePiperVoice(locale: Locale) {
  const pack = VOICE_PACKS[locale]
  const voiceDir = join(voicesDir, pack.id)
  const onnxPath = join(voiceDir, `${pack.id}.onnx`)
  const configPath = join(voiceDir, `${pack.id}.onnx.json`)
  if (!existsSync(onnxPath) || !existsSync(configPath)) {
    console.log(`⬇️  Téléchargement voix Piper ${pack.id}…`)
    await downloadFile(pack.onnx, onnxPath)
    await downloadFile(pack.config, configPath)
  }
  return { onnxPath, voiceId: pack.id }
}

function collectGuideEntries(): GuideAudioEntry[] {
  const entries: GuideAudioEntry[] = []

  for (const locale of ['fr', 'en'] as const) {
    const t = locale === 'fr' ? fr : en
    const content = buildStaticPortfolio(locale, t)
    const knowledge = buildChatKnowledge(content, locale, t)

    for (const topicId of GUIDE_TOPIC_IDS) {
      const chunkId = chunkIdForTopic(topicId)
      if (!chunkId) continue
      const reply = getGuideReplyForTopic(topicId, knowledge, content, t)
      if (!reply) continue
      const title = t.chatbot.menu[topicId]
      entries.push({
        locale,
        chunkId,
        title,
        text: reply.text,
        speechText: resolveGuideSpeechText(chunkId, title, reply.text, locale),
      })
    }

    for (const project of content.projects) {
      const chunkId = chunkIdForProject(project.slug)
      const chunk = knowledge.chunks.find((item) => item.id === chunkId)
      if (!chunk) continue
      const prefix = t.chatbot.templates.projectPrefix.replace('{{title}}', project.title)
      const text = `${prefix}\n\n${chunk.body}`
      entries.push({
        locale,
        chunkId,
        title: project.title,
        text,
        speechText: resolveGuideSpeechText(chunkId, project.title, text, locale),
      })
    }
  }

  return entries
}

function synthesizeWithPiper(piperExe: string, modelPath: string, text: string, outputPath: string) {
  const result = spawnSync(
    piperExe,
    ['--model', modelPath, '--output_file', outputPath, '--length_scale', '0.95'],
    { input: text, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
  )
  if (result.status !== 0 || !existsSync(outputPath)) {
    throw new Error(`Piper failed for ${outputPath}\n${result.stderr?.toString() ?? ''}`)
  }
}

async function synthesizeWithGemini(
  ai: GoogleGenAI,
  text: string,
  locale: Locale,
  outputPath: string,
  models: string[],
) {
  // TTS models expect a clear "speak this transcript" instruction (not free-form chat).
  const prompt =
    locale === 'fr'
      ? `Speak in French, professionally and warmly:\n${text}`
      : `Speak in English, professionally and warmly:\n${text}`

  let lastError: unknown
  for (let i = 0; i < models.length; i += 1) {
    const model = models[i]!
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: VOICES[locale] },
            },
          },
        },
      })

      const data = response.candidates?.[0]?.content?.parts?.find(
        (part) => part.inlineData?.data,
      )?.inlineData?.data
      if (!data) {
        throw new Error('Gemini TTS: empty audio payload')
      }

      const pcm = Buffer.from(data, 'base64')
      writeFileSync(outputPath, pcmToWav(pcm))
      return model
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message : String(error)
      const isQuota = message.includes('429') || message.includes('RESOURCE_EXHAUSTED')
      if (isQuota && i < models.length - 1) {
        console.warn(`   ↻ quota ${model} → essai ${models[i + 1]}`)
        continue
      }
      throw error
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function loadExistingManifest(): {
  gemini: Record<Locale, string[]>
} {
  const path = join(outputDir, 'manifest.json')
  const empty = { gemini: { fr: [] as string[], en: [] as string[] } }
  if (!existsSync(path)) return empty
  try {
    const data = JSON.parse(readFileSync(path, 'utf8')) as {
      gemini?: Record<Locale, string[]>
    }
    return {
      gemini: {
        fr: [...(data.gemini?.fr ?? [])],
        en: [...(data.gemini?.en ?? [])],
      },
    }
  } catch {
    return empty
  }
}

async function main() {
  const force = process.argv.includes('--force')
  const preferPiper = process.argv.includes('--piper')
  const piperFallback = process.argv.includes('--piper-fallback')
  const limit = parseLimit()
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
  const useGemini = Boolean(apiKey) && !preferPiper
  const existing = loadExistingManifest()
  const geminiDone: Record<Locale, Set<string>> = {
    fr: new Set(existing.gemini.fr),
    en: new Set(existing.gemini.en),
  }

  console.log('🎙️  Génération audio guide portfolio\n')
  console.log(
    useGemini
      ? `Mode : Gemini TTS (${TTS_MODELS.join(' → ')}) · voix FR=${VOICES.fr} EN=${VOICES.en}${piperFallback ? ' · fallback Piper ON' : ' · strict (stop si quota)'}`
      : 'Mode : Piper local (fallback)',
  )
  if (!force && useGemini) {
    console.log(
      `Skip Gemini déjà OK : FR=${geminiDone.fr.size} · EN=${geminiDone.en.size} (utilise --force pour tout refaire)\n`,
    )
  }

  const ai = useGemini ? new GoogleGenAI({ apiKey: apiKey! }) : null
  let piperExe: string | null = null
  const piperVoices: Partial<Record<Locale, { onnxPath: string; voiceId: string }>> = {}
  let activeModels = [...TTS_MODELS]

  if (!useGemini) {
    await ensurePiper()
    piperExe = findPiperExecutable()
    if (!piperExe) throw new Error('Piper executable not found')
    piperVoices.fr = await ensurePiperVoice('fr')
    piperVoices.en = await ensurePiperVoice('en')
  }

  const entries = collectGuideEntries()
  const manifestFiles: Record<Locale, string[]> = { fr: [], en: [] }
  let generated = 0
  let skipped = 0
  let geminiFailures = 0

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i]!
    const localeDir = join(outputDir, entry.locale)
    mkdirSync(localeDir, { recursive: true })
    const outputPath = join(localeDir, `${entry.chunkId}.wav`)
    const alreadyGemini =
      existsSync(outputPath) &&
      statSync(outputPath).size > 0 &&
      geminiDone[entry.locale].has(entry.chunkId)

    // Sans --force : on ne skip que les WAV déjà générés via Gemini.
    // Les anciens Piper (présents mais absents de manifest.gemini) sont régénérés.
    if (!force && alreadyGemini) {
      manifestFiles[entry.locale].push(entry.chunkId)
      skipped += 1
      continue
    }

    if (generated >= limit) {
      console.log(`⏸️  Limite --limit=${limit} atteinte (reprendre plus tard sans --force)`)
      for (let j = i; j < entries.length; j += 1) {
        const rest = entries[j]!
        const restPath = join(outputDir, rest.locale, `${rest.chunkId}.wav`)
        if (existsSync(restPath) && statSync(restPath).size > 0) {
          manifestFiles[rest.locale].push(rest.chunkId)
        }
      }
      break
    }

    console.log(`🔊 ${entry.locale}/${entry.chunkId}`)

    try {
      if (ai) {
        const usedModel = await synthesizeWithGemini(
          ai,
          entry.speechText,
          entry.locale,
          outputPath,
          activeModels,
        )
        // Prefer the working model first for the next requests.
        if (usedModel !== activeModels[0]) {
          activeModels = [usedModel, ...activeModels.filter((m) => m !== usedModel)]
        }
        geminiDone[entry.locale].add(entry.chunkId)
        await sleep(2500)
      } else {
        synthesizeWithPiper(
          piperExe!,
          piperVoices[entry.locale]!.onnxPath,
          entry.speechText,
          outputPath,
        )
      }
      manifestFiles[entry.locale].push(entry.chunkId)
      generated += 1
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`⚠️  Gemini KO (${entry.chunkId}): ${message}`)
      geminiFailures += 1

      if (!piperFallback) {
        console.error(
          '\n⛔ Arrêt strict : quota/erreur Gemini sur tous les modèles. Relance demain sans --force.',
        )
        for (let j = i; j < entries.length; j += 1) {
          const rest = entries[j]!
          const restPath = join(outputDir, rest.locale, `${rest.chunkId}.wav`)
          if (existsSync(restPath) && statSync(restPath).size > 0) {
            if (!manifestFiles[rest.locale].includes(rest.chunkId)) {
              manifestFiles[rest.locale].push(rest.chunkId)
            }
          }
        }
        break
      }

      if (!piperExe) {
        await ensurePiper()
        piperExe = findPiperExecutable()
        piperVoices.fr = await ensurePiperVoice('fr')
        piperVoices.en = await ensurePiperVoice('en')
      }
      if (!piperExe) throw error

      console.log(`   → fallback Piper pour ${entry.chunkId}`)
      synthesizeWithPiper(
        piperExe,
        piperVoices[entry.locale]!.onnxPath,
        entry.speechText,
        outputPath,
      )
      manifestFiles[entry.locale].push(entry.chunkId)
      generated += 1
    }
  }

  // Always include every existing wav so an early stop never shrinks the manifest.
  for (const locale of ['fr', 'en'] as const) {
    const dir = join(outputDir, locale)
    if (!existsSync(dir)) continue
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.wav')) continue
      const chunkId = file.slice(0, -4)
      if (!manifestFiles[locale].includes(chunkId)) {
        manifestFiles[locale].push(chunkId)
      }
    }
  }

  const voices = {
    fr: `gemini:${VOICES.fr}`,
    en: `gemini:${VOICES.en}`,
  }

  const manifest = {
    version: '3',
    generatedAt: new Date().toISOString(),
    format: 'wav' as const,
    provider: useGemini ? 'gemini-tts' : 'piper',
    voices: useGemini
      ? voices
      : {
          fr: piperVoices.fr?.voiceId ?? voices.fr,
          en: piperVoices.en?.voiceId ?? voices.en,
        },
    files: manifestFiles,
    gemini: {
      fr: [...geminiDone.fr].sort(),
      en: [...geminiDone.en].sort(),
    },
  }

  writeFileSync(join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  const total = manifestFiles.fr.length + manifestFiles.en.length
  const geminiTotal = geminiDone.fr.size + geminiDone.en.size
  console.log(`\n✅ Manifest : ${total} fichiers · générés=${generated} · skip Gemini=${skipped}`)
  console.log(`   Gemini OK : ${geminiTotal}/24 · reste : ${24 - geminiTotal}`)
  if (geminiFailures > 0) {
    console.log(`   ⚠️  Échecs Gemini : ${geminiFailures} — relance demain : npm run guide:audio`)
  }
  if (Number.isFinite(limit) && generated >= limit) {
    console.log('   Relance demain / plus tard : npm run guide:audio')
  }
}

main().catch((error: unknown) => {
  console.error('\n❌', error instanceof Error ? error.message : error)
  process.exit(1)
})
