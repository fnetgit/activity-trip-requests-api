import { BaseController } from './controller.js'
import { ok, type HttpRequest, type HttpResponse, type SuccessResponse } from '../../../shared/infra/http/http.js'
import type { Validator } from '../../../shared/infra/validation/validator.js'
import type { HolidayOutput } from '../../application/dtos/holiday-output.js'

interface ListHolidaysUseCase {
  execute(year: number): Promise<HolidayOutput[]>
}

interface ListHolidaysParams {
  year: number
}

export class ListHolidaysController extends BaseController<HolidayOutput[]> {
  constructor(
    private readonly listHolidaysUseCase: ListHolidaysUseCase,
    private readonly validator: Validator<ListHolidaysParams>,
  ) {
    super()
  }

  protected async perform(request: HttpRequest): Promise<HttpResponse<SuccessResponse<HolidayOutput[]>>> {
    const params = this.validator.validate(request.params ?? {})
    const holidays = await this.listHolidaysUseCase.execute(params.year)

    return ok(holidays)
  }
}
