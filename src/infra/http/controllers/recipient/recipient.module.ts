import { DatabaseModule } from '@/infra/database/database.module'
import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { RegisterRecipientUseCase } from '@/domain/delivery/application/use-cases/register-recipient'
import { AuthorizationService } from '@/core/services/authorization-service'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { RegisterRecipientController } from './register-recipient.controller'
import { GetRecipientsController } from './get-recipients.controller'
import { GetRecipientsUseCase } from '@/domain/delivery/application/use-cases/get-recipients'

@Module({
  imports: [DatabaseModule, UserModule, CryptographyModule],
  controllers: [RegisterRecipientController, GetRecipientsController],
  providers: [
    AuthorizationService,
    RegisterRecipientUseCase,
    GetRecipientsUseCase,
  ],
  exports: [RegisterRecipientUseCase, GetRecipientsUseCase],
})
export class RecipientModule {}
