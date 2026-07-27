import type { ComponentType, SVGProps } from 'react'
import {
  GithubIcon,
  InstagramIcon,
  WhatsAppIcon,
} from '@/components/shared/SocialIcons'

type SocialIcon = ComponentType<SVGProps<SVGSVGElement>>

export const SOCIAL_ICON_KEYS = ['instagram', 'github', 'whatsapp'] as const
export type SocialIconKey = (typeof SOCIAL_ICON_KEYS)[number]

const iconMap: Record<string, SocialIcon> = {
  instagram: InstagramIcon,
  github: GithubIcon,
  whatsapp: WhatsAppIcon,
}

export function getSocialLinkIcon(iconKey: string): SocialIcon {
  return iconMap[iconKey] ?? GithubIcon
}
