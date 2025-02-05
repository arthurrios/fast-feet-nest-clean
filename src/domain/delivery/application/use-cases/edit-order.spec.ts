import { AuthorizationService } from '@/core/services/authorization-service'
import { makeOrder } from 'test/factories/make-order'
import { authorizationServiceMock } from 'test/factories/mocks/authorization-service-mock'
import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { EditOrderUseCase } from './edit-order'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let authorizationService: AuthorizationService
let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: EditOrderUseCase

describe('Edit Order', () => {
  beforeEach(() => {
    authorizationService = authorizationServiceMock('admin-id-123')
    inMemoryOrdersRepository = new InMemoryOrdersRepository()

    sut = new EditOrderUseCase(authorizationService, inMemoryOrdersRepository)
  })
  it('should be able to edit a order succesfully', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const order = makeOrder({ title: 'Order title' })

    await inMemoryOrdersRepository.create(order)

    await sut.execute({
      orderId: order.id.toValue(),
      requesterId: adminId.toValue(),
      title: 'Order Altered Title',
      description: order.description,
      coordinate: order.coordinate,
    })

    expect(inMemoryOrdersRepository.items[0].title).toBe('Order Altered Title')
  })
  it('should not be able to edit order if requester is not admin', async () => {
    const requesterId = new UniqueEntityID('requester-id-123')

    const order = makeOrder({ title: 'Order title' })

    const result = await sut.execute({
      orderId: order.id.toValue(),
      requesterId: requesterId.toValue(),
      title: 'Order Altered Title',
      description: order.description,
      coordinate: order.coordinate,
    })

    expect(result.isLeft()).toBe(true)
  })
})
