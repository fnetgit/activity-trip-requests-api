import { getPrismaClient } from '#src/shared/infra/database/prisma-client'
import type { TripRequestRepository } from '#src/trip-requests/application/ports/trip-request-repository'
import { PrismaTripRequestRepository } from '#src/trip-requests/infra/repositories/prisma-trip-request-repository'

export const makeTripRequestRepository = (): TripRequestRepository => new PrismaTripRequestRepository(getPrismaClient())
