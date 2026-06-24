import type { FastifyReply, FastifyRequest } from 'fastify'

import type { Controller } from '#src/trip-requests/infra/controllers/controller'

export const adaptFastifyRoute =
  <TBody>(controller: Controller<TBody>) =>
  async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const response = await controller.handle({
      body: request.body as TBody,
      params: request.params as Record<string, string>,
    })

    await reply.status(response.statusCode).send(response.body)
  }
