import { z } from 'zod'
import type { Translations } from '@/i18n/types'

export function getContactSchema(t: Translations) {
  return z.object({
    name: z.string().min(2, t.validation.nameMin).max(80, t.validation.nameMax),
    email: z.string().email(t.validation.emailInvalid),
    message: z
      .string()
      .min(10, t.validation.messageMin)
      .max(2000, t.validation.messageMax),
    website: z.string().max(0).optional(),
  })
}

export type ContactFormValues = z.infer<ReturnType<typeof getContactSchema>>

export function getLoginSchema(t: Translations) {
  return z.object({
    email: z.string().email(t.validation.emailInvalid),
    password: z.string().min(6, t.auth.passwordMin),
  })
}

export type LoginFormValues = z.infer<ReturnType<typeof getLoginSchema>>

export function getForgotPasswordSchema(t: Translations) {
  return z.object({
    email: z.string().email(t.validation.emailInvalid),
  })
}

export type ForgotPasswordFormValues = z.infer<ReturnType<typeof getForgotPasswordSchema>>

export function getResetPasswordSchema(t: Translations) {
  return z
    .object({
      password: z.string().min(6, t.auth.passwordMin),
      confirmPassword: z.string().min(6, t.auth.passwordMin),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: t.auth.passwordMismatch,
      path: ['confirmPassword'],
    })
}

export type ResetPasswordFormValues = z.infer<ReturnType<typeof getResetPasswordSchema>>
