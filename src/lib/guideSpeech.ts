import type { Locale } from '@/i18n/types'
import {
  type GuideAudioManifest,
  guideAudioUrl,
  isGuideAudioAvailable,
} from '@/lib/portfolioChat/guideAudio'
import { resolveGuideSpeechText } from '@/lib/portfolioChat/guideSpeechScripts'

let activeUtterance: SpeechSynthesisUtterance | null = null
let activeAudio: HTMLAudioElement | null = null
let resumeTimer: ReturnType<typeof setInterval> | null = null
let manifestPromise: Promise<GuideAudioManifest | null> | null = null
let manifestCache: GuideAudioManifest | null = null

const audioCache = new Map<string, HTMLAudioElement>()

const FEMALE_HINTS =
  /female|zira|hazel|samantha|susan|karen|catherine|julie|claire|amelie|virginie|emma|linda|helen|heather|moira|fiona|veena|ayana|hortense|denise/i

const MALE_HINTS: Record<Locale, RegExp[]> = {
  fr: [/paul/i, /henri/i, /thomas/i, /nicolas/i, /sebastien/i, /denis/i, /claude/i, /male/i, /homme/i, /tom/i],
  en: [/david/i, /mark/i, /daniel/i, /james/i, /george/i, /guy/i, /ryan/i, /male/i, /richard/i, /aaron/i],
}

export function isGuideSpeechSupported(): boolean {
  return typeof window !== 'undefined' && ('Audio' in window || 'speechSynthesis' in window)
}

export function preloadGuideSpeechVoices(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.getVoices()
}

export async function loadGuideAudioManifest(): Promise<GuideAudioManifest | null> {
  if (manifestCache) return manifestCache
  if (!manifestPromise) {
    manifestPromise = fetch('/audio/guide/manifest.json')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: GuideAudioManifest | null) => {
        manifestCache = data
        return data
      })
      .catch(() => null)
  }
  return manifestPromise
}

export function preloadGuideAudio(locale: Locale, chunkId: string, manifest?: GuideAudioManifest | null): void {
  if (typeof window === 'undefined') return
  if (manifest && !isGuideAudioAvailable(manifest, locale, chunkId)) return

  const url = guideAudioUrl(locale, chunkId)
  if (audioCache.has(url)) return

  const audio = new Audio(url)
  audio.preload = 'auto'
  audio.load()
  audioCache.set(url, audio)
}

function clearResumeTimer(): void {
  if (resumeTimer) {
    clearInterval(resumeTimer)
    resumeTimer = null
  }
}

function loadWebSpeechVoices(): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis
  const existing = synth.getVoices()
  if (existing.length > 0) return Promise.resolve(existing)

  return new Promise((resolve) => {
    const finish = () => {
      synth.removeEventListener('voiceschanged', finish)
      resolve(synth.getVoices())
    }
    synth.addEventListener('voiceschanged', finish)
    window.setTimeout(finish, 400)
  })
}

function pickMaleVoice(voices: SpeechSynthesisVoice[], locale: Locale): SpeechSynthesisVoice | undefined {
  const langPrefix = locale === 'fr' ? 'fr' : 'en'
  const langVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith(langPrefix))
  if (langVoices.length === 0) return undefined

  for (const pattern of MALE_HINTS[locale]) {
    const match = langVoices.find((voice) => pattern.test(voice.name) && !FEMALE_HINTS.test(voice.name))
    if (match) return match
  }

  const notFemale = langVoices.find((voice) => !FEMALE_HINTS.test(voice.name))
  return notFemale ?? langVoices[0]
}

export interface SpeakGuideOptions {
  onStart?: () => void
  onEnd?: () => void
  /** Fired when Piper WAV is unavailable and Web Speech fallback is used. */
  onFallback?: () => void
}

export function stopGuideSpeech(): void {
  if (typeof window === 'undefined') return

  clearResumeTimer()

  if (activeAudio) {
    activeAudio.pause()
    activeAudio.currentTime = 0
    activeAudio.onended = null
    activeAudio.onplay = null
    activeAudio.onerror = null
    activeAudio = null
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  activeUtterance = null
}

async function speakWithWebSpeech(
  chunkId: string,
  title: string,
  body: string,
  locale: Locale,
  options: SpeakGuideOptions,
): Promise<void> {
  if (!('speechSynthesis' in window)) return

  const text = resolveGuideSpeechText(chunkId, title, body, locale)
  if (!text) return

  const startSpeaking = (voices: SpeechSynthesisVoice[]) => {
    const voice = pickMaleVoice(voices, locale)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = locale === 'fr' ? 'fr-FR' : 'en-US'
    if (voice) utterance.voice = voice
    // Slightly slower for technical terms / acronyms clarity
    utterance.rate = locale === 'fr' ? 1.02 : 1.05
    utterance.pitch = 0.94

    const finish = () => {
      clearResumeTimer()
      if (activeUtterance === utterance) activeUtterance = null
      options.onEnd?.()
    }

    utterance.onstart = () => {
      resumeTimer = setInterval(() => {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume()
      }, 250)
      options.onStart?.()
    }
    utterance.onend = finish
    utterance.onerror = finish

    activeUtterance = utterance
    window.speechSynthesis.speak(utterance)
  }

  const cachedVoices = window.speechSynthesis.getVoices()
  if (cachedVoices.length > 0) {
    startSpeaking(cachedVoices)
    return
  }

  startSpeaking(await loadWebSpeechVoices())
}

async function speakWithPreloadedAudio(
  locale: Locale,
  chunkId: string,
  options: SpeakGuideOptions,
): Promise<boolean> {
  const url = guideAudioUrl(locale, chunkId)
  const cached = audioCache.get(url)
  const audio = cached ?? new Audio(url)

  if (!cached) {
    audio.preload = 'auto'
    audioCache.set(url, audio)
  }

  audio.currentTime = 0

  return new Promise((resolve) => {
    const cleanup = () => {
      audio.onended = null
      audio.onplay = null
      audio.onerror = null
    }

    audio.onplay = () => options.onStart?.()
    audio.onended = () => {
      cleanup()
      if (activeAudio === audio) activeAudio = null
      options.onEnd?.()
    }
    audio.onerror = () => {
      cleanup()
      audioCache.delete(url)
      if (activeAudio === audio) activeAudio = null
      resolve(false)
    }

    activeAudio = audio
    void audio
      .play()
      .then(() => resolve(true))
      .catch(() => {
        audioCache.delete(url)
        if (activeAudio === audio) activeAudio = null
        resolve(false)
      })
  })
}

export async function speakGuideAnswer(
  chunkId: string,
  title: string,
  body: string,
  locale: Locale,
  options: SpeakGuideOptions = {},
): Promise<void> {
  if (typeof window === 'undefined') return

  stopGuideSpeech()

  const played = await speakWithPreloadedAudio(locale, chunkId, options)
  if (played) return

  options.onFallback?.()
  await speakWithWebSpeech(chunkId, title, body, locale, options)
}
