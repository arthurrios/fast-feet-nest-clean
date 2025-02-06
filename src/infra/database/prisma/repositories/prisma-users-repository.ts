import { UsersRepository } from '@/domain/user/application/repositories/users-repository'
import { User } from '@/domain/user/enterprise/entities/user'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaUserMapper } from '../mappers/prisma-user-mapper'

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }

  findByCPF(cpf: CPF): Promise<User | null> {
    throw new Error('Method not implemented.')
  }

  create(user: User): Promise<void> {
    throw new Error('Method not implemented.')
  }

  save(user: User): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
