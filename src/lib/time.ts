import type { Locale } from '@/i18n/types'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const MONTHS_FR = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
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

const RELATIVE_FR: Record<string, string> = {
  now: 'à l\'instant',
  seconds: 'il y a {{n}} secondes',
  minute: 'il y a 1 minute',
  minutes: 'il y a {{n}} minutes',
  hour: 'il y a 1 heure',
  hours: 'il y a {{n}} heures',
  day: 'hier',
  days: 'il y a {{n}} jours',
}

const RELATIVE_EN: Record<string, string> = {
  now: 'just now',
  seconds: '{{n}} seconds ago',
  minute: '1 minute ago',
  minutes: '{{n}} minutes ago',
  hour: '1 hour ago',
  hours: '{{n}} hours ago',
  day: 'yesterday',
  days: '{{n}} days ago',
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Duration  MM:SS                                                   */
/* ------------------------------------------------------------------ */

/** Format seconds as `MM:SS`. Ex. `125` → `"02:05"` */
export function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/* ------------------------------------------------------------------ */
/*  Absolute dates                                                    */
/* ------------------------------------------------------------------ */

/** Ex. FR `1 janv. 2026 14:30` · EN `Jan 1, 2026 2:30 PM` */
export function formatDateTime(
  value: string | number | Date,
  locale: Locale = 'fr',
): string {
  const date = toValidDate(value)
  if (!date) return '—'

  const day = date.getDate()
  const month = (locale === 'fr' ? MONTHS_FR : MONTHS_EN)[date.getMonth()]
  const year = date.getFullYear()

  if (locale === 'fr') {
    const hours = pad2(date.getHours())
    const minutes = pad2(date.getMinutes())
    return `${day} ${month} ${year} ${hours}:${minutes}`
  }

  // EN: "Jan 1, 2026 2:30 PM"
  const hours12 = date.getHours()
  const ampm = hours12 >= 12 ? 'PM' : 'AM'
  const h12 = hours12 % 12 || 12
  const minutes = pad2(date.getMinutes())
  return `${month} ${day}, ${year} ${h12}:${minutes} ${ampm}`
}

/** Ex. FR `1 janv. 2026` · EN `Jan 1, 2026` */
export function formatDateOnly(
  value: string | number | Date,
  locale: Locale = 'fr',
): string {
  const date = toValidDate(value)
  if (!date) return '—'

  const day = date.getDate()
  const month = (locale === 'fr' ? MONTHS_FR : MONTHS_EN)[date.getMonth()]
  const year = date.getFullYear()

  return locale === 'fr' ? `${day} ${month} ${year}` : `${month} ${day}, ${year}`
}

/* ------------------------------------------------------------------ */
/*  Relative time                                                     */
/* ------------------------------------------------------------------ */

/**
 * Ex. FR `il y a 3 heures` · EN `3 hours ago`
 * Returns `null` if the date is older than 7 days (caller should use absolute format).
 */
export function formatRelativeTime(
  value: string | number | Date,
  locale: Locale = 'fr',
): string | null {
  const date = toValidDate(value)
  if (!date) return null

  const now = Date.now()
  const diffMs = now - date.getTime()

  if (diffMs < 0) return null

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const dict = locale === 'fr' ? RELATIVE_FR : RELATIVE_EN

  if (seconds < 10) return dict.now
  if (seconds < 60) return dict.seconds.replace('{{n}}', String(seconds))
  if (minutes === 1) return dict.minute
  if (minutes < 60) return dict.minutes.replace('{{n}}', String(minutes))
  if (hours === 1) return dict.hour
  if (hours < 24) return dict.hours.replace('{{n}}', String(hours))
  if (days === 1) return dict.day
  if (days < 7) return dict.days.replace('{{n}}', String(days))

  return null
}

/**
 * Smart date: relative for recent (< 7 days), absolute for older.
 * Ex. FR `il y a 3 heures` or `1 janv. 2026 14:30`
 */
export function formatSmartDate(
  value: string | number | Date,
  locale: Locale = 'fr',
): string {
  return formatRelativeTime(value, locale) ?? formatDateTime(value, locale)
}
