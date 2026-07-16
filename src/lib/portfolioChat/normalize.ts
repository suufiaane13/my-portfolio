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

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length

  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }

  return matrix[a.length][b.length]
}

export function fuzzyTokenMatch(queryToken: string, keyword: string): boolean {
  if (queryToken === keyword) return true
  if (queryToken.length < 3 || keyword.length < 3) return false
  if (keyword.startsWith(queryToken) || queryToken.startsWith(keyword)) return true
  return levenshtein(queryToken, keyword) <= 2
}
