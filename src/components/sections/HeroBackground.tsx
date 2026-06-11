import { useEffect, useState } from 'react'
import DotField from '@/components/DotField/DotField.jsx'
import { useTheme } from '@/hooks/useTheme'

interface HeroBackgroundProps {
  className?: string
}

const dotFieldThemes = {
  light: {
    dotRadius: 3.2,
    dotSpacing: 12.5,
    gradientFrom: 'rgba(124, 92, 255, 0.48)',
    gradientTo: 'rgba(91, 140, 255, 0.28)',
    glowColor: 'rgba(124, 92, 255, 0.3)',
  },
  dark: {
    dotRadius: 3,
    dotSpacing: 13,
    gradientFrom: 'rgba(124, 92, 255, 0.5)',
    gradientTo: 'rgba(59, 111, 232, 0.32)',
    glowColor: 'rgba(124, 92, 255, 0.38)',
  },
} as const

export function HeroBackground({ className }: HeroBackgroundProps) {
  const { isDark } = useTheme()
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  if (reduceMotion) {
    return (
      <div
        className={className}
        aria-hidden="true"
        style={{
          background: isDark
            ? 'radial-gradient(circle at top, rgba(124, 92, 255, 0.25), transparent 55%), var(--background)'
            : 'radial-gradient(circle at top, rgba(124, 92, 255, 0.12), transparent 60%), var(--background)',
        }}
      />
    )
  }

  const theme = isDark ? dotFieldThemes.dark : dotFieldThemes.light

  return (
    <DotField
      className={className}
      fadeBottom
      dotRadius={theme.dotRadius}
      dotSpacing={theme.dotSpacing}
      cursorRadius={420}
      bulgeStrength={58}
      glowRadius={160}
      gradientFrom={theme.gradientFrom}
      gradientTo={theme.gradientTo}
      glowColor={theme.glowColor}
      sparkle={false}
      waveAmplitude={0}
    />
  )
}
