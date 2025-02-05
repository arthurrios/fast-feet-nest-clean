import { Order } from '@/domain/delivery/enterprise/entities/order'
import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { AuthorizationService } from '@/core/services/authorization-service'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { OrdersRepository } from '../repository/orders-repository'
import { Role } from '@/domain/user/@types/role'

interface GetOrderUseCaseRequest {
  requesterId: string
  orderId: string
}

type GetOrderUseCaseResponse = Either<
  UnauthorizedAdminOnlyError,
  ResourceNotFoundError | { order: Order }
>

export class GetOrderUseCase {
  constructor(
    private authorizationService: AuthorizationService,
    private ordersRepository: OrdersRepository,
  ) {}

  async execute({
    requesterId,
    orderId,
  }: GetOrderUseCaseRequest): Promise<GetOrderUseCaseResponse> {
    const authResult = await this.authorizationService.verifyRole(
      new UniqueEntityID(requesterId),
      Role.ADMIN,
    )

    if (authResult.isLeft()) {
      return left(authResult.value)
    }

    const order = await this.ordersRepository.findById(orderId)

    if (!order) {
      return left(new ResourceNotFoundError('order'))
    }

    return right({ order })
  }
}
