import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CouriersRepository } from '@/domain/delivery/application/repository/courier-repository'
import { Courier } from '@/domain/delivery/enterprise/entities/courier'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { PrismaCourierMapper } from '../mappers/prisma-courier-mapper'

@Injectable()
export class PrismaCouriersRepository implements CouriersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Courier | null> {
    const rawUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    })

    if (!rawUser) {
      return null
    }

    return PrismaCourierMapper.toDomain(rawUser)
  }

  async findByCpf(cpf: string): Promise<Courier | null> {
    const rawUser = await this.prisma.user.findUnique({
      where: {
        cpf,
      },
    })

    if (!rawUser) {
      return null
    }

    return PrismaCourierMapper.toDomain(rawUser)
  }

  async findMany({ page }: PaginationParams): Promise<Courier[]> {
    const rawUsers = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    })

    return rawUsers.map(PrismaCourierMapper.toDomain)
  }

  async create(courier: Courier): Promise<void> {
    const data = PrismaCourierMapper.toPrisma(courier)

    await this.prisma.user.create({
      data,
    })
  }

  async save(courier: Courier): Promise<void> {
    const data = PrismaCourierMapper.toPrisma(courier)

    await this.prisma.user.update({
      where: {
        id: courier.id.toString(),
      },
      data,
    })
  }

  async delete(courier: Courier): Promise<void> {
    const data = PrismaCourierMapper.toPrisma(courier)

    await this.prisma.user.delete({
      where: {
        id: courier.id.toString(),
      },
    })
  }
}
