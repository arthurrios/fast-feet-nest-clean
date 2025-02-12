import { OnUserPasswordChanged } from '@/domain/delivery/application/subscribers/on-user-password-changed'
import { OnOrderStatusChanged } from '@/domain/notification/application/subscribers/on-order-status-changed'
import { OnCourierAssigned } from '@/domain/user/application/subscribers/on-courier-assigned'
import { OnCourierCreated } from '@/domain/user/application/subscribers/on-courier-registered'
import { OnOrderCreated } from '@/domain/user/application/subscribers/on-order-created'
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification'
import { CreateUserUseCase } from '@/domain/user/application/use-cases/create-user'
import { CryptographyModule } from '../cryptography/cryptography.module'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  providers: [
    OnUserPasswordChanged,
    OnOrderStatusChanged,
    OnOrderCreated,
    OnCourierCreated,
    OnCourierAssigned,
    SendNotificationUseCase,
    CreateUserUseCase,
  ],
})
export class EventsModule {}
