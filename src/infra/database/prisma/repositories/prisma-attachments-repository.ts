import { AttachmentsRepository } from '@/domain/delivery/application/repository/attachments-repository'
import { Attachment } from '@/domain/delivery/enterprise/entities/attachment'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaAttachmentsRepository implements AttachmentsRepository {
  create(attachment: Attachment): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
