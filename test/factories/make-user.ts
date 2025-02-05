import { faker } from '@faker-js/faker'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, UserProps } from '@/domain/user/enterprise/entities/user'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'
import { generateValidCpf } from './faker-utils/generate-valid-cpf'
import { Role } from '@/domain/user/@types/role'

export function makeUser(override: Partial<UserProps>, id?: UniqueEntityID) {
  const validCpf = generateValidCpf()

  const cpf = CPF.create(validCpf)

  const user = User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      cpf,
      role: Role.COURIER,
      ...override,
    },
    id,
  )

  return user
}
