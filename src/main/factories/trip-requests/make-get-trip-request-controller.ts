import type { TripRequestRepository } from '#src/trip-requests/application/ports/trip-request-repository'
import { GetTripRequestUseCase } from '#src/trip-requests/application/use-cases/get-trip-request-use-case'
import { GetTripRequestController } from '#src/trip-requests/infra/controllers/get-trip-request-controller'

import { makeTripRequestIdParamsValidator } from './make-trip-request-id-params-validator.js'

export const makeGetTripRequestController = (tripRequestRepository: TripRequestRepository): GetTripRequestController =>
  new GetTripRequestController(new GetTripRequestUseCase(tripRequestRepository), makeTripRequestIdParamsValidator())
