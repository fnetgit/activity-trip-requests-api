import { BaseController } from './controller.js'
import { ok, type HttpRequest, type HttpResponse, type SuccessResponse } from '../../../shared/infra/http/http.js'
import type { HolidayOutput } from '../../application/dtos/holiday-output.js'

interface ListHolidaysUseCase {
  execute(year: number): Promise<HolidayOutput[]>
}

export class ListHolidaysController extends BaseController<undefined, HolidayOutput[]> {
  constructor(private readonly listHolidaysUseCase: ListHolidaysUseCase) {
    super()
  }

  protected async perform(request: HttpRequest<undefined>): Promise<HttpResponse<SuccessResponse<HolidayOutput[]>>> {
    const holidays = await this.listHolidaysUseCase.execute(Number(request.params?.['year']))

    return ok(holidays)
  }
}
