import { PaginationParams } from '@/core/repositories/pagination-params'
import {
  UserDeliveriesRepository,
  UserDelivery,
} from '@/domain/user/application/repositories/user-deliveries-repository'

export class InMemoryUserDeliveriesRepository
  implements UserDeliveriesRepository
{
  public items: UserDelivery[] = []

  async createOrUpdate(delivery: UserDelivery): Promise<void> {
    const index = this.items.findIndex(
      (item) =>
        item.deliveryId === delivery.deliveryId && item.role === delivery.role,
    )

    if (index >= 0) {
      this.items[index] = delivery
    } else {
      this.items.push(delivery)
    }
  }

  async findByCpf(
    cpf: string,
    { page }: PaginationParams,
  ): Promise<UserDelivery[]> {
    const deliveries = this.items
      .filter((item) => item.cpf === cpf)
      .slice((page - 1) * 20, page * 20)

    return deliveries
  }
}
