import { Role } from '@/domain/user/@types/role'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { OrderFactory } from 'test/factories/make-order'
import { RecipientFactory } from 'test/factories/make-recipient'
import { UserFactory } from 'test/factories/make-user'

describe('Fetch orders nearby (E2E)', () => {
  let app: INestApplication
  let orderFactory: OrderFactory
  let recipientFactory: RecipientFactory
  let userFactory: UserFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [OrderFactory, RecipientFactory, UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    orderFactory = moduleRef.get(OrderFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    userFactory = moduleRef.get(UserFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /orders/nearby', async () => {
    const user = await userFactory.makePrismaUser({ roles: [Role.ADMIN] })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const recipient = await recipientFactory.makePrismaRecipient()

    const order1 = await orderFactory.makePrismaOrder({
      recipientId: recipient.id,
      coordinate: {
        latitude: 0,
        longitude: 0,
      },
    })
    const order2 = await orderFactory.makePrismaOrder({
      recipientId: recipient.id,
      coordinate: {
        latitude: 0,
        longitude: 0,
      },
    })

    const response = await request(app.getHttpServer())
      .get(`/orders/nearby?latitude=0&longitude=0&page=1`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      orders: expect.arrayContaining([
        expect.objectContaining({
          title: order1.title,
          description: order1.description,
        }),
        expect.objectContaining({
          title: order2.title,
          description: order2.description,
        }),
      ]),
    })
  })
})
