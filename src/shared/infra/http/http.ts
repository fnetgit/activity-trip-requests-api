import { DomainError, type DomainErrorCode } from '../../domain/errors/domain-error.js'

export interface HttpRequest<TBody = unknown> {
  body: TBody
}

export interface HttpResponse<TBody = unknown> {
  statusCode: number
  body: TBody
}

export interface SuccessResponse<TData> {
  success: true
  data: TData
}

export interface ErrorResponse {
  success: false
  error: {
    code: DomainErrorCode
    message: string
  }
}

export const created = <TData>(data: TData): HttpResponse<SuccessResponse<TData>> => ({
  statusCode: 201,
  body: {
    success: true,
    data,
  },
})

export const badRequest = (error: DomainError): HttpResponse<ErrorResponse> => errorResponse(400, error)

export const conflict = (error: DomainError): HttpResponse<ErrorResponse> => errorResponse(409, error)

export const badGateway = (error: DomainError): HttpResponse<ErrorResponse> => errorResponse(502, error)

export const serverError = (): HttpResponse<ErrorResponse> =>
  errorResponse(500, new DomainError('INTERNAL_SERVER_ERROR', 'Internal server error'))

const errorResponse = (statusCode: number, error: DomainError): HttpResponse<ErrorResponse> => ({
  statusCode,
  body: {
    success: false,
    error: {
      code: error.code,
      message: error.message,
    },
  },
})
