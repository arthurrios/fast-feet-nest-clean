import { Either, right } from '@/core/either'
import { Order } from '../../enterprise/entities/order'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { OrdersRepository } from '../repository/orders-repository'
import { Injectable } from '@nestjs/common'

interface FetchOrdersNearbyRequest {
  latitude: number
  longitude: number
  params: PaginationParams
}

type FetchOrdersNearbyResponse = Either<null, { orders: Order[] }>

@Injectable()
export class FetchOrdersNearbyUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    latitude,
    longitude,
    params: { page },
  }: FetchOrdersNearbyRequest): Promise<FetchOrdersNearbyResponse> {
    const orders = await this.ordersRepository.findManyNearby(
      { latitude, longitude },
      {
        page,
      },
    )

    return right({ orders })
  }
}
