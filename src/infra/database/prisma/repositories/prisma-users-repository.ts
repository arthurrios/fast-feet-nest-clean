import { UsersRepository } from '@/domain/user/application/repositories/users-repository'
import { User } from '@/domain/user/enterprise/entities/user'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import {
  PrismaUserMapper,
  PrismaUserWithRoles,
} from '../mappers/prisma-user-mapper'

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        roles: true,
      },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user as PrismaUserWithRoles)
  }

  async findByCpf(cpf: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        cpf,
      },
      include: {
        roles: true,
      },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user as PrismaUserWithRoles)
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        roles: true,
      },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user as PrismaUserWithRoles)
  }

  async create(user: User): Promise<void> {
    const data = PrismaUserMapper.toPrisma(user)

    await this.prisma.user.create({
      data,
    })
  }

  async save(user: User): Promise<void> {
    const data = PrismaUserMapper.toPrisma(user)

    await this.prisma.user.update({
      where: {
        id: user.id.toString(),
      },
      data,
    })
  }
}
