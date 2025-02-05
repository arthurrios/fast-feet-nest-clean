import { FakeHasher } from 'test/cryptography/fake-hasher'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'

import { makeUser } from 'test/factories/make-user'
import { AuthorizationService } from '@/core/services/authorization-service'
import { authorizationServiceMock } from 'test/factories/mocks/authorization-service-mock'
import { ChangeUserPasswordUseCase } from './change-user-password'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

let authorizationService: AuthorizationService
let inMemoryUsersRepository: InMemoryUsersRepository
let fakeHasher: FakeHasher
let sut: ChangeUserPasswordUseCase

describe('Change User Password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authorizationService = authorizationServiceMock('admin-id-123')
    inMemoryUsersRepository = new InMemoryUsersRepository()
    fakeHasher = new FakeHasher()

    sut = new ChangeUserPasswordUseCase(
      authorizationService,
      fakeHasher,
      inMemoryUsersRepository,
    )
  })

  it('should be able to change user password', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const user = makeUser({
      password: await fakeHasher.hash('123456'),
    })

    inMemoryUsersRepository.items.push(user)

    const result = await sut.execute({
      requesterId: adminId.toString(),
      userId: user.id.toString(),
      newPassword: '454545',
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryUsersRepository.items[0]).toMatchObject(
      expect.objectContaining({
        password: await fakeHasher.hash('454545'),
      }),
    )
  })
  it('should not change user password if requester is not admin', async () => {
    const requesterId = new UniqueEntityID('requester-id-123')

    const user = makeUser({
      password: await fakeHasher.hash('123456'),
    })

    inMemoryUsersRepository.items.push(user)

    const result = await sut.execute({
      requesterId: requesterId.toString(),
      userId: user.id.toString(),
      newPassword: '454545',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedAdminOnlyError)
  })
  it('should not change user password if user does not exist', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const user = makeUser({
      password: await fakeHasher.hash('123456'),
    })

    const result = await sut.execute({
      requesterId: adminId.toString(),
      userId: user.id.toString(),
      newPassword: '454545',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
