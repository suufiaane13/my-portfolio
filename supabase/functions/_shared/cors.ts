const ALLOWED_ORIGINS = [
  'https://suufiaane.netlify.app',
  'https://soufiane-hajji.netlify.app',
]

export function getCorsHeaders(req?: Request): Record<string, string> {
  const origin = req?.headers?.get('origin') ?? ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]

  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  }
}

export function isOriginAllowed(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true // same-origin / curl / server-to-server
  return ALLOWED_ORIGINS.includes(origin)
}

export function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
  extraHeaders: Record<string, string> = {},
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...extraHeaders, 'Content-Type': 'application/json' },
  })
}
