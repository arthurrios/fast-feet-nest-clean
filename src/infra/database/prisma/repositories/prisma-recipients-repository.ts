import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { RecipientsRepository } from '@/domain/delivery/application/repository/recipient-repository'
import { Recipient } from '@/domain/delivery/enterprise/entities/recipient'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { PrismaRecipientMapper } from '../mappers/prisma-recipient-mapper'

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

    return PrismaRecipientMapper.toDomain(rawUser)
  }

  async findByCpf(cpf: string): Promise<Recipient | null> {
    const rawUser = await this.prisma.user.findUnique({
      where: {
        cpf,
      },
    })

    if (!rawUser) {
      return null
    }

    return PrismaRecipientMapper.toDomain(rawUser)
  }

  async findMany({ page }: PaginationParams): Promise<Recipient[]> {
    const rawUsers = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    })

    return rawUsers.map(PrismaRecipientMapper.toDomain)
  }

  async create(recipient: Recipient): Promise<void> {
    const data = PrismaRecipientMapper.toPrisma(recipient)

    await this.prisma.user.create({
      data,
    })
  }

  async save(recipient: Recipient): Promise<void> {
    const data = PrismaRecipientMapper.toPrisma(recipient)

    await this.prisma.user.update({
      where: {
        id: recipient.id.toString(),
      },
      data,
    })
  }

  async delete(recipient: Recipient): Promise<void> {
    const data = PrismaRecipientMapper.toPrisma(recipient)

    await this.prisma.user.delete({
      where: {
        id: recipient.id.toString(),
      },
    })
  }
}
