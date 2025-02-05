import { Courier } from '@/domain/delivery/enterprise/entities/courier'
import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { AuthorizationService } from '@/core/services/authorization-service'
import { CouriersRepository } from '../repository/courier-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Role } from '@/domain/user/@types/role'

interface GetCourierUseCaseRequest {
  requesterId: string
  courierId: string
}

type GetCourierUseCaseResponse = Either<
  UnauthorizedAdminOnlyError,
  ResourceNotFoundError | { courier: Courier }
>

export class GetCourierUseCase {
  constructor(
    private authorizationService: AuthorizationService,
    private couriersRepository: CouriersRepository,
  ) {}

  async execute({
    requesterId,
    courierId,
  }: GetCourierUseCaseRequest): Promise<GetCourierUseCaseResponse> {
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

    return right({ courier })
  }
}
