import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DomainEvent } from '@/core/events/domain-event'

export class CourierAssignedEvent implements DomainEvent {
  public occurredAt: Date
  public courierId: UniqueEntityID
  public orderId: UniqueEntityID

  constructor(courierId: UniqueEntityID, orderId: UniqueEntityID) {
    this.courierId = courierId
    this.orderId = orderId
    this.occurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.orderId
  }
}
