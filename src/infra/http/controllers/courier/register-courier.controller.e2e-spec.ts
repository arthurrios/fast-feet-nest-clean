import { Role } from '@/domain/user/@types/role'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { makeCourier } from 'test/factories/make-courier'
import { UserFactory } from 'test/factories/make-user'

describe('Register courier (E2E)', () => {
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

  test('[POST] /couriers', async () => {
    const user = await userFactory.makePrismaUser({ roles: [Role.ADMIN] })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const courier = makeCourier()

    const response = await request(app.getHttpServer())
      .post(`/couriers`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: courier.name,
        email: courier.email,
        cpf: courier.cpf,
        password: courier.password,
        role: Role.COURIER,
      })

    expect(response.statusCode).toBe(201)

    const courierOnDatabase = await prisma.user.findUnique({
      where: {
        cpf: courier.cpf.getRaw(),
      },
    })

    expect(courierOnDatabase).toBeTruthy()
  })
})
