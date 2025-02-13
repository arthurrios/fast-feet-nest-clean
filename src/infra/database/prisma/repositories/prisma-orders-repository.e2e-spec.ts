import { OrdersRepository } from '@/domain/delivery/application/repository/orders-repository'
import { AppModule } from '@/infra/app.module'
import { CacheRepository } from '@/infra/cache/cache-repository'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { empty } from '@prisma/client/runtime/library'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { OrderFactory } from 'test/factories/make-order'
import { OrderAttachmentFactory } from 'test/factories/make-order-attachment'
import { RecipientFactory } from 'test/factories/make-recipient'

describe('Prisma Orders Repository (E2E)', () => {
  let app: INestApplication
  let orderFactory: OrderFactory
  let attachmentFactory: AttachmentFactory
  let orderAttachmentFactory: OrderAttachmentFactory
  let cacheRepository: CacheRepository
  let ordersRepository: OrdersRepository
  let recipientFactory: RecipientFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        OrderFactory,
        RecipientFactory,
        OrderAttachmentFactory,
        AttachmentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    orderFactory = moduleRef.get(OrderFactory)
    ordersRepository = moduleRef.get(OrdersRepository)
    recipientFactory = moduleRef.get(RecipientFactory)
    orderAttachmentFactory = moduleRef.get(OrderAttachmentFactory)
    cacheRepository = moduleRef.get(CacheRepository)
    attachmentFactory = moduleRef.get(AttachmentFactory)

    await app.init()
  })

  it('should cache order details', async () => {
    const recipient = await recipientFactory.makePrismaRecipient()

    const order = await orderFactory.makePrismaOrder({
      recipientId: recipient.id,
    })

    const attachment = await attachmentFactory.makePrismaAttachment()

    await orderAttachmentFactory.makePrismaOrderAttachment({
      orderId: order.id,
      attachmentId: attachment.id,
    })

    const orderId = order.id.toString()

    const orderDetails = await ordersRepository.findById(orderId)

    const cached = await cacheRepository.get(`order:${orderId}:details`)

    if (!cached) {
      throw new Error('Cache not found')
    }

    expect(JSON.parse(cached)).toEqual(
      expect.objectContaining({
        id: orderDetails?.id.toString(),
      }),
    )
  })
  it('should return cached order details on subsequent calls', async () => {
    const recipient = await recipientFactory.makePrismaRecipient()

    const order = await orderFactory.makePrismaOrder({
      recipientId: recipient.id,
    })

    const attachment = await attachmentFactory.makePrismaAttachment()

    await orderAttachmentFactory.makePrismaOrderAttachment({
      orderId: order.id,
      attachmentId: attachment.id,
    })

    const orderId = order.id.toString()

    let cached = await cacheRepository.get(`order:${orderId}:details`)

    expect(cached).toBeNull()

    await ordersRepository.findById(orderId)

    cached = await cacheRepository.get(`order:${orderId}:details`)

    expect(cached).not.toBeNull()

    if (!cached) {
      throw new Error('Cache not found')
    }

    const orderDetails = await ordersRepository.findById(orderId)

    expect(JSON.parse(cached)).toEqual(
      expect.objectContaining({
        id: orderDetails?.id.toString(),
      }),
    )
  })
  it('should reset order details cache when saving the order', async () => {
    const recipient = await recipientFactory.makePrismaRecipient()

    const order = await orderFactory.makePrismaOrder({
      recipientId: recipient.id,
    })

    const attachment = await attachmentFactory.makePrismaAttachment()

    await orderAttachmentFactory.makePrismaOrderAttachment({
      orderId: order.id,
      attachmentId: attachment.id,
    })

    const orderId = order.id.toString()

    await cacheRepository.set(
      `order:${orderId}:details`,
      JSON.stringify({ empty: true }),
    )

    await ordersRepository.save(order)

    const cached = await cacheRepository.get(`order:${orderId}:details`)

    expect(cached).toBeNull()
  })
})
