import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { FetchOrdersNearbyCourierUseCase } from './fetch-orders-nearby-courier'
import { OrderStatus } from '../../@types/status'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Order } from '../../enterprise/entities/order'
import { makeCourier } from 'test/factories/make-courier'
import { makeOrder } from 'test/factories/make-order'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: FetchOrdersNearbyCourierUseCase

describe('Fetch Orders Nearby Courier', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    sut = new FetchOrdersNearbyCourierUseCase(inMemoryOrdersRepository)
  })

  it('should be able to fetch orders nearby courier', async () => {
    const courier = makeCourier({ name: 'John Doe' })

    const orders: Order[] = Array.from({ length: 22 }).map((_, index) => {
      return makeOrder(
        {
          courierId: courier.id,
          recipientId: new UniqueEntityID('1'),
          status: OrderStatus.PENDING,
          coordinate: {
            latitude: -15.7962004,
            longitude: -47.9119285,
          },
          title: 'Order title',
          description: 'Order description',
        },
        new UniqueEntityID(index.toString()),
      )
    })

    inMemoryOrdersRepository.items.push(...orders)

    const page1 = await sut.execute({
      courierLatitude: -15.7962004,
      courierLongitude: -47.9119285,
      params: { page: 1 },
    })

    expect(page1.isRight() && page1.value.orders).toHaveLength(20)
  })
})
