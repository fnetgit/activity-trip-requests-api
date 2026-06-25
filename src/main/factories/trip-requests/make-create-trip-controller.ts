import type { HolidaysGateway } from '#src/trip-requests/application/ports/holidays-gateway'
import type { TripRequestRepository } from '#src/trip-requests/application/ports/trip-request-repository'
import { CreateTripRequestUseCase } from '#src/trip-requests/application/use-cases/create-trip-request-use-case'
import { CreateTripController } from '#src/trip-requests/infra/controllers/create-trip-controller'

import { makeCreateTripRequestValidator } from './make-create-trip-request-validator.js'

export const makeCreateTripController = (
  tripRequestRepository: TripRequestRepository,
  holidaysGateway: HolidaysGateway,
): CreateTripController =>
  new CreateTripController(
    new CreateTripRequestUseCase(tripRequestRepository, holidaysGateway),
    makeCreateTripRequestValidator(),
  )
