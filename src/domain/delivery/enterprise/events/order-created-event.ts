import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Order } from '../entities/order'
import { DomainEvent } from '@/core/events/domain-event'

export class OrderCreatedEvent implements DomainEvent {
  public occurredAt: Date
  public order: Order

  constructor(order: Order) {
    this.order = order
    this.occurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.order.id
  }
}
