/**
 * Génère les fichiers audio du guide portfolio (Piper TTS, voix masculine FR/EN).
 *
 * Usage : npm run guide:audio
 * Prérequis : Node 20+, connexion internet (1ère exécution : télécharge Piper + modèles)
 */

import { spawnSync } from 'node:child_process'
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import { fr } from '../src/i18n/locales/fr'
import { en } from '../src/i18n/locales/en'
import { buildGuideSpeechText } from '../src/lib/guideSpeechText'
import { buildStaticPortfolio } from '../src/lib/staticPortfolio'
import { buildChatKnowledge } from '../src/lib/portfolioChat/engine'
import { getGuideReplyForTopic } from '../src/lib/portfolioChat/guide'
import { chunkIdForProject, chunkIdForTopic } from '../src/lib/portfolioChat/guideTopics'
import type { Locale } from '../src/i18n/types'
import type { GuideTopicId } from '../src/lib/portfolioChat/guideTopics'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const toolsDir = join(root, 'scripts', '.tools')
const piperDir = join(toolsDir, 'piper')
const voicesDir = join(toolsDir, 'piper-voices')
const outputDir = join(root, 'public', 'audio', 'guide')

const PIPER_RELEASE = '2023.11.14-2'
const PIPER_ARCHIVE = `piper_windows_amd64.zip`
const PIPER_URL = `https://github.com/rhasspy/piper/releases/download/${PIPER_RELEASE}/${PIPER_ARCHIVE}`

const VOICE_PACKS: Record<
  Locale,
  { id: string; onnx: string; config: string }
> = {
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

async function downloadFile(url: string, destination: string, force = false) {
  if (!force && existsSync(destination) && statSync(destination).size > 0) return

  mkdirSync(dirname(destination), { recursive: true })
  const response = await fetch(url)
  if (!response.ok || !response.body) {
    throw new Error(`Download failed (${response.status}): ${url}`)
  }

  await pipeline(response.body, createWriteStream(destination))
}

function getPiperExecutable(): string {
  const candidates = [
    join(piperDir, 'piper.exe'),
    join(piperDir, 'piper', 'piper.exe'),
    join(toolsDir, 'piper.exe'),
  ]

  const found = candidates.find((path) => existsSync(path))
  if (!found) {
    throw new Error('Piper executable not found after install')
  }
  return found
}

async function ensurePiper() {
  const piperExe = join(piperDir, 'piper.exe')
  if (existsSync(piperExe)) return

  mkdirSync(toolsDir, { recursive: true })
  const zipPath = join(toolsDir, PIPER_ARCHIVE)

  console.log('⬇️  Téléchargement Piper TTS…')
  await downloadFile(PIPER_URL, zipPath)

  console.log('📦 Extraction Piper…')
  mkdirSync(piperDir, { recursive: true })
  const extract = spawnSync('tar', ['-xf', zipPath, '-C', piperDir], { stdio: 'inherit' })
  if (extract.status !== 0) {
    throw new Error('Échec extraction Piper (tar). Extrayez manuellement le zip dans scripts/.tools/piper/')
  }
}

async function ensureVoice(locale: Locale) {
  const pack = VOICE_PACKS[locale]
  const voiceDir = join(voicesDir, pack.id)
  const onnxPath = join(voiceDir, `${pack.id}.onnx`)
  const configPath = join(voiceDir, `${pack.id}.onnx.json`)

  if (!existsSync(onnxPath) || !existsSync(configPath)) {
    console.log(`⬇️  Téléchargement voix ${pack.id}…`)
    await downloadFile(pack.onnx, onnxPath)
    await downloadFile(pack.config, configPath)
  }

  return { onnxPath, configPath, voiceId: pack.id }
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
        speechText: buildGuideSpeechText(title, reply.text, locale),
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
        speechText: buildGuideSpeechText(project.title, text, locale),
      })
    }
  }

  return entries
}

function synthesizeWithPiper(
  piperExe: string,
  modelPath: string,
  text: string,
  outputPath: string,
) {
  const result = spawnSync(
    piperExe,
    // Slightly slower than default for clearer tech acronyms
    ['--model', modelPath, '--output_file', outputPath, '--length_scale', '0.95'],
    {
      input: text,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  )

  if (result.status !== 0 || !existsSync(outputPath)) {
    throw new Error(
      `Piper failed for ${outputPath}\n${result.stderr?.toString() ?? result.stdout?.toString()}`,
    )
  }
}

async function main() {
  const force = process.argv.includes('--force')

  console.log('🎙️  Génération audio guide portfolio\n')
  await ensurePiper()
  const piperExe = getPiperExecutable()

  const voiceModels: Record<Locale, { onnxPath: string; voiceId: string }> = {
    fr: await ensureVoice('fr'),
    en: await ensureVoice('en'),
  }

  const entries = collectGuideEntries()
  const manifestFiles: Record<Locale, string[]> = { fr: [], en: [] }

  for (const entry of entries) {
    const localeDir = join(outputDir, entry.locale)
    mkdirSync(localeDir, { recursive: true })

    const outputPath = join(localeDir, `${entry.chunkId}.wav`)
    if (!force && existsSync(outputPath) && statSync(outputPath).size > 0) {
      manifestFiles[entry.locale].push(entry.chunkId)
      continue
    }

    console.log(`🔊 ${entry.locale}/${entry.chunkId}`)
    synthesizeWithPiper(
      piperExe,
      voiceModels[entry.locale].onnxPath,
      entry.speechText,
      outputPath,
    )
    manifestFiles[entry.locale].push(entry.chunkId)
  }

  const manifest = {
    version: '1',
    generatedAt: new Date().toISOString(),
    format: 'wav' as const,
    voices: {
      fr: voiceModels.fr.voiceId,
      en: voiceModels.en.voiceId,
    },
    files: manifestFiles,
  }

  writeFileSync(join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  const total = manifestFiles.fr.length + manifestFiles.en.length
  console.log(`\n✅ ${total} fichiers audio → public/audio/guide/`)
  console.log('   Voix : fr_FR-tom-medium (FR) · en_US-ryan-medium (EN)')
}

main().catch((error: unknown) => {
  console.error('\n❌', error instanceof Error ? error.message : error)
  process.exit(1)
})
