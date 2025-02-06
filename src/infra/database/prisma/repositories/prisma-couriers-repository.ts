import { UsersRepository } from '@/domain/user/application/repositories/users-repository'
import { User } from '@/domain/user/enterprise/entities/user'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaUserMapper } from '../mappers/prisma-user-mapper'
import { CouriersRepository } from '@/domain/delivery/application/repository/courier-repository'
import { Courier } from '@/domain/delivery/enterprise/entities/courier'
import { PaginationParams } from '@/core/repositories/pagination-params'

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

    const user = PrismaUserMapper.toDomain(rawUser)

    return Courier.fromUser(user)
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
