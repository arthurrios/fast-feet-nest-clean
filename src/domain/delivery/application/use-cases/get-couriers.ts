import { Either, left, right } from '@/core/either'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { Courier } from '../../enterprise/entities/courier'
import { AuthorizationService } from '@/core/services/authorization-service'
import { CouriersRepository } from '../repository/courier-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Role } from '@/domain/user/@types/role'

interface GetCouriersUseCaseRequest {
  requesterId: string
  params: PaginationParams
}

type GetCouriersUseCaseResponse = Either<
  UnauthorizedAdminOnlyError,
  { couriers: Courier[] }
>

export class GetCouriersUseCase {
  constructor(
    private authorizationService: AuthorizationService,
    private couriersRepository: CouriersRepository,
  ) {}

  async execute({
    requesterId,
    params,
  }: GetCouriersUseCaseRequest): Promise<GetCouriersUseCaseResponse> {
    const authResult = await this.authorizationService.verifyRole(
      new UniqueEntityID(requesterId),
      Role.ADMIN,
    )

    if (authResult.isLeft()) {
      return left(authResult.value)
    }

    const couriers = await this.couriersRepository.findMany(params)

    return right({ couriers })
  }
}
