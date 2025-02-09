import { DomainEvents } from '@/core/events/domain-events'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { generateValidCpf } from 'test/factories/faker-utils/generate-valid-cpf'

describe('Fetch orders nearby (E2E)', () => {
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

  test('[GET] /orders/nearby', async () => {
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

    await prisma.order.createMany({
      data: [
        {
          courierId: null,
          recipientId: recipient.id,
          status: 'PENDING',
          latitude: 0,
          longitude: 0,
          slug: 'order-title',
          title: 'Order title',
          description: 'Order description',
        },
        {
          courierId: null,
          recipientId: recipient.id,
          status: 'PENDING',
          latitude: 0,
          longitude: 0,
          slug: 'order-title-1',
          title: 'Order title 1',
          description: 'Order description',
        },
      ],
    })

    const response = await request(app.getHttpServer())
      .get(`/orders/nearby`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        latitude: 0,
        longitude: 0,
        params: { page: 1 },
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      orders: [
        expect.objectContaining({
          title: 'Order title',
          description: 'Order description',
        }),
        expect.objectContaining({
          title: 'Order title 1',
          description: 'Order description',
        }),
      ],
    })
  })
})
