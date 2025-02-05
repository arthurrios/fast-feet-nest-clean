import { UsersRepository } from '@/domain/user/application/repositories/users-repository'
import { Either, left, right } from '../either'
import { UnauthorizedAdminOnlyError } from '../errors/errors/unauthorized-admin-only-error'
import { UniqueEntityID } from '../entities/unique-entity-id'
import { Role } from '@/domain/user/@types/role'

export class AuthorizationService {
  constructor(private usersRepository: UsersRepository) {}

  async verifyRole(
    id: UniqueEntityID,
    requiredRole: Role,
  ): Promise<Either<UnauthorizedAdminOnlyError, void>> {
    const user = await this.usersRepository.findById(id.toValue())

    if (!user || user.role !== requiredRole) {
      console.warn(
        `Authorization denied. User with ID: ${id.toValue()} attempted to access an admin-only resource.`,
      )
      return left(new UnauthorizedAdminOnlyError())
    }

    console.log(
      `Authorization successful. Admin with ID: ${id.toValue()} accessed the resource.`,
    )
    return right(undefined)
  }
}
