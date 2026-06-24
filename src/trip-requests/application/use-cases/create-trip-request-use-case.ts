import { DomainError } from '../../../shared/domain/errors/domain-error.js'
import { TripRequest } from '../../domain/entities/trip-request.js'
import type { CreateTripRequestInput } from '../dtos/create-trip-request-input.js'
import type { TripRequestOutput } from '../dtos/trip-request-output.js'
import type { HolidaysGateway } from '../ports/holidays-gateway.js'
import type { TripRequestRepository } from '../ports/trip-request-repository.js'

export class CreateTripRequestUseCase {
  constructor(
    private readonly tripRequestRepository: TripRequestRepository,
    private readonly holidaysGateway: HolidaysGateway,
  ) {}

  async execute(input: CreateTripRequestInput): Promise<TripRequestOutput> {
    const tripRequest = TripRequest.create(input)
    const holidays = await this.holidaysGateway.findByYear(this.getDepartureYear(tripRequest))
    const isHolidayTrip = holidays.some((holiday) => holiday.date === tripRequest.departureCivilDate)

    if (isHolidayTrip) {
      throw new DomainError('HOLIDAY_TRIP_NOT_ALLOWED', 'Trip requests cannot start on a national holiday')
    }

    await this.tripRequestRepository.create(tripRequest)

    return tripRequest.toJSON()
  }

  private getDepartureYear(tripRequest: TripRequest): number {
    return Number(tripRequest.departureCivilDate.slice(0, 4))
  }
}
