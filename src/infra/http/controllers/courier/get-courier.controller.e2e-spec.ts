import { Role } from '@/domain/user/@types/role'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { CourierFactory } from 'test/factories/make-courier'
import { RecipientFactory } from 'test/factories/make-recipient'
import { UserFactory } from 'test/factories/make-user'

describe('Get courier by ID (E2E)', () => {
  let app: INestApplication
  let courierFactory: CourierFactory
  let userFactory: UserFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [CourierFactory, RecipientFactory, UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    courierFactory = moduleRef.get(CourierFactory)
    userFactory = moduleRef.get(UserFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /couriers/:id', async () => {
    const user = await userFactory.makePrismaUser({ roles: [Role.ADMIN] })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const courier = await courierFactory.makePrismaCourier()

    const response = await request(app.getHttpServer())
      .get(`/couriers/${courier.id}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      courier: expect.objectContaining({
        name: courier.name,
        email: courier.email,
      }),
    })
  })
})
