import { AuthorizationService } from '@/core/services/authorization-service'
import { CouriersRepository } from '../repository/courier-repository'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Role } from '@/domain/user/@types/role'

interface DeleteCourierUseCaseRequest {
  requesterId: string
  courierId: string
}

type DeleteCourierUseCaseResponse = Either<
  UnauthorizedAdminOnlyError | ResourceNotFoundError,
  null
>

export class DeleteCourierUseCase {
  constructor(
    private authorizationService: AuthorizationService,
    private couriersRepository: CouriersRepository,
  ) {}

  async execute({
    requesterId,
    courierId,
  }: DeleteCourierUseCaseRequest): Promise<DeleteCourierUseCaseResponse> {
    const authResult = await this.authorizationService.verifyRole(
      new UniqueEntityID(requesterId),
      Role.ADMIN,
    )

    if (authResult.isLeft()) {
      return left(authResult.value)
    }

    const courier = await this.couriersRepository.findById(courierId)

    if (!courier) {
      return left(new ResourceNotFoundError('courier'))
    }

    await this.couriersRepository.delete(courier)

    return right(null)
  }
}
