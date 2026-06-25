import { z } from 'zod'

import { dateInputField, requiredTextField, ZodValidator } from '#src/main/validation/zod-validator'
import type { Validator } from '#src/shared/infra/validation/validator'
import type { CreateTripRequestInput } from '#src/trip-requests/application/dtos/create-trip-request-input'

const passengerCountMessage = 'Passenger count must be greater than zero'

const createTripRequestSchema = z.object(
  {
    requesterName: requiredTextField('requesterName'),
    origin: requiredTextField('origin'),
    destination: requiredTextField('destination'),
    departureAt: dateInputField('departureAt'),
    returnAt: dateInputField('returnAt'),
    purpose: requiredTextField('purpose'),
    passengerCount: z
      .number({ error: passengerCountMessage })
      .int(passengerCountMessage)
      .positive(passengerCountMessage),
  },
  { error: 'Trip request payload is required' },
)

export const makeCreateTripRequestValidator = (): Validator<CreateTripRequestInput> =>
  new ZodValidator(createTripRequestSchema)
