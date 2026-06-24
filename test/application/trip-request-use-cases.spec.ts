import { DomainError } from '#src/shared/domain/errors/domain-error'
import { UniqueEntityId } from '#src/shared/domain/value-objects/unique-entity-id'
import type { Holiday, HolidaysGateway } from '#src/trip-requests/application/ports/holidays-gateway'
import type { TripRequestRepository } from '#src/trip-requests/application/ports/trip-request-repository'
import { CancelTripRequestUseCase } from '#src/trip-requests/application/use-cases/cancel-trip-request-use-case'
import { CreateTripRequestUseCase } from '#src/trip-requests/application/use-cases/create-trip-request-use-case'
import { GetTripRequestUseCase } from '#src/trip-requests/application/use-cases/get-trip-request-use-case'
import { ListTripRequestsUseCase } from '#src/trip-requests/application/use-cases/list-trip-requests-use-case'
import { TripRequest } from '#src/trip-requests/domain/entities/trip-request'

const makeTripRequestInput = () => ({
  requesterName: 'Maria Silva',
  origin: 'Parnaiba',
  destination: 'Teresina',
  departureAt: '2026-06-24T07:00:00-03:00',
  returnAt: '2026-06-24T18:00:00.000Z',
  purpose: 'Participation in an institutional meeting',
  passengerCount: 3,
})

const makeTripRequest = (id: string): TripRequest =>
  TripRequest.create(
    {
      ...makeTripRequestInput(),
      createdAt: '2026-06-20T14:30:00.000Z',
    },
    new UniqueEntityId(id),
  )

class FakeTripRequestRepository implements TripRequestRepository {
  readonly createdTripRequests: TripRequest[] = []
  readonly savedTripRequests: TripRequest[] = []
  private readonly tripRequests = new Map<string, TripRequest>()

  constructor(tripRequests: TripRequest[] = []) {
    for (const tripRequest of tripRequests) {
      this.tripRequests.set(tripRequest.id.toValue(), tripRequest)
    }
  }

  async create(tripRequest: TripRequest): Promise<void> {
    this.createdTripRequests.push(tripRequest)
    this.tripRequests.set(tripRequest.id.toValue(), tripRequest)
  }

  async findAll(): Promise<TripRequest[]> {
    return [...this.tripRequests.values()]
  }

  async findById(id: string): Promise<TripRequest | null> {
    return this.tripRequests.get(id) ?? null
  }

  async save(tripRequest: TripRequest): Promise<void> {
    this.savedTripRequests.push(tripRequest)
    this.tripRequests.set(tripRequest.id.toValue(), tripRequest)
  }
}

class FakeHolidaysGateway implements HolidaysGateway {
  readonly requestedYears: number[] = []

  constructor(private readonly holidays: Holiday[] = []) {}

  async findByYear(year: number): Promise<Holiday[]> {
    this.requestedYears.push(year)

    return this.holidays
  }
}

class FailingHolidaysGateway implements HolidaysGateway {
  async findByYear(): Promise<Holiday[]> {
    throw new DomainError('HOLIDAYS_API_UNAVAILABLE', 'Holidays API is unavailable')
  }
}

describe('CreateTripRequestUseCase', () => {
  it('creates and persists a pending trip request', async () => {
    const repository = new FakeTripRequestRepository()
    const holidaysGateway = new FakeHolidaysGateway()
    const useCase = new CreateTripRequestUseCase(repository, holidaysGateway)

    const output = await useCase.execute(makeTripRequestInput())

    expect(output.status).toBe('pending')
    expect(output.departureAt).toBe('2026-06-24T10:00:00.000Z')
    expect(repository.createdTripRequests).toHaveLength(1)
    expect(holidaysGateway.requestedYears).toStrictEqual([2026])
  })

  it('uses the UTC departure year to search holidays', async () => {
    const repository = new FakeTripRequestRepository()
    const holidaysGateway = new FakeHolidaysGateway()
    const useCase = new CreateTripRequestUseCase(repository, holidaysGateway)

    await useCase.execute({
      ...makeTripRequestInput(),
      departureAt: '2026-12-31T23:30:00-03:00',
      returnAt: '2027-01-01T04:00:00.000Z',
    })

    expect(holidaysGateway.requestedYears).toStrictEqual([2027])
  })

  it('blocks creation when departure date is a national holiday', async () => {
    const repository = new FakeTripRequestRepository()
    const holidaysGateway = new FakeHolidaysGateway([
      {
        date: '2026-06-24',
        name: 'National holiday',
        type: 'national',
      },
    ])
    const useCase = new CreateTripRequestUseCase(repository, holidaysGateway)

    await expect(useCase.execute(makeTripRequestInput())).rejects.toThrow(
      new DomainError('HOLIDAY_TRIP_NOT_ALLOWED', 'Trip requests cannot start on a national holiday'),
    )
    expect(repository.createdTripRequests).toHaveLength(0)
  })

  it('does not persist when the holidays gateway fails', async () => {
    const repository = new FakeTripRequestRepository()
    const holidaysGateway = new FailingHolidaysGateway()
    const useCase = new CreateTripRequestUseCase(repository, holidaysGateway)

    await expect(useCase.execute(makeTripRequestInput())).rejects.toThrow(
      new DomainError('HOLIDAYS_API_UNAVAILABLE', 'Holidays API is unavailable'),
    )
    expect(repository.createdTripRequests).toHaveLength(0)
  })
})

describe('ListTripRequestsUseCase', () => {
  it('lists serialized trip requests', async () => {
    const repository = new FakeTripRequestRepository([makeTripRequest('1'), makeTripRequest('2')])
    const useCase = new ListTripRequestsUseCase(repository)

    const output = await useCase.execute()

    expect(output).toHaveLength(2)
    expect(output.map((tripRequest) => tripRequest.id)).toStrictEqual(['1', '2'])
  })

  it('returns an empty list when no trip request exists', async () => {
    const repository = new FakeTripRequestRepository()
    const useCase = new ListTripRequestsUseCase(repository)

    await expect(useCase.execute()).resolves.toStrictEqual([])
  })
})

describe('GetTripRequestUseCase', () => {
  it('returns an existing trip request', async () => {
    const repository = new FakeTripRequestRepository([makeTripRequest('1')])
    const useCase = new GetTripRequestUseCase(repository)

    const output = await useCase.execute('1')

    expect(output.id).toBe('1')
    expect(output.status).toBe('pending')
  })

  it('throws when the trip request does not exist', async () => {
    const repository = new FakeTripRequestRepository()
    const useCase = new GetTripRequestUseCase(repository)

    await expect(useCase.execute('missing-id')).rejects.toThrow(
      new DomainError('TRIP_REQUEST_NOT_FOUND', 'Trip request not found'),
    )
  })
})

describe('CancelTripRequestUseCase', () => {
  it('cancels and saves an existing trip request', async () => {
    const repository = new FakeTripRequestRepository([makeTripRequest('1')])
    const useCase = new CancelTripRequestUseCase(repository)

    const output = await useCase.execute('1')

    expect(output.status).toBe('canceled')
    expect(repository.savedTripRequests).toHaveLength(1)
    expect(repository.savedTripRequests[0]?.status).toBe('canceled')
  })

  it('throws when the trip request does not exist', async () => {
    const repository = new FakeTripRequestRepository()
    const useCase = new CancelTripRequestUseCase(repository)

    await expect(useCase.execute('missing-id')).rejects.toThrow(
      new DomainError('TRIP_REQUEST_NOT_FOUND', 'Trip request not found'),
    )
  })

  it('propagates the domain error when the trip request is already canceled', async () => {
    const tripRequest = makeTripRequest('1')
    tripRequest.cancel()
    const repository = new FakeTripRequestRepository([tripRequest])
    const useCase = new CancelTripRequestUseCase(repository)

    await expect(useCase.execute('1')).rejects.toThrow(
      new DomainError('TRIP_REQUEST_ALREADY_CANCELED', 'Trip request is already canceled'),
    )
    expect(repository.savedTripRequests).toHaveLength(0)
  })
})
