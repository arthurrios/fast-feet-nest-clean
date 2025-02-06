import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Role } from '@/domain/user/@types/role'
import { User } from '@/domain/user/enterprise/entities/user'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'

import { Prisma, User as PrismaUser } from '@prisma/client'

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser) {
    return User.create(
      {
        cpf: CPF.create(raw.cpf),
        email: raw.email,
        name: raw.name,
        password: raw.password,
        role: Role[raw.role as keyof typeof Role],
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id.toString(),
      cpf: user.cpf.getRaw(),
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
