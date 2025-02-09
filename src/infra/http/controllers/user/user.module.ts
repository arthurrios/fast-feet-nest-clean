import { AuthorizationService } from '@/core/services/authorization-service'
import { DatabaseModule } from '@/infra/database/database.module'
import { Module } from '@nestjs/common'

import { CreateUserUseCase } from '@/domain/user/application/use-cases/create-user'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { AuthenticateUseCase } from '@/domain/user/application/use-cases/authenticate-user'
import { CreateUserController } from './create-user.controller'
import { AuthenticateController } from './authenticate.controller'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  providers: [AuthorizationService, CreateUserUseCase, AuthenticateUseCase],
  controllers: [CreateUserController, AuthenticateController],
  exports: [AuthorizationService, CreateUserUseCase, AuthenticateUseCase],
})
export class UserModule {}
