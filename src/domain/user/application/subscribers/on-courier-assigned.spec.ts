import { InMemoryUserDeliveriesRepository } from 'test/repositories/in-memory-user-deliveries-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makeOrder } from 'test/factories/make-order'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { CPF } from '../../enterprise/entities/value-objects/cpf'
import { generateValidCpf } from 'test/factories/faker-utils/generate-valid-cpf'
import { makeUser } from 'test/factories/make-user'
import { waitFor } from 'test/utils/wait-for'
import { Role } from '../../@types/role'
import { OnCourierAssigned } from './on-courier-assigned'
import { InMemoryOrderAttachmentsRepository } from 'test/repositories/in-memory-order-attachments-repository'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryOrderAttachmentsRepository: InMemoryOrderAttachmentsRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryUserDeliveriesRepositories: InMemoryUserDeliveriesRepository

describe('On Order Created', () => {
  beforeEach(() => {
    inMemoryOrderAttachmentsRepository =
      new InMemoryOrderAttachmentsRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository(
      inMemoryOrderAttachmentsRepository,
    )
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryUserDeliveriesRepositories = new InMemoryUserDeliveriesRepository()

    vi.spyOn(inMemoryUsersRepository, 'findById')
    vi.spyOn(inMemoryUserDeliveriesRepositories, 'createOrUpdate')

    new OnCourierAssigned(
      inMemoryUsersRepository,
      inMemoryUserDeliveriesRepositories,
    )
  })

  it('should create a new user delivery for the recipient', async () => {
    const user = makeUser({
      cpf: CPF.create(generateValidCpf()),
      roles: [Role.COURIER],
    })

    inMemoryUsersRepository.create(user)

    const order = makeOrder({ title: 'Test order' })

    inMemoryOrdersRepository.create(order)

    order.assignCourier(user.id)
    inMemoryOrdersRepository.save(order)

    await waitFor(() => {
      expect(inMemoryUsersRepository.findById).toHaveBeenCalledWith(
        user.id.toString(),
      )
      expect(
        inMemoryUserDeliveriesRepositories.createOrUpdate,
      ).toHaveBeenCalledWith({
        cpf: user.cpf.getRaw(),
        deliveryId: order.id.toValue(),
        role: Role.COURIER,
      })
      expect(inMemoryUserDeliveriesRepositories.items).toHaveLength(1)
      expect(inMemoryUserDeliveriesRepositories.items[0]).toMatchObject({
        cpf: user.cpf.getRaw(),
        deliveryId: order.id.toValue(),
        role: Role.COURIER,
      })
    })
  })
  it('should not assign delivery for non-existent user', async () => {
    const order = makeOrder({ title: 'Test order' })
    inMemoryOrdersRepository.create(order)

    const invalidUserId = new UniqueEntityID()
    order.assignCourier(invalidUserId)
    inMemoryOrdersRepository.save(order)

    await waitFor(() => {
      expect(inMemoryUserDeliveriesRepositories.items).toHaveLength(0)
    })
  })
})
