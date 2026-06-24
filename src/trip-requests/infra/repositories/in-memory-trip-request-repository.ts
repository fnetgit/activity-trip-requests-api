import type { TripRequestRepository } from '../../application/ports/trip-request-repository.js'
import type { TripRequest } from '../../domain/entities/trip-request.js'

export class InMemoryTripRequestRepository implements TripRequestRepository {
  private readonly tripRequests = new Map<string, TripRequest>()

  async create(tripRequest: TripRequest): Promise<void> {
    this.tripRequests.set(tripRequest.id.toValue(), tripRequest)
  }

  async findAll(): Promise<TripRequest[]> {
    return [...this.tripRequests.values()]
  }

  async findById(id: string): Promise<TripRequest | null> {
    return this.tripRequests.get(id) ?? null
  }

  async save(tripRequest: TripRequest): Promise<void> {
    this.tripRequests.set(tripRequest.id.toValue(), tripRequest)
  }
}
