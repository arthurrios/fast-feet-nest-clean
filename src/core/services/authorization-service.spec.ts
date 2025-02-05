import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { AuthorizationService } from './authorization-service'
import { UniqueEntityID } from '../entities/unique-entity-id'
import { makeUser } from 'test/factories/make-user'
import { Role } from '@/domain/user/@types/role'
import { UnauthorizedAdminOnlyError } from '../errors/errors/unauthorized-admin-only-error'

let inMemoryUsersRepository: InMemoryUsersRepository
let authorizationService: AuthorizationService

describe('Authorization Service', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    authorizationService = new AuthorizationService(inMemoryUsersRepository)
  })

  it('should authorize an admin successfully', async () => {
    const adminId = new UniqueEntityID('admin-id-123')
    const adminUser = makeUser({ role: Role.ADMIN }, adminId)

    inMemoryUsersRepository.create(adminUser)

    const result = await authorizationService.verifyRole(adminId, Role.ADMIN)

    expect(result.isRight()).toBe(true)
  })

  it('should deny access if the user is not found', async () => {
    const invalidId = new UniqueEntityID('invalid-id-123')

    const result = await authorizationService.verifyRole(invalidId, Role.ADMIN)

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedAdminOnlyError)
  })

  it('should deny access if the user is not an admin', async () => {
    const userId = new UniqueEntityID('user-id-123')
    const user = makeUser({ role: Role.COURIER }, userId)

    inMemoryUsersRepository.create(user)

    const result = await authorizationService.verifyRole(userId, Role.ADMIN)

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedAdminOnlyError)
  })
})
