import { AuthorizationService } from '@/core/services/authorization-service'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Either, left, right } from '@/core/either'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'

export function authorizationServiceMock(
  adminId: string,
): AuthorizationService {
  return {
    verifyRole: vi.fn(
      async (
        id: UniqueEntityID,
      ): Promise<Either<UnauthorizedAdminOnlyError, void>> => {
        if (id.toValue() === adminId) {
          return right(undefined)
        }
        return left(new UnauthorizedAdminOnlyError())
      },
    ),
  } as unknown as AuthorizationService
}
