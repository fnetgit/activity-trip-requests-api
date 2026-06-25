import type { TripRequestRepository } from '#src/trip-requests/application/ports/trip-request-repository'
import { CancelTripRequestUseCase } from '#src/trip-requests/application/use-cases/cancel-trip-request-use-case'
import { CancelTripRequestController } from '#src/trip-requests/infra/controllers/cancel-trip-request-controller'

import { makeTripRequestIdParamsValidator } from './make-trip-request-id-params-validator.js'

export const makeCancelTripRequestController = (
  tripRequestRepository: TripRequestRepository,
): CancelTripRequestController =>
  new CancelTripRequestController(
    new CancelTripRequestUseCase(tripRequestRepository),
    makeTripRequestIdParamsValidator(),
  )
