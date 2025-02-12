import { PaginationParams } from '@/core/repositories/pagination-params'
import {
  FindManyNearbyParams,
  OrdersRepository,
} from '@/domain/delivery/application/repository/orders-repository'
import { Order } from '@/domain/delivery/enterprise/entities/order'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaOrderMapper } from '../mappers/prisma-order-mapper'
import { RawOrder } from '../dtos/raw-order'
import { OrderAttachmentsRepository } from '@/domain/delivery/application/repository/order-attachments-repository'
import { DomainEvents } from '@/core/events/domain-events'
import { CacheRepository } from '@/infra/cache/cache-repository'

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(
    private prisma: PrismaService,
    private orderAttachmentsRepository: OrderAttachmentsRepository,
    private cacheRepository: CacheRepository,
  ) {}

  async findById(id: string): Promise<Order | null> {
    const cacheHit = await this.cacheRepository.get(`order:${id}:details`)

    if (cacheHit) {
      const cachedData = JSON.parse(cacheHit)
      return PrismaOrderMapper.toDomain(cachedData)
    }

    const order = await this.prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return null
    }

    await this.cacheRepository.set(
      `order:${id}:details`,
      JSON.stringify(order),
    )

    const orderDetails = PrismaOrderMapper.toDomain(order)


    return orderDetails
  }

  async findManyByCourierId(
    courierId: string,
    { page }: PaginationParams,
  ): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { courierId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    })

    return orders.map(PrismaOrderMapper.toDomain)
  }

  async findManyNearby(
    coordinate: FindManyNearbyParams,
    { page }: PaginationParams,
  ): Promise<Order[]> {
    const { latitude, longitude } = coordinate
    const distanceLimit = 10
    const limit = 20
    const offset = (page - 1) * limit

    const orders = await this.prisma.$queryRaw<RawOrder[]>`
    SELECT *
    FROM "orders"
    WHERE (
      6371 * acos(
        cos(radians(${latitude})) * cos(radians("latitude")) *
        cos(radians("longitude") - radians(${longitude})) +
        sin(radians(${latitude})) * sin(radians("latitude"))
      )
    ) < ${distanceLimit}
    ORDER BY "created_at" DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `

    return orders.map(PrismaOrderMapper.toDomain)
  }

  async findMany({ page }: PaginationParams): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    })

    return orders.map(PrismaOrderMapper.toDomain)
  }

  async create(order: Order): Promise<void> {
    const data = PrismaOrderMapper.toPrisma(order)

    await this.orderAttachmentsRepository.createMany(
      order.attachments.getItems(),
    )

    await this.prisma.order.create({
      data,
    })

    DomainEvents.dispatchEventsForAggregate(order.id)
  }

  async save(order: Order): Promise<void> {
    const data = PrismaOrderMapper.toPrisma(order)

    if (order.attachments.currentItems.length !== 0) {
      await Promise.all([
        await this.orderAttachmentsRepository.createMany(
          order.attachments.getNewItems(),
        ),
        await this.orderAttachmentsRepository.createMany(
          order.attachments.getRemovedItems(),
        ),
        await this.prisma.order.update({
          where: {
            id: data.id,
          },
          data,
        }),
      ])
    } else {
      await this.orderAttachmentsRepository.createMany(
        order.attachments.getItems(),
      )
      await this.prisma.order.update({
        where: {
          id: data.id,
        },
        data,
      })
    }

    this.cacheRepository.delete(`order:${order.id}:details`)

    DomainEvents.dispatchEventsForAggregate(order.id)
  }

  async delete(order: Order): Promise<void> {
    const data = PrismaOrderMapper.toPrisma(order)

    await this.prisma.order.delete({
      where: {
        id: data.id,
      },
    })
  }
}
