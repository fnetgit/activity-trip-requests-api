import type { TripRequestRepository } from '#src/trip-requests/application/ports/trip-request-repository'
import { ListTripRequestsUseCase } from '#src/trip-requests/application/use-cases/list-trip-requests-use-case'
import { ListTripRequestsController } from '#src/trip-requests/infra/controllers/list-trip-requests-controller'

export const makeListTripRequestsController = (
  tripRequestRepository: TripRequestRepository,
): ListTripRequestsController => new ListTripRequestsController(new ListTripRequestsUseCase(tripRequestRepository))
