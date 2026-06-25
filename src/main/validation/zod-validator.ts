import { z } from 'zod'

import { DomainError } from '#src/shared/domain/errors/domain-error'
import type { Validator } from '#src/shared/infra/validation/validator'

export class ZodValidator<TOutput> implements Validator<TOutput> {
  constructor(private readonly schema: z.ZodType<TOutput>) {}

  validate(input: unknown): TOutput {
    const result = this.schema.safeParse(input)

    if (result.success) {
      return result.data
    }

    throw new DomainError('VALIDATION_ERROR', result.error.issues[0]?.message ?? 'Invalid request')
  }
}

export const requiredTextField = (field: string): z.ZodString =>
  z.string({ error: `${field} is required` }).refine((value) => value.trim().length > 0, {
    message: `${field} is required`,
  })

export const dateInputField = (field: string): z.ZodType<Date | string> =>
  z
    .union([z.string(), z.date()], { error: `${field} must be a valid ISO 8601 value` })
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: `${field} must be a valid ISO 8601 value`,
    })
