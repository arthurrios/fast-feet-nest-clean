import { Role } from '@/domain/user/@types/role'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { CourierFactory } from 'test/factories/make-courier'
import { UserFactory } from 'test/factories/make-user'

describe('Get couriers (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let courierFactory: CourierFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, CourierFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    userFactory = moduleRef.get(UserFactory)
    courierFactory = moduleRef.get(CourierFactory)
    courierFactory = moduleRef.get(CourierFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /couriers', async () => {
    const user = await userFactory.makePrismaUser({ role: Role.ADMIN })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const courier1 = await courierFactory.makePrismaCourier()
    const courier2 = await courierFactory.makePrismaCourier()

    const response = await request(app.getHttpServer())
      .get(`/couriers`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      couriers: expect.arrayContaining([
        expect.objectContaining({
          name: courier1.name,
          email: courier1.email,
        }),
        expect.objectContaining({
          name: courier2.name,
          email: courier2.email,
        }),
      ]),
    })
  })
})
