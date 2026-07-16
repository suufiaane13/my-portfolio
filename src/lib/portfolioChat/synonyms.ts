/** Maps canonical tokens to query variants (FR + EN). */
export const SYNONYM_GROUPS: readonly (readonly string[])[] = [
  ['skill', 'skills', 'competence', 'competences', 'stack', 'techno', 'technos', 'tech'],
  ['project', 'projects', 'projet', 'projets', 'realisation', 'realisations', 'portfolio'],
  ['experience', 'experiences', 'xp', 'travail', 'work', 'job', 'emploi', 'carriere', 'career'],
  ['education', 'formation', 'formations', 'diplome', 'diploma', 'study', 'studies', 'ecole'],
  ['contact', 'contacter', 'email', 'mail', 'message', 'reach', 'hire', 'recruter', 'collaborer'],
  ['freelance', 'disponible', 'available', 'availability', 'dispo', 'hireable'],
  ['about', 'bio', 'profil', 'profile', 'qui', 'who', 'presente', 'introduce'],
  ['cv', 'resume', 'curriculum'],
  ['game', 'jeu', 'memory', 'memoire', 'leaderboard', 'classement', 'score'],
  ['language', 'languages', 'langue', 'langues', 'parle', 'speak', 'spoken'],
  ['interest', 'interests', 'interet', 'interets', 'hobby', 'hobbies', 'passion'],
  ['social', 'github', 'instagram', 'whatsapp', 'reseau', 'network', 'link', 'links'],
  ['location', 'adresse', 'address', 'maroc', 'morocco', 'oujda', 'ahfir', 'where', 'ou'],
  ['hello', 'bonjour', 'salut', 'hey', 'hi', 'coucou'],
  ['thanks', 'merci', 'thank', 'thx'],
  ['react', 'frontend', 'front'],
  ['laravel', 'backend', 'back'],
  ['kotlin', 'android', 'mobile'],
  ['supabase', 'database', 'db'],
]

export function expandSynonyms(tokens: string[]): string[] {
  const expanded = new Set(tokens)

  for (const token of tokens) {
    for (const group of SYNONYM_GROUPS) {
      if (group.some((entry) => entry === token || token.includes(entry) || entry.includes(token))) {
        group.forEach((entry) => expanded.add(entry))
      }
    }
  }

  return Array.from(expanded)
}

export function detectIntentHints(query: string): string[] {
  const normalized = query.toLowerCase()
  const hints: string[] = []

  if (/^(bonjour|salut|hello|hi|hey|coucou)\b/.test(normalized)) hints.push('greeting')
  if (/\b(merci|thanks|thank you|thx)\b/.test(normalized)) hints.push('thanks')
  if (/\b(cv|resume|curriculum)\b/.test(normalized)) hints.push('cv')
  if (/\b(jeu|game|memory|memoire|classement|leaderboard)\b/.test(normalized)) hints.push('game')
  if (/\b(contact|email|whatsapp|contacter|hire|freelance|disponible)\b/.test(normalized)) {
    hints.push('contact')
  }

  return hints
}
