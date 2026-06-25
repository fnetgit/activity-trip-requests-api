import { DomainError } from '#src/shared/domain/errors/domain-error'
import type { TripRequestOutput } from '#src/trip-requests/application/dtos/trip-request-output'
import { GetTripRequestController } from '#src/trip-requests/infra/controllers/get-trip-request-controller'

import { FailingValidator, makeTripRequestOutput, PassThroughValidator } from './controller-test-helpers.js'

class FakeGetTripRequestUseCase {
  readonly receivedIds: string[] = []

  constructor(
    private readonly result: TripRequestOutput = makeTripRequestOutput(),
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

describe('GetTripRequestController', () => {
  it('passes params id to the use case and returns 200', async () => {
    const output = makeTripRequestOutput({ id: 'trip-1' })
    const useCase = new FakeGetTripRequestUseCase(output)
    const controller = new GetTripRequestController(useCase, new PassThroughValidator())

    await expect(controller.handle({ body: undefined, params: { id: 'trip-1' } })).resolves.toStrictEqual({
      statusCode: 200,
      body: {
        success: true,
        data: output,
      },
    })
    expect(useCase.receivedIds).toStrictEqual(['trip-1'])
  })

  it('maps missing trip requests to 404', async () => {
    const controller = new GetTripRequestController(
      new FakeGetTripRequestUseCase(
        makeTripRequestOutput(),
        new DomainError('TRIP_REQUEST_NOT_FOUND', 'Trip request not found'),
      ),
      new PassThroughValidator(),
    )

    await expect(controller.handle({ body: undefined, params: { id: 'missing-id' } })).resolves.toStrictEqual({
      statusCode: 404,
      body: {
        success: false,
        error: {
          code: 'TRIP_REQUEST_NOT_FOUND',
          message: 'Trip request not found',
        },
      },
    })
  })

  it('validates id param before calling the use case', async () => {
    const useCase = new FakeGetTripRequestUseCase()
    const controller = new GetTripRequestController(useCase, new FailingValidator('id is required'))

    await expect(controller.handle({ body: undefined, params: {} })).resolves.toStrictEqual({
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
