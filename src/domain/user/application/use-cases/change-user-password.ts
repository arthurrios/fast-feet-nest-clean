import { Either, left, right } from '@/core/either'
import { User } from '../../enterprise/entities/user'
import { UsersRepository } from '../repositories/users-repository'
import { AuthorizationService } from '@/core/services/authorization-service'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { HashGenerator } from '../cryptography/hash-generator'
import { Role } from '../../@types/role'

interface ChangeUserPasswordUseCaseRequest {
  requesterId: string
  userId: string
  newPassword: string
}

type ChangeUserPasswordUseCaseResponse = Either<
  UnauthorizedAdminOnlyError,
  { user: User }
>

export class ChangeUserPasswordUseCase {
  constructor(
    private authorizationService: AuthorizationService,
    private hashGenerator: HashGenerator,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    requesterId,
    userId,
    newPassword,
  }: ChangeUserPasswordUseCaseRequest): Promise<ChangeUserPasswordUseCaseResponse> {
    const authResult = await this.authorizationService.verifyRole(
      new UniqueEntityID(requesterId),
      Role.ADMIN,
    )
    if (authResult.isLeft()) {
      return left(authResult.value)
    }

    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('user'))
    }

    const newPasswordHashed = await this.hashGenerator.hash(newPassword)

    user.changePassword(newPasswordHashed)

    await this.usersRepository.save(user)

    return right({ user })
  }
}
