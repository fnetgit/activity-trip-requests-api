import { BaseController } from './controller.js'
import { ok, type HttpRequest, type HttpResponse, type SuccessResponse } from '../../../shared/infra/http/http.js'
import type { Validator } from '../../../shared/infra/validation/validator.js'
import type { TripRequestOutput } from '../../application/dtos/trip-request-output.js'

interface GetTripRequestUseCase {
  execute(id: string): Promise<TripRequestOutput>
}

interface GetTripRequestParams {
  id: string
}

export class GetTripRequestController extends BaseController<TripRequestOutput> {
  constructor(
    private readonly getTripRequestUseCase: GetTripRequestUseCase,
    private readonly validator: Validator<GetTripRequestParams>,
  ) {
    super()
  }

  protected async perform(request: HttpRequest): Promise<HttpResponse<SuccessResponse<TripRequestOutput>>> {
    const params = this.validator.validate(request.params ?? {})
    const tripRequest = await this.getTripRequestUseCase.execute(params.id)

    return ok(tripRequest)
  }
}
