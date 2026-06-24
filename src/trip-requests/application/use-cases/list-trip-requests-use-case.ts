import type { TripRequestOutput } from '../dtos/trip-request-output.js'
import type { TripRequestRepository } from '../ports/trip-request-repository.js'

export class ListTripRequestsUseCase {
  constructor(private readonly tripRequestRepository: TripRequestRepository) {}

  async execute(): Promise<TripRequestOutput[]> {
    const tripRequests = await this.tripRequestRepository.findAll()

    return tripRequests.map((tripRequest) => tripRequest.toJSON())
  }
}
