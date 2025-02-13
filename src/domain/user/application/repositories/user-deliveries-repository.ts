import { Role } from '../../@types/role'
import { PaginationParams } from '@/core/repositories/pagination-params'

export interface UserDelivery {
  cpf: string
  deliveryId: string
  role: Role
}

export abstract class UserDeliveriesRepository {
  abstract createOrUpdate(delivery: UserDelivery): Promise<void>
  abstract findByCpf(
    cpf: string,
    params: PaginationParams,
  ): Promise<UserDelivery[]>
}
