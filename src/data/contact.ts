import type { ComponentType, SVGProps } from 'react'
import {
  GithubIcon,
  InstagramIcon,
  WhatsAppIcon,
} from '@/components/shared/SocialIcons'
import { profile } from '@/data/profile'

type SocialIcon = ComponentType<SVGProps<SVGSVGElement>>

export interface SocialLink {
  label: string
  href: string
  icon: SocialIcon
  handle: string
}

export const whatsapp = {
  value: '+212 641 454 572',
  href: 'https://wa.me/212641454572',
} as const

export const contactValues = {
  email: 'hji.sfn@gmail.com',
  address: 'Oujda, Maroc',
} as const

export const socialLinks: SocialLink[] = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/suuf.iaane',
    icon: InstagramIcon,
    handle: '@suuf.iaane',
  },
  {
    label: 'GitHub',
    href: profile.github,
    icon: GithubIcon,
    handle: profile.githubHandle,
  },
  {
    label: 'WhatsApp',
    href: whatsapp.href,
    icon: WhatsAppIcon,
    handle: whatsapp.value,
  },
]
