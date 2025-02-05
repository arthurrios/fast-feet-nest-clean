import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { FetchCourierOrdersUseCase } from './fetch-courier-orders'
import { makeCourier } from 'test/factories/make-courier'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Order } from '../../enterprise/entities/order'
import { OrderStatus } from '../../@types/status'
import { InMemoryCouriersRepository } from 'test/repositories/in-memory-couriers-repository'
import { makeOrder } from 'test/factories/make-order'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryCouriersRepository: InMemoryCouriersRepository
let sut: FetchCourierOrdersUseCase
describe('Fetch Courier Orders', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    inMemoryCouriersRepository = new InMemoryCouriersRepository()

    sut = new FetchCourierOrdersUseCase(inMemoryOrdersRepository)
  })
  it('should be able to fetch courier orders', async () => {
    const courier = makeCourier({ name: 'John Doe' })

    const orders: Order[] = Array.from({ length: 22 }).map((_, index) => {
      return makeOrder(
        {
          courierId: courier.id,
          recipientId: new UniqueEntityID('1'),
          status: OrderStatus.PENDING,
          coordinate: {
            latitude: 0,
            longitude: 0,
          },
          title: 'Order title',
          description: 'Order description',
        },
        new UniqueEntityID(index.toString()),
      )
    })

    inMemoryOrdersRepository.items.push(...orders)

    const page1 = await sut.execute({
      courierId: courier.id.toString(),
      params: { page: 1 },
    })
    expect(page1.isRight() && page1.value.orders).toHaveLength(20)
  })
  it('should not return orders from other couriers', async () => {
    const courier1 = makeCourier({ name: 'John Doe' })
    await inMemoryCouriersRepository.create(courier1)

    const courier2 = makeCourier({ name: 'Jane Doe' })
    await inMemoryCouriersRepository.create(courier2)

    const order1 = makeOrder({ courierId: courier1.id })
    const order2 = makeOrder({ courierId: courier2.id })

    inMemoryOrdersRepository.items.push(order1, order2)

    const result = await sut.execute({
      courierId: courier1.id.toString(),
      params: { page: 1 },
    })

    expect(result.isRight() && result.value.orders).toHaveLength(1)
    expect(
      result.isRight() && result.value.orders[0]?.courierId?.toString(),
    ).toBe(courier1.id.toString())
  })
})
