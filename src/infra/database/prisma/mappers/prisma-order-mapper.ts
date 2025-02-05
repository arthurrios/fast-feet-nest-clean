import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Order } from '@/domain/delivery/enterprise/entities/order'
import { OrderAttachmentList } from '@/domain/delivery/enterprise/entities/order-attachment-list'
import { Slug } from '@/domain/delivery/enterprise/entities/value-objects/slug'
import { Prisma, Order as PrismaOrder } from '@prisma/client'
import { PrismaAttachmentMapper } from './prisma-attachment-mapper'

export class PrismaOrderMapper {
  static toDomain(raw: PrismaOrder) {
    return Order.create(
      {
        title: raw.title,
        description: raw.description,
        coordinate: {
          latitude: Number(raw.latitude),
          longitude: Number(raw.longitude),
        },
        slug: Slug.create(raw.slug),
        recipientId: new UniqueEntityID(raw.recipientId),
        courierId: raw.courierId ? new UniqueEntityID(raw.courierId) : null,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(order: Order): Prisma.OrderUncheckedCreateInput {
    return {
      id: order.id.toString(),
      courierId: order.courierId?.toString(),
      recipientId: order.recipientId.toString(),
      title: order.title,
      description: order.description,
      slug: order.slug.value,
      latitude: order.coordinate.latitude,
      longitude: order.coordinate.longitude,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }
  }
}
