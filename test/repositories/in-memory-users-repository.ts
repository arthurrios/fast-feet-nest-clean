import { DomainEvents } from '@/core/events/domain-events'
import { UsersRepository } from '@/domain/user/application/repositories/users-repository'
import { User } from '@/domain/user/enterprise/entities/user'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []
  async findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id.toString() === id)

    if (!user) {
      return null
    }

    return user
  }

  async findByCPF(cpf: CPF): Promise<User | null> {
    const user = this.items.find((item) => item.cpf.getRaw() === cpf.getRaw())

    if (!user) {
      return null
    }

    return user
  }

  async create(user: User): Promise<void> {
    this.items.push(user)
  }

  async save(user: User): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === user.id)

    this.items[itemIndex] = user

    DomainEvents.dispatchEventsForAggregate(user.id)
  }
}
