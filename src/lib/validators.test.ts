import { describe, expect, it } from 'vitest'
import type { User } from '@supabase/supabase-js'
import { fr } from '@/i18n/locales/fr'
import {
  getContactSchema,
  getForgotPasswordSchema,
  getLoginSchema,
  getResetPasswordSchema,
} from '@/lib/validators'
import { isAdminUser } from '@/services/auth'

describe('validators', () => {
  const contact = getContactSchema(fr)
  const login = getLoginSchema(fr)
  const forgot = getForgotPasswordSchema(fr)
  const reset = getResetPasswordSchema(fr)

  it('accepts a valid contact payload', () => {
    const result = contact.safeParse({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'Bonjour, je souhaite discuter d’un projet.',
      website: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects honeypot website field when filled', () => {
    const result = contact.safeParse({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'Bonjour, je souhaite discuter d’un projet.',
      website: 'https://spam.example',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short contact messages', () => {
    const result = contact.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      message: 'Hi',
    })
    expect(result.success).toBe(false)
  })

  it('validates login credentials shape', () => {
    expect(login.safeParse({ email: 'admin@example.com', password: 'secret1' }).success).toBe(true)
    expect(login.safeParse({ email: 'bad', password: '123' }).success).toBe(false)
  })

  it('validates forgot-password email', () => {
    expect(forgot.safeParse({ email: 'admin@example.com' }).success).toBe(true)
    expect(forgot.safeParse({ email: 'not-an-email' }).success).toBe(false)
  })

  it('requires matching reset passwords', () => {
    expect(
      reset.safeParse({ password: 'secret1', confirmPassword: 'secret1' }).success,
    ).toBe(true)
    expect(
      reset.safeParse({ password: 'secret1', confirmPassword: 'other12' }).success,
    ).toBe(false)
  })
})

describe('isAdminUser', () => {
  it('returns false for missing users', () => {
    expect(isAdminUser(null)).toBe(false)
    expect(isAdminUser(undefined)).toBe(false)
  })

  it('returns true only when app_metadata.role is admin', () => {
    const admin = { app_metadata: { role: 'admin' } } as unknown as User
    const user = { app_metadata: { role: 'user' } } as unknown as User
    expect(isAdminUser(admin)).toBe(true)
    expect(isAdminUser(user)).toBe(false)
  })
})
