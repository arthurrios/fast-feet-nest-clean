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

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return null
    }

    return PrismaOrderMapper.toDomain(order)
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

  async findManyNearbyCourier(
    courierCoordinate: FindManyNearbyParams,
    { page }: PaginationParams,
  ): Promise<Order[]> {
    const { latitude, longitude } = courierCoordinate
    const distanceLimit = 10
    const limit = 20
    const offset = (page - 1) * limit

    const orders = await this.prisma.$queryRaw<RawOrder[]>`
    SELECT *
    FROM "Order"
    WHERE (
      6371 * acos(
        cos(radians(${latitude})) * cos(radians("latitude")) *
        cos(radians("longitude") - radians(${longitude})) +
        sin(radians(${latitude})) * sin(radians("latitude"))
      )
    ) < ${distanceLimit}
    ORDER BY "createdAt" DESC
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

    await this.prisma.order.create({
      data,
    })
  }

  async save(order: Order): Promise<void> {
    const data = PrismaOrderMapper.toPrisma(order)

    await this.prisma.order.update({
      where: {
        id: data.id,
      },
      data,
    })
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
