import type { Locale } from '@/i18n/types'

const MONTHS_FR = [
  'ja',
  'fé',
  'ma',
  'av',
  'mai',
  'jn',
  'jl',
  'ao',
  'se',
  'oc',
  'no',
  'dé',
] as const

const MONTHS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

function pad2(value: number) {
  return String(value).padStart(2, '0')
}

function toValidDate(value: string | number | Date): Date | null {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    const local = new Date(year!, month! - 1, day!)
    return Number.isNaN(local.getTime()) ? null : local
  }
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Ex. FR `01 ja 2026 à 14h 30min` · EN `01 Jan 2026 at 14h 30min` */
export function formatDateTime(
  value: string | number | Date,
  locale: Locale = 'fr',
): string {
  const date = toValidDate(value)
  if (!date) return '—'

  const day = pad2(date.getDate())
  const month = (locale === 'fr' ? MONTHS_FR : MONTHS_EN)[date.getMonth()]
  const year = date.getFullYear()
  const hours = pad2(date.getHours())
  const minutes = pad2(date.getMinutes())
  const connector = locale === 'fr' ? 'à' : 'at'

  return `${day} ${month} ${year} ${connector} ${hours}h ${minutes}min`
}

/** Ex. FR `01 ja 2026` · EN `01 Jan 2026` */
export function formatDateOnly(
  value: string | number | Date,
  locale: Locale = 'fr',
): string {
  const date = toValidDate(value)
  if (!date) return '—'

  const day = pad2(date.getDate())
  const month = (locale === 'fr' ? MONTHS_FR : MONTHS_EN)[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}
