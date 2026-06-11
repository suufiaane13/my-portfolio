import { useCallback, useRef } from 'react'

type SoundType = 'flip' | 'match' | 'win' | 'mismatch'

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.08,
) {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = type
  oscillator.frequency.value = frequency
  gainNode.gain.value = gain

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  const now = ctx.currentTime
  gainNode.gain.setValueAtTime(gain, now)
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

  oscillator.start(now)
  oscillator.stop(now + duration)
}

export function useGameSounds(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null)

  const getContext = useCallback(() => {
    if (typeof window === 'undefined') return null
    if (!contextRef.current) {
      contextRef.current = new AudioContext()
    }
    if (contextRef.current.state === 'suspended') {
      void contextRef.current.resume()
    }
    return contextRef.current
  }, [])

  const play = useCallback(
    (sound: SoundType) => {
      if (!enabled) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const ctx = getContext()
      if (!ctx) return

      switch (sound) {
        case 'flip':
          playTone(ctx, 420, 0.08, 'triangle', 0.05)
          break
        case 'match':
          playTone(ctx, 523, 0.1, 'sine', 0.07)
          setTimeout(() => playTone(ctx, 659, 0.12, 'sine', 0.06), 80)
          break
        case 'mismatch':
          playTone(ctx, 220, 0.15, 'sawtooth', 0.04)
          break
        case 'win':
          ;[523, 659, 784, 1047].forEach((freq, index) => {
            setTimeout(() => playTone(ctx, freq, 0.18, 'sine', 0.07), index * 120)
          })
          break
      }
    },
    [enabled, getContext],
  )

  return { play }
}
