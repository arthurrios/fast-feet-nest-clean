import { AuthorizationService } from '@/core/services/authorization-service'
import { UsersRepository } from '@/domain/user/application/repositories/users-repository'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaUsersRepository } from '@/infra/database/prisma/repositories/prisma-users-repository'
import { Module } from '@nestjs/common'
import { CreateUserController } from '../create-user.controller'
import { CreateUserUseCase } from '@/domain/user/application/use-cases/create-user'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { AuthenticateController } from '../authenticate.controller'
import { AuthenticateUseCase } from '@/domain/user/application/use-cases/authenticate-user'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  providers: [AuthorizationService, CreateUserUseCase, AuthenticateUseCase],
  controllers: [CreateUserController, AuthenticateController],
  exports: [AuthorizationService, CreateUserUseCase, AuthenticateUseCase],
})
export class UserModule {}
