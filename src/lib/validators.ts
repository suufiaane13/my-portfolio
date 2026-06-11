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
