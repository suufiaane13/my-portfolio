import { memo } from 'react'
import { cn } from '@/lib/utils'

export type WaveFill = 'background' | 'section-alt'

interface WaveDividerProps {
  fill?: WaveFill
  className?: string
}

const WAVE_PATH =
  'M0,26 C180,6 360,42 540,22 S900,2 1080,22 1260,42 1440,18 V48 H0 Z'

const WAVE_CREST =
  'M0,26 C180,6 360,42 540,22 S900,2 1080,22 1260,42 1440,18'

/**
 * Séparateur SVG statique — fill thème + trait accent sur la crête.
 */
export const WaveDivider = memo(function WaveDivider({
  fill = 'background',
  className,
}: WaveDividerProps) {
  return (
    <div
      className={cn('pointer-events-none relative w-full leading-[0]', className)}
      aria-hidden="true"
    >
      <svg
        className="block h-[clamp(2.75rem,5vw,4.25rem)] w-full"
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={WAVE_PATH}
          className={fill === 'section-alt' ? 'fill-section-alt' : 'fill-background'}
        />
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
