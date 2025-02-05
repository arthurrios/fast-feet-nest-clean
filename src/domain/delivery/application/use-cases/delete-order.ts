import { AuthorizationService } from '@/core/services/authorization-service'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { OrdersRepository } from '../repository/orders-repository'
import { Role } from '@/domain/user/@types/role'

interface DeleteOrderUseCaseRequest {
  requesterId: string
  orderId: string
}

type DeleteOrderUseCaseResponse = Either<
  UnauthorizedAdminOnlyError | ResourceNotFoundError,
  null
>

export class DeleteOrderUseCase {
  constructor(
    private authorizationService: AuthorizationService,
    private ordersRepository: OrdersRepository,
  ) {}

  async execute({
    requesterId,
    orderId,
  }: DeleteOrderUseCaseRequest): Promise<DeleteOrderUseCaseResponse> {
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

    await this.ordersRepository.delete(order)

    return right(null)
  }
}
