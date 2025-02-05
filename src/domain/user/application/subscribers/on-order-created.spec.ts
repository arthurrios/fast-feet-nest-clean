import { InMemoryUserDeliveriesRepository } from 'test/repositories/in-memory-user-deliveries-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { OnOrderCreated } from './on-order-created'
import { makeOrder } from 'test/factories/make-order'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { CPF } from '../../enterprise/entities/value-objects/cpf'
import { generateValidCpf } from 'test/factories/faker-utils/generate-valid-cpf'
import { makeUser } from 'test/factories/make-user'
import { waitFor } from 'test/utils/wait-for'
import { Role } from '../../@types/role'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryUserDeliveriesRepositories: InMemoryUserDeliveriesRepository

describe('On Order Created', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryUserDeliveriesRepositories = new InMemoryUserDeliveriesRepository()

    vi.spyOn(inMemoryUsersRepository, 'findById')
    vi.spyOn(inMemoryUserDeliveriesRepositories, 'createOrUpdate')

    new OnOrderCreated(
      inMemoryUsersRepository,
      inMemoryUserDeliveriesRepositories,
    )
  })

  it('should create a new user delivery for the recipient', async () => {
    const user = makeUser({ cpf: CPF.create(generateValidCpf()) })

    inMemoryUsersRepository.create(user)

    const order = makeOrder({ recipientId: user.id })

    inMemoryOrdersRepository.create(order)

    expect(inMemoryUsersRepository.findById).toHaveBeenCalledWith(
      order.recipientId.toString(),
    )
    await waitFor(() => {
      expect(
        inMemoryUserDeliveriesRepositories.createOrUpdate,
      ).toHaveBeenCalledWith({
        cpf: user.cpf,
        deliveryId: order.id,
        role: Role.RECIPIENT,
      })
      expect(inMemoryUserDeliveriesRepositories.items).toHaveLength(1)
      expect(inMemoryUserDeliveriesRepositories.items[0]).toMatchObject({
        cpf: user.cpf,
        deliveryId: order.id,
        role: Role.RECIPIENT,
      })
    })
  })
  it('should not create delivery for non-existent user', async () => {
    const invalidUserId = new UniqueEntityID()
    const order = makeOrder({ recipientId: invalidUserId })

    inMemoryOrdersRepository.create(order)

    await waitFor(() => {
      expect(inMemoryUserDeliveriesRepositories.items).toHaveLength(0)
    })
  })
})
