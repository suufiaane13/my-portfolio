import type { HTMLAttributes } from 'react'

export interface DotFieldProps extends HTMLAttributes<HTMLDivElement> {
  dotRadius?: number
  dotSpacing?: number
  cursorRadius?: number
  cursorForce?: number
  bulgeOnly?: boolean
  bulgeStrength?: number
  glowRadius?: number
  sparkle?: boolean
  waveAmplitude?: number
  gradientFrom?: string
  gradientTo?: string
  glowColor?: string
  /** Masque CSS en bas — idéal avec WaveDivider au hero */
  fadeBottom?: boolean
}

declare const DotField: (props: DotFieldProps) => JSX.Element
export default DotField
