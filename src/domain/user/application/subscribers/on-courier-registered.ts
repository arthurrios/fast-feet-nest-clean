import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { CreateUserUseCase } from '../use-cases/create-user'
import { CourierRegisteredEvent } from '@/domain/delivery/enterprise/events/courier-registered-event'
import { Role } from '../../@types/role'

export class OnCourierCreated implements EventHandler {
  constructor(private createUserUseCase: CreateUserUseCase) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.createNewCourierUser.bind(this),
      CourierRegisteredEvent.name,
    )
  }

  private async createNewCourierUser({ courier }: CourierRegisteredEvent) {
    await this.createUserUseCase.execute({
      name: courier.name,
      email: courier.email,
      cpf: courier.cpf.getRaw(),
      password: courier.password,
      role: Role.COURIER,
    })
  }
}
