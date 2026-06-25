import { BaseController } from './controller.js'
import { ok, type HttpResponse, type SuccessResponse } from '../../../shared/infra/http/http.js'
import type { TripRequestOutput } from '../../application/dtos/trip-request-output.js'

interface ListTripRequestsUseCase {
  execute(): Promise<TripRequestOutput[]>
}

export class ListTripRequestsController extends BaseController<TripRequestOutput[]> {
  constructor(private readonly listTripRequestsUseCase: ListTripRequestsUseCase) {
    super()
  }

  protected async perform(): Promise<HttpResponse<SuccessResponse<TripRequestOutput[]>>> {
    const tripRequests = await this.listTripRequestsUseCase.execute()

    return ok(tripRequests)
  }
}
