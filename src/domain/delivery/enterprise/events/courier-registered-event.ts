import { DomainEvent } from '@/core/events/domain-event'
import { Courier } from '../entities/courier'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export class CourierRegisteredEvent implements DomainEvent {
  public occurredAt: Date
  public courier: Courier

  constructor(courier: Courier) {
    this.courier = courier
    this.occurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.courier.id
  }
}
