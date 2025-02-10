import { ChangeUserPasswordUseCase } from '@/domain/user/application/use-cases/change-user-password'
import { AuthorizationService } from '@/core/services/authorization-service'
import { DatabaseModule } from '@/infra/database/database.module'
import { Module } from '@nestjs/common'

import { CreateUserUseCase } from '@/domain/user/application/use-cases/create-user'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { AuthenticateUseCase } from '@/domain/user/application/use-cases/authenticate-user'
import { CreateUserController } from './create-user.controller'
import { AuthenticateController } from './authenticate.controller'
import { ChangeUserPasswordController } from './change-user-password.controller'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    CreateUserController,
    AuthenticateController,
    ChangeUserPasswordController,
  ],
  providers: [
    AuthorizationService,
    CreateUserUseCase,
    AuthenticateUseCase,
    ChangeUserPasswordUseCase,
  ],
  exports: [CreateUserUseCase, AuthenticateUseCase, ChangeUserPasswordUseCase],
})
export class UserModule {}
