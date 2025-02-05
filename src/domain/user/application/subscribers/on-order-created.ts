import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { Role } from '../../@types/role'
import { UsersRepository } from '../repositories/users-repository'
import { OrderCreatedEvent } from '@/domain/delivery/enterprise/events/order-created-event'
import { UserDeliveriesRepository } from '../repositories/user-deliveries-repository'

export class OnOrderCreated implements EventHandler {
  constructor(
    private usersRepository: UsersRepository,
    private userDeliveriesRepository: UserDeliveriesRepository,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.createOrUpdateRecipientDeliveries.bind(this),
      OrderCreatedEvent.name,
    )
  }

  private async createOrUpdateRecipientDeliveries({
    order,
  }: OrderCreatedEvent) {
    const recipient = await this.usersRepository.findById(
      order.recipientId.toString(),
    )
    if (!recipient) return

    await this.userDeliveriesRepository.createOrUpdate({
      cpf: recipient.cpf,
      deliveryId: order.id,
      role: Role.RECIPIENT,
    })
  }
}
