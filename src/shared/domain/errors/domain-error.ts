export type DomainErrorCode =
  | 'VALIDATION_ERROR'
  | 'TRIP_REQUEST_NOT_FOUND'
  | 'TRIP_REQUEST_ALREADY_CANCELED'
  | 'HOLIDAY_TRIP_NOT_ALLOWED'
  | 'HOLIDAYS_API_UNAVAILABLE'
  | 'INTERNAL_SERVER_ERROR'

export class DomainError extends Error {
  readonly code: DomainErrorCode

  constructor(code: DomainErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'DomainError'
  }
}
