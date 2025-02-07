import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { generateValidCpf } from 'test/factories/faker-utils/generate-valid-cpf'

describe('Register user (E2E)', () => {
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

  test('[POST] /users', async () => {
    const validCpf = generateValidCpf()

    const response = await request(app.getHttpServer()).post('/users').send({
      name: 'John Doe',
      email: faker.internet.email(),
      cpf: validCpf,
      password: '123456',
    })

    expect(response.status).toBe(201)

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        cpf: validCpf,
      },
    })

    expect(userOnDatabase).toBeTruthy()
  })
})
