import { Entity } from '../../../shared/domain/entities/entity.js'
import { DomainError } from '../../../shared/domain/errors/domain-error.js'
import type { UniqueEntityId } from '../../../shared/domain/value-objects/unique-entity-id.js'
import { UtcDateTime } from '../../../shared/domain/value-objects/utc-date-time.js'

export type TripRequestStatus = 'pending' | 'canceled'
export type TripRequestDateInput = Date | string

export interface TripRequestProps {
  requesterName: string
  origin: string
  destination: string
  departureAt: UtcDateTime
  returnAt: UtcDateTime
  purpose: string
  passengerCount: number
  status: TripRequestStatus
  createdAt: UtcDateTime
}

export interface CreateTripRequestInput {
  requesterName: string
  origin: string
  destination: string
  departureAt: TripRequestDateInput
  returnAt: TripRequestDateInput
  purpose: string
  passengerCount: number
  createdAt?: TripRequestDateInput
}

export interface RestoreTripRequestInput extends Omit<CreateTripRequestInput, 'createdAt'> {
  status: string
  createdAt: Date | string
}

export interface TripRequestSnapshot {
  id: string
  requesterName: string
  origin: string
  destination: string
  departureAt: string
  returnAt: string
  purpose: string
  passengerCount: number
  status: TripRequestStatus
  createdAt: string
}

const REQUIRED_TEXT_FIELDS = ['requesterName', 'origin', 'destination', 'purpose'] as const
type RequiredTextField = (typeof REQUIRED_TEXT_FIELDS)[number]
type DateField = 'departureAt' | 'returnAt' | 'createdAt'

export class TripRequest extends Entity<TripRequestProps> {
  static create(input: CreateTripRequestInput, id?: UniqueEntityId): TripRequest {
    TripRequest.validatePayload(input)
    TripRequest.validateRequiredTextFields(input)
    TripRequest.validatePassengerCount(input.passengerCount)
    TripRequest.validateDateInput(input.departureAt, 'departureAt')
    TripRequest.validateDateInput(input.returnAt, 'returnAt')

    if (input.createdAt !== undefined) {
      TripRequest.validateDateInput(input.createdAt, 'createdAt')
    }

    const departureAt = new UtcDateTime(input.departureAt)
    const returnAt = new UtcDateTime(input.returnAt)

    if (returnAt.isBefore(departureAt)) {
      throw new DomainError('VALIDATION_ERROR', 'Return date must be equal to or after departure date')
    }

    return new TripRequest(
      {
        requesterName: input.requesterName,
        origin: input.origin,
        destination: input.destination,
        departureAt,
        returnAt,
        purpose: input.purpose,
        passengerCount: input.passengerCount,
        status: 'pending',
        createdAt: new UtcDateTime(input.createdAt ?? new Date()),
      },
      id,
    )
  }

  static restore(input: RestoreTripRequestInput, id: UniqueEntityId): TripRequest {
    TripRequest.validatePayload(input)
    TripRequest.validateRequiredTextFields(input)
    TripRequest.validatePassengerCount(input.passengerCount)
    TripRequest.validateDateInput(input.departureAt, 'departureAt')
    TripRequest.validateDateInput(input.returnAt, 'returnAt')
    TripRequest.validateDateInput(input.createdAt, 'createdAt')

    if (input.status !== 'pending' && input.status !== 'canceled') {
      throw new DomainError('VALIDATION_ERROR', 'Trip request status is invalid')
    }

    const departureAt = new UtcDateTime(input.departureAt)
    const returnAt = new UtcDateTime(input.returnAt)

    if (returnAt.isBefore(departureAt)) {
      throw new DomainError('VALIDATION_ERROR', 'Return date must be equal to or after departure date')
    }

    return new TripRequest(
      {
        requesterName: input.requesterName,
        origin: input.origin,
        destination: input.destination,
        departureAt,
        returnAt,
        purpose: input.purpose,
        passengerCount: input.passengerCount,
        status: input.status,
        createdAt: new UtcDateTime(input.createdAt),
      },
      id,
    )
  }

  get departureCivilDate(): string {
    return this.props.departureAt.toCivilDate()
  }

  get status(): TripRequestStatus {
    return this.props.status
  }

  cancel(): void {
    if (this.props.status === 'canceled') {
      throw new DomainError('TRIP_REQUEST_ALREADY_CANCELED', 'Trip request is already canceled')
    }

    this.props.status = 'canceled'
  }

  toJSON(): TripRequestSnapshot {
    return {
      id: this.id.toValue(),
      requesterName: this.props.requesterName,
      origin: this.props.origin,
      destination: this.props.destination,
      departureAt: this.props.departureAt.toISOString(),
      returnAt: this.props.returnAt.toISOString(),
      purpose: this.props.purpose,
      passengerCount: this.props.passengerCount,
      status: this.props.status,
      createdAt: this.props.createdAt.toISOString(),
    }
  }

  private static validatePayload(input: unknown): asserts input is CreateTripRequestInput {
    if (typeof input !== 'object' || input === null) {
      throw new DomainError('VALIDATION_ERROR', 'Trip request payload is required')
    }
  }

  private static validateRequiredTextFields(input: CreateTripRequestInput): void {
    const emptyField = REQUIRED_TEXT_FIELDS.find((field) => TripRequest.isMissingTextField(input, field))

    if (emptyField !== undefined) {
      throw new DomainError('VALIDATION_ERROR', `${emptyField} is required`)
    }
  }

  private static isMissingTextField(input: CreateTripRequestInput, field: RequiredTextField): boolean {
    const value = input[field] as unknown

    return typeof value !== 'string' || value.trim().length === 0
  }

  private static validatePassengerCount(passengerCount: number): void {
    if (!Number.isInteger(passengerCount) || passengerCount <= 0) {
      throw new DomainError('VALIDATION_ERROR', 'Passenger count must be greater than zero')
    }
  }

  private static validateDateInput(value: unknown, field: DateField): asserts value is TripRequestDateInput {
    if (typeof value !== 'string' && !(value instanceof Date)) {
      throw new DomainError('VALIDATION_ERROR', `${field} must be a valid ISO 8601 value`)
    }
  }
}
