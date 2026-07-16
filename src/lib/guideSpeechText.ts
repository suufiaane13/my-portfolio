export function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/[★•]/g, '')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildGuideSpeechText(title: string, body: string): string {
  const cleanTitle = stripMarkdownForSpeech(title)
  const cleanBody = stripMarkdownForSpeech(body)
  if (!cleanBody) return cleanTitle
  if (!cleanTitle) return cleanBody
  return `${cleanTitle}. ${cleanBody}`
}
