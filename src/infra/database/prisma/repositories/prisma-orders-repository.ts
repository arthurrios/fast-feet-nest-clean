import { PaginationParams } from '@/core/repositories/pagination-params'
import {
  FindManyNearbyParams,
  OrdersRepository,
} from '@/domain/delivery/application/repository/orders-repository'
import { Order } from '@/domain/delivery/enterprise/entities/order'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  findById(id: string): Promise<Order | null> {
    throw new Error('Method not implemented.')
  }

  findManyByCourierId(
    courierId: string,
    params: PaginationParams,
  ): Promise<Order[]> {
    throw new Error('Method not implemented.')
  }

  findManyNearbyCourier(
    courierCoordinate: FindManyNearbyParams,
    params: PaginationParams,
  ): Promise<Order[]> {
    throw new Error('Method not implemented.')
  }

  findMany(params: PaginationParams): Promise<Order[]> {
    throw new Error('Method not implemented.')
  }

  create(order: Order): Promise<void> {
    throw new Error('Method not implemented.')
  }

  save(order: Order): Promise<void> {
    throw new Error('Method not implemented.')
  }

  delete(order: Order): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
