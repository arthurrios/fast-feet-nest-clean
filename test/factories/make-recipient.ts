import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  Recipient,
  RecipientProps,
} from '@/domain/delivery/enterprise/entities/recipient'
import { faker } from '@faker-js/faker'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'
import { generateValidCpf } from './faker-utils/generate-valid-cpf'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaRecipientMapper } from '@/infra/database/prisma/mappers/prisma-recipient-mapper'

export function makeRecipient(
  override?: Partial<RecipientProps>,
  id?: UniqueEntityID,
) {
  const recipient = Recipient.create(
    {
      name: faker.person.fullName(),
      cpf: CPF.create(generateValidCpf()),
      email: faker.internet.email(),
      password: faker.internet.password(),
      createdAt: new Date(),
      ...override,
    },
    id,
  )

  return recipient
}

@Injectable()
export class RecipientFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaRecipient(
    data: Partial<RecipientProps> = {},
  ): Promise<Recipient> {
    const recipient = makeRecipient(data)

    const finalCpf =
      data.cpf && typeof data.cpf === 'string'
        ? data.cpf
        : data.cpf && typeof data.cpf !== 'string'
          ? data.cpf.getRaw()
          : recipient.cpf.getRaw()

    const existingUser = await this.prisma.user.findUnique({
      where: { cpf: finalCpf },
      include: { roles: true },
    })

    if (existingUser) {
      const alreadyHasRecipientRole = existingUser.roles.some(
        (role) => role.role === 'RECIPIENT',
      )

      if (!alreadyHasRecipientRole) {
        await this.prisma.user.update({
          where: { cpf: finalCpf },
          data: {
            roles: {
              create: { role: 'RECIPIENT' },
            },
          },
        })
      }

      const updatedUser = await this.prisma.user.findUnique({
        where: { cpf: finalCpf },
        include: { roles: true },
      })

      if (!updatedUser) {
        throw new Error(`User with CPF ${finalCpf} not found after update`)
      }

      return PrismaRecipientMapper.toDomain(updatedUser)
    } else {
      await this.prisma.user.create({
        data: PrismaRecipientMapper.toPrisma(recipient),
      })
      return recipient
    }
  }
}
