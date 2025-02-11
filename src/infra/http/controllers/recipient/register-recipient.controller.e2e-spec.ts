import { Role } from '@/domain/user/@types/role'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { makeRecipient } from 'test/factories/make-recipient'
import { UserFactory } from 'test/factories/make-user'

describe('Register recipient (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    userFactory = moduleRef.get(UserFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /recipients', async () => {
    const user = await userFactory.makePrismaUser({ roles: [Role.ADMIN] })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const recipient = makeRecipient()

    const response = await request(app.getHttpServer())
      .post(`/recipients`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: recipient.name,
        email: recipient.email,
        cpf: recipient.cpf,
        password: recipient.password,
        role: Role.RECIPIENT,
      })

    expect(response.statusCode).toBe(201)

    const recipientOnDatabase = await prisma.user.findUnique({
      where: {
        cpf: recipient.cpf.getRaw(),
      },
    })

    expect(recipientOnDatabase).toBeTruthy()
  })
})
