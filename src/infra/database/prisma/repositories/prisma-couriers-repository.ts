import { PaginationParams } from '@/core/repositories/pagination-params'
import { CouriersRepository } from '@/domain/delivery/application/repository/courier-repository'
import { Courier } from '@/domain/delivery/enterprise/entities/courier'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaCouriersRepository implements CouriersRepository {
  findById(id: string): Promise<Courier | null> {
    throw new Error('Method not implemented.')
  }

  findByCpf(cpf: string): Promise<Courier | null> {
    throw new Error('Method not implemented.')
  }

  findMany(params: PaginationParams): Promise<Courier[]> {
    throw new Error('Method not implemented.')
  }

  create(courier: Courier): Promise<void> {
    throw new Error('Method not implemented.')
  }

  save(courier: Courier): Promise<void> {
    throw new Error('Method not implemented.')
  }

  delete(courier: Courier): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
