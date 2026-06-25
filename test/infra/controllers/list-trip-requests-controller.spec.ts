import type { TripRequestOutput } from '#src/trip-requests/application/dtos/trip-request-output'
import { ListTripRequestsController } from '#src/trip-requests/infra/controllers/list-trip-requests-controller'

import { makeTripRequestOutput } from './controller-test-helpers.js'

class FakeListTripRequestsUseCase {
  constructor(
    private readonly result: TripRequestOutput[] = [makeTripRequestOutput()],
    private readonly error?: Error,
  ) {}

  async execute(): Promise<TripRequestOutput[]> {
    if (this.error !== undefined) {
      throw this.error
    }

    return this.result
  }
}

describe('ListTripRequestsController', () => {
  it('returns 200 with serialized trip requests', async () => {
    const output = [makeTripRequestOutput({ id: '1' }), makeTripRequestOutput({ id: '2' })]
    const controller = new ListTripRequestsController(new FakeListTripRequestsUseCase(output))

    await expect(controller.handle({ body: undefined })).resolves.toStrictEqual({
      statusCode: 200,
      body: {
        success: true,
        data: output,
      },
    })
  })

  it('maps unexpected errors to 500 without exposing internal details', async () => {
    const controller = new ListTripRequestsController(
      new FakeListTripRequestsUseCase([], new Error('Database connection failed')),
    )

    await expect(controller.handle({ body: undefined })).resolves.toStrictEqual({
      statusCode: 500,
      body: {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
        },
      },
    })
  })
})
