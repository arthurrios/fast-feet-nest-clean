import { AuthorizationService } from '@/core/services/authorization-service'
import { makeOrder } from 'test/factories/make-order'
import { authorizationServiceMock } from 'test/factories/mocks/authorization-service-mock'
import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { EditOrderUseCase } from './edit-order'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryOrderAttachmentsRepository } from 'test/repositories/in-memory-order-attachments-repository'
import { makeOrderAttachment } from 'test/factories/make-order-attachment'

let authorizationService: AuthorizationService
let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryOrderAttachmentsRepository: InMemoryOrderAttachmentsRepository
let sut: EditOrderUseCase

describe('Edit Order', () => {
  beforeEach(() => {
    authorizationService = authorizationServiceMock('admin-id-123')
    inMemoryOrderAttachmentsRepository =
      new InMemoryOrderAttachmentsRepository()
    inMemoryOrdersRepository = new InMemoryOrdersRepository(
      inMemoryOrderAttachmentsRepository,
    )
    sut = new EditOrderUseCase(
      authorizationService,
      inMemoryOrdersRepository,
      inMemoryOrderAttachmentsRepository,
    )
  })
  it('should be able to edit a order succesfully', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const order = makeOrder({ title: 'Order title' })

    await inMemoryOrdersRepository.create(order)

    await sut.execute({
      orderId: order.id.toValue(),
      requesterId: adminId.toValue(),
      title: 'Order Altered Title',
      description: order.description,
      coordinate: order.coordinate,
      attachmentsIds: ['1', '2'],
    })

    expect(inMemoryOrdersRepository.items[0].title).toBe('Order Altered Title')
  })
  it('should not be able to edit order if requester is not admin', async () => {
    const requesterId = new UniqueEntityID('requester-id-123')

    const order = makeOrder({ title: 'Order title' })

    const result = await sut.execute({
      orderId: order.id.toValue(),
      requesterId: requesterId.toValue(),
      title: 'Order Altered Title',
      description: order.description,
      coordinate: order.coordinate,
      attachmentsIds: ['1', '2'],
    })

    expect(result.isLeft()).toBe(true)
  })
  it('should sync new and removed attachments when editing a order', async () => {
    const adminId = new UniqueEntityID('admin-id-123')

    const order = makeOrder({ title: 'Order title' })

    await inMemoryOrdersRepository.create(order)

    inMemoryOrderAttachmentsRepository.items.push(
      makeOrderAttachment({
        orderId: order.id,
        attachmentId: new UniqueEntityID('1'),
      }),
      makeOrderAttachment({
        orderId: order.id,
        attachmentId: new UniqueEntityID('2'),
      }),
    )

    const result = await sut.execute({
      orderId: order.id.toValue(),
      requesterId: adminId.toValue(),
      title: 'Order Altered Title',
      description: order.description,
      coordinate: order.coordinate,
      attachmentsIds: ['1', '3'],
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryOrdersRepository.items[0].title).toBe('Order Altered Title')
    expect(inMemoryOrderAttachmentsRepository.items).toHaveLength(2)
    expect(inMemoryOrderAttachmentsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attachmentId: new UniqueEntityID('1'),
        }),
        expect.objectContaining({
          attachmentId: new UniqueEntityID('3'),
        }),
      ]),
    )
  })
})
