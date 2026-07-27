const STOPWORDS_FR = new Set([
  'a',
  'au',
  'aux',
  'avec',
  'ce',
  'ces',
  'cette',
  'de',
  'des',
  'du',
  'dans',
  'en',
  'et',
  'est',
  'il',
  'je',
  'la',
  'le',
  'les',
  'ma',
  'mes',
  'mon',
  'ne',
  'on',
  'ou',
  'par',
  'pas',
  'pour',
  'que',
  'qui',
  'quoi',
  'sa',
  'se',
  'ses',
  'son',
  'sur',
  'ta',
  'te',
  'tes',
  'ton',
  'tu',
  'un',
  'une',
  'vos',
  'votre',
  'vous',
  'the',
  'is',
  'are',
  'what',
  'how',
  'can',
  'do',
  'does',
  'me',
  'my',
  'your',
  'you',
  'about',
  'tell',
  'show',
])

export function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '')
}

export function normalizeText(value: string): string {
  return stripAccents(value.toLowerCase().trim())
}

export function tokenize(value: string): string[] {
  return normalizeText(value)
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOPWORDS_FR.has(token))
}
