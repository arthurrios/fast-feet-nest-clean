import { Recipient } from '@/domain/delivery/enterprise/entities/recipient'
import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { AuthorizationService } from '@/core/services/authorization-service'
import { RecipientsRepository } from '../repository/recipient-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Role } from '@/domain/user/@types/role'

interface GetRecipientUseCaseRequest {
  requesterId: string
  recipientId: string
}

type GetRecipientUseCaseResponse = Either<
  UnauthorizedAdminOnlyError,
  ResourceNotFoundError | { recipient: Recipient }
>

export class GetRecipientUseCase {
  constructor(
    private authorizationService: AuthorizationService,
    private recipientsRepository: RecipientsRepository,
  ) {}

  async execute({
    requesterId,
    recipientId,
  }: GetRecipientUseCaseRequest): Promise<GetRecipientUseCaseResponse> {
    const authResult = await this.authorizationService.verifyRole(
      new UniqueEntityID(requesterId),
      Role.ADMIN,
    )

    if (authResult.isLeft()) {
      return left(authResult.value)
    }

    const recipient = await this.recipientsRepository.findById(recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError('recipient'))
    }

    return right({ recipient })
  }
}
