import { memo } from 'react'
import { WAVE_CREST, WAVE_PATH } from '@/lib/wavePaths'
import { cn } from '@/lib/utils'

export type WaveFill = 'background' | 'section-alt'

interface WaveDividerProps {
  fill?: WaveFill
  position?: 'top' | 'bottom'
  /** Trait de crête uniquement — pas de remplissage sous la vague */
  crestOnly?: boolean
  className?: string
}

/**
 * Séparateur SVG statique — fill thème + trait accent sur la crête.
 */
export const WaveDivider = memo(function WaveDivider({
  fill = 'background',
  position = 'bottom',
  crestOnly = false,
  className,
}: WaveDividerProps) {
  return (
    <div
      className={cn(
        'pointer-events-none relative w-full leading-[0]',
        position === 'top' && 'rotate-180',
        className,
      )}
      aria-hidden="true"
    >
      <svg
        className="block h-[clamp(2.75rem,5vw,4.25rem)] w-full"
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {!crestOnly && (
          <path
            d={WAVE_PATH}
            className={fill === 'section-alt' ? 'fill-section-alt' : 'fill-background'}
          />
        )}
        <path
          d={WAVE_CREST}
          fill="none"
          stroke="var(--wave-accent)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
})
