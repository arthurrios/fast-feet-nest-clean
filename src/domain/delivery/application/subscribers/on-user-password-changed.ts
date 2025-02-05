import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { UserLinkedEntity } from '@/core/shared/entities/user-linked-entity'
import { UserLinkedEntityRepository } from '@/core/types/repositories/user-linked-entity-repository'
import { UserPasswordChangedEvent } from '@/domain/user/enterprise/events/user-password-changed-event'

export class OnUserPasswordChanged implements EventHandler {
  constructor(
    private repositories: UserLinkedEntityRepository<UserLinkedEntity>[],
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.changeDeliveryUserPassword.bind(this),
      UserPasswordChangedEvent.name,
    )
  }

  private async changeDeliveryUserPassword({ user }: UserPasswordChangedEvent) {
    for (const repository of this.repositories) {
      const entity = await repository.findByCpf(user.cpf.toString())
      if (entity) {
        entity.password = user.password
        await repository.save(entity)
      }
    }
  }
}
