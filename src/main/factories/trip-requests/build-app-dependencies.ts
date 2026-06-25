import type { HolidaysGateway } from '#src/trip-requests/application/ports/holidays-gateway'
import type { TripRequestRepository } from '#src/trip-requests/application/ports/trip-request-repository'

export interface BuildAppDependencies {
  tripRequestRepository?: TripRequestRepository
  holidaysGateway?: HolidaysGateway
}
