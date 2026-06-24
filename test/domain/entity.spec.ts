import { Entity } from '#src/shared/domain/entities/entity'
import { UniqueEntityId } from '#src/shared/domain/value-objects/unique-entity-id'

interface FakeEntityProps {
  name: string
}

class FakeEntity extends Entity<FakeEntityProps> {
  static create(props: FakeEntityProps, id?: UniqueEntityId): FakeEntity {
    return new FakeEntity(props, id)
  }

  get name(): string {
    return this.props.name
  }
}

describe('Entity', () => {
  it('generates an id when none is provided', () => {
    const entity = FakeEntity.create({ name: 'Test entity' })

    expect(entity.id.toValue()).toHaveLength(36)
  })

  it('uses the provided id', () => {
    const id = new UniqueEntityId('trip-request-1')
    const entity = FakeEntity.create({ name: 'Test entity' }, id)

    expect(entity.id).toBe(id)
    expect(entity.id.toValue()).toBe('trip-request-1')
  })

  it('keeps props available to concrete entities', () => {
    const entity = FakeEntity.create({ name: 'Test entity' })

    expect(entity.name).toBe('Test entity')
  })
})
