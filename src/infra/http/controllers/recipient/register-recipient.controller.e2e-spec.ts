import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { generateValidCpf } from 'test/factories/faker-utils/generate-valid-cpf'

describe('Register recipient (E2E)', () => {
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

  test('[POST] /recipients', async () => {
    const validCpf = generateValidCpf()
    const validCpf2 = generateValidCpf()

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

    const response = await request(app.getHttpServer())
      .post(`/recipients`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Justin Doe',
        email: faker.internet.email(),
        cpf: validCpf2,
        password: '123456',
        role: 'RECIPIENT',
      })

    console.log(response)

    expect(response.statusCode).toBe(201)

    const recipientOnDatabase = await prisma.user.findUnique({
      where: {
        cpf: validCpf2,
      },
    })

    expect(recipientOnDatabase).toBeTruthy()
  })
})
