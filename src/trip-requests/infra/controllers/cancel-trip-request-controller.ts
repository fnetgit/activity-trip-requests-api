import { BaseController } from './controller.js'
import { ok, type HttpRequest, type HttpResponse, type SuccessResponse } from '../../../shared/infra/http/http.js'
import type { TripRequestOutput } from '../../application/dtos/trip-request-output.js'

interface CancelTripRequestUseCase {
  execute(id: string): Promise<TripRequestOutput>
}

export class CancelTripRequestController extends BaseController<undefined, TripRequestOutput> {
  constructor(private readonly cancelTripRequestUseCase: CancelTripRequestUseCase) {
    super()
  }

  protected async perform(request: HttpRequest<undefined>): Promise<HttpResponse<SuccessResponse<TripRequestOutput>>> {
    const tripRequest = await this.cancelTripRequestUseCase.execute(request.params?.['id'] ?? '')

    return ok(tripRequest)
  }
}
