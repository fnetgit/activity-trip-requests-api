import type { FastifyInstance } from 'fastify'

import { adaptFastifyRoute } from '#src/shared/infra/http/fastify-controller-adapter'

import type { BuildAppDependencies } from '../factories/trip-requests/build-app-dependencies.js'
import { makeCancelTripRequestController } from '../factories/trip-requests/make-cancel-trip-request-controller.js'
import { makeCreateTripController } from '../factories/trip-requests/make-create-trip-controller.js'
import { makeGetTripRequestController } from '../factories/trip-requests/make-get-trip-request-controller.js'
import { makeHolidaysGateway } from '../factories/trip-requests/make-holidays-gateway.js'
import { makeListHolidaysController } from '../factories/trip-requests/make-list-holidays-controller.js'
import { makeListTripRequestsController } from '../factories/trip-requests/make-list-trip-requests-controller.js'
import { makeTripRequestRepository } from '../factories/trip-requests/make-trip-request-repository.js'

export const registerTripRequestRoutes = (app: FastifyInstance, dependencies: BuildAppDependencies = {}): void => {
  const tripRequestRepository = dependencies.tripRequestRepository ?? makeTripRequestRepository()
  const holidaysGateway = dependencies.holidaysGateway ?? makeHolidaysGateway()

  app.post('/trip-requests', adaptFastifyRoute(makeCreateTripController(tripRequestRepository, holidaysGateway)))
  app.get('/trip-requests', adaptFastifyRoute(makeListTripRequestsController(tripRequestRepository)))
  app.get('/trip-requests/:id', adaptFastifyRoute(makeGetTripRequestController(tripRequestRepository)))
  app.patch('/trip-requests/:id/cancel', adaptFastifyRoute(makeCancelTripRequestController(tripRequestRepository)))
  app.get('/holidays/:year', adaptFastifyRoute(makeListHolidaysController(holidaysGateway)))
}
