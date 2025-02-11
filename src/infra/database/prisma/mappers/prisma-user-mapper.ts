import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Role } from '@/domain/user/@types/role'
import { User } from '@/domain/user/enterprise/entities/user'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'

import { Prisma, User as PrismaUser } from '@prisma/client'

export type PrismaUserWithRoles = PrismaUser & {
  roles: { role: Role }[]
}

export class PrismaUserMapper {
  static toDomain(raw: PrismaUserWithRoles) {
    return User.create(
      {
        cpf: CPF.create(raw.cpf),
        email: raw.email,
        name: raw.name,
        password: raw.password,
        roles: raw.roles.map((role) => role.role),
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
      roles: {
        createMany: {
          data: user.roles.map((role) => ({
            role: role ?? Role.COURIER,
          })),
        },
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
