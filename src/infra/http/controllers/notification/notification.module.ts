import { DatabaseModule } from '@/infra/database/database.module'
import { Module } from '@nestjs/common'
import { ReadNotificationController } from './read-notification.controller'
import { ReadNotificationUseCase } from '@/domain/notification/application/use-cases/read-notification'

@Module({
  imports: [DatabaseModule],
  controllers: [ReadNotificationController],
  providers: [ReadNotificationUseCase],
  exports: [ReadNotificationUseCase],
})
export class NotificationModule {}
