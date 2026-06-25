import type { FastifyInstance } from 'fastify'

import type { BuildAppDependencies } from '#src/main/factories/trip-requests/build-app-dependencies'
import { makeCancelTripRequestController } from '#src/main/factories/trip-requests/make-cancel-trip-request-controller'
import { makeCreateTripController } from '#src/main/factories/trip-requests/make-create-trip-controller'
import { makeGetTripRequestController } from '#src/main/factories/trip-requests/make-get-trip-request-controller'
import { makeHolidaysGateway } from '#src/main/factories/trip-requests/make-holidays-gateway'
import { makeListHolidaysController } from '#src/main/factories/trip-requests/make-list-holidays-controller'
import { makeListTripRequestsController } from '#src/main/factories/trip-requests/make-list-trip-requests-controller'
import { makeTripRequestRepository } from '#src/main/factories/trip-requests/make-trip-request-repository'
import { adaptFastifyRoute } from '#src/shared/infra/http/fastify-controller-adapter'

export const registerTripRequestRoutes = (app: FastifyInstance, dependencies: BuildAppDependencies = {}): void => {
  const tripRequestRepository = dependencies.tripRequestRepository ?? makeTripRequestRepository()
  const holidaysGateway = dependencies.holidaysGateway ?? makeHolidaysGateway()

  app.post('/trip-requests', adaptFastifyRoute(makeCreateTripController(tripRequestRepository, holidaysGateway)))
  app.get('/trip-requests', adaptFastifyRoute(makeListTripRequestsController(tripRequestRepository)))
  app.get('/trip-requests/:id', adaptFastifyRoute(makeGetTripRequestController(tripRequestRepository)))
  app.patch('/trip-requests/:id/cancel', adaptFastifyRoute(makeCancelTripRequestController(tripRequestRepository)))
  app.get('/holidays/:year', adaptFastifyRoute(makeListHolidaysController(holidaysGateway)))
}
