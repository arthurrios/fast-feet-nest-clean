import { MockInstance } from 'vitest'
import { SendNotificationUseCase } from '../use-cases/send-notification'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { OnOrderStatusChanged } from './on-order-status-changed'
import { makeOrder } from 'test/factories/make-order'
import { OrderStatus } from '@/domain/delivery/@types/status'
import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { InMemoryOrderAttachmentsRepository } from 'test/repositories/in-memory-order-attachments-repository'
import { waitFor } from 'test/utils/wait-for'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let inMemoryOrderAttachmentsRepository: InMemoryOrderAttachmentsRepository
let sendNotificationUseCase: SendNotificationUseCase

let sendNotificationExecuteSpy: MockInstance

describe('On Order Status Changed', () => {
  beforeEach(() => {
    inMemoryOrderAttachmentsRepository =
      new InMemoryOrderAttachmentsRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository(
      inMemoryOrderAttachmentsRepository,
    )
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemoryNotificationsRepository,
    )

    sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, 'execute')

    new OnOrderStatusChanged(sendNotificationUseCase)
  })

  it('should be able to send a notification when order status changed', async () => {
    const order = makeOrder({ status: OrderStatus.PICKED_UP })

    inMemoryOrdersRepository.items.push(order)

    order.updateStatus(OrderStatus.DELIVERED)

    inMemoryOrdersRepository.save(order)

    await waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalledWith({
        title: 'Order status changed',
        content: `Order #${order.id} status has changed to "${order.status}"`,
        recipientId: order.recipientId.toString(),
      })
    })
  })
})
