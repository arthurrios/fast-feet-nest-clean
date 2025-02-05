import { Either, right } from '@/core/either'
import { Order } from '../../enterprise/entities/order'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { OrdersRepository } from '../repository/orders-repository'

interface FetchOrdersNearbyCourierRequest {
  courierLatitude: number
  courierLongitude: number
  params: PaginationParams
}

type FetchOrdersNearbyCourierResponse = Either<null, { orders: Order[] }>

export class FetchOrdersNearbyCourierUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    courierLatitude,
    courierLongitude,
    params,
  }: FetchOrdersNearbyCourierRequest): Promise<FetchOrdersNearbyCourierResponse> {
    const orders = await this.ordersRepository.findManyNearbyCourier(
      { latitude: courierLatitude, longitude: courierLongitude },
      {
        page: params.page,
      },
    )

    return right({ orders })
  }
}
