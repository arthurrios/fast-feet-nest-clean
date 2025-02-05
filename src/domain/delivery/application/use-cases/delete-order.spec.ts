import { AuthorizationService } from '@/core/services/authorization-service'
import { makeOrder } from 'test/factories/make-order'
import { authorizationServiceMock } from 'test/factories/mocks/authorization-service-mock'
import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { EditOrderUseCase } from './edit-order'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DeleteOrderUseCase } from './delete-order'

let authorizationService: AuthorizationService
let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: DeleteOrderUseCase

describe('Delete Order', () => {
  beforeEach(() => {
    authorizationService = authorizationServiceMock('admin-id-123')
    inMemoryOrdersRepository = new InMemoryOrdersRepository()

    sut = new DeleteOrderUseCase(authorizationService, inMemoryOrdersRepository)
  })
  it('should be able to delete a order succesfully', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const order = makeOrder({ title: 'Order Title' })

    await inMemoryOrdersRepository.create(order)

    await sut.execute({
      orderId: order.id.toValue(),
      requesterId: adminId.toValue(),
    })

    expect(inMemoryOrdersRepository.items).toHaveLength(0)
  })
  it('should not be able to edit order if requester is not admin', async () => {
    const requesterId = new UniqueEntityID('requester-id-123')

    const order = makeOrder({ title: 'Order Title' })

    const result = await sut.execute({
      requesterId: requesterId.toString(),
      orderId: order.id.toValue(),
    })

    expect(result.isLeft()).toBe(true)
  })
})
