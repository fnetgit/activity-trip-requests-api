import { DomainError } from '#src/shared/domain/errors/domain-error'
import type { Validator } from '#src/shared/infra/validation/validator'
import type { HolidayOutput } from '#src/trip-requests/application/dtos/holiday-output'
import type { TripRequestOutput } from '#src/trip-requests/application/dtos/trip-request-output'

export const makeTripRequestOutput = (overrides: Partial<TripRequestOutput> = {}): TripRequestOutput => ({
  id: '1',
  requesterName: 'Maria Silva',
  origin: 'Parnaiba',
  destination: 'Teresina',
  departureAt: '2026-06-24T10:00:00.000Z',
  returnAt: '2026-06-24T18:00:00.000Z',
  purpose: 'Participation in an institutional meeting',
  passengerCount: 3,
  status: 'pending',
  createdAt: '2026-06-20T14:30:00.000Z',
  ...overrides,
})

export const makeHolidayOutput = (): HolidayOutput => ({
  date: '2026-01-01',
  name: 'Confraternizacao Universal',
  type: 'national',
})

export class PassThroughValidator<TOutput> implements Validator<TOutput> {
  validate(input: unknown): TOutput {
    return input as TOutput
  }
}

export class StaticValidator<TOutput> implements Validator<TOutput> {
  constructor(private readonly output: TOutput) {}

  validate(): TOutput {
    return this.output
  }
}

export class FailingValidator<TOutput> implements Validator<TOutput> {
  constructor(private readonly message: string) {}

  validate(): TOutput {
    throw new DomainError('VALIDATION_ERROR', this.message)
  }
}
