import type { Locale } from '@/i18n/types'

/**
 * Locale-aware pronunciation map for tech terms, brands, and awkward acronyms.
 * Longer / more specific keys first (matched as whole words, case-insensitive).
 * Values are phonetic spellings tuned for Piper + Web Speech (not display text).
 */
const TECH_PRONUNCIATION: Record<Locale, Array<[string, string]>> = {
  en: [
    // Multi-word / versioned stacks
    ['Jetpack Compose', 'Jet pack Compose'],
    ['React Native', 'React Native'],
    ['Tailwind CSS v4', 'Tailwind C S S version 4'],
    ['Tailwind CSS', 'Tailwind C S S'],
    ['Tailwind', 'Tailwind'],
    ['Express.js', 'Express J S'],
    ['ExpressJS', 'Express J S'],
    ['Node.js', 'Node J S'],
    ['NodeJS', 'Node J S'],
    ['Next.js', 'Next J S'],
    ['Vue.js', 'View J S'],
    ['Kotlin/Compose', 'Kotlin Compose'],
    ['Git/GitHub', 'Git and Git Hub'],
    ['CI/CD', 'C I C D'],
    ['UI/UX', 'U I U X'],
    ['API REST', 'REST A P I'],
    ['REST API', 'REST A P I'],
    ['GraphQL', 'Graph Q L'],
    ['PostgreSQL', 'Postgres Q L'],
    ['TypeScript', 'Type Script'],
    ['JavaScript', 'Java Script'],
    ['MongoDB', 'Mongo D B'],
    ['FastAPI', 'Fast A P I'],
    ['NoSQL', 'No S Q L'],
    ['MySQL', 'My sequel'],
    ['HTML5', 'H T M L 5'],
    ['HTML', 'H T M L'],
    ['CSS3', 'C S S 3'],
    ['CSS', 'C S S'],
    ['JWT', 'J W T'],
    ['OAuth', 'Oh auth'],
    ['OpenAPI', 'Open A P I'],
    ['Full-Stack', 'full stack'],
    ['full-stack', 'full stack'],
    ['Full Stack', 'full stack'],
    ['fullstack', 'full stack'],
    ['Front-end', 'front end'],
    ['Back-end', 'back end'],
    ['Frontend', 'front end'],
    ['Backend', 'back end'],
    ['mobile-first', 'mobile first'],
    ['open-source', 'open source'],
    ['open source', 'open source'],
    ['e-commerce', 'e commerce'],
    ['e-learning', 'e learning'],
    ['AI-generated', 'A I generated'],
    // Platforms & brands
    ['Supabase', 'Super base'],
    ['GitHub', 'Git Hub'],
    ['LinkedIn', 'Linkt in'],
    ['Instagram', 'Instagram'],
    ['WhatsApp', 'Whats App'],
    ['Netlify', 'Net li fy'],
    ['Vercel', 'Ver sell'],
    ['Android', 'Android'],
    ['Bootstrap', 'Boot strap'],
    ['Laravel', 'Lara vel'],
    ['Docker', 'Docker'],
    ['Kotlin', 'Caught lin'],
    ['Python', 'Pie thon'],
    ['Oracle', 'Oracle'],
    ['Figma', 'Fig ma'],
    ['Canva', 'Can va'],
    ['Tauri', 'Tow ree'],
    ['Vite', 'Veet'],
    ['React', 'React'],
    ['Rust', 'Rust'],
    ['Blade', 'Blade'],
    ['Nginx', 'Engine X'],
    ['Redis', 'Red iss'],
    ['AWS', 'A W S'],
    ['SaaS', 'sass'],
    ['DevOps', 'Dev ops'],
    ['Scrum', 'Scrum'],
    ['Agile', 'Agile'],
    // Roles & soft product terms
    ['freelance', 'free lance'],
    ['Freelance', 'free lance'],
    ['freelancer', 'free lancer'],
    ['hireable', 'hireable'],
    ['Remote', 'remote'],
    ['Responsive', 'responsive'],
    ['Storage', 'storage'],
    ['Auth', 'auth'],
    // Acronyms (short — after longer phrases)
    ['PWA', 'P W A'],
    ['SQL', 'S Q L'],
    ['API', 'A P I'],
    ['PHP', 'P H P'],
    ['SDK', 'S D K'],
    ['CLI', 'C L I'],
    ['IDE', 'I D E'],
    ['UX', 'U X'],
    ['UI', 'U I'],
    ['QR', 'Q R'],
    ['IT', 'I T'],
    ['AI', 'A I'],
    ['CV', 'C V'],
    ['Git', 'Git'],
    ['npm', 'N P M'],
    ['JSON', 'Jason'],
    ['XML', 'X M L'],
    ['YAML', 'Yam el'],
    ['HTTPS', 'H T T P S'],
    ['HTTP', 'H T T P'],
    ['URL', 'U R L'],
    ['SEO', 'S E O'],
    ['CMS', 'C M S'],
  ],
  fr: [
    // Multi-word / versioned stacks
    ['Jetpack Compose', 'Djet pack Compose'],
    ['React Native', 'React Native'],
    ['Tailwind CSS v4', 'Tail wind C S S version 4'],
    ['Tailwind CSS', 'Tail wind C S S'],
    ['Tailwind', 'Tail wind'],
    ['Express.js', 'Express J S'],
    ['ExpressJS', 'Express J S'],
    ['Node.js', 'Node J S'],
    ['NodeJS', 'Node J S'],
    ['Next.js', 'Next J S'],
    ['Vue.js', 'Vue J S'],
    ['Kotlin/Compose', 'Kotlin Compose'],
    ['Git/GitHub', 'guit et guit heub'],
    ['CI/CD', 'C I C D'],
    ['UI/UX', 'U I U X'],
    ['API REST', 'A P I REST'],
    ['REST API', 'REST A P I'],
    ['GraphQL', 'Graph Q L'],
    ['PostgreSQL', 'Postgres Q L'],
    ['TypeScript', 'Type Script'],
    ['JavaScript', 'Java Script'],
    ['MongoDB', 'Mongo D B'],
    ['FastAPI', 'Fast A P I'],
    ['NoSQL', 'No S Q L'],
    ['MySQL', 'Maï S Q L'],
    ['HTML5', 'H T M L 5'],
    ['HTML', 'H T M L'],
    ['CSS3', 'C S S 3'],
    ['CSS', 'C S S'],
    ['JWT', 'J W T'],
    ['OAuth', 'O auth'],
    ['OpenAPI', 'Open A P I'],
    ['Full-Stack', 'full stack'],
    ['full-stack', 'full stack'],
    ['Full Stack', 'full stack'],
    ['fullstack', 'full stack'],
    ['Front-end', 'front end'],
    ['Back-end', 'back end'],
    ['Frontend', 'front end'],
    ['Backend', 'back end'],
    ['mobile-first', 'mobile first'],
    ['open-source', 'open source'],
    ['open source', 'open source'],
    ['e-commerce', 'e commerce'],
    ['e-learning', 'e learning'],
    ['générées par IA', 'générées par I A'],
    ['AI-generated', 'générées par I A'],
    // Platforms & brands
    ['Supabase', 'Sou per beïss'],
    ['GitHub', 'guit heub'],
    ['LinkedIn', 'Linke dine'],
    ['Instagram', 'Insta grame'],
    ['WhatsApp', 'Ouats app'],
    ['Netlify', 'Net li faï'],
    ['Vercel', 'Ver cell'],
    ['Android', 'An droïde'],
    ['Bootstrap', 'Boot strap'],
    ['Laravel', 'Lara vèl'],
    ['Docker', 'Do keur'],
    ['Kotlin', 'Cot line'],
    ['Python', 'Paï thone'],
    ['Oracle', 'Ora keul'],
    ['Figma', 'Fig ma'],
    ['Canva', 'Can va'],
    ['Tauri', 'Taou ri'],
    ['Vite', 'Veet'],
    ['React', 'Ri acte'],
    ['Rust', 'Rust'],
    ['Blade', 'Blade'],
    ['Nginx', 'Engine X'],
    ['Redis', 'Ré diss'],
    ['AWS', 'A W S'],
    ['SaaS', 'sass'],
    ['DevOps', 'Dev ops'],
    ['Scrum', 'Scrum'],
    ['Agile', 'A djaïl'],
    // Roles & soft product terms
    ['freelance', 'free lance'],
    ['Freelance', 'free lance'],
    ['freelancer', 'free lan seur'],
    ['hireable', 'disponible'],
    ['Remote', 'à distance'],
    ['Responsive', 'resse ponsive'],
    ['Storage', 'stockage'],
    ['Auth', 'authentification'],
    ['Présent', 'présent'],
    ['Present', 'présent'],
    // Acronyms (short — after longer phrases)
    ['PWA', 'P W A'],
    ['SQL', 'S Q L'],
    ['API', 'A P I'],
    ['PHP', 'P H P'],
    ['SDK', 'S D K'],
    ['CLI', 'C L I'],
    ['IDE', 'I D E'],
    ['UX', 'U X'],
    ['UI', 'U I'],
    ['QR', 'Q R'],
    ['IT', 'I T'],
    ['IA', 'I A'],
    ['AI', 'I A'],
    ['CV', 'C V'],
    ['Git', 'guit'],
    ['npm', 'N P M'],
    ['JSON', 'Jason'],
    ['XML', 'X M L'],
    ['YAML', 'Yam el'],
    ['HTTPS', 'H T T P S'],
    ['HTTP', 'H T T P'],
    ['URL', 'U R L'],
    ['SEO', 'S E O'],
    ['CMS', 'C M S'],
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
    // Em / en dashes → pause-friendly separators
    .replace(/[—–―]/g, ', ')
    // Middle dots / bullets between tags
    .replace(/[·•]/g, ', ')
    .replace(/\s*\/\s*/g, ', ')
    .replace(/&/g, ` ${andWord} `)
    .replace(/N°\s*/gi, numberWord)
    .replace(/°/g, ' ')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    // Collapse "word. . word" and trailing punctuation noise
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
    .replace(/\btop[-\s]?(\d+)\b/gi, locale === 'fr' ? 'top $1' : 'top $1')
    .replace(/\bv(\d+)\b/gi, locale === 'fr' ? 'version $1' : 'version $1')
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

function expandPhone(text: string, locale: Locale): string {
  // +212 602 353 136 → grouped digits for clearer TTS
  return text.replace(/\+?\d[\d\s.-]{7,}\d/g, (raw) => {
    const digits = raw.replace(/\D/g, '')
    if (digits.length < 8) return raw
    const groups = digits.match(/.{1,3}/g)?.join(' ') ?? digits
    if (locale === 'fr' && digits.startsWith('212')) {
      return `plus ${groups}`
    }
    if (locale === 'en' && digits.startsWith('212')) {
      return `plus ${groups}`
    }
    return groups
  })
}

function applyTechPronunciation(text: string, locale: Locale): string {
  let result = text
  for (const [term, spoken] of TECH_PRONUNCIATION[locale]) {
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

function finalizeSentenceFlow(text: string): string {
  return text
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*\.\s*/g, '. ')
    .replace(/\.\s*,/g, '.')
    .replace(/,\s*\./g, '.')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.!?])/g, '$1')
    .replace(/([.!?])([A-Za-zÀ-ÿ])/g, '$1 $2')
    .trim()
}

/** Drop English "hireable" tag — redundant after availability phrasing. */
function scrubHireableNoise(text: string): string {
  return text.replace(/\s*[,—–-]\s*hireable\b/gi, '')
}

/** Plus between words (Kotlin + Jetpack), not phone (+212) or counts (30+). */
function expandPlusSigns(text: string, locale: Locale): string {
  const andWord = locale === 'fr' ? 'et' : 'and'
  return text.replace(/(?<=\D)\s*\+\s*(?=\D)/g, ` ${andWord} `)
}

/** Full speech cleanup for guide TTS (Piper + Web Speech). */
export function prepareGuideSpeechText(raw: string, locale: Locale): string {
  let text = stripMarkdownForSpeech(raw)
  // Tech terms before slash/dash splits so "UI/UX" and "Git/GitHub" stay intact
  text = applyTechPronunciation(text, locale)
  text = normalizeWhitespaceAndPunctuation(text, locale)
  text = expandCounts(text, locale)
  text = expandEmail(text, locale)
  text = expandPhone(text, locale)
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

  // Avoid "About. About. …" when body still starts with the topic label after cleanup
  if (cleanBody.toLowerCase().startsWith(cleanTitle.toLowerCase())) {
    return cleanBody
  }

  return `${cleanTitle}. ${cleanBody}`
}
