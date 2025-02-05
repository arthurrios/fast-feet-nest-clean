import { InMemoryUserDeliveriesRepository } from 'test/repositories/in-memory-user-deliveries-repository'
import { FetchUserDeliveriesUseCase } from './fetch-user-deliveries'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'
import { CPF } from '../../enterprise/entities/value-objects/cpf'
import { generateValidCpf } from 'test/factories/faker-utils/generate-valid-cpf'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Role } from '../../@types/role'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryUserDeliveriesRepository: InMemoryUserDeliveriesRepository
let sut: FetchUserDeliveriesUseCase

describe('Fetch User Deliveries', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryUserDeliveriesRepository = new InMemoryUserDeliveriesRepository()

    sut = new FetchUserDeliveriesUseCase(
      inMemoryUsersRepository,
      inMemoryUserDeliveriesRepository,
    )
  })

  it('should be able to fetch user deliveries', async () => {
    const user = makeUser({ cpf: CPF.create(generateValidCpf()) })

    await inMemoryUsersRepository.create(user)

    const deliveries = [
      {
        cpf: user.cpf,
        deliveryId: new UniqueEntityID('1'),
        role: Role.RECIPIENT,
      },
      {
        cpf: user.cpf,
        deliveryId: new UniqueEntityID('2'),
        role: Role.COURIER,
      },
    ]

    inMemoryUserDeliveriesRepository.items.push(...deliveries)

    const result = await sut.execute({
      userId: user.id.toString(),
      page: 1,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.deliveries).toHaveLength(2)
      expect(result.value.deliveries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ deliveryId: deliveries[0].deliveryId }),
          expect.objectContaining({ deliveryId: deliveries[1].deliveryId }),
        ]),
      )
    }
  })

  it('should return empty array if user has no deliveries', async () => {
    const user = makeUser({ cpf: CPF.create(generateValidCpf()) })

    await inMemoryUsersRepository.create(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      page: 1,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.deliveries).toHaveLength(0)
    }
  })
  it('should handle pagination', async () => {
    const user = makeUser({ cpf: CPF.create(generateValidCpf()) })

    await inMemoryUsersRepository.create(user)

    const deliveries = Array.from({ length: 22 }).map((_, index) => ({
      cpf: user.cpf,
      deliveryId: new UniqueEntityID(`delivery${index + 1}`),
      role: index % 2 === 0 ? Role.RECIPIENT : Role.COURIER,
    }))

    inMemoryUserDeliveriesRepository.items.push(...deliveries)

    const page1 = await sut.execute({ userId: user.id.toString(), page: 1 })
    expect(page1.isRight() && page1.value.deliveries).toHaveLength(20)
  })
  it('should not return deliveries from other users', async () => {
    const user1 = makeUser({ cpf: CPF.create(generateValidCpf()) })
    await inMemoryUsersRepository.create(user1)

    const user2 = makeUser({ cpf: CPF.create(generateValidCpf()) })
    await inMemoryUsersRepository.create(user2)

    inMemoryUserDeliveriesRepository.items.push(
      {
        cpf: user1.cpf,
        deliveryId: new UniqueEntityID('1'),
        role: Role.RECIPIENT,
      },
      {
        cpf: user2.cpf,
        deliveryId: new UniqueEntityID('2'),
        role: Role.COURIER,
      },
    )

    const result = await sut.execute({
      userId: user1.id.toString(),
      page: 1,
    })

    expect(result.isRight() && result.value.deliveries).toHaveLength(1)
    expect(
      result.isRight() && result.value.deliveries[0].deliveryId.toString(),
    ).toBe('1')
  })
  it('should return an error if user does not exist', async () => {
    const result = await sut.execute({
      userId: new UniqueEntityID().toString(),
      page: 1,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
