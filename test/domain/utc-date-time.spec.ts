import { DomainError } from '#src/shared/domain/errors/domain-error'
import { UtcDateTime } from '#src/shared/domain/value-objects/utc-date-time'

describe('UtcDateTime', () => {
  it('normalizes ISO 8601 values to UTC', () => {
    const dateTime = new UtcDateTime('2026-06-24T07:00:00-03:00')

    expect(dateTime.toISOString()).toBe('2026-06-24T10:00:00.000Z')
  })

  it('extracts the UTC civil date', () => {
    const dateTime = new UtcDateTime('2026-06-24T23:30:00-03:00')

    expect(dateTime.toCivilDate()).toBe('2026-06-25')
  })

  it('compares dates', () => {
    const earlier = new UtcDateTime('2026-06-24T10:00:00.000Z')
    const later = new UtcDateTime('2026-06-24T18:00:00.000Z')

    expect(earlier.isBefore(later)).toBe(true)
    expect(later.isBefore(earlier)).toBe(false)
  })

  it('rejects invalid dates', () => {
    expect(() => new UtcDateTime('not-a-date')).toThrow(DomainError)
    expect(() => new UtcDateTime('not-a-date')).toThrow('Date must be a valid ISO 8601 value')
  })
})
