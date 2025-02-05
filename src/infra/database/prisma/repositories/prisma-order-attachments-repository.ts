import { OrderAttachmentsRepository } from '@/domain/delivery/application/repository/order-attachments-repository'
import { OrderAttachment } from '@/domain/delivery/enterprise/entities/order-attachment'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaOrderAttachmentsRepository
  implements OrderAttachmentsRepository
{
  createMany(attachments: OrderAttachment[]): Promise<void> {
    throw new Error('Method not implemented.')
  }

  deleteMany(attachments: OrderAttachment[]): Promise<void> {
    throw new Error('Method not implemented.')
  }

  findManyByOrderId(orderId: string): Promise<OrderAttachment[]> {
    throw new Error('Method not implemented.')
  }

  deleteManyByOrderId(orderId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
