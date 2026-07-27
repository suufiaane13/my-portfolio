import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GuideView } from '@/hooks/usePortfolioGuide'
import type { Locale } from '@/i18n/types'
import {
  isGuideSpeechSupported,
  loadGuideAudioManifest,
  preloadGuideAudio,
  preloadGuideSpeechVoices,
  speakGuideAnswer,
  stopGuideSpeech,
} from '@/lib/guideSpeech'

interface UseGuideSpeechOptions {
  isOpen: boolean
  view: GuideView
  locale: Locale
  onFallback?: () => void
}

export function useGuideSpeech({ isOpen, view, locale, onFallback }: UseGuideSpeechOptions) {
  const supported = isGuideSpeechSupported()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [manifestLoaded, setManifestLoaded] = useState(false)
  const wasSpeakableRef = useRef(false)

  const callbacks = useMemo(
    () => ({
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onFallback,
    }),
    [onFallback],
  )

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    preloadGuideSpeechVoices()
    void loadGuideAudioManifest().then(() => {
      if (!cancelled) setManifestLoaded(true)
    })

    return () => {
      cancelled = true
    }
  }, [isOpen])

  // Reset manifest gate when the panel closes (render-time, avoids sync setState-in-effect).
  const [openGate, setOpenGate] = useState(isOpen)
  if (openGate !== isOpen) {
    setOpenGate(isOpen)
    if (!isOpen) setManifestLoaded(false)
  }

  const stopSpeech = useCallback(() => {
    stopGuideSpeech()
    setIsSpeaking(false)
  }, [])

  const speakAnswer = useCallback(
    (chunkId: string, title: string, text: string) => {
      if (!supported || !text) return
      void speakGuideAnswer(chunkId, title, text, locale, callbacks)
    },
    [callbacks, locale, supported],
  )

  const preloadAnswer = useCallback(
    (chunkId: string) => {
      if (!chunkId) return
      preloadGuideAudio(locale, chunkId)
    },
    [locale],
  )

  const toggleSpeech = useCallback(
    (chunkId: string, title: string, text: string) => {
      if (isSpeaking) {
        stopSpeech()
        return
      }
      speakAnswer(chunkId, title, text)
    },
    [isSpeaking, speakAnswer, stopSpeech],
  )

  const shouldSpeak = isOpen && view === 'answer'
  if (wasSpeakableRef.current && !shouldSpeak) {
    stopGuideSpeech()
    if (isSpeaking) setIsSpeaking(false)
  }
  wasSpeakableRef.current = shouldSpeak

  useEffect(() => () => stopGuideSpeech(), [])

  return {
    supported,
    isSpeaking,
    manifestLoaded,
    speakAnswer,
    preloadAnswer,
    toggleSpeech,
    stopSpeech,
  }
}
