import { DomainError } from '../../../shared/domain/errors/domain-error.js'
import {
  badGateway,
  badRequest,
  conflict,
  created,
  serverError,
  type ErrorResponse,
  type HttpRequest,
  type HttpResponse,
  type SuccessResponse,
} from '../../../shared/infra/http/http.js'
import type { CreateTripRequestInput } from '../../application/dtos/create-trip-request-input.js'
import type { TripRequestOutput } from '../../application/dtos/trip-request-output.js'

interface CreateTripRequestUseCase {
  execute(input: CreateTripRequestInput): Promise<TripRequestOutput>
}

type CreateTripControllerResponse = ErrorResponse | SuccessResponse<TripRequestOutput>

export class CreateTripController {
  constructor(private readonly createTripRequestUseCase: CreateTripRequestUseCase) {}

  async handle(request: HttpRequest<CreateTripRequestInput>): Promise<HttpResponse<CreateTripControllerResponse>> {
    try {
      const tripRequest = await this.createTripRequestUseCase.execute(request.body)

      return created(tripRequest)
    } catch (error) {
      return this.handleError(error)
    }
  }

  private handleError(error: unknown): HttpResponse<ErrorResponse> {
    if (!(error instanceof DomainError)) {
      return serverError()
    }

    if (error.code === 'VALIDATION_ERROR') {
      return badRequest(error)
    }

    if (error.code === 'HOLIDAY_TRIP_NOT_ALLOWED') {
      return conflict(error)
    }

    if (error.code === 'HOLIDAYS_API_UNAVAILABLE') {
      return badGateway(error)
    }

    return serverError()
  }
}
