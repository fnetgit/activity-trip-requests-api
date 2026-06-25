import fastify, { type FastifyInstance } from 'fastify'

import { env } from '#src/config/env'
import type { BuildAppDependencies } from '#src/main/factories/trip-requests/build-app-dependencies'
import { registerTripRequestRoutes } from '#src/main/routes/trip-request-routes'

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

  registerTripRequestRoutes(app, dependencies)

  return app
}
