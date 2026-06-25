import { buildApp } from '#src/main'
import type { Holiday, HolidaysGateway } from '#src/trip-requests/application/ports/holidays-gateway'
import { InMemoryTripRequestRepository } from '#src/trip-requests/infra/repositories/in-memory-trip-request-repository'

interface SuccessResponse<TData> {
  success: true
  data: TData
}

interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

interface TripRequestResponse {
  id: string
  requesterName: string
  departureAt: string
  status: string
}

interface HolidayResponse {
  date: string
  name: string
  type: string
}

const makeTripRequestBody = () => ({
  requesterName: 'Maria Silva',
  origin: 'Parnaiba',
  destination: 'Teresina',
  departureAt: '2026-06-24T07:00:00-03:00',
  returnAt: '2026-06-24T18:00:00.000Z',
  purpose: 'Participation in an institutional meeting',
  passengerCount: 3,
})

class FakeHolidaysGateway implements HolidaysGateway {
  constructor(private readonly holidays: Holiday[] = []) {}

  async findByYear(): Promise<Holiday[]> {
    return this.holidays
  }
}

describe('Fastify app', () => {
  it('creates, lists, reads and cancels trip requests through HTTP routes', async () => {
    const repository = new InMemoryTripRequestRepository()
    const app = buildApp({
      tripRequestRepository: repository,
      holidaysGateway: new FakeHolidaysGateway(),
    })

    const createResponse = await app.inject({
      method: 'POST',
      url: '/trip-requests',
      payload: makeTripRequestBody(),
    })
    const createdBody = createResponse.json<SuccessResponse<TripRequestResponse>>()
    const createdId = createdBody.data.id

    expect(createResponse.statusCode).toBe(201)
    expect(createdBody).toMatchObject({
      success: true,
      data: {
        requesterName: 'Maria Silva',
        departureAt: '2026-06-24T10:00:00.000Z',
        status: 'pending',
      },
    })

    const listResponse = await app.inject({
      method: 'GET',
      url: '/trip-requests',
    })

    expect(listResponse.statusCode).toBe(200)
    expect(listResponse.json<SuccessResponse<TripRequestResponse[]>>().data).toHaveLength(1)

    const getResponse = await app.inject({
      method: 'GET',
      url: `/trip-requests/${createdId}`,
    })

    expect(getResponse.statusCode).toBe(200)
    expect(getResponse.json<SuccessResponse<TripRequestResponse>>().data.id).toBe(createdId)

    const cancelResponse = await app.inject({
      method: 'PATCH',
      url: `/trip-requests/${createdId}/cancel`,
    })

    expect(cancelResponse.statusCode).toBe(200)
    expect(cancelResponse.json<SuccessResponse<TripRequestResponse>>().data.status).toBe('canceled')

    await app.close()
  })

  it('returns standardized errors from HTTP routes', async () => {
    const app = buildApp({
      tripRequestRepository: new InMemoryTripRequestRepository(),
      holidaysGateway: new FakeHolidaysGateway(),
    })

    const response = await app.inject({
      method: 'GET',
      url: '/trip-requests/missing-id',
    })

    expect(response.statusCode).toBe(404)
    expect(response.json<ErrorResponse>()).toStrictEqual({
      success: false,
      error: {
        code: 'TRIP_REQUEST_NOT_FOUND',
        message: 'Trip request not found',
      },
    })

    await app.close()
  })

  it.each([
    [
      'missing requesterName',
      {
        ...makeTripRequestBody(),
        requesterName: undefined,
      },
      'requesterName is required',
    ],
    [
      'invalid requesterName type',
      {
        ...makeTripRequestBody(),
        requesterName: 123,
      },
      'requesterName is required',
    ],
    [
      'missing departureAt',
      {
        ...makeTripRequestBody(),
        departureAt: undefined,
      },
      'departureAt must be a valid ISO 8601 value',
    ],
    [
      'return before departure',
      {
        ...makeTripRequestBody(),
        returnAt: '2026-06-24T09:59:59.999Z',
      },
      'Return date must be equal to or after departure date',
    ],
    [
      'invalid passenger count',
      {
        ...makeTripRequestBody(),
        passengerCount: 0,
      },
      'Passenger count must be greater than zero',
    ],
  ])('returns validation errors for invalid create payloads: %s', async (_caseName, payload, message) => {
    const app = buildApp({
      tripRequestRepository: new InMemoryTripRequestRepository(),
      holidaysGateway: new FakeHolidaysGateway(),
    })

    const response = await app.inject({
      method: 'POST',
      url: '/trip-requests',
      payload,
    })

    expect(response.statusCode).toBe(400)
    expect(response.json<ErrorResponse>()).toStrictEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
      },
    })

    await app.close()
  })

  it('returns a validation error when create payload is missing', async () => {
    const app = buildApp({
      tripRequestRepository: new InMemoryTripRequestRepository(),
      holidaysGateway: new FakeHolidaysGateway(),
    })

    const response = await app.inject({
      method: 'POST',
      url: '/trip-requests',
    })

    expect(response.statusCode).toBe(400)
    expect(response.json<ErrorResponse>()).toStrictEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Trip request payload is required',
      },
    })

    await app.close()
  })

  it('lists holidays through the configured gateway', async () => {
    const app = buildApp({
      tripRequestRepository: new InMemoryTripRequestRepository(),
      holidaysGateway: new FakeHolidaysGateway([
        {
          date: '2026-01-01',
          name: 'Confraternizacao Universal',
          type: 'national',
        },
      ]),
    })

    const response = await app.inject({
      method: 'GET',
      url: '/holidays/2026',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json<SuccessResponse<HolidayResponse[]>>()).toStrictEqual({
      success: true,
      data: [
        {
          date: '2026-01-01',
          name: 'Confraternizacao Universal',
          type: 'national',
        },
      ],
    })

    await app.close()
  })

  it('returns a standardized error for unknown routes', async () => {
    const app = buildApp({
      tripRequestRepository: new InMemoryTripRequestRepository(),
      holidaysGateway: new FakeHolidaysGateway(),
    })

    const response = await app.inject({
      method: 'GET',
      url: '/unknown',
    })

    expect(response.statusCode).toBe(404)
    expect(response.json<ErrorResponse>()).toStrictEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Route not found',
      },
    })

    await app.close()
  })
})
