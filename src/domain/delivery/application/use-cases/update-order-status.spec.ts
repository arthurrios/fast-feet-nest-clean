import { makeOrder } from 'test/factories/make-order'
import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { OrderStatus } from '../../@types/status'
import { UpdateOrderStatusUseCase } from './update-order-status'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { NotAllowedError } from '../../../../core/errors/errors/not-allowed-error'
import { InMemoryOrderAttachmentsRepository } from 'test/repositories/in-memory-order-attachments-repository'
import { makeOrderAttachment } from 'test/factories/make-order-attachment'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryOrderAttachmentsRepository: InMemoryOrderAttachmentsRepository
let sut: UpdateOrderStatusUseCase

describe('Update Order', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    inMemoryOrderAttachmentsRepository =
      new InMemoryOrderAttachmentsRepository()
    sut = new UpdateOrderStatusUseCase(
      inMemoryOrdersRepository,
      inMemoryOrderAttachmentsRepository,
    )
  })
  it('should be able to update an order status', async () => {
    const order = makeOrder({
      title: 'Order 1',
      courierId: new UniqueEntityID('1'),
    })

    inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      courierId: '1',
      orderId: order.id.toString(),
      status: OrderStatus.PICKED_UP,
      attachmentsIds: [],
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      order: expect.objectContaining({
        status: OrderStatus.PICKED_UP,
      }),
    })
    expect(inMemoryOrdersRepository.items[0]).toMatchObject({
      status: OrderStatus.PICKED_UP,
    })
  })
  it('should not be able to update an order status if the order does not exist', async () => {
    const result = await sut.execute({
      courierId: '1',
      orderId: '1',
      status: OrderStatus.PICKED_UP,
      attachmentsIds: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
  it('should not be able to update an order status to PICKED_UP if the courier is not provided', async () => {
    const order = makeOrder({
      title: 'Order 1',
      courierId: new UniqueEntityID('1'),
    })

    inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      orderId: order.id.toString(),
      status: OrderStatus.PICKED_UP,
      attachmentsIds: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
  it('should not be able to update an order status to DELIVERED if the courier is not assigned to the order', async () => {
    const order = makeOrder({
      title: 'Order 1',
      courierId: new UniqueEntityID('1'),
    })

    inMemoryOrdersRepository.create(order)

    inMemoryOrderAttachmentsRepository.items.push(
      makeOrderAttachment({
        orderId: order.id,
        attachmentId: new UniqueEntityID('1'),
      }),
      makeOrderAttachment({
        orderId: order.id,
        attachmentId: new UniqueEntityID('2'),
      }),
    )

    const result = await sut.execute({
      courierId: '2',
      orderId: order.id.toString(),
      status: OrderStatus.DELIVERED,
      attachmentsIds: ['1', '2'],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to update an order status to DELIVERED if the attachments are not provided', async () => {
    const order = makeOrder({
      title: 'Order 1',
      courierId: new UniqueEntityID('1'),
    })

    inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      courierId: '1',
      orderId: order.id.toString(),
      status: OrderStatus.DELIVERED,
      attachmentsIds: ['1'],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
  it('should be able to update an order status to DELIVERED', async () => {
    const order = makeOrder({
      title: 'Order 1',
      courierId: new UniqueEntityID('1'),
    })

    inMemoryOrdersRepository.create(order)

    inMemoryOrderAttachmentsRepository.items.push(
      makeOrderAttachment({
        orderId: order.id,
        attachmentId: new UniqueEntityID('1'),
      }),
      makeOrderAttachment({
        orderId: order.id,
        attachmentId: new UniqueEntityID('2'),
      }),
    )

    const result = await sut.execute({
      courierId: '1',
      orderId: order.id.toString(),
      status: OrderStatus.DELIVERED,
      attachmentsIds: ['1', '2'],
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      order: expect.objectContaining({
        status: OrderStatus.DELIVERED,
      }),
    })
    expect(inMemoryOrdersRepository.items[0]).toMatchObject({
      status: OrderStatus.DELIVERED,
    })
    expect(inMemoryOrderAttachmentsRepository.items).toHaveLength(2)
    expect(inMemoryOrderAttachmentsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          orderId: order.id,
          attachmentId: new UniqueEntityID('1'),
        }),
        expect.objectContaining({
          orderId: order.id,
          attachmentId: new UniqueEntityID('2'),
        }),
      ]),
    )
  })
})
