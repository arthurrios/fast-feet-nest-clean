import { AuthorizationService } from '@/core/services/authorization-service'
import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { authorizationServiceMock } from 'test/factories/mocks/authorization-service-mock'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeOrder } from 'test/factories/make-order'
import { GetOrderUseCase } from './get-order'

let authorizationService: AuthorizationService
let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: GetOrderUseCase
describe('Get Order', () => {
  beforeEach(() => {
    authorizationService = authorizationServiceMock('admin-id-123')
    inMemoryOrdersRepository = new InMemoryOrdersRepository()

    sut = new GetOrderUseCase(authorizationService, inMemoryOrdersRepository)
  })
  it('should be able to get order succesfully', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const order = makeOrder({ title: 'Order Title' })
    inMemoryOrdersRepository.items.push(order)

    const result = await sut.execute({
      requesterId: adminId.toValue(),
      orderId: order.id.toValue(),
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      order: expect.objectContaining({ title: 'Order Title' }),
    })
  })
  it('should not be able to get order if requester is not admin', async () => {
    const requesterId = new UniqueEntityID('requester-id-123')

    const order = makeOrder({ title: 'Order Title' })

    const result = await sut.execute({
      requesterId: requesterId.toString(),
      orderId: order.id.toValue(),
    })

    expect(result.isLeft()).toBe(true)
  })
})
