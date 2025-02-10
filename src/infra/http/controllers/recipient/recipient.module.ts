import { DatabaseModule } from '@/infra/database/database.module'
import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { RegisterRecipientUseCase } from '@/domain/delivery/application/use-cases/register-recipient'
import { AuthorizationService } from '@/core/services/authorization-service'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { RegisterRecipientController } from './register-recipient.controller'
import { GetRecipientsController } from './get-recipients.controller'
import { GetRecipientsUseCase } from '@/domain/delivery/application/use-cases/get-recipients'
import { GetRecipientController } from './get-recipient.controller'
import { GetRecipientUseCase } from '@/domain/delivery/application/use-cases/get-recipient'
import { EditRecipientController } from './edit-recipient.controller'
import { EditRecipientUseCase } from '@/domain/delivery/application/use-cases/edit-recipient'

@Module({
  imports: [DatabaseModule, UserModule, CryptographyModule],
  controllers: [
    RegisterRecipientController,
    GetRecipientsController,
    GetRecipientController,
    EditRecipientController,
  ],
  providers: [
    AuthorizationService,
    RegisterRecipientUseCase,
    GetRecipientsUseCase,
    GetRecipientUseCase,
    EditRecipientUseCase,
  ],
  exports: [
    RegisterRecipientUseCase,
    GetRecipientsUseCase,
    GetRecipientUseCase,
    EditRecipientUseCase,
  ],
})
export class RecipientModule {}
