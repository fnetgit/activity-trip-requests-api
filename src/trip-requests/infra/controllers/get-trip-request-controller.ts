import { BaseController } from './controller.js'
import { ok, type HttpRequest, type HttpResponse, type SuccessResponse } from '../../../shared/infra/http/http.js'
import type { TripRequestOutput } from '../../application/dtos/trip-request-output.js'

interface GetTripRequestUseCase {
  execute(id: string): Promise<TripRequestOutput>
}

export class GetTripRequestController extends BaseController<undefined, TripRequestOutput> {
  constructor(private readonly getTripRequestUseCase: GetTripRequestUseCase) {
    super()
  }

  protected async perform(request: HttpRequest): Promise<HttpResponse<SuccessResponse<TripRequestOutput>>> {
    const tripRequest = await this.getTripRequestUseCase.execute(request.params?.['id'] ?? '')

    return ok(tripRequest)
  }
}
