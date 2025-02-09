import { PaginationParams } from '@/core/repositories/pagination-params'
import { Order } from '../../enterprise/entities/order'

export interface FindManyNearbyParams {
  latitude: number
  longitude: number
}

export abstract class OrdersRepository {
  abstract findById(id: string): Promise<Order | null>
  abstract findManyByCourierId(
    courierId: string,
    params: PaginationParams,
  ): Promise<Order[]>

  abstract findManyNearby(
    coordinate: FindManyNearbyParams,
    params: PaginationParams,
  ): Promise<Order[]>

  abstract findMany(params: PaginationParams): Promise<Order[]>
  abstract create(order: Order): Promise<void>
  abstract save(order: Order): Promise<void>
  abstract delete(order: Order): Promise<void>
}
