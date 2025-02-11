import { OrderAttachmentsRepository } from '@/domain/delivery/application/repository/order-attachments-repository'
import { OrderAttachment } from '@/domain/delivery/enterprise/entities/order-attachment'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaOrderAttachmentMapper } from '../mappers/prisma-order-attachment-mapper'

@Injectable()
export class PrismaOrderAttachmentsRepository
  implements OrderAttachmentsRepository
{
  constructor(private prisma: PrismaService) {}

  async createMany(attachments: OrderAttachment[]): Promise<void> {
    if (attachments.length === 0) {
      return
    }

    const data = PrismaOrderAttachmentMapper.toPrismaUpdateMany(attachments)

    await this.prisma.attachment.updateMany(data)
  }

  async deleteMany(attachments: OrderAttachment[]): Promise<void> {
    if (attachments.length === 0) {
      return
    }

    const attachmentsIds = attachments.map((attachment) =>
      attachment.attachmentId.toString(),
    )

    await this.prisma.attachment.deleteMany({
      where: {
        id: {
          in: attachmentsIds,
        },
      },
    })
  }

  async findManyByOrderId(orderId: string): Promise<OrderAttachment[]> {
    const orderAttachments = await this.prisma.attachment.findMany({
      where: { orderId },
    })

    console.log(orderAttachments)

    return orderAttachments.map(PrismaOrderAttachmentMapper.toDomain)
  }

  async deleteManyByOrderId(orderId: string): Promise<void> {
    await this.prisma.attachment.deleteMany({
      where: { orderId },
    })
  }
}
