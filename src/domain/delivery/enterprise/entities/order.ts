import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Slug } from './value-objects/slug'
import { OrderStatus } from '../../@types/status'
import { Optional } from '@/core/types/optional'
import { AggregateRoot } from '@/core/entities/aggregate-root'
import { OrderCreatedEvent } from '../events/order-created-event'
import { CourierAssignedEvent } from '../events/courier-assigned-event'
import { Coordinate } from 'test/utils/get-distance-between-coordinates'
import { OrderAttachmentList } from './order-attachment-list'
import { OrderStatusChangedEvent } from '../events/order-status-changed'

export interface OrderProps {
  recipientId: UniqueEntityID
  courierId?: UniqueEntityID | null
  title: string
  description: string
  slug: Slug
  coordinate: Coordinate
  status: OrderStatus
  attachments: OrderAttachmentList
  createdAt: Date
  updatedAt?: Date | null
}

export class Order extends AggregateRoot<OrderProps> {
  get courierId() {
    return this.props.courierId
  }

  get recipientId() {
    return this.props.recipientId
  }

  get title() {
    return this.props.title
  }

  get description() {
    return this.props.description
  }

  get slug() {
    return this.props.slug
  }

  get coordinate() {
    return this.props.coordinate
  }

  get status() {
    return this.props.status
  }

  get attachments() {
    return this.props.attachments
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  set title(title: string) {
    this.props.title = title
    this.props.slug = Slug.createFromText(title)
    this.touch()
  }

  set description(description: string) {
    this.props.description = description
    this.touch()
  }

  set attachments(attachments: OrderAttachmentList) {
    this.props.attachments = attachments
    this.touch()
  }

  set coordinate(coordinate: Coordinate) {
    this.props.coordinate = coordinate
    this.touch()
  }

  static create(
    props: Optional<OrderProps, 'createdAt' | 'slug' | 'status' | 'courierId'>,
    id?: UniqueEntityID,
  ) {
    const order = new Order(
      {
        ...props,
        slug: props.slug ?? Slug.createFromText(props.title),
        status: props.status ?? OrderStatus.PENDING,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    order.addDomainEvent(new OrderCreatedEvent(order))

    return order
  }

  assignCourier(courierId: UniqueEntityID) {
    if (!this.props.courierId?.equals(courierId)) {
      this.props.courierId = courierId
      this.props.status = OrderStatus.AWAITING
      this.addDomainEvent(new CourierAssignedEvent(courierId, this.id))
      this.touch()
    }
  }

  updateStatus(status: OrderStatus) {
    this.props.status = status
    this.touch()

    this.addDomainEvent(new OrderStatusChangedEvent(this))
  }
}
