import type { PrismaClient } from '@prisma/client'

import { UniqueEntityId } from '#src/shared/domain/value-objects/unique-entity-id'
import type { TripRequestRepository } from '#src/trip-requests/application/ports/trip-request-repository'
import { TripRequest } from '#src/trip-requests/domain/entities/trip-request'

type PrismaTripRequest = Awaited<ReturnType<PrismaClient['tripRequest']['findFirstOrThrow']>>

export class PrismaTripRequestRepository implements TripRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(tripRequest: TripRequest): Promise<void> {
    const data = this.toPersistence(tripRequest)

    await this.prisma.tripRequest.create({
      data,
    })
  }

  async findAll(): Promise<TripRequest[]> {
    const tripRequests = await this.prisma.tripRequest.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return tripRequests.map((tripRequest) => this.toDomain(tripRequest))
  }

  async findById(id: string): Promise<TripRequest | null> {
    const tripRequest = await this.prisma.tripRequest.findUnique({
      where: {
        id,
      },
    })

    return tripRequest === null ? null : this.toDomain(tripRequest)
  }

  async save(tripRequest: TripRequest): Promise<void> {
    const data = this.toPersistence(tripRequest)

    await this.prisma.tripRequest.update({
      where: {
        id: data.id,
      },
      data,
    })
  }

  private toDomain(tripRequest: PrismaTripRequest): TripRequest {
    return TripRequest.restore(
      {
        requesterName: tripRequest.requesterName,
        origin: tripRequest.origin,
        destination: tripRequest.destination,
        departureAt: tripRequest.departureAt,
        returnAt: tripRequest.returnAt,
        purpose: tripRequest.purpose,
        passengerCount: tripRequest.passengerCount,
        status: tripRequest.status,
        createdAt: tripRequest.createdAt,
      },
      new UniqueEntityId(tripRequest.id),
    )
  }

  private toPersistence(tripRequest: TripRequest) {
    const snapshot = tripRequest.toJSON()

    return {
      id: snapshot.id,
      requesterName: snapshot.requesterName,
      origin: snapshot.origin,
      destination: snapshot.destination,
      departureAt: snapshot.departureAt,
      returnAt: snapshot.returnAt,
      purpose: snapshot.purpose,
      passengerCount: snapshot.passengerCount,
      status: snapshot.status,
      createdAt: snapshot.createdAt,
    }
  }
}
