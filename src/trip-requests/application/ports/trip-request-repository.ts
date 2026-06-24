import type { TripRequest } from '../../domain/entities/trip-request.js'

export interface TripRequestRepository {
  create(tripRequest: TripRequest): Promise<void>
  findAll(): Promise<TripRequest[]>
  findById(id: string): Promise<TripRequest | null>
  save(tripRequest: TripRequest): Promise<void>
}
