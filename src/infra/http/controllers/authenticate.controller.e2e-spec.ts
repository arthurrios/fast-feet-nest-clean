import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { hash } from 'bcrypt'
import request from 'supertest'
import { generateValidCpf } from 'test/factories/faker-utils/generate-valid-cpf'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /sessions', async () => {
    const validCpf = generateValidCpf()

    await prisma.user.create({
      data: {
        name: 'John Doe',
        email: faker.internet.email(),
        cpf: validCpf,
        password: await hash('123456', 8),
      },
    })

    const response = await request(app.getHttpServer()).post('/sessions').send({
      name: 'John Doe',
      email: faker.internet.email(),
      cpf: validCpf,
      password: '123456',
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({ access_token: expect.any(String) })
  })
})
