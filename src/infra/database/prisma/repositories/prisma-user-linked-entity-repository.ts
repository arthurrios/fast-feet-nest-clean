import { UserLinkedEntity } from '@/core/shared/entities/user-linked-entity'
import { UserLinkedEntityRepository } from '@/core/types/repositories/user-linked-entity-repository'
import { PrismaService } from '../prisma.service'
import { Injectable } from '@nestjs/common'
import {
  PrismaUserMapper,
  PrismaUserWithRoles,
} from '../mappers/prisma-user-mapper'

@Injectable()
export class PrismaUserLinkedEntityRepository extends UserLinkedEntityRepository<UserLinkedEntity> {
  constructor(private prisma: PrismaService) {
    super()
  }

  async findByCpf(cpf: string): Promise<UserLinkedEntity | null> {
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

  async save(entity: UserLinkedEntity): Promise<void> {
    await this.prisma.user.update({
      where: {
        cpf: entity.cpf.getRaw(),
      },
      data: {
        password: entity.password,
      },
    })
  }
}
