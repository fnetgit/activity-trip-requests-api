import type { HolidaysGateway } from '#src/trip-requests/application/ports/holidays-gateway'
import { ListHolidaysUseCase } from '#src/trip-requests/application/use-cases/list-holidays-use-case'
import { ListHolidaysController } from '#src/trip-requests/infra/controllers/list-holidays-controller'

import { makeListHolidaysParamsValidator } from './make-list-holidays-params-validator.js'

export const makeListHolidaysController = (holidaysGateway: HolidaysGateway): ListHolidaysController =>
  new ListHolidaysController(new ListHolidaysUseCase(holidaysGateway), makeListHolidaysParamsValidator())
