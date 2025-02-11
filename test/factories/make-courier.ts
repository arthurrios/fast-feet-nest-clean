import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  Courier,
  CourierProps,
} from '@/domain/delivery/enterprise/entities/courier'
import { faker } from '@faker-js/faker'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'
import { generateValidCpf } from './faker-utils/generate-valid-cpf'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaCourierMapper } from '@/infra/database/prisma/mappers/prisma-courier-mapper'

export function makeCourier(
  override?: Partial<CourierProps>,
  id?: UniqueEntityID,
) {
  const courier = Courier.create(
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

  return courier
}

@Injectable()
export class CourierFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaCourier(data: Partial<CourierProps> = {}): Promise<Courier> {
    const courier = makeCourier(data)

    const finalCpf =
      data.cpf && typeof data.cpf === 'string'
        ? data.cpf
        : data.cpf && typeof data.cpf !== 'string'
          ? data.cpf.getRaw()
          : courier.cpf.getRaw()

    const existingUser = await this.prisma.user.findUnique({
      where: { cpf: finalCpf },
      include: { roles: true },
    })

    if (existingUser) {
      const alreadyHasCourierRole = existingUser.roles.some(
        (role) => role.role === 'COURIER',
      )

      if (!alreadyHasCourierRole) {
        await this.prisma.user.update({
          where: { cpf: finalCpf },
          data: {
            roles: {
              create: { role: 'COURIER' },
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

      return PrismaCourierMapper.toDomain(updatedUser)
    } else {
      await this.prisma.user.create({
        data: PrismaCourierMapper.toPrisma(courier),
      })
      return courier
    }
  }
}
