import { AuthorizationService } from '@/core/services/authorization-service'
import { makeRecipient } from 'test/factories/make-recipient'
import { authorizationServiceMock } from 'test/factories/mocks/authorization-service-mock'
import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { EditRecipientUseCase } from './edit-recipient'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let authorizationService: AuthorizationService
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let sut: EditRecipientUseCase

describe('Edit Recipient', () => {
  beforeEach(() => {
    authorizationService = authorizationServiceMock('admin-id-123')
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()

    sut = new EditRecipientUseCase(
      authorizationService,
      inMemoryRecipientsRepository,
    )
  })
  it('should be able to edit a recipient succesfully', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const recipient = makeRecipient({ name: 'John Doe' })

    await inMemoryRecipientsRepository.create(recipient)

    await sut.execute({
      recipientId: recipient.id.toValue(),
      requesterId: adminId.toValue(),
      name: 'Jane Doe',
      cpf: recipient.cpf.getRaw(),
      email: recipient.email,
      coordinate: {
        latitude: 0,
        longitude: 0,
      },
    })

    expect(inMemoryRecipientsRepository.items[0].name).toBe('Jane Doe')
    expect(inMemoryRecipientsRepository.items[0].cpf).toBe(recipient.cpf)
  })
  it('should not be able to edit recipient if requester is not admin', async () => {
    const requesterId = new UniqueEntityID('requester-id-123')

    const recipient = makeRecipient()

    const result = await sut.execute({
      requesterId: requesterId.toString(),
      recipientId: recipient.id.toValue(),
      name: 'Jane Doe',
      cpf: recipient.cpf.getRaw(),
      email: recipient.email,
      coordinate: {
        latitude: 0,
        longitude: 0,
      },
    })

    expect(result.isLeft()).toBe(true)
  })
})
