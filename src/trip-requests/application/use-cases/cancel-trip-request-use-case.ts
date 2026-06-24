import { DomainError } from '../../../shared/domain/errors/domain-error.js'
import type { TripRequestOutput } from '../dtos/trip-request-output.js'
import type { TripRequestRepository } from '../ports/trip-request-repository.js'

export class CancelTripRequestUseCase {
  constructor(private readonly tripRequestRepository: TripRequestRepository) {}

  async execute(id: string): Promise<TripRequestOutput> {
    const tripRequest = await this.tripRequestRepository.findById(id)

    if (tripRequest === null) {
      throw new DomainError('TRIP_REQUEST_NOT_FOUND', 'Trip request not found')
    }

    tripRequest.cancel()
    await this.tripRequestRepository.save(tripRequest)

    return tripRequest.toJSON()
  }
}
