import { UniqueEntityId } from '#src/shared/domain/value-objects/unique-entity-id'
import { TripRequest } from '#src/trip-requests/domain/entities/trip-request'
import { InMemoryTripRequestRepository } from '#src/trip-requests/infra/repositories/in-memory-trip-request-repository'

const makeTripRequest = (id: string): TripRequest =>
  TripRequest.create(
    {
      requesterName: 'Maria Silva',
      origin: 'Parnaiba',
      destination: 'Teresina',
      departureAt: '2026-06-24T10:00:00.000Z',
      returnAt: '2026-06-24T18:00:00.000Z',
      purpose: 'Participation in an institutional meeting',
      passengerCount: 3,
      createdAt: '2026-06-20T14:30:00.000Z',
    },
    new UniqueEntityId(id),
  )

describe('InMemoryTripRequestRepository', () => {
  it('creates and finds a trip request by id', async () => {
    const repository = new InMemoryTripRequestRepository()
    const tripRequest = makeTripRequest('trip-1')

    await repository.create(tripRequest)

    await expect(repository.findById('trip-1')).resolves.toBe(tripRequest)
  })

  it('returns null when the trip request does not exist', async () => {
    const repository = new InMemoryTripRequestRepository()

    await expect(repository.findById('missing-id')).resolves.toBeNull()
  })

  it('lists all created trip requests in insertion order', async () => {
    const repository = new InMemoryTripRequestRepository()
    const firstTripRequest = makeTripRequest('trip-1')
    const secondTripRequest = makeTripRequest('trip-2')

    await repository.create(firstTripRequest)
    await repository.create(secondTripRequest)

    await expect(repository.findAll()).resolves.toStrictEqual([firstTripRequest, secondTripRequest])
  })

  it('saves an existing trip request state', async () => {
    const repository = new InMemoryTripRequestRepository()
    const tripRequest = makeTripRequest('trip-1')

    await repository.create(tripRequest)
    tripRequest.cancel()
    await repository.save(tripRequest)

    const savedTripRequest = await repository.findById('trip-1')

    expect(savedTripRequest?.status).toBe('canceled')
  })
})
