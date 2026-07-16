import type { Locale } from '@/i18n/types'

/**
 * Safe aliases only — no letter-by-letter dotted acronyms (H.T.M.L., C.S.S.).
 * Longer keys first. Matched as whole words, case-insensitive.
 */
const MINIMAL_SPEECH_ALIASES: Record<Locale, Array<[string, string]>> = {
  en: [
    ['Git/GitHub', 'Git and GitHub'],
    ['UI/UX', 'UI UX'],
    ['Kotlin/Compose', 'Kotlin Compose'],
    ['Laravel/Blade', 'Laravel Blade'],
    ['Oracle/FastAPI', 'Oracle FastAPI'],
    ['Full-Stack', 'full stack'],
    ['full-stack', 'full stack'],
    ['Front-end', 'Frontend'],
    ['Back-end', 'Backend'],
    ['mobile-first', 'mobile first'],
    ['open-source', 'open source'],
    ['e-commerce', 'ecommerce'],
    ['e-learning', 'elearning'],
    ['Express.js', 'Express JS'],
    ['Node.js', 'Node JS'],
    ['Tailwind CSS v4', 'Tailwind CSS version 4'],
    ['HTML5', 'HTML 5'],
    ['CSS3', 'CSS 3'],
    ['API REST', 'REST API'],
    ['REST APIs', 'REST APIs'],
    ['Supabase', 'Super base'],
  ],
  fr: [
    ['Git/GitHub', 'Git et GitHub'],
    ['UI/UX', 'UI UX'],
    ['Kotlin/Compose', 'Kotlin Compose'],
    ['Laravel/Blade', 'Laravel Blade'],
    ['Oracle/FastAPI', 'Oracle FastAPI'],
    ['Full-Stack', 'full stack'],
    ['full-stack', 'full stack'],
    ['Front-end', 'Frontend'],
    ['Back-end', 'Backend'],
    ['mobile-first', 'mobile first'],
    ['open-source', 'open source'],
    ['open source', 'open source'],
    ['e-commerce', 'ecommerce'],
    ['e-learning', 'elearning'],
    ['Express.js', 'Express JS'],
    ['Node.js', 'Node JS'],
    ['Tailwind CSS v4', 'Tailwind CSS version 4'],
    ['Tailwind CSS', 'Tailwind CSS'],
    ['HTML5', 'HTML 5'],
    ['CSS3', 'CSS 3'],
    ['API REST', 'API REST'],
    ['APIs REST', 'API REST'],
    ['Supabase', 'Soupa base'],
  ],
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Strip markdown / list markers before further speech cleanup. */
export function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/[★●▪︎]/g, '')
    .trim()
}

function normalizeWhitespaceAndPunctuation(text: string, locale: Locale): string {
  const andWord = locale === 'fr' ? 'et' : 'and'
  const numberWord = locale === 'fr' ? 'numéro ' : 'number '

  return text
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[—–―]/g, ', ')
    .replace(/[·•]/g, ', ')
    // Keep compound hyphens handled by aliases; remaining word-internal hyphens → space
    .replace(/(?<=\w)-(?=\w)/g, ' ')
    .replace(/\s*\/\s*/g, ', ')
    .replace(/&/g, ` ${andWord} `)
    .replace(/N°\s*/gi, numberWord)
    .replace(/°/g, ' ')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .replace(/\.\s*\./g, '.')
    .replace(/,\s*,/g, ',')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/([.!?])\s*\1+/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function expandCounts(text: string, locale: Locale): string {
  const plusWord = locale === 'fr' ? 'plus' : 'plus'
  return text
    .replace(/(\d+)\+/g, `$1 ${plusWord}`)
    .replace(/\btop[-\s]?(\d+)\b/gi, 'top $1')
    .replace(/\bv(\d+)\b/gi, locale === 'fr' ? 'version $1' : 'version $1')
}

/** Spoken forms for portfolio years — Piper mangles bare "2025" / "2023–2025". */
const YEAR_WORDS: Record<string, Record<Locale, string>> = {
  '2020': { fr: 'deux mille vingt', en: 'twenty twenty' },
  '2021': { fr: 'deux mille vingt et un', en: 'twenty twenty one' },
  '2022': { fr: 'deux mille vingt-deux', en: 'twenty twenty two' },
  '2023': { fr: 'deux mille vingt-trois', en: 'twenty twenty three' },
  '2024': { fr: 'deux mille vingt-quatre', en: 'twenty twenty four' },
  '2025': { fr: 'deux mille vingt-cinq', en: 'twenty twenty five' },
  '2026': { fr: 'deux mille vingt-six', en: 'twenty twenty six' },
  '2027': { fr: 'deux mille vingt-sept', en: 'twenty twenty seven' },
  '2028': { fr: 'deux mille vingt-huit', en: 'twenty twenty eight' },
  '2029': { fr: 'deux mille vingt-neuf', en: 'twenty twenty nine' },
  '2030': { fr: 'deux mille trente', en: 'twenty thirty' },
}

function speakYear(year: string, locale: Locale): string {
  return YEAR_WORDS[year]?.[locale] ?? year
}

function expandYears(text: string, locale: Locale): string {
  const joiner = locale === 'fr' ? ' à ' : ' to '

  // Ranges: 2023–2025, 2023-2025, 2023 — 2025 (before dashes are stripped)
  let result = text.replace(
    /\b(20\d{2})\s*[–—−\-]\s*(20\d{2})\b/g,
    (_m, start: string, end: string) => `${speakYear(start, locale)}${joiner}${speakYear(end, locale)}`,
  )

  // Adjacent years already space-separated in scripts: "2025 2026"
  result = result.replace(
    /\b(20\d{2})\s+(20\d{2})\b/g,
    (_m, start: string, end: string) => `${speakYear(start, locale)}${joiner}${speakYear(end, locale)}`,
  )

  // Standalone years
  result = result.replace(/\b(20\d{2})\b/g, (year) => speakYear(year, locale))

  return result
}

function expandEmail(text: string, locale: Locale): string {
  const at = locale === 'fr' ? ' arobase ' : ' at '
  const dot = locale === 'fr' ? ' point ' : ' dot '
  return text.replace(
    /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    (_match, user: string, domain: string) => {
      const spokenUser = user.replace(/[._-]/g, ' ')
      const spokenDomain = domain.replace(/\./g, dot)
      return `${spokenUser}${at}${spokenDomain}`
    },
  )
}

function expandPhone(text: string): string {
  return text.replace(/\+?\d[\d\s.-]{7,}\d/g, (raw) => {
    const digits = raw.replace(/\D/g, '')
    if (digits.length < 8) return raw
    const groups = digits.match(/.{1,3}/g)?.join(' ') ?? digits
    if (digits.startsWith('212')) {
      return `plus ${groups}`
    }
    return groups
  })
}

function applyMinimalAliases(text: string, locale: Locale): string {
  let result = text
  for (const [term, spoken] of MINIMAL_SPEECH_ALIASES[locale]) {
    const pattern = new RegExp(`(?<![\\w])${escapeRegExp(term)}(?![\\w])`, 'gi')
    result = result.replace(pattern, spoken)
  }
  return result
}

function dedupeTitlePrefix(title: string, body: string): string {
  const cleanTitle = title.trim()
  if (!cleanTitle || !body) return body
  const escaped = escapeRegExp(cleanTitle)
  return body
    .replace(new RegExp(`^${escaped}\\s*[.:,\\-—–]?\\s*`, 'i'), '')
    .replace(new RegExp(`^${escaped}\\s+`, 'i'), '')
    .trim()
}

/**
 * Normalize sentence flow without turning acronyms into "H. T. M. L.".
 * Only pad after a period that ends a real sentence (letter/digit before, space+capital after).
 */
function finalizeSentenceFlow(text: string): string {
  return text
    .replace(/\s*,\s*/g, ', ')
    .replace(/\.\s+/g, '. ')
    .replace(/([a-zà-ÿ0-9)])\.(?=[A-ZÀ-Ÿ])/g, '$1. ')
    .replace(/\.\s*,/g, '.')
    .replace(/,\s*\./g, '.')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.!?])/g, '$1')
    .replace(/([.!?])([A-Za-zÀ-ÿ])/g, '$1 $2')
    .trim()
}

/** Drop English "hireable" tag — redundant after availability phrasing. */
function scrubHireableNoise(text: string): string {
  return text
    .replace(/\s*[,—–-]\s*hireable\b/gi, '')
    .replace(/\bhireable\b/gi, '')
}

/** Plus between words (Kotlin + Jetpack), not phone (+212) or counts (30+). */
function expandPlusSigns(text: string, locale: Locale): string {
  const andWord = locale === 'fr' ? 'et' : 'and'
  return text.replace(/(?<=\D)\s*\+\s*(?=\D)/g, ` ${andWord} `)
}

/** Light speech cleanup for guide TTS (Piper + Web Speech). */
export function prepareGuideSpeechText(raw: string, locale: Locale): string {
  let text = stripMarkdownForSpeech(raw)
  // Aliases before slash/hyphen splits so compounds stay intact
  text = applyMinimalAliases(text, locale)
  // Years before dash/comma normalization (keeps 2023–2025 as a range)
  text = expandYears(text, locale)
  text = normalizeWhitespaceAndPunctuation(text, locale)
  text = expandCounts(text, locale)
  text = expandEmail(text, locale)
  text = expandPhone(text)
  text = expandPlusSigns(text, locale)
  text = scrubHireableNoise(text)
  text = finalizeSentenceFlow(text)
  return text
}

export function buildGuideSpeechText(title: string, body: string, locale: Locale = 'en'): string {
  const cleanTitle = prepareGuideSpeechText(title, locale)
  let cleanBody = prepareGuideSpeechText(body, locale)
  cleanBody = dedupeTitlePrefix(cleanTitle, cleanBody)

  if (!cleanBody) return cleanTitle
  if (!cleanTitle) return cleanBody

  if (cleanBody.toLowerCase().startsWith(cleanTitle.toLowerCase())) {
    return cleanBody
  }

  return `${cleanTitle}. ${cleanBody}`
}
