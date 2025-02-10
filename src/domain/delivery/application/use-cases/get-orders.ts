import { Either, left, right } from '@/core/either'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { Order } from '../../enterprise/entities/order'
import { AuthorizationService } from '@/core/services/authorization-service'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { OrdersRepository } from '../repository/orders-repository'
import { Role } from '@/domain/user/@types/role'
import { Injectable } from '@nestjs/common'

interface GetOrdersUseCaseRequest {
  requesterId: string
  page: number
}

type GetOrdersUseCaseResponse = Either<
  UnauthorizedAdminOnlyError,
  { orders: Order[] }
>

@Injectable()
export class GetOrdersUseCase {
  constructor(
    private authorizationService: AuthorizationService,
    private ordersRepository: OrdersRepository,
  ) {}

  async execute({
    requesterId,
    page,
  }: GetOrdersUseCaseRequest): Promise<GetOrdersUseCaseResponse> {
    const authResult = await this.authorizationService.verifyRole(
      new UniqueEntityID(requesterId),
      Role.ADMIN,
    )

    if (authResult.isLeft()) {
      return left(authResult.value)
    }

    const orders = await this.ordersRepository.findMany({ page })

    return right({ orders })
  }
}
