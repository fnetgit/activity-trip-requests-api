import { randomUUID } from 'node:crypto'

import { DomainError } from '../errors/domain-error.js'

export class UniqueEntityId {
  private readonly value: string

  constructor(value?: string) {
    const id = value ?? randomUUID()

    if (id.trim().length === 0) {
      throw new DomainError('VALIDATION_ERROR', 'Entity id cannot be empty')
    }

    this.value = id
  }

  toString(): string {
    return this.value
  }

  toValue(): string {
    return this.value
  }
}
