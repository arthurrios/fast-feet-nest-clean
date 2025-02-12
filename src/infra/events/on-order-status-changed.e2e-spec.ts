import { INestApplication } from '@nestjs/common'
import { PrismaService } from '../database/prisma/prisma.service'
import { RecipientFactory } from 'test/factories/make-recipient'
import { OrderFactory } from 'test/factories/make-order'
import { JwtService } from '@nestjs/jwt'
import { AppModule } from '../app.module'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { CourierFactory } from 'test/factories/make-courier'
import { waitFor } from 'test/utils/wait-for'
import { DatabaseModule } from '../database/database.module'
import { OrderStatus } from '@/domain/delivery/@types/status'

describe('On order status changed (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let recipientFactory: RecipientFactory
  let courierFactory: CourierFactory
  let orderFactory: OrderFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [RecipientFactory, OrderFactory, CourierFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    recipientFactory = moduleRef.get(RecipientFactory)
    courierFactory = moduleRef.get(CourierFactory)
    orderFactory = moduleRef.get(OrderFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })
  it('should send a notification when order status is updated', async () => {
    const user = await recipientFactory.makePrismaRecipient()
    const accessToken = jwt.sign({ sub: user.id.toString() })

    const courier = await courierFactory.makePrismaCourier()

    const order = await orderFactory.makePrismaOrder({
      recipientId: user.id,
    })    

    const orderId = order.id.toString()

    await request(app.getHttpServer())
      .put(`/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        status: 'PICKED_UP',
        courierId: courier.id.toString(),
      })    
  
    await waitFor(async () => {
      const notificationOnDatabase = await prisma.notification.findFirst({
        where: {
          recipientId: user.id.toString(),
        },
      })
      expect(notificationOnDatabase).not.toBeNull()
    })
  })
})
