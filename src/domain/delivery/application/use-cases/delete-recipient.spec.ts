import { AuthorizationService } from '@/core/services/authorization-service'
import { makeRecipient } from 'test/factories/make-recipient'
import { authorizationServiceMock } from 'test/factories/mocks/authorization-service-mock'
import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { EditRecipientUseCase } from './edit-recipient'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DeleteRecipientUseCase } from './delete-recipient'

let authorizationService: AuthorizationService
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let sut: DeleteRecipientUseCase

describe('Delete Recipient', () => {
  beforeEach(() => {
    authorizationService = authorizationServiceMock('admin-id-123')
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()

    sut = new DeleteRecipientUseCase(
      authorizationService,
      inMemoryRecipientsRepository,
    )
  })
  it('should be able to delete a recipient succesfully', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const recipient = makeRecipient({ name: 'John Doe' })

    await inMemoryRecipientsRepository.create(recipient)

    await sut.execute({
      recipientId: recipient.id.toValue(),
      requesterId: adminId.toValue(),
    })

    expect(inMemoryRecipientsRepository.items).toHaveLength(0)
  })
  it('should not be able to edit recipient if requester is not admin', async () => {
    const requesterId = new UniqueEntityID('requester-id-123')

    const recipient = makeRecipient()

    const result = await sut.execute({
      requesterId: requesterId.toString(),
      recipientId: recipient.id.toValue(),
    })

    expect(result.isLeft()).toBe(true)
  })
})
