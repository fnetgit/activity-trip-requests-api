import { z } from 'zod'

import { ZodValidator } from '#src/main/validation/zod-validator'
import type { Validator } from '#src/shared/infra/validation/validator'

export interface ListHolidaysParams {
  year: number
}

const yearMessage = 'Year must be a positive integer'

const listHolidaysParamsSchema = z.object({
  year: z.coerce.number({ error: yearMessage }).int(yearMessage).positive(yearMessage),
})

export const makeListHolidaysParamsValidator = (): Validator<ListHolidaysParams> =>
  new ZodValidator(listHolidaysParamsSchema)
