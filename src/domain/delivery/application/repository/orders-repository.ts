import { PaginationParams } from '@/core/repositories/pagination-params'
import { Order } from '../../enterprise/entities/order'

export interface FindManyNearbyParams {
  latitude: number
  longitude: number
}

export interface OrdersRepository {
  findById(id: string): Promise<Order | null>
  findManyByCourierId(
    courierId: string,
    params: PaginationParams,
  ): Promise<Order[]>
  findManyNearbyCourier(
    courierCoordinate: FindManyNearbyParams,
    params: PaginationParams,
  ): Promise<Order[]>
  findMany(params: PaginationParams): Promise<Order[]>
  create(order: Order): Promise<void>
  save(order: Order): Promise<void>
  delete(order: Order): Promise<void>
}
