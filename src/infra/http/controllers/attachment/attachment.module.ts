import { DatabaseModule } from '@/infra/database/database.module'
import { Module } from '@nestjs/common'
import { UploadAttachmentController } from './upload-attachment.controller'
import { StorageModule } from '@/infra/storage/storage.module'
import { UploadAndCreateAttachmentUseCase } from '@/domain/delivery/application/use-cases/upload-and-create-attachment'

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [UploadAttachmentController],
  providers: [UploadAndCreateAttachmentUseCase],
  exports: [UploadAndCreateAttachmentUseCase],
})
export class AttachmentModule {}
