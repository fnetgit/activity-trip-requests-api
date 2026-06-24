/* eslint-disable no-console */
import { fileURLToPath } from 'node:url'

import fastify, { type FastifyInstance } from 'fastify'

import { env } from '#src/config/env'
import { getPrismaClient } from '#src/shared/infra/database/prisma-client'
import { adaptFastifyRoute } from '#src/shared/infra/http/fastify-controller-adapter'
import type { HolidaysGateway } from '#src/trip-requests/application/ports/holidays-gateway'
import type { TripRequestRepository } from '#src/trip-requests/application/ports/trip-request-repository'
import { CancelTripRequestUseCase } from '#src/trip-requests/application/use-cases/cancel-trip-request-use-case'
import { CreateTripRequestUseCase } from '#src/trip-requests/application/use-cases/create-trip-request-use-case'
import { GetTripRequestUseCase } from '#src/trip-requests/application/use-cases/get-trip-request-use-case'
import { ListHolidaysUseCase } from '#src/trip-requests/application/use-cases/list-holidays-use-case'
import { ListTripRequestsUseCase } from '#src/trip-requests/application/use-cases/list-trip-requests-use-case'
import { CancelTripRequestController } from '#src/trip-requests/infra/controllers/cancel-trip-request-controller'
import { CreateTripController } from '#src/trip-requests/infra/controllers/create-trip-controller'
import { GetTripRequestController } from '#src/trip-requests/infra/controllers/get-trip-request-controller'
import { ListHolidaysController } from '#src/trip-requests/infra/controllers/list-holidays-controller'
import { ListTripRequestsController } from '#src/trip-requests/infra/controllers/list-trip-requests-controller'
import { BrasilApiHolidaysGateway } from '#src/trip-requests/infra/gateways/brasil-api-holidays-gateway'
import { PrismaTripRequestRepository } from '#src/trip-requests/infra/repositories/prisma-trip-request-repository'

export interface BuildAppDependencies {
  tripRequestRepository?: TripRequestRepository
  holidaysGateway?: HolidaysGateway
}

export const logStartupBanner = (): void => {
  console.log(`[${env.appName}] starting application`)
  console.log(`Environment: ${env.nodeEnv}`)
  console.log(`Port: ${String(env.port)}`)
}

const getStatusCodeFromError = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) {
    return undefined
  }

  const statusCode = error.statusCode

  return typeof statusCode === 'number' ? statusCode : undefined
}

export const buildApp = (dependencies: BuildAppDependencies = {}): FastifyInstance => {
  const app = fastify({
    logger: env.nodeEnv !== 'test',
  })

  app.setErrorHandler(async (error: unknown, _request, reply) => {
    if (getStatusCodeFromError(error) === 400) {
      await reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request',
        },
      })
      return
    }

    await reply.status(500).send({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      },
    })
  })

  app.setNotFoundHandler(async (_request, reply) => {
    await reply.status(404).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Route not found',
      },
    })
  })

  const tripRequestRepository = dependencies.tripRequestRepository ?? new PrismaTripRequestRepository(getPrismaClient())
  const holidaysGateway = dependencies.holidaysGateway ?? new BrasilApiHolidaysGateway(env.holidaysApiBaseUrl)

  const createTripRequestController = new CreateTripController(
    new CreateTripRequestUseCase(tripRequestRepository, holidaysGateway),
  )
  const listTripRequestsController = new ListTripRequestsController(new ListTripRequestsUseCase(tripRequestRepository))
  const getTripRequestController = new GetTripRequestController(new GetTripRequestUseCase(tripRequestRepository))
  const cancelTripRequestController = new CancelTripRequestController(
    new CancelTripRequestUseCase(tripRequestRepository),
  )
  const listHolidaysController = new ListHolidaysController(new ListHolidaysUseCase(holidaysGateway))

  app.post('/trip-requests', adaptFastifyRoute(createTripRequestController))
  app.get('/trip-requests', adaptFastifyRoute(listTripRequestsController))
  app.get('/trip-requests/:id', adaptFastifyRoute(getTripRequestController))
  app.patch('/trip-requests/:id/cancel', adaptFastifyRoute(cancelTripRequestController))
  app.get('/holidays/:year', adaptFastifyRoute(listHolidaysController))

  return app
}

export const bootstrap = async (): Promise<void> => {
  logStartupBanner()

  const app = buildApp()

  await app.listen({
    port: env.port,
    host: '0.0.0.0',
  })
}

const isEntrypoint = (): boolean => {
  const entrypoint = process.argv[1]

  if (entrypoint === undefined) {
    return false
  }

  return fileURLToPath(import.meta.url) === entrypoint
}

if (isEntrypoint()) {
  bootstrap().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
}
