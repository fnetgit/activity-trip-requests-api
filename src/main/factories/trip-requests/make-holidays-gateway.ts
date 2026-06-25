import { env } from '#src/config/env'
import type { HolidaysGateway } from '#src/trip-requests/application/ports/holidays-gateway'
import { BrasilApiHolidaysGateway } from '#src/trip-requests/infra/gateways/brasil-api-holidays-gateway'

export const makeHolidaysGateway = (): HolidaysGateway => new BrasilApiHolidaysGateway(env.holidaysApiBaseUrl)
