import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  OrderAttachment,
  OrderAttachmentProps,
} from '@/domain/delivery/enterprise/entities/order-attachment'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

export function makeOrderAttachment(
  override: Partial<OrderAttachmentProps> = {},
  id?: UniqueEntityID,
) {
  const orderAttachment = OrderAttachment.create(
    {
      orderId: new UniqueEntityID(),
      attachmentId: new UniqueEntityID(),
      ...override,
    },
    id,
  )

  return orderAttachment
}

@Injectable()
export class OrderAttachmentFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaOrderAttachment(
    data: Partial<OrderAttachmentProps> = {},
  ): Promise<OrderAttachment> {
    const orderAttachment = makeOrderAttachment(data)

    await this.prisma.attachment.update({
      where: {
        id: orderAttachment.attachmentId.toString(),
      },
      data: {
        orderId: orderAttachment.orderId.toString(),
      },
    })

    return orderAttachment
  }
}
