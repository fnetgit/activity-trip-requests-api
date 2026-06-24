export type DomainErrorCode = 'VALIDATION_ERROR' | 'TRIP_REQUEST_ALREADY_CANCELED'

export class DomainError extends Error {
  readonly code: DomainErrorCode

  constructor(code: DomainErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'DomainError'
  }
}
