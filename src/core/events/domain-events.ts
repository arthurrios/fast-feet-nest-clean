import { AggregateRoot } from '../entities/aggregate-root'
import { UniqueEntityID } from '../entities/unique-entity-id'
import type { DomainEvent } from './domain-event'

type DomainEventCallback<T extends DomainEvent> = (
  event: T,
) => void | Promise<void>

export class DomainEvents {
  private static handlersMap: Record<string, DomainEventCallback<any>[]> = {}
  private static markedAggregates: AggregateRoot<unknown>[] = []

  public static shouldRun = true

  public static markAggregateForDispatch(aggregate: AggregateRoot<unknown>) {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id)

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate)
    }
  }

  private static dispatchAggregateEvents(aggregate: AggregateRoot<unknown>) {
    aggregate.domainEvents.forEach((event: DomainEvent) => this.dispatch(event))
  }

  private static removeAggregateFromMarkedDispatchList(
    aggregate: AggregateRoot<unknown>,
  ) {
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate))

    this.markedAggregates.splice(index, 1)
  }

  private static findMarkedAggregateByID(
    id: UniqueEntityID,
  ): AggregateRoot<unknown> | undefined {
    return this.markedAggregates.find((aggregate) => {
      if (!(aggregate.id instanceof UniqueEntityID)) {
        console.warn('ID corrompido, não podemos modificar:', aggregate.id)
        return false // Or handle accordingly
      }

      return aggregate.id.equals(id)
    })
  }

  public static dispatchEventsForAggregate(id: UniqueEntityID) {
    const aggregate = this.findMarkedAggregateByID(id)

    if (!this.shouldRun) {
      return
    }

    if (aggregate) {
      this.dispatchAggregateEvents(aggregate)
      aggregate.clearEvents()
      this.removeAggregateFromMarkedDispatchList(aggregate)
    }
  }

  public static register<T extends DomainEvent>(
    callback: DomainEventCallback<T>,
    eventClassName: string,
  ) {
    const wasEventRegisteredBefore = eventClassName in this.handlersMap

    if (!wasEventRegisteredBefore) {
      this.handlersMap[eventClassName] = []
    }

    this.handlersMap[eventClassName].push(callback)
  }

  public static clearHandlers() {
    this.handlersMap = {}
  }

  public static clearMarkedAggregates() {
    this.markedAggregates = []
  }

  private static dispatch(event: DomainEvent) {
    const eventClassName: string = event.constructor.name

    const isEventRegistered = eventClassName in this.handlersMap

    if (isEventRegistered) {
      const handlers = this.handlersMap[eventClassName]

      for (const handler of handlers) {
        handler(event)
      }
    }
  }
}
