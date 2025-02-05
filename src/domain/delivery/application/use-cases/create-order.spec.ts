import { InMemoryCouriersRepository } from 'test/repositories/in-memory-couriers-repository'
import { AuthorizationService } from '@/core/services/authorization-service'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { authorizationServiceMock } from 'test/factories/mocks/authorization-service-mock'
import { UnauthorizedAdminOnlyError } from '@/core/errors/errors/unauthorized-admin-only-error'
import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { CreateOrderUseCase } from './create-order'
import { makeRecipient } from 'test/factories/make-recipient'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

let authorizationService: AuthorizationService
let inMemoryCouriersRepository: InMemoryCouriersRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let inMemoryOrdersRepository: InMemoryOrdersRepository
let sut: CreateOrderUseCase

describe('Create order', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authorizationService = authorizationServiceMock('admin-id-123')
    inMemoryCouriersRepository = new InMemoryCouriersRepository()
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository()

    sut = new CreateOrderUseCase(
      authorizationService,
      inMemoryCouriersRepository,
      inMemoryRecipientsRepository,
      inMemoryOrdersRepository,
    )
  })

  it('should create a new order succesfully', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const recipient = makeRecipient()

    inMemoryRecipientsRepository.items.push(recipient)

    const result = await sut.execute({
      requesterId: adminId.toString(),
      recipientId: recipient.id.toString(),
      title: 'Order Title',
      description: 'Order description',
      coordinate: {
        latitude: 0,
        longitude: 0,
      },
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      order: inMemoryOrdersRepository.items[0],
    })
    expect(result.value).toEqual({
      order: expect.objectContaining({
        courierId: null,
      }),
    })
  })
  it('should not create order if requester is not admin', async () => {
    const requesterId = new UniqueEntityID('requester-id-123')

    const result = await sut.execute({
      requesterId: requesterId.toString(),
      recipientId: '1',
      title: 'Order Title',
      description: 'Order description',
      coordinate: {
        latitude: 0,
        longitude: 0,
      },
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedAdminOnlyError)
  })
  it('should not create a new order if recipient is not found', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const recipient = makeRecipient()

    inMemoryRecipientsRepository.items.push(recipient)

    const result = await sut.execute({
      requesterId: adminId.toString(),
      recipientId: '1',
      title: 'Order Title',
      description: 'Order description',
      coordinate: {
        latitude: 0,
        longitude: 0,
      },
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
  it('should not create a new order if courier is not found', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const recipient = makeRecipient()

    inMemoryRecipientsRepository.items.push(recipient)

    const result = await sut.execute({
      requesterId: adminId.toString(),
      recipientId: recipient.id.toString(),
      courierId: '1',
      title: 'Order Title',
      description: 'Order description',
      coordinate: {
        latitude: 0,
        longitude: 0,
      },
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
