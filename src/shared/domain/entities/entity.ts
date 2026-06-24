import { UniqueEntityId } from '../value-objects/unique-entity-id.js'

export abstract class Entity<Props> {
  private readonly _id: UniqueEntityId
  protected props: Props

  get id(): UniqueEntityId {
    return this._id
  }

  protected constructor(props: Props, id?: UniqueEntityId) {
    this.props = props
    this._id = id ?? new UniqueEntityId()
  }
}
