import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaUserMapper } from '../mappers/prisma-user-mapper'
import { Recipient } from '@/domain/delivery/enterprise/entities/recipient'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { RecipientsRepository } from '@/domain/delivery/application/repository/recipient-repository'

@Injectable()
export class PrismaRecipientsRepository implements RecipientsRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Recipient | null> {
    const rawUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    })

    if (!rawUser) {
      return null
    }

    const user = PrismaUserMapper.toDomain(rawUser)

    return Recipient.fromUser(user)
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
