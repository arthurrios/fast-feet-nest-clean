import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Recipient } from '@/domain/delivery/enterprise/entities/recipient'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'

import { Prisma, User as PrismaUser } from '@prisma/client'

export class PrismaRecipientMapper {
  static toDomain(raw: PrismaUser) {
    return Recipient.create(
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

  static toPrisma(recipient: Recipient): Prisma.UserUncheckedCreateInput {
    return {
      id: recipient.id.toString(),
      cpf: recipient.cpf.getRaw(),
      email: recipient.email,
      name: recipient.name,
      roles: {
        create: {
          role: 'RECIPIENT',
        },
      },
      password: recipient.password,
      createdAt: recipient.createdAt,
      updatedAt: recipient.updatedAt,
    }
  }
}
