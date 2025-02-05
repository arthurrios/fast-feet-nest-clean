import { EventHandler } from '@/core/events/event-handler'
import { UsersRepository } from '../repositories/users-repository'
import { CourierAssignedEvent } from '@/domain/delivery/enterprise/events/courier-assigned-event'
import { Role } from '../../@types/role'
import { UserDeliveriesRepository } from '../repositories/user-deliveries-repository'
import { DomainEvents } from '@/core/events/domain-events'

export class OnCourierAssigned implements EventHandler {
  constructor(
    private usersRepository: UsersRepository,
    private userDeliveriesRepository: UserDeliveriesRepository,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.assignOrderToCourier.bind(this),
      CourierAssignedEvent.name,
    )
  }

  private async assignOrderToCourier({
    courierId,
    orderId,
  }: CourierAssignedEvent) {
    const courier = await this.usersRepository.findById(courierId.toString())
    if (!courier) return

    await this.userDeliveriesRepository.createOrUpdate({
      cpf: courier.cpf,
      deliveryId: orderId,
      role: Role.COURIER,
    })
  }
}
