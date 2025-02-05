import { PaginationParams } from '@/core/repositories/pagination-params'
import { RecipientsRepository } from '@/domain/delivery/application/repository/recipient-repository'
import { Recipient } from '@/domain/delivery/enterprise/entities/recipient'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaRecipientRepository implements RecipientsRepository {
  findById(id: string): Promise<Recipient | null> {
    throw new Error('Method not implemented.')
  }

  findByCpf(cpf: string): Promise<Recipient | null> {
    throw new Error('Method not implemented.')
  }

  findMany(params: PaginationParams): Promise<Recipient[]> {
    throw new Error('Method not implemented.')
  }

  create(recipient: Recipient): Promise<void> {
    throw new Error('Method not implemented.')
  }

  save(recipient: Recipient): Promise<void> {
    throw new Error('Method not implemented.')
  }

  delete(recipient: Recipient): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
