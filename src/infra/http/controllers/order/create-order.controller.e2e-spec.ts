import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { generateValidCpf } from 'test/factories/faker-utils/generate-valid-cpf'

describe('Create order (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /orders', async () => {
    const validCpf = generateValidCpf()

    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: faker.internet.email(),
        cpf: validCpf,
        password: '123456',
        role: 'ADMIN',
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    const recipient = await prisma.user.create({
      data: {
        name: 'Jane Doe',
        email: faker.internet.email(),
        cpf: generateValidCpf(),
        password: '123456',
        role: 'RECIPIENT',
      },
    })

    const courier = await prisma.user.create({
      data: {
        name: 'Justin Doe',
        email: faker.internet.email(),
        cpf: generateValidCpf(),
        password: '123456',
        role: 'COURIER',
      },
    })

    const response = await request(app.getHttpServer())
      .post(`/orders/${recipient.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: `Order title`,
        description: 'Order description',
        coordinate: {
          latitude: 0,
          longitude: 0,
        },
        courierId: courier.id,
      })

    expect(response.statusCode).toBe(201)
  })
})
