import { Either, left, right } from '@/core/either'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { Recipient } from '../../enterprise/entities/recipient'
import { AuthorizationService } from '@/core/services/authorization-service'
import { RecipientsRepository } from '../repository/recipient-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Role } from '@/domain/user/@types/role'

interface GetRecipientsUseCaseRequest {
  requesterId: string
  params: PaginationParams
}

type GetRecipientsUseCaseResponse = Either<
  UnauthorizedAdminOnlyError,
  { recipients: Recipient[] }
>

export class GetRecipientsUseCase {
  constructor(
    private authorizationService: AuthorizationService,
    private recipientsRepository: RecipientsRepository,
  ) {}

  async execute({
    requesterId,
    params,
  }: GetRecipientsUseCaseRequest): Promise<GetRecipientsUseCaseResponse> {
    const authResult = await this.authorizationService.verifyRole(
      new UniqueEntityID(requesterId),
      Role.ADMIN,
    )

    if (authResult.isLeft()) {
      return left(authResult.value)
    }

    const recipients = await this.recipientsRepository.findMany(params)

    return right({ recipients })
  }
}
