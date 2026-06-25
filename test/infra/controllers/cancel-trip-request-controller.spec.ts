import { DomainError } from '#src/shared/domain/errors/domain-error'
import type { TripRequestOutput } from '#src/trip-requests/application/dtos/trip-request-output'
import { CancelTripRequestController } from '#src/trip-requests/infra/controllers/cancel-trip-request-controller'

import { FailingValidator, makeTripRequestOutput, PassThroughValidator } from './controller-test-helpers.js'

class FakeCancelTripRequestUseCase {
  readonly receivedIds: string[] = []

  constructor(
    private readonly result: TripRequestOutput = makeTripRequestOutput({ status: 'canceled' }),
    private readonly error?: Error,
  ) {}

  async execute(id: string): Promise<TripRequestOutput> {
    this.receivedIds.push(id)

    if (this.error !== undefined) {
      throw this.error
    }

    return this.result
  }
}

describe('CancelTripRequestController', () => {
  it('passes params id to the use case and returns 200 with a canceled output', async () => {
    const output = makeTripRequestOutput({ id: 'trip-1', status: 'canceled' })
    const useCase = new FakeCancelTripRequestUseCase(output)
    const controller = new CancelTripRequestController(useCase, new PassThroughValidator())

    await expect(controller.handle({ body: undefined, params: { id: 'trip-1' } })).resolves.toStrictEqual({
      statusCode: 200,
      body: {
        success: true,
        data: output,
      },
    })
    expect(useCase.receivedIds).toStrictEqual(['trip-1'])
  })

  it('maps already canceled trip requests to 409', async () => {
    const controller = new CancelTripRequestController(
      new FakeCancelTripRequestUseCase(
        makeTripRequestOutput(),
        new DomainError('TRIP_REQUEST_ALREADY_CANCELED', 'Trip request is already canceled'),
      ),
      new PassThroughValidator(),
    )

    await expect(controller.handle({ body: undefined, params: { id: 'trip-1' } })).resolves.toStrictEqual({
      statusCode: 409,
      body: {
        success: false,
        error: {
          code: 'TRIP_REQUEST_ALREADY_CANCELED',
          message: 'Trip request is already canceled',
        },
      },
    })
  })

  it('validates id param before calling the use case', async () => {
    const useCase = new FakeCancelTripRequestUseCase()
    const controller = new CancelTripRequestController(useCase, new FailingValidator('id is required'))

    await expect(controller.handle({ body: undefined, params: { id: '' } })).resolves.toStrictEqual({
      statusCode: 400,
      body: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'id is required',
        },
      },
    })
    expect(useCase.receivedIds).toStrictEqual([])
  })
})
