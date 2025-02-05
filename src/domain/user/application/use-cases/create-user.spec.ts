import { FakeHasher } from 'test/cryptography/fake-hasher'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'

import { makeUser } from 'test/factories/make-user'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'
import { generateValidCpf } from 'test/factories/faker-utils/generate-valid-cpf'
import { CreateUserUseCase } from './create-user'

let inMemoryUsersRepository: InMemoryUsersRepository
let fakeHasher: FakeHasher
let sut: CreateUserUseCase

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    fakeHasher = new FakeHasher()

    sut = new CreateUserUseCase(inMemoryUsersRepository, fakeHasher)
  })

  it('should create a user succesfully', async () => {
    const user = makeUser({ cpf: CPF.create(generateValidCpf()) })

    const result = await sut.execute({
      name: user.name,
      cpf: user.cpf.getRaw(),
      email: user.email,
      password: user.password,
      role: user.role,
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      user: inMemoryUsersRepository.items[0],
    })
  })
  it('should hash user password upon registration', async () => {
    const user = makeUser({ password: '123456' })
    const result = await sut.execute({
      name: user.name,
      cpf: user.cpf.getRaw(),
      email: user.email,
      password: user.password,
      role: user.role,
    })

    const hashedPassword = await fakeHasher.hash('123456')

    expect(result.isRight()).toBe(true)
    expect(inMemoryUsersRepository.items[0].password).toEqual(hashedPassword)
  })
})
