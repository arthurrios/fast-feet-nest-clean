import { AuthorizationService } from '@/core/services/authorization-service'
import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { GetOrdersUseCase } from './get-orders'
import { authorizationServiceMock } from 'test/factories/mocks/authorization-service-mock'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Order } from '../../enterprise/entities/order'
import { makeOrder } from 'test/factories/make-order'

let authorizationService: AuthorizationService
let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: GetOrdersUseCase
describe('Get Orders', () => {
  beforeEach(() => {
    authorizationService = authorizationServiceMock('admin-id-123')
    inMemoryOrdersRepository = new InMemoryOrdersRepository()

    sut = new GetOrdersUseCase(authorizationService, inMemoryOrdersRepository)
  })
  it('should be able to get orders succesfully', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const orders: Order[] = Array.from({ length: 22 }).map((_, index) => {
      return makeOrder(
        {
          title: `Order ${index}`,
          description: `Order description ${index}`,
        },
        new UniqueEntityID(index.toString()),
      )
    })

    inMemoryOrdersRepository.items.push(...orders)

    const result = await sut.execute({
      requesterId: adminId.toValue(),
      params: { page: 1 },
    })

    expect(result.isRight() && result.value.orders).toHaveLength(20)
  })
  it('should not be able to get orders if requester is not admin', async () => {
    const requesterId = new UniqueEntityID('requester-id-123')

    const result = await sut.execute({
      requesterId: requesterId.toString(),
      params: { page: 1 },
    })

    expect(result.isLeft()).toBe(true)
  })
})
