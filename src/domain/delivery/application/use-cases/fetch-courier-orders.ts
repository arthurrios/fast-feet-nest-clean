import { Either, right } from '@/core/either'
import { Order } from '../../enterprise/entities/order'
import { NotAllowedError } from '../../../../core/errors/errors/not-allowed-error'
import { OrdersRepository } from '../repository/orders-repository'
import { PaginationParams } from '@/core/repositories/pagination-params'

interface FetchCourierOrdersUseCaseRequest {
  courierId: string
  params: PaginationParams
}

type FetchCourierOrdersUseCaseResponse = Either<
  NotAllowedError,
  { orders: Order[] }
>

export class FetchCourierOrdersUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    courierId,
    params: { page },
  }: FetchCourierOrdersUseCaseRequest): Promise<FetchCourierOrdersUseCaseResponse> {
    const orders = await this.ordersRepository.findManyByCourierId(courierId, {
      page,
    })

    return right({ orders })
  }
}
