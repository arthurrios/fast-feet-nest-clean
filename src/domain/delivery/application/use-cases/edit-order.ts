import { Coordinate } from 'test/utils/get-distance-between-coordinates'
import { Order } from '../../enterprise/entities/order'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Either, left, right } from '@/core/either'
import { OrdersRepository } from '../repository/orders-repository'
import { AuthorizationService } from '@/core/services/authorization-service'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Role } from '@/domain/user/@types/role'

interface EditOrderUseCaseRequest {
  requesterId: string
  orderId: string
  title: string
  description: string
  coordinate: Coordinate
}

type EditOrderUseCaseResponse = Either<
  UnauthorizedAdminOnlyError | ResourceNotFoundError,
  { order: Order }
>

export class EditOrderUseCase {
  constructor(
    private authorizationService: AuthorizationService,
    private ordersRepository: OrdersRepository,
  ) {}

  async execute({
    requesterId,
    orderId,
    title,
    description,
    coordinate,
  }: EditOrderUseCaseRequest): Promise<EditOrderUseCaseResponse> {
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

    order.title = title
    order.description = description
    order.coordinate = coordinate

    await this.ordersRepository.save(order)

    return right({ order })
  }
}
