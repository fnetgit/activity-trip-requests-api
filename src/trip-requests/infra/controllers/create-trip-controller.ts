import { BaseController } from './controller.js'
import { created, type HttpRequest, type HttpResponse, type SuccessResponse } from '../../../shared/infra/http/http.js'
import type { Validator } from '../../../shared/infra/validation/validator.js'
import type { CreateTripRequestInput } from '../../application/dtos/create-trip-request-input.js'
import type { TripRequestOutput } from '../../application/dtos/trip-request-output.js'

interface CreateTripRequestUseCase {
  execute(input: CreateTripRequestInput): Promise<TripRequestOutput>
}

export class CreateTripController extends BaseController<TripRequestOutput> {
  constructor(
    private readonly createTripRequestUseCase: CreateTripRequestUseCase,
    private readonly validator: Validator<CreateTripRequestInput>,
  ) {
    super()
  }

  protected async perform(request: HttpRequest): Promise<HttpResponse<SuccessResponse<TripRequestOutput>>> {
    const input = this.validator.validate(request.body)
    const tripRequest = await this.createTripRequestUseCase.execute(input)

    return created(tripRequest)
  }
}
