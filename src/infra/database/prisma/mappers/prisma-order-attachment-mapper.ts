import type { Prisma, Attachment as PrismaAttachment } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { OrderAttachment } from '@/domain/delivery/enterprise/entities/order-attachment'

export class PrismaOrderAttachmentMapper {
  static toDomain(raw: PrismaAttachment): OrderAttachment {
    if (!raw.orderId) {
      throw new Error('Invalid attachment type.')
    }

    return OrderAttachment.create(
      {
        attachmentId: new UniqueEntityID(raw.id),
        orderId: new UniqueEntityID(raw.orderId),
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrismaUpdateMany(
    attachments: OrderAttachment[],
  ): Prisma.AttachmentUpdateManyArgs {
    const attachmentsIds = attachments.map((attachment) =>
      attachment.attachmentId.toString(),
    )

    return {
      where: {
        id: {
          in: attachmentsIds,
        },
      },
      data: {
        orderId: attachments[0].orderId.toString(),
      },
    }
  }
}
