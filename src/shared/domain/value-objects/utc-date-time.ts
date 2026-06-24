import { DomainError } from '../errors/domain-error.js'

const ISO_DATE_SEPARATOR = 'T'

export class UtcDateTime {
  private readonly value: Date

  constructor(value: Date | string) {
    const date = value instanceof Date ? new Date(value.getTime()) : new Date(value)

    if (Number.isNaN(date.getTime())) {
      throw new DomainError('VALIDATION_ERROR', 'Date must be a valid ISO 8601 value')
    }

    this.value = date
  }

  isBefore(other: UtcDateTime): boolean {
    return this.value.getTime() < other.value.getTime()
  }

  toCivilDate(): string {
    const [civilDate] = this.toISOString().split(ISO_DATE_SEPARATOR)

    if (civilDate === undefined) {
      throw new DomainError('VALIDATION_ERROR', 'Date must include a civil date')
    }

    return civilDate
  }

  toDate(): Date {
    return new Date(this.value.getTime())
  }

  toISOString(): string {
    return this.value.toISOString()
  }
}
