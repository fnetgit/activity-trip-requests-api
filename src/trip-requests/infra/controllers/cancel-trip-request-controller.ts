import { BaseController } from './controller.js'
import { ok, type HttpRequest, type HttpResponse, type SuccessResponse } from '../../../shared/infra/http/http.js'
import type { Validator } from '../../../shared/infra/validation/validator.js'
import type { TripRequestOutput } from '../../application/dtos/trip-request-output.js'

interface CancelTripRequestUseCase {
  execute(id: string): Promise<TripRequestOutput>
}

interface CancelTripRequestParams {
  id: string
}

export class CancelTripRequestController extends BaseController<TripRequestOutput> {
  constructor(
    private readonly cancelTripRequestUseCase: CancelTripRequestUseCase,
    private readonly validator: Validator<CancelTripRequestParams>,
  ) {
    super()
  }

  protected async perform(request: HttpRequest): Promise<HttpResponse<SuccessResponse<TripRequestOutput>>> {
    const params = this.validator.validate(request.params ?? {})
    const tripRequest = await this.cancelTripRequestUseCase.execute(params.id)

    return ok(tripRequest)
  }
}
