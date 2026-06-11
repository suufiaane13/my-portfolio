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
  value: '+212 602 353 136',
  href: 'https://wa.me/212602353136',
} as const

export const contactValues = {
  email: 'hjisfn@gmail.com',
  address: 'Hay Saada Rue Khaibar N°07, Ahfir',
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
