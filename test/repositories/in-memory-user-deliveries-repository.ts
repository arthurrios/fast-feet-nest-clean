import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { PaginationParams } from '@/core/repositories/pagination-params'
import {
  UserDeliveriesRepository,
  UserDelivery,
} from '@/domain/user/application/repositories/user-deliveries-repository'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'

export class InMemoryUserDeliveriesRepository
  implements UserDeliveriesRepository
{
  public items: UserDelivery[] = []

  async createOrUpdate(delivery: UserDelivery): Promise<void> {
    const index = this.items.findIndex(
      (item) =>
        item.deliveryId.equals(delivery.deliveryId) &&
        item.role === delivery.role,
    )

    if (index >= 0) {
      this.items[index] = delivery
    } else {
      this.items.push(delivery)
    }
  }

  // async findByCpf(cpf: CPF, ): Promise<UserDelivery[]> {
  //   return this.items.filter((item) => item.cpf.equals(cpf))
  // }

  async findByCpf(
    cpf: CPF,
    { page }: PaginationParams,
  ): Promise<UserDelivery[]> {
    const deliveries = this.items
      .filter((item) => item.cpf.equals(cpf))
      .slice((page - 1) * 20, page * 20)

    return deliveries
  }
}
