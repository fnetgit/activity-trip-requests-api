import { DomainError } from '../../../shared/domain/errors/domain-error.js'
import {
  badGateway,
  badRequest,
  conflict,
  serverError,
  type ErrorResponse,
  type HttpRequest,
  type HttpResponse,
  type SuccessResponse,
} from '../../../shared/infra/http/http.js'

export type ControllerResponse<TData> = ErrorResponse | SuccessResponse<TData>

export interface Controller<TRequestBody = unknown, TResponseBody = unknown> {
  handle(request: HttpRequest<TRequestBody>): Promise<HttpResponse<TResponseBody>>
}

export abstract class BaseController<TRequestBody, TData> implements Controller<
  TRequestBody,
  ControllerResponse<TData>
> {
  async handle(request: HttpRequest<TRequestBody>): Promise<HttpResponse<ControllerResponse<TData>>> {
    try {
      return await this.perform(request)
    } catch (error) {
      return this.handleError(error)
    }
  }

  protected abstract perform(request: HttpRequest<TRequestBody>): Promise<HttpResponse<SuccessResponse<TData>>>

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
