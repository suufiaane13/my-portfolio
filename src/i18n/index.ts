import { en } from '@/i18n/locales/en'
import { fr } from '@/i18n/locales/fr'
import type { Locale, Translations } from '@/i18n/types'

export type { Locale, Translations }

export const dictionaries: Record<Locale, Translations> = { fr, en }

export const defaultLocale: Locale = 'fr'

export const localeLabels: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
}
