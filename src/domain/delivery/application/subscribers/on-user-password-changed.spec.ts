import { MockUserLinkedRepository } from 'test/factories/mocks/mock-user-linked-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { OnUserPasswordChanged } from './on-user-password-changed'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'
import { generateValidCpf } from 'test/factories/faker-utils/generate-valid-cpf'
import { makeUser } from 'test/factories/make-user'
import { UserLinkedEntity } from '@/core/shared/entities/user-linked-entity'
import { waitFor } from 'test/utils/wait-for'

let inMemoryUsersRepository: InMemoryUsersRepository
let mockLinkedRepo1: MockUserLinkedRepository
let mockLinkedRepo2: MockUserLinkedRepository
let sut: OnUserPasswordChanged

describe('On User Password Changed', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    mockLinkedRepo1 = new MockUserLinkedRepository()
    mockLinkedRepo2 = new MockUserLinkedRepository()

    sut = new OnUserPasswordChanged([mockLinkedRepo1, mockLinkedRepo2])
  })

  it('should change password in all linked entities', async () => {
    const cpf = CPF.create(generateValidCpf())
    const user = makeUser({ cpf })
    const linkedEntity: UserLinkedEntity = {
      cpf: user.cpf,
      password: 'old-password',
    }

    mockLinkedRepo1.items.push(linkedEntity)
    mockLinkedRepo2.items.push(linkedEntity)

    user.changePassword('new-password')
    await inMemoryUsersRepository.save(user)

    await waitFor(() => {
      expect(mockLinkedRepo1.items[0].password).toBe('new-password')
      expect(mockLinkedRepo2.items[0].password).toBe('new-password')

      expect(mockLinkedRepo1.saveCalls).toHaveLength(1)
      expect(mockLinkedRepo2.saveCalls).toHaveLength(1)
    })
  })
})
