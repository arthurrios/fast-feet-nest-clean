import { AuthorizationService } from '@/core/services/authorization-service'
import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { authorizationServiceMock } from 'test/factories/mocks/authorization-service-mock'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeRecipient } from 'test/factories/make-recipient'
import { GetRecipientUseCase } from './get-recipient'

let authorizationService: AuthorizationService
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let sut: GetRecipientUseCase
describe('Get Recipient', () => {
  beforeEach(() => {
    authorizationService = authorizationServiceMock('admin-id-123')
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()

    sut = new GetRecipientUseCase(
      authorizationService,
      inMemoryRecipientsRepository,
    )
  })
  it('should be able to get recipient succesfully', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const recipient = makeRecipient({ name: 'John Doe' })
    inMemoryRecipientsRepository.items.push(recipient)

    const result = await sut.execute({
      requesterId: adminId.toValue(),
      recipientId: recipient.id.toValue(),
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      recipient: expect.objectContaining({ name: 'John Doe' }),
    })
  })
  it('should not be able to get recipient if requester is not admin', async () => {
    const requesterId = new UniqueEntityID('requester-id-123')

    const recipient = makeRecipient()

    const result = await sut.execute({
      requesterId: requesterId.toString(),
      recipientId: recipient.id.toValue(),
    })

    expect(result.isLeft()).toBe(true)
  })
})
