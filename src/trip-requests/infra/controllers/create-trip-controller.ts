import { BaseController } from './controller.js'
import { created, type HttpRequest, type HttpResponse, type SuccessResponse } from '../../../shared/infra/http/http.js'
import type { CreateTripRequestInput } from '../../application/dtos/create-trip-request-input.js'
import type { TripRequestOutput } from '../../application/dtos/trip-request-output.js'

interface CreateTripRequestUseCase {
  execute(input: CreateTripRequestInput): Promise<TripRequestOutput>
}

export class CreateTripController extends BaseController<CreateTripRequestInput, TripRequestOutput> {
  constructor(private readonly createTripRequestUseCase: CreateTripRequestUseCase) {
    super()
  }

  protected async perform(
    request: HttpRequest<CreateTripRequestInput>,
  ): Promise<HttpResponse<SuccessResponse<TripRequestOutput>>> {
    const tripRequest = await this.createTripRequestUseCase.execute(request.body)

    return created(tripRequest)
  }
}
