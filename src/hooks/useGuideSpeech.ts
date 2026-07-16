import { useCallback, useEffect, useMemo, useState } from 'react'
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
}

export function useGuideSpeech({ isOpen, view, locale }: UseGuideSpeechOptions) {
  const supported = isGuideSpeechSupported()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [manifestLoaded, setManifestLoaded] = useState(false)

  const callbacks = useMemo(
    () => ({
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    }),
    [],
  )

  useEffect(() => {
    if (!isOpen) return

    preloadGuideSpeechVoices()
    void loadGuideAudioManifest().then(() => setManifestLoaded(true))
  }, [isOpen])

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

  useEffect(() => {
    if (!isOpen || view !== 'answer') stopSpeech()
  }, [isOpen, stopSpeech, view])

  useEffect(() => () => stopSpeech(), [stopSpeech])

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
