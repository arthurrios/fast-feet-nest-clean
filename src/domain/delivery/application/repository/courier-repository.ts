import { PaginationParams } from '@/core/repositories/pagination-params'
import { Courier } from '../../enterprise/entities/courier'
import { UserLinkedEntityRepository } from '@/core/types/repositories/user-linked-entity-repository'

export abstract class CouriersRepository extends UserLinkedEntityRepository<Courier> {
  abstract findById(id: string): Promise<Courier | null>
  abstract findByCpf(cpf: string): Promise<Courier | null>
  abstract findMany(params: PaginationParams): Promise<Courier[]>
  abstract create(courier: Courier): Promise<void>
  abstract save(courier: Courier): Promise<void>
  abstract delete(courier: Courier): Promise<void>
}
