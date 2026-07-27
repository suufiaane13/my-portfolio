import type { Session, User } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase'

export type AuthErrorCode = 'not_configured' | 'invalid_credentials' | 'not_admin' | 'network' | 'unknown'

export class AuthServiceError extends Error {
  code: AuthErrorCode

  constructor(message: string, code: AuthErrorCode) {
    super(message)
    this.name = 'AuthServiceError'
    this.code = code
  }
}

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false
  const role = user.app_metadata?.role
  return role === 'admin'
}

export async function signInWithPassword(email: string, password: string): Promise<Session> {
  const supabase = getSupabase()
  if (!supabase) {
    throw new AuthServiceError('Supabase is not configured', 'not_configured')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    const code = error.message.toLowerCase().includes('invalid') ? 'invalid_credentials' : 'network'
    throw new AuthServiceError(error.message, code)
  }

  if (!data.session || !isAdminUser(data.user)) {
    await supabase.auth.signOut()
    throw new AuthServiceError('not_admin', 'not_admin')
  }

  return data.session
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function requestPasswordReset(email: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) {
    throw new AuthServiceError('Supabase is not configured', 'not_configured')
  }

  const redirectTo = `${window.location.origin}/reset-password`
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })

  if (error) {
    throw new AuthServiceError(error.message, 'network')
  }
}

export async function updatePassword(newPassword: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) {
    throw new AuthServiceError('Supabase is not configured', 'not_configured')
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    throw new AuthServiceError(error.message, 'network')
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) return null

  if (!isAdminUser(data.session.user)) {
    await supabase.auth.signOut()
    return null
  }

  return data.session
}
