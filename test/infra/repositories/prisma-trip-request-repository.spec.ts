import type { PrismaClient, TripRequest as PrismaTripRequest } from '@prisma/client'
import { mockDeep } from 'vitest-mock-extended'
import type { DeepMockProxy } from 'vitest-mock-extended'

import { UniqueEntityId } from '#src/shared/domain/value-objects/unique-entity-id'
import { TripRequest } from '#src/trip-requests/domain/entities/trip-request'
import { PrismaTripRequestRepository } from '#src/trip-requests/infra/repositories/prisma-trip-request-repository'

const makeTripRequest = (id = 'trip-1'): TripRequest =>
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

const makePrismaTripRequest = (overrides: Partial<PrismaTripRequest> = {}): PrismaTripRequest => ({
  id: 'trip-1',
  requesterName: 'Maria Silva',
  origin: 'Parnaiba',
  destination: 'Teresina',
  departureAt: new Date('2026-06-24T10:00:00.000Z'),
  returnAt: new Date('2026-06-24T18:00:00.000Z'),
  purpose: 'Participation in an institutional meeting',
  passengerCount: 3,
  status: 'pending',
  createdAt: new Date('2026-06-20T14:30:00.000Z'),
  ...overrides,
})

describe('PrismaTripRequestRepository', () => {
  let prisma: DeepMockProxy<PrismaClient>
  let repository: PrismaTripRequestRepository

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>()
    repository = new PrismaTripRequestRepository(prisma)
  })

  it('creates a trip request using the Prisma delegate', async () => {
    const tripRequest = makeTripRequest()

    await repository.create(tripRequest)

    expect(prisma.tripRequest.create.mock.calls).toStrictEqual([
      [
        {
          data: {
            id: 'trip-1',
            requesterName: 'Maria Silva',
            origin: 'Parnaiba',
            destination: 'Teresina',
            departureAt: '2026-06-24T10:00:00.000Z',
            returnAt: '2026-06-24T18:00:00.000Z',
            purpose: 'Participation in an institutional meeting',
            passengerCount: 3,
            status: 'pending',
            createdAt: '2026-06-20T14:30:00.000Z',
          },
        },
      ],
    ])
  })

  it('lists trip requests ordered by most recent creation date', async () => {
    prisma.tripRequest.findMany.mockResolvedValue([
      makePrismaTripRequest({ id: 'trip-2', status: 'canceled' }),
      makePrismaTripRequest({ id: 'trip-1' }),
    ])

    const tripRequests = await repository.findAll()

    expect(prisma.tripRequest.findMany.mock.calls).toStrictEqual([
      [
        {
          orderBy: {
            createdAt: 'desc',
          },
        },
      ],
    ])
    expect(tripRequests.map((tripRequest) => tripRequest.toJSON())).toStrictEqual([
      {
        id: 'trip-2',
        requesterName: 'Maria Silva',
        origin: 'Parnaiba',
        destination: 'Teresina',
        departureAt: '2026-06-24T10:00:00.000Z',
        returnAt: '2026-06-24T18:00:00.000Z',
        purpose: 'Participation in an institutional meeting',
        passengerCount: 3,
        status: 'canceled',
        createdAt: '2026-06-20T14:30:00.000Z',
      },
      {
        id: 'trip-1',
        requesterName: 'Maria Silva',
        origin: 'Parnaiba',
        destination: 'Teresina',
        departureAt: '2026-06-24T10:00:00.000Z',
        returnAt: '2026-06-24T18:00:00.000Z',
        purpose: 'Participation in an institutional meeting',
        passengerCount: 3,
        status: 'pending',
        createdAt: '2026-06-20T14:30:00.000Z',
      },
    ])
  })

  it('finds a trip request by id', async () => {
    prisma.tripRequest.findUnique.mockResolvedValue(makePrismaTripRequest())

    const tripRequest = await repository.findById('trip-1')

    expect(prisma.tripRequest.findUnique.mock.calls).toStrictEqual([
      [
        {
          where: {
            id: 'trip-1',
          },
        },
      ],
    ])
    expect(tripRequest?.toJSON().id).toBe('trip-1')
  })

  it('returns null when the trip request does not exist', async () => {
    prisma.tripRequest.findUnique.mockResolvedValue(null)

    await expect(repository.findById('missing-id')).resolves.toBeNull()
  })

  it('saves the current trip request state', async () => {
    const tripRequest = makeTripRequest()
    tripRequest.cancel()

    await repository.save(tripRequest)

    expect(prisma.tripRequest.update.mock.calls).toStrictEqual([
      [
        {
          where: {
            id: 'trip-1',
          },
          data: {
            id: 'trip-1',
            requesterName: 'Maria Silva',
            origin: 'Parnaiba',
            destination: 'Teresina',
            departureAt: '2026-06-24T10:00:00.000Z',
            returnAt: '2026-06-24T18:00:00.000Z',
            purpose: 'Participation in an institutional meeting',
            passengerCount: 3,
            status: 'canceled',
            createdAt: '2026-06-20T14:30:00.000Z',
          },
        },
      ],
    ])
  })
})
