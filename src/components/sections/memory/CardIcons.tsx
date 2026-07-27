import { useId, type ReactNode, type SVGProps } from 'react'
import type { CardId } from '@/data/memoryGame'
import { cn } from '@/lib/utils'

type IconProps = SVGProps<SVGSVGElement>

function IconShell({ className, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('memory-card-icon', className)}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

function CompassIcon(props: IconProps) {
  const gradId = useId()
  return (
    <IconShell {...props}>
      <defs>
        <linearGradient id={gradId} x1="8" y1="8" x2="24" y2="24">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#3B6FE8" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="10" stroke={`url(#${gradId})`} strokeWidth="1.5" />
      <circle cx="16" cy="16" r="1.5" fill={`url(#${gradId})`} />
      <path d="M16 8.5 18.2 18.2 16 16 13.8 18.2 16 8.5Z" fill="#F59E0B" stroke="#F59E0B" strokeWidth=".5" />
      <path d="m16 16 4-1.5M16 16l-1.5 4M16 16l-4-1.5M16 16l1.5-4" stroke={`url(#${gradId})`} strokeWidth="1.2" strokeLinecap="round" />
    </IconShell>
  )
}

function WavesIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path
        d="M4 18c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 7 0 4.5 2 7 0"
        stroke="#38BDF8"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M4 22.5c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 7 0 4.5 2 7 0"
        stroke="#3B6FE8"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity=".75"
      />
      <path
        d="M4 13.5c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 7 0 4.5 2 7 0"
        stroke="#7DD3FC"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity=".55"
      />
    </IconShell>
  )
}

function ChessIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path
        d="M16 6.5c1.8 0 3 1.1 3 2.6 0 1.1-.6 2-1.6 2.5l1 1.2h-4.8l1-1.2c-1-.5-1.6-1.4-1.6-2.5 0-1.5 1.2-2.6 3-2.6Z"
        fill="#E2E8F0"
        stroke="#94A3B8"
        strokeWidth="1"
      />
      <path d="M11.5 12.2h9v2.2c0 .8-.6 1.4-1.4 1.4h-6.2c-.8 0-1.4-.6-1.4-1.4v-2.2Z" fill="#CBD5E1" />
      <rect x="10" y="17" width="12" height="2.2" rx=".8" fill="#64748B" />
      <rect x="9" y="20" width="14" height="2.8" rx="1" fill="#475569" />
      <circle cx="16" cy="9" r=".8" fill="#3B6FE8" />
    </IconShell>
  )
}

function MountainIcon(props: IconProps) {
  const gradId = useId()
  return (
    <IconShell {...props}>
      <defs>
        <linearGradient id={gradId} x1="6" y1="24" x2="26" y2="10">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#3B6FE8" />
        </linearGradient>
      </defs>
      <path d="M4 24 13 11l5 7 3-4.5L28 24H4Z" fill={`url(#${gradId})`} opacity=".85" />
      <path d="M13 11 16 15.5 19 13 22 17" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".5" />
      <circle cx="22" cy="10" r="2.5" fill="#FDE68A" />
    </IconShell>
  )
}

function MoonIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path
        d="M18.5 7.2a8 8 0 1 0 6.3 11.8A7 7 0 0 1 18.5 7.2Z"
        fill="#BFDBFE"
        stroke="#3B6FE8"
        strokeWidth="1.2"
      />
      <circle cx="21" cy="11" r=".7" fill="#94A3B8" opacity=".6" />
      <circle cx="19" cy="15" r=".5" fill="#94A3B8" opacity=".45" />
      <circle cx="23" cy="16" r=".45" fill="#94A3B8" opacity=".4" />
      <path
        d="M8 10.5h1M7 14h1.2M8.5 17.5h1"
        stroke="#3B82F6"
        strokeWidth="1"
        strokeLinecap="round"
        opacity=".7"
      />
    </IconShell>
  )
}

function PalmIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M16 24V13" stroke="#92400E" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 15c-4-3.5-7-2.5-8 1 2.5-.5 5 .5 6.5 2.5" stroke="#22C55E" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M16 13.5c3.5-4 7-3.5 8.5.5-3-.2-5.5 1.2-6.8 3.5" stroke="#16A34A" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M16 12c-1-4.5 1-7.5 4.5-8-1.5 2.8-.8 5.5 1 7.2" stroke="#4ADE80" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M16 14c-5-1-7.5 1-8 4 2.2-1 4.5-.2 6 1.5" stroke="#15803D" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="16" cy="25" rx="5" ry="1" fill="#3B6FE8" opacity=".25" />
    </IconShell>
  )
}

function CameraIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <rect x="6" y="11" width="20" height="13" rx="2.5" fill="#334155" />
      <path d="M12 11l1.8-2.5h4.4L20 11" stroke="#64748B" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="16" cy="17.5" r="4.2" fill="#1E293B" stroke="#3B82F6" strokeWidth="1.5" />
      <circle cx="16" cy="17.5" r="2" fill="#3B6FE8" opacity=".5" />
      <circle cx="22" cy="13.5" r=".9" fill="#F59E0B" />
    </IconShell>
  )
}

function CoffeeIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M9 12h11.5c2 0 3.5 1.2 3.5 3s-1.5 3-3.5 3H11" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 12V24H20V12" stroke="#78350F" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 24h15" stroke="#A16207" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 8c0-1.5 1-2.5 2.5-2.5h5c1.2 0 2 .8 2 2" stroke="#D97706" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10 16h6" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" opacity=".6" />
    </IconShell>
  )
}

function PlaneIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path
        d="M16 7 18.5 14.5 27 16l-8.5 1.5L16 25l-2.5-7.5L5 16l8.5-1.5L16 7Z"
        fill="#3B82F6"
        stroke="#3B6FE8"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M16 14v5" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".6" />
    </IconShell>
  )
}

function BookIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path
        d="M8 8.5c0-1 .8-1.8 1.8-1.8H16v17.5H9.8A1.8 1.8 0 0 1 8 22.4V8.5Z"
        fill="#3B6FE8"
        opacity=".85"
      />
      <path
        d="M24 8.5c0-1-.8-1.8-1.8-1.8H16v17.5h6.2c1 0 1.8-.8 1.8-1.8V8.5Z"
        fill="#3B82F6"
      />
      <path d="M16 6.7v17.5" stroke="#1E40AF" strokeWidth="1.2" />
      <path d="M11 11h3M11 14.5h3M19 11h3M19 14.5h3" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".55" />
    </IconShell>
  )
}

function MusicIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path
        d="M20.5 8.5v11.2c-.8.9-2 1.5-3.3 1.5-2 0-3.7-1.4-3.7-3.2s1.7-3.2 3.7-3.2c.6 0 1.2.1 1.7.4V11.8l-6.5 1.8v9.4c-.8.9-2 1.5-3.3 1.5-2 0-3.7-1.4-3.7-3.2s1.7-3.2 3.7-3.2c1.5 0 2.8.7 3.5 1.8"
        stroke="#3B82F6"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17.2" cy="20" r="2" fill="#3B6FE8" />
      <circle cx="10.7" cy="22" r="2" fill="#60A5FA" />
    </IconShell>
  )
}

function StarIcon(props: IconProps) {
  const gradId = useId()
  return (
    <IconShell {...props}>
      <defs>
        <linearGradient id={gradId} x1="16" y1="5" x2="16" y2="27">
          <stop stopColor="#FDE68A" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <path
        d="M16 6.5 18.6 13.5 26 14l-6 5 2 7.5L16 22.8 10 26.5l2-7.5-6-5.5 7.4-.5L16 6.5Z"
        fill={`url(#${gradId})`}
        stroke="#D97706"
        strokeWidth=".8"
        strokeLinejoin="round"
      />
    </IconShell>
  )
}

function SunIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="16" cy="16" r="5" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.2" />
      <g stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round">
        <path d="M16 6.5v2.8M16 22.7v2.8M6.5 16h2.8M22.7 16h2.8" />
        <path d="m9.8 9.8 2 2M20.2 20.2l2 2M22.2 9.8l-2 2M11.8 20.2l-2 2" />
      </g>
    </IconShell>
  )
}

function AnchorIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="16" cy="9.5" r="2.2" stroke="#3B6FE8" strokeWidth="1.5" />
      <path d="M16 11.5v10" stroke="#3B82F6" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 18.5c0 3.3 2.7 5.5 6 5.5s6-2.2 6-5.5" stroke="#3B6FE8" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.5 18.5H23.5" stroke="#3B82F6" strokeWidth="1.6" strokeLinecap="round" />
    </IconShell>
  )
}

function FlowerIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="16" cy="16" r="2.2" fill="#FDE68A" />
      <ellipse cx="16" cy="10.5" rx="3" ry="4" fill="#3B82F6" opacity=".9" />
      <ellipse cx="16" cy="21.5" rx="3" ry="4" fill="#38BDF8" opacity=".85" />
      <ellipse cx="10.5" cy="16" rx="4" ry="3" fill="#3B6FE8" opacity=".9" />
      <ellipse cx="21.5" cy="16" rx="4" ry="3" fill="#60A5FA" opacity=".85" />
      <ellipse cx="11.8" cy="11.8" rx="3" ry="3.5" fill="#22C55E" opacity=".85" transform="rotate(-45 11.8 11.8)" />
      <ellipse cx="20.2" cy="20.2" rx="3" ry="3.5" fill="#14B8A6" opacity=".85" transform="rotate(-45 20.2 20.2)" />
    </IconShell>
  )
}

function GlobeIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="16" cy="16" r="9" stroke="#3B6FE8" strokeWidth="1.5" />
      <ellipse cx="16" cy="16" rx="4" ry="9" stroke="#3B82F6" strokeWidth="1.2" />
      <path d="M7 16h18M8.5 11.5h15M8.5 20.5h15" stroke="#3B82F6" strokeWidth="1.1" strokeLinecap="round" opacity=".7" />
      <path d="M16 7c2.5 2.8 4 6 4 9s-1.5 6.2-4 9" stroke="#38BDF8" strokeWidth="1.1" opacity=".55" />
    </IconShell>
  )
}

function SparklesIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M16 7 17 12.5 22.5 13.5 17 14.5 16 20 15 14.5 9.5 13.5 15 12.5 16 7Z" fill="#3B82F6" />
      <path d="M24 8.5 24.6 10.8 27 11.5 24.6 12.2 24 14.5 23.4 12.2 21 11.5 23.4 10.8 24 8.5Z" fill="#38BDF8" />
      <path d="M8.5 19.5 9.1 21.8 11.5 22.5 9.1 23.2 8.5 25.5 7.9 23.2 5.5 22.5 7.9 21.8 8.5 19.5Z" fill="#3B6FE8" />
    </IconShell>
  )
}

function DiamondIcon(props: IconProps) {
  const gradId = useId()
  return (
    <IconShell {...props}>
      <defs>
        <linearGradient id={gradId} x1="16" y1="7" x2="16" y2="25">
          <stop stopColor="#7DD3FC" />
          <stop offset="1" stopColor="#3B6FE8" />
        </linearGradient>
      </defs>
      <path
        d="M16 7 25 13 16 25 7 13 16 7Z"
        fill={`url(#${gradId})`}
        stroke="#2563EB"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M7 13h18M11 13 16 7l5 6M13.5 13h5l2.5 6H9.5l4-6Z" stroke="#fff" strokeWidth=".8" opacity=".35" />
    </IconShell>
  )
}

const cardIconMap: Record<CardId, (props: IconProps) => ReactNode> = {
  compass: CompassIcon,
  waves: WavesIcon,
  chess: ChessIcon,
  mountain: MountainIcon,
  moon: MoonIcon,
  palm: PalmIcon,
  camera: CameraIcon,
  coffee: CoffeeIcon,
  plane: PlaneIcon,
  book: BookIcon,
  music: MusicIcon,
  star: StarIcon,
  sun: SunIcon,
  anchor: AnchorIcon,
  flower: FlowerIcon,
  globe: GlobeIcon,
  sparkles: SparklesIcon,
  diamond: DiamondIcon,
}

export function CardIcon({ id, className }: { id: CardId; className?: string }) {
  const Icon = cardIconMap[id]
  return <Icon className={className} />
}
