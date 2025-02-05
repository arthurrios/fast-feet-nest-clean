import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { CPF } from '../../enterprise/entities/value-objects/cpf'
import { Role } from '../../@types/role'
import { PaginationParams } from '@/core/repositories/pagination-params'

export interface UserDelivery {
  cpf: CPF
  deliveryId: UniqueEntityID
  role: Role
}

export abstract class UserDeliveriesRepository {
  abstract createOrUpdate(delivery: UserDelivery): Promise<void>
  abstract findByCpf(
    cpf: CPF,
    params: PaginationParams,
  ): Promise<UserDelivery[]>
}
