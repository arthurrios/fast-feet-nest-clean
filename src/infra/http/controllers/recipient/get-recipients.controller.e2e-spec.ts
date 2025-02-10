import { Role } from '@/domain/user/@types/role'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { RecipientFactory } from 'test/factories/make-recipient'
import { UserFactory } from 'test/factories/make-user'

describe('Get recipients (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let recipientFactory: RecipientFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, RecipientFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    userFactory = moduleRef.get(UserFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /recipients', async () => {
    const user = await userFactory.makePrismaUser({ role: Role.ADMIN })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const recipient1 = await recipientFactory.makePrismaRecipient()
    const recipient2 = await recipientFactory.makePrismaRecipient()

    const response = await request(app.getHttpServer())
      .get(`/recipients`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      recipients: expect.arrayContaining([
        expect.objectContaining({
          name: recipient1.name,
          email: recipient1.email,
        }),
        expect.objectContaining({
          name: recipient2.name,
          email: recipient2.email,
        }),
      ]),
    })
  })
})
