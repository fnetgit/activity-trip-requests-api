import { DomainError } from '#src/shared/domain/errors/domain-error'
import type { HolidayOutput } from '#src/trip-requests/application/dtos/holiday-output'
import type { TripRequestOutput } from '#src/trip-requests/application/dtos/trip-request-output'
import { CancelTripRequestController } from '#src/trip-requests/infra/controllers/cancel-trip-request-controller'
import { GetTripRequestController } from '#src/trip-requests/infra/controllers/get-trip-request-controller'
import { ListHolidaysController } from '#src/trip-requests/infra/controllers/list-holidays-controller'
import { ListTripRequestsController } from '#src/trip-requests/infra/controllers/list-trip-requests-controller'

const makeTripRequestOutput = (overrides: Partial<TripRequestOutput> = {}): TripRequestOutput => ({
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

const makeHolidayOutput = (): HolidayOutput => ({
  date: '2026-01-01',
  name: 'Confraternizacao Universal',
  type: 'national',
})

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

class FakeListHolidaysUseCase {
  readonly receivedYears: number[] = []

  constructor(
    private readonly result: HolidayOutput[] = [makeHolidayOutput()],
    private readonly error?: Error,
  ) {}

  async execute(year: number): Promise<HolidayOutput[]> {
    this.receivedYears.push(year)

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

describe('GetTripRequestController', () => {
  it('passes params id to the use case and returns 200', async () => {
    const output = makeTripRequestOutput({ id: 'trip-1' })
    const useCase = new FakeGetTripRequestUseCase(output)
    const controller = new GetTripRequestController(useCase)

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
})

describe('CancelTripRequestController', () => {
  it('passes params id to the use case and returns 200 with a canceled output', async () => {
    const output = makeTripRequestOutput({ id: 'trip-1', status: 'canceled' })
    const useCase = new FakeCancelTripRequestUseCase(output)
    const controller = new CancelTripRequestController(useCase)

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
})

describe('ListHolidaysController', () => {
  it('converts params year to number and returns 200', async () => {
    const output = [makeHolidayOutput()]
    const useCase = new FakeListHolidaysUseCase(output)
    const controller = new ListHolidaysController(useCase)

    await expect(controller.handle({ body: undefined, params: { year: '2026' } })).resolves.toStrictEqual({
      statusCode: 200,
      body: {
        success: true,
        data: output,
      },
    })
    expect(useCase.receivedYears).toStrictEqual([2026])
  })

  it('maps invalid year validation errors to 400', async () => {
    const controller = new ListHolidaysController(
      new FakeListHolidaysUseCase([], new DomainError('VALIDATION_ERROR', 'Year must be a positive integer')),
    )

    await expect(controller.handle({ body: undefined, params: { year: 'invalid' } })).resolves.toStrictEqual({
      statusCode: 400,
      body: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Year must be a positive integer',
        },
      },
    })
  })
})
