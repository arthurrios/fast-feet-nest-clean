import { Role } from '@/domain/user/@types/role'
import { AppModule } from '@/infra/app.module'
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'

describe('Change user password (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let prisma: PrismaService
  let hasher: BcryptHasher
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, BcryptHasher],
    }).compile()

    app = moduleRef.createNestApplication()
    userFactory = moduleRef.get(UserFactory)
    prisma = moduleRef.get(PrismaService)
    hasher = moduleRef.get(BcryptHasher)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /users/:id/password', async () => {
    const user = await userFactory.makePrismaUser({ role: Role.ADMIN })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const userToChangePassword = await userFactory.makePrismaUser()

    const response = await request(app.getHttpServer())
      .post(`/users/${userToChangePassword.id}/password`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        newPassword: 'new-password',
      })

    expect(response.status).toBe(204)

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        cpf: userToChangePassword.cpf.getRaw(),
      },
    })

    const passwordMatches = await hasher.compare(
      'new-password',
      userOnDatabase?.password ?? '',
    )

    expect(passwordMatches).toBe(true)
  })
})
