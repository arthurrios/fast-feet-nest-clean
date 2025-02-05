import { Either, left, right } from '@/core/either'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { Order } from '../../enterprise/entities/order'
import { AuthorizationService } from '@/core/services/authorization-service'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { OrdersRepository } from '../repository/orders-repository'
import { Role } from '@/domain/user/@types/role'

interface GetOrdersUseCaseRequest {
  requesterId: string
  params: PaginationParams
}

type GetOrdersUseCaseResponse = Either<
  UnauthorizedAdminOnlyError,
  { orders: Order[] }
>

export class GetOrdersUseCase {
  constructor(
    private authorizationService: AuthorizationService,
    private ordersRepository: OrdersRepository,
  ) {}

  async execute({
    requesterId,
    params,
  }: GetOrdersUseCaseRequest): Promise<GetOrdersUseCaseResponse> {
    const authResult = await this.authorizationService.verifyRole(
      new UniqueEntityID(requesterId),
      Role.ADMIN,
    )

    if (authResult.isLeft()) {
      return left(authResult.value)
    }

    const orders = await this.ordersRepository.findMany(params)

    return right({ orders })
  }
}
