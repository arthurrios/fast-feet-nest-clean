import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Courier } from '@/domain/delivery/enterprise/entities/courier'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'

import { Prisma, User as PrismaUser } from '@prisma/client'

export class PrismaCourierMapper {
  static toDomain(raw: PrismaUser) {
    return Courier.create(
      {
        cpf: CPF.create(raw.cpf),
        email: raw.email,
        name: raw.name,
        password: raw.password,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(courier: Courier): Prisma.UserUncheckedCreateInput {
    return {
      id: courier.id.toString(),
      cpf: courier.cpf.getRaw(),
      email: courier.email,
      name: courier.name,
      role: 'COURIER',
      password: courier.password,
      createdAt: courier.createdAt,
      updatedAt: courier.updatedAt,
    }
  }
}
