import { AuthorizationService } from '@/core/services/authorization-service'
import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { GetRecipientsUseCase } from './get-recipients'
import { authorizationServiceMock } from 'test/factories/mocks/authorization-service-mock'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Recipient } from '../../enterprise/entities/recipient'
import { makeRecipient } from 'test/factories/make-recipient'
import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'
import { generateValidCpf } from 'test/factories/faker-utils/generate-valid-cpf'

let authorizationService: AuthorizationService
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let sut: GetRecipientsUseCase
describe('Get Recipients', () => {
  beforeEach(() => {
    authorizationService = authorizationServiceMock('admin-id-123')
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()

    sut = new GetRecipientsUseCase(
      authorizationService,
      inMemoryRecipientsRepository,
    )
  })
  it('should be able to get recipients succesfully', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const recipients: Recipient[] = Array.from({ length: 22 }).map(
      (_, index) => {
        return makeRecipient(
          {
            name: `Recipient ${index}`,
            cpf: CPF.create(generateValidCpf()),
            email: `recipient.${index}@email.com`,
          },
          new UniqueEntityID(index.toString()),
        )
      },
    )

    inMemoryRecipientsRepository.items.push(...recipients)

    const result = await sut.execute({
      requesterId: adminId.toValue(),
      params: { page: 1 },
    })

    expect(result.isRight() && result.value.recipients).toHaveLength(20)
  })
  it('should not be able to get recipients if requester is not admin', async () => {
    const requesterId = new UniqueEntityID('requester-id-123')

    const result = await sut.execute({
      requesterId: requesterId.toString(),
      params: { page: 1 },
    })

    expect(result.isLeft()).toBe(true)
  })
})
