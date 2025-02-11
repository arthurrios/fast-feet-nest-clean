import { Role } from '@/domain/user/@types/role'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { CourierFactory } from 'test/factories/make-courier'
import { UserFactory } from 'test/factories/make-user'

describe('Delete courier (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let courierFactory: CourierFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, CourierFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    userFactory = moduleRef.get(UserFactory)
    courierFactory = moduleRef.get(CourierFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[DELETE] /couriers/:id', async () => {
    const user = await userFactory.makePrismaUser({ roles: [Role.ADMIN] })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const courier = await courierFactory.makePrismaCourier()

    const response = await request(app.getHttpServer())
      .delete(`/couriers/${courier.id}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(204)

    const courierOnDatabase = await prisma.user.findUnique({
      where: {
        cpf: courier.cpf.getRaw(),
        roles: {
          some: {
            role: Role.COURIER,
          },
        },
      },
    })

    expect(courierOnDatabase).toBe(null)
  })
})
