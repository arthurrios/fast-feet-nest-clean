import { Role } from '@/domain/user/@types/role'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { RecipientFactory } from 'test/factories/make-recipient'
import { UserFactory } from 'test/factories/make-user'

describe('Edit recipient (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let recipientFactory: RecipientFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, RecipientFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    userFactory = moduleRef.get(UserFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PUT] /recipients/:id', async () => {
    const user = await userFactory.makePrismaUser({ role: Role.ADMIN })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const recipient = await recipientFactory.makePrismaRecipient()

    const response = await request(app.getHttpServer())
      .put(`/recipients/${recipient.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: recipient.name,
        email: 'new.email@test.com',
        cpf: recipient.cpf,
        password: recipient.password,
        role: Role.RECIPIENT,
      })

    expect(response.statusCode).toBe(204)

    const recipientOnDatabase = await prisma.user.findUnique({
      where: {
        cpf: recipient.cpf.getRaw(),
      },
    })

    expect(recipientOnDatabase?.email).toEqual('new.email@test.com')
  })
})
