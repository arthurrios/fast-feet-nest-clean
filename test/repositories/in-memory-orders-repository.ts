import { DomainEvents } from '@/core/events/domain-events'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { OrderAttachmentsRepository } from '@/domain/delivery/application/repository/order-attachments-repository'
import {
  FindManyNearbyParams,
  OrdersRepository,
} from '@/domain/delivery/application/repository/orders-repository'
import { Order } from '@/domain/delivery/enterprise/entities/order'
import { getDistanceBetweenCoordinates } from 'test/utils/get-distance-between-coordinates'

export class InMemoryOrdersRepository implements OrdersRepository {
  public items: Order[] = []

  constructor(private orderAttachmentsRepository: OrderAttachmentsRepository) {}

  async findById(id: string): Promise<Order | null> {
    const order = this.items.find((item) => item.id.toString() === id)

    if (!order) {
      return null
    }

    return order
  }

  async findManyByCourierId(
    courierId: string,
    { page }: PaginationParams,
  ): Promise<Order[]> {
    const orders = this.items
      .filter((item) => item.courierId?.toString() === courierId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20)

    return orders
  }

  async findManyNearby(
    { latitude, longitude }: FindManyNearbyParams,
    { page }: PaginationParams,
  ): Promise<Order[]> {
    return this.items
      .filter((item) => {
        const distance = getDistanceBetweenCoordinates(
          {
            latitude,
            longitude,
          },
          {
            latitude: item.coordinate.latitude,
            longitude: item.coordinate.longitude,
          },
        )

        return distance < 10
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20)
  }

  async findMany({ page }: PaginationParams): Promise<Order[]> {
    const orders = this.items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20)

    return orders
  }

  async create(order: Order): Promise<void> {
    this.items.push(order)

    await this.orderAttachmentsRepository.createMany(
      order.attachments.getItems(),
    )

    DomainEvents.dispatchEventsForAggregate(order.id)
  }

  async save(order: Order): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(order.id))

    this.items[index] = order

    await this.orderAttachmentsRepository.createMany(
      order.attachments.getNewItems(),
    )

    await this.orderAttachmentsRepository.deleteMany(
      order.attachments.getRemovedItems(),
    )

    DomainEvents.dispatchEventsForAggregate(order.id)
  }

  async delete(order: Order): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(order.id))

    this.items.splice(index, 1)
  }
}
