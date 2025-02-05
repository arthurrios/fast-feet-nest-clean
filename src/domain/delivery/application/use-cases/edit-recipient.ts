import { Either, left, right } from '@/core/either'
import { RecipientsRepository } from '../repository/recipient-repository'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Recipient } from '../../enterprise/entities/recipient'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AuthorizationService } from '@/core/services/authorization-service'
import { Coordinate } from 'test/utils/get-distance-between-coordinates'
import { Role } from '@/domain/user/@types/role'

interface EditRecipientUseCaseRequest {
  requesterId: string
  recipientId: string
  name: string
  cpf: string
  email: string
  coordinate: Coordinate
}

type EditRecipientUseCaseResponse = Either<
  UnauthorizedAdminOnlyError | ResourceNotFoundError,
  { recipient: Recipient }
>

export class EditRecipientUseCase {
  constructor(
    private authorizationService: AuthorizationService,
    private recipientsRepository: RecipientsRepository,
  ) {}

  async execute({
    requesterId,
    recipientId,
    email,
    name,
    cpf,
  }: EditRecipientUseCaseRequest): Promise<EditRecipientUseCaseResponse> {
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

    recipient.name = name
    recipient.cpf = CPF.create(cpf)
    recipient.email = email

    await this.recipientsRepository.save(recipient)

    return right({ recipient })
  }
}
