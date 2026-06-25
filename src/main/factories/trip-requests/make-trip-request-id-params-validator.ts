import { z } from 'zod'

import { requiredTextField, ZodValidator } from '#src/main/validation/zod-validator'
import type { Validator } from '#src/shared/infra/validation/validator'

export interface TripRequestIdParams {
  id: string
}

const tripRequestIdParamsSchema = z.object({
  id: requiredTextField('id'),
})

export const makeTripRequestIdParamsValidator = (): Validator<TripRequestIdParams> =>
  new ZodValidator(tripRequestIdParamsSchema)
