import { DomainError } from '#src/shared/domain/errors/domain-error'
import type { CreateTripRequestInput } from '#src/trip-requests/application/dtos/create-trip-request-input'
import type { TripRequestOutput } from '#src/trip-requests/application/dtos/trip-request-output'
import { CreateTripController } from '#src/trip-requests/infra/controllers/create-trip-controller'

const makeCreateTripRequestInput = (): CreateTripRequestInput => ({
  requesterName: 'Maria Silva',
  origin: 'Parnaiba',
  destination: 'Teresina',
  departureAt: '2026-06-24T10:00:00.000Z',
  returnAt: '2026-06-24T18:00:00.000Z',
  purpose: 'Participation in an institutional meeting',
  passengerCount: 3,
})

const makeTripRequestOutput = (): TripRequestOutput => ({
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
})

class FakeCreateTripRequestUseCase {
  readonly receivedInputs: CreateTripRequestInput[] = []

  constructor(
    private readonly result: TripRequestOutput = makeTripRequestOutput(),
    private readonly error?: Error,
  ) {}

  async execute(input: CreateTripRequestInput): Promise<TripRequestOutput> {
    this.receivedInputs.push(input)

    if (this.error !== undefined) {
      throw this.error
    }

    return this.result
  }
}

describe('CreateTripController', () => {
  it('returns 201 with the created trip request', async () => {
    const output = makeTripRequestOutput()
    const useCase = new FakeCreateTripRequestUseCase(output)
    const controller = new CreateTripController(useCase)

    const response = await controller.handle({ body: makeCreateTripRequestInput() })

    expect(response).toStrictEqual({
      statusCode: 201,
      body: {
        success: true,
        data: output,
      },
    })
  })

  it('passes the request body to the use case', async () => {
    const input = makeCreateTripRequestInput()
    const useCase = new FakeCreateTripRequestUseCase()
    const controller = new CreateTripController(useCase)

    await controller.handle({ body: input })

    expect(useCase.receivedInputs).toStrictEqual([input])
  })

  it('maps validation errors to 400', async () => {
    const controller = new CreateTripController(
      new FakeCreateTripRequestUseCase(
        makeTripRequestOutput(),
        new DomainError('VALIDATION_ERROR', 'Passenger count must be greater than zero'),
      ),
    )

    await expect(controller.handle({ body: makeCreateTripRequestInput() })).resolves.toStrictEqual({
      statusCode: 400,
      body: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Passenger count must be greater than zero',
        },
      },
    })
  })

  it('maps holiday trip errors to 409', async () => {
    const controller = new CreateTripController(
      new FakeCreateTripRequestUseCase(
        makeTripRequestOutput(),
        new DomainError('HOLIDAY_TRIP_NOT_ALLOWED', 'Trip requests cannot start on a national holiday'),
      ),
    )

    await expect(controller.handle({ body: makeCreateTripRequestInput() })).resolves.toStrictEqual({
      statusCode: 409,
      body: {
        success: false,
        error: {
          code: 'HOLIDAY_TRIP_NOT_ALLOWED',
          message: 'Trip requests cannot start on a national holiday',
        },
      },
    })
  })

  it('maps holidays API errors to 502', async () => {
    const controller = new CreateTripController(
      new FakeCreateTripRequestUseCase(
        makeTripRequestOutput(),
        new DomainError('HOLIDAYS_API_UNAVAILABLE', 'Holidays API is unavailable'),
      ),
    )

    await expect(controller.handle({ body: makeCreateTripRequestInput() })).resolves.toStrictEqual({
      statusCode: 502,
      body: {
        success: false,
        error: {
          code: 'HOLIDAYS_API_UNAVAILABLE',
          message: 'Holidays API is unavailable',
        },
      },
    })
  })

  it('maps unexpected errors to 500 without exposing internal details', async () => {
    const controller = new CreateTripController(
      new FakeCreateTripRequestUseCase(makeTripRequestOutput(), new Error('Database connection failed')),
    )

    await expect(controller.handle({ body: makeCreateTripRequestInput() })).resolves.toStrictEqual({
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
