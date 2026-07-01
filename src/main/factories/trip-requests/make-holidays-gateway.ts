import { env } from '#src/config/env'
import { getPrismaClient } from '#src/shared/infra/database/prisma-client'
import type { HolidaysGateway } from '#src/trip-requests/application/ports/holidays-gateway'
import { BrasilApiHolidaysGateway } from '#src/trip-requests/infra/gateways/brasil-api-holidays-gateway'
import { MirroringHolidaysGateway } from '#src/trip-requests/infra/gateways/mirroring-holidays-gateway'
import { PrismaHolidaysRepository } from '#src/trip-requests/infra/repositories/prisma-holidays-repository'

export const makeHolidaysGateway = (): HolidaysGateway =>
  new MirroringHolidaysGateway(
    new PrismaHolidaysRepository(getPrismaClient()),
    new BrasilApiHolidaysGateway(env.holidaysApiBaseUrl),
  )
