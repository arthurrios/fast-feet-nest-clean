import { EventHandler } from '@/core/events/event-handler'
import { SendNotificationUseCase } from '../use-cases/send-notification'
import { OrderStatusChangedEvent } from '@/domain/delivery/enterprise/events/order-status-changed-event'
import { DomainEvents } from '@/core/events/domain-events'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OnOrderStatusChanged implements EventHandler {
  constructor(private sendNotification: SendNotificationUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendOrderStatusChangedNotification.bind(this),
      OrderStatusChangedEvent.name,
    )
  }

  private async sendOrderStatusChangedNotification({
    order,
  }: OrderStatusChangedEvent) {
    await this.sendNotification.execute({
      title: 'Order status changed',
      content: `Order #${order.id.toString()} status has changed to "${order.status}"`,
      recipientId: order.recipientId.toString(),
    })
  }
}
