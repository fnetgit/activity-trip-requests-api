import { DomainError } from '#src/shared/domain/errors/domain-error'
import { UniqueEntityId } from '#src/shared/domain/value-objects/unique-entity-id'

describe('UniqueEntityId', () => {
  it('generates a UUID when no value is provided', () => {
    const id = new UniqueEntityId()

    expect(id.toValue()).toHaveLength(36)
    expect(id.toString()).toBe(id.toValue())
  })

  it('preserves a provided id', () => {
    const id = new UniqueEntityId('trip-request-1')

    expect(id.toValue()).toBe('trip-request-1')
  })

  it('rejects an empty id', () => {
    expect(() => new UniqueEntityId('   ')).toThrow(DomainError)
    expect(() => new UniqueEntityId('   ')).toThrow('Entity id cannot be empty')
  })
})
